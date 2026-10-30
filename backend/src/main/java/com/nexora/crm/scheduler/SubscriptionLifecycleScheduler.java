package com.nexora.crm.scheduler;

import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.Subscription;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.SubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Scheduled job to handle subscription expiration and company suspension lifecycle.
 *
 * Rules:
 * 1. Active subscription before renewal date remains Active.
 * 2. On or after renewal date, if payment/renewal is not completed, enters configured grace period (e.g. 7 days).
 * 3. A company is NOT suspended immediately when renewal date arrives.
 * 4. Only after grace period expires without payment/renewal, mark subscription as Expired / Suspended,
 *    and suspend the company (status = "Suspended", isActive = false) to block restricted CRM features.
 * 5. Historical Expired / Cancelled subscriptions are preserved and not re-suspended repeatedly.
 * 6. When renewed/paid, subscription is restored to Active and company is reactivated.
 */
@Component
public class SubscriptionLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionLifecycleScheduler.class);

    public static final int DEFAULT_GRACE_PERIOD_DAYS = 7;

    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ofPattern("MMM dd, yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ISO_LOCAL_DATE
    );

    private final SubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;

    public SubscriptionLifecycleScheduler(
            SubscriptionRepository subscriptionRepository,
            CompanyRepository companyRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.companyRepository = companyRepository;
    }

    /**
     * Run daily at 02:00 AM. Also executes on demand or at system startup / test invocation.
     */
    @Scheduled(cron = "${crm.subscription.check-cron:0 0 2 * * *}")
    @Transactional
    public ProcessResult processSubscriptionLifecycles() {
        return processSubscriptionLifecyclesOnDate(LocalDate.now(), DEFAULT_GRACE_PERIOD_DAYS);
    }

    /**
     * Core lifecycle processor parameterised by evaluation date and grace period days.
     */
    @Transactional
    public ProcessResult processSubscriptionLifecyclesOnDate(LocalDate today, int gracePeriodDays) {
        log.info("Running SubscriptionLifecycleScheduler for reference date: {}, grace period: {} days", today, gracePeriodDays);

        List<Subscription> subscriptions = subscriptionRepository.findAll();
        int activeCount = 0;
        int graceCount = 0;
        int suspendedCount = 0;
        int skippedCount = 0;

        for (Subscription sub : subscriptions) {
            String rawDate = sub.getRenewalDate();
            if (rawDate == null || rawDate.isBlank() || rawDate.equalsIgnoreCase("—") || rawDate.equalsIgnoreCase("Next month")) {
                skippedCount++;
                continue;
            }

            LocalDate renewalDate = parseDate(rawDate);
            if (renewalDate == null) {
                log.debug("Skipping unparseable renewal date '{}' for subscription {}", rawDate, sub.getId());
                skippedCount++;
                continue;
            }

            String currentSubStatus = sub.getStatus() != null ? sub.getStatus().trim() : "Active";
            Company company = sub.getCompany();

            // Scenario 6: Historical Expired or Cancelled
            if ("Cancelled".equalsIgnoreCase(currentSubStatus)) {
                skippedCount++;
                continue;
            }

            // Check if renewal date has not yet been reached
            if (today.isBefore(renewalDate)) {
                // Scenario 1: Active subscription before renewal date
                activeCount++;
                continue;
            }

            // Renewal date has been reached (today >= renewalDate)
            LocalDate gracePeriodEnd = renewalDate.plusDays(gracePeriodDays);

            if (!today.isAfter(gracePeriodEnd)) {
                // Scenario 3: Renewal date reached without payment -> in Grace Period
                // Important Business Rule: Do NOT suspend company immediately just because renewal date arrives!
                if (!"Grace_Period".equalsIgnoreCase(currentSubStatus) && !"Pending_Renewal".equalsIgnoreCase(currentSubStatus)) {
                    log.info("Subscription {} for company {} entered grace period until {}",
                            sub.getId(), company != null ? company.getId() : "null", gracePeriodEnd);
                    sub.setStatus("Grace_Period");
                    subscriptionRepository.save(sub);
                }
                graceCount++;
            } else {
                // Scenario 4: Grace period has expired without payment (today > renewalDate + gracePeriod)
                boolean alreadySuspended = "Suspended".equalsIgnoreCase(currentSubStatus) || "Expired".equalsIgnoreCase(currentSubStatus);
                boolean companyAlreadySuspended = company != null && "Suspended".equalsIgnoreCase(company.getStatus()) && !Boolean.TRUE.equals(company.getIsActive());

                if (!alreadySuspended || !companyAlreadySuspended) {
                    log.warn("Subscription {} and company {} suspended: renewal date {} expired grace period on {}",
                            sub.getId(), company != null ? company.getId() : "null", renewalDate, gracePeriodEnd);
                    sub.setStatus("Suspended");
                    subscriptionRepository.save(sub);

                    if (company != null) {
                        company.setStatus("Suspended");
                        company.setIsActive(false);
                        companyRepository.save(company);
                    }
                    suspendedCount++;
                } else {
                    // Already processed and in suspended state (idempotent)
                    skippedCount++;
                }
            }
        }

        log.info("Subscription lifecycle check finished: active={}, grace={}, suspended={}, skipped={}",
                activeCount, graceCount, suspendedCount, skippedCount);

        return new ProcessResult(activeCount, graceCount, suspendedCount, skippedCount);
    }

    public static LocalDate parseDate(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        for (DateTimeFormatter fmt : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(trimmed, fmt);
            } catch (DateTimeParseException ignored) {}
        }
        return null;
    }

    public record ProcessResult(int active, int gracePeriod, int suspended, int skipped) {}
}
