package com.nexora.crm.scheduler;

import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.Subscription;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.SubscriptionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class SubscriptionLifecycleSchedulerTest {

    @Autowired
    private SubscriptionLifecycleScheduler scheduler;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private CompanyRepository companyRepository;

    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("MMM dd, yyyy", Locale.ENGLISH);

    private String testCompanyId;
    private String testSubId;

    @BeforeEach
    public void setup() {
        testCompanyId = "TEST_LIFECYCLE_" + System.currentTimeMillis();
        testSubId = "sub-lifecycle-" + System.currentTimeMillis();

        Company c = new Company();
        c.setId(testCompanyId);
        c.setName("Lifecycle Test Corp");
        c.setEmail("contact@" + testCompanyId.toLowerCase() + ".com");
        c.setStatus("Active");
        c.setIsActive(true);
        c.setPlan("Growth");
        c.setBillingCycle("Monthly");
        c.setPrice("₹2,499");
        c.setRenewalDate("Dec 31, 2026");
        companyRepository.save(c);

        Subscription sub = new Subscription();
        sub.setId(testSubId);
        sub.setCompany(c);
        sub.setPlanName("Growth");
        sub.setBillingCycle("Monthly");
        sub.setAmount("₹2,499");
        sub.setStatus("Active");
        sub.setStartDate("Jan 01, 2026");
        sub.setRenewalDate("Dec 31, 2026");
        sub.setAutoRenew(true);
        subscriptionRepository.save(sub);
    }

    @AfterEach
    public void tearDown() {
        try {
            subscriptionRepository.findById(testSubId).ifPresent(subscriptionRepository::delete);
            companyRepository.findById(testCompanyId).ifPresent(companyRepository::delete);
        } catch (Exception ignored) {}
    }

    @Test
    @DisplayName("Scenario 1: Active subscription before renewal date remains Active")
    public void testScenario1_ActiveBeforeRenewalDate() {
        LocalDate evalDate = LocalDate.parse("2026-10-30");

        Subscription sub = subscriptionRepository.findById(testSubId).orElseThrow();
        sub.setRenewalDate("Nov 15, 2026");
        sub.setStatus("Active");
        subscriptionRepository.save(sub);

        scheduler.processSubscriptionLifecyclesOnDate(evalDate, 7);

        Subscription updatedSub = subscriptionRepository.findById(testSubId).orElseThrow();
        Company updatedComp = companyRepository.findById(testCompanyId).orElseThrow();

        assertEquals("Active", updatedSub.getStatus());
        assertEquals("Active", updatedComp.getStatus());
        assertTrue(updatedComp.getIsActive());
    }

    @Test
    @DisplayName("Scenario 2: Renewal date reached with successful payment/renewal")
    public void testScenario2_RenewalDateWithPayment() {
        LocalDate evalDate = LocalDate.parse("2026-10-30");

        Subscription sub = subscriptionRepository.findById(testSubId).orElseThrow();
        // Paid and renewed for next month
        LocalDate nextRenewal = evalDate.plusMonths(1);
        sub.setRenewalDate(nextRenewal.format(DTF));
        sub.setStatus("Active");
        subscriptionRepository.save(sub);

        scheduler.processSubscriptionLifecyclesOnDate(evalDate, 7);

        Subscription updatedSub = subscriptionRepository.findById(testSubId).orElseThrow();
        Company updatedComp = companyRepository.findById(testCompanyId).orElseThrow();

        assertEquals("Active", updatedSub.getStatus());
        assertEquals("Active", updatedComp.getStatus());
        assertTrue(updatedComp.getIsActive());
    }

    @Test
    @DisplayName("Scenario 3: Renewal date reached without payment -> enters Grace Period without suspending company")
    public void testScenario3_RenewalDateReachedWithoutPayment_EntersGracePeriod() {
        LocalDate evalDate = LocalDate.parse("2026-10-30");

        Subscription sub = subscriptionRepository.findById(testSubId).orElseThrow();
        // Renewal date was yesterday (2026-10-29), grace period 7 days ends on 2026-11-05
        sub.setRenewalDate("Oct 29, 2026");
        sub.setStatus("Active");
        subscriptionRepository.save(sub);

        scheduler.processSubscriptionLifecyclesOnDate(evalDate, 7);

        Subscription updatedSub = subscriptionRepository.findById(testSubId).orElseThrow();
        Company updatedComp = companyRepository.findById(testCompanyId).orElseThrow();

        assertEquals("Grace_Period", updatedSub.getStatus());
        // COMPANY MUST NOT BE SUSPENDED YET!
        assertEquals("Active", updatedComp.getStatus());
        assertTrue(updatedComp.getIsActive());
    }

    @Test
    @DisplayName("Scenario 4: Grace period expires without payment -> automatically suspends subscription and company")
    public void testScenario4_GracePeriodExpiresWithoutPayment_SuspendsCompany() {
        LocalDate evalDate = LocalDate.parse("2026-10-30");

        Subscription sub = subscriptionRepository.findById(testSubId).orElseThrow();
        // Renewal date was 10 days ago (2026-10-20), grace period ended on 2026-10-27
        sub.setRenewalDate("Oct 20, 2026");
        sub.setStatus("Grace_Period");
        subscriptionRepository.save(sub);

        scheduler.processSubscriptionLifecyclesOnDate(evalDate, 7);

        Subscription updatedSub = subscriptionRepository.findById(testSubId).orElseThrow();
        Company updatedComp = companyRepository.findById(testCompanyId).orElseThrow();

        assertEquals("Suspended", updatedSub.getStatus());
        assertEquals("Suspended", updatedComp.getStatus());
        assertFalse(updatedComp.getIsActive());
    }

    @Test
    @DisplayName("Scenario 5: Suspended subscription reactivated upon successful renewal")
    public void testScenario5_SuspendedSubscriptionReactivatedUponRenewal() {
        Subscription sub = subscriptionRepository.findById(testSubId).orElseThrow();
        sub.setStatus("Suspended");
        sub.setRenewalDate("Oct 10, 2026");
        subscriptionRepository.save(sub);

        Company comp = companyRepository.findById(testCompanyId).orElseThrow();
        comp.setStatus("Suspended");
        comp.setIsActive(false);
        companyRepository.save(comp);

        // Simulate payment/renewal: new active subscription and renewal date
        LocalDate now = LocalDate.now();
        LocalDate futureDate = now.plusMonths(1);
        sub.setStatus("Active");
        sub.setRenewalDate(futureDate.format(DTF));
        subscriptionRepository.save(sub);

        comp.setStatus("Active");
        comp.setIsActive(true);
        comp.setRenewalDate(sub.getRenewalDate());
        companyRepository.save(comp);

        // Run scheduler
        scheduler.processSubscriptionLifecyclesOnDate(now, 7);

        Subscription updatedSub = subscriptionRepository.findById(testSubId).orElseThrow();
        Company updatedComp = companyRepository.findById(testCompanyId).orElseThrow();

        assertEquals("Active", updatedSub.getStatus());
        assertEquals("Active", updatedComp.getStatus());
        assertTrue(updatedComp.getIsActive());
    }

    @Test
    @DisplayName("Scenario 6: Historical expired and cancelled subscriptions preserved and skipped")
    public void testScenario6_HistoricalCancelledSubscriptionsPreserved() {
        LocalDate evalDate = LocalDate.parse("2026-10-30");

        Subscription sub = subscriptionRepository.findById(testSubId).orElseThrow();
        sub.setStatus("Cancelled");
        sub.setRenewalDate("Jan 01, 2025");
        subscriptionRepository.save(sub);

        SubscriptionLifecycleScheduler.ProcessResult result =
                scheduler.processSubscriptionLifecyclesOnDate(evalDate, 7);

        Subscription updatedSub = subscriptionRepository.findById(testSubId).orElseThrow();
        assertEquals("Cancelled", updatedSub.getStatus());
        assertTrue(result.skipped() > 0);
    }
}
