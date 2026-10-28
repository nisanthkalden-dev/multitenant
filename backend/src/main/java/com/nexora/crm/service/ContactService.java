package com.nexora.crm.service;

import com.nexora.crm.dto.contact.ContactRequest;
import com.nexora.crm.dto.contact.ContactResponse;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.Contact;
import com.nexora.crm.entity.Customer;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.ContactRepository;
import com.nexora.crm.repository.CustomerRepository;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final CustomerRepository customerRepository;
    private final CompanyRepository companyRepository;
    private final TenantContext tenantContext;

    public ContactService(
            ContactRepository contactRepository,
            CustomerRepository customerRepository,
            CompanyRepository companyRepository,
            TenantContext tenantContext
    ) {
        this.contactRepository = contactRepository;
        this.customerRepository = customerRepository;
        this.companyRepository = companyRepository;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getContacts(String search, Pageable pageable) {
        String companyId = tenantContext.getCurrentCompanyId();
        return contactRepository.searchContacts(companyId, search, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getContactsByCustomer(String customerId) {
        String companyId = tenantContext.getCurrentCompanyId();
        return contactRepository.findByCompany_IdAndCustomer_Id(companyId, customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContactResponse getContactById(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Contact contact = contactRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));
        return mapToResponse(contact);
    }

    @Transactional
    public ContactResponse createContact(ContactRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        Contact contact = new Contact();
        contact.setId("CONT-" + System.currentTimeMillis());
        contact.setCompany(company);
        contact.setFirstName(request.getFirstName().trim());
        contact.setLastName(request.getLastName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setTitle(request.getTitle());
        contact.setDepartment(request.getDepartment());
        contact.setIsPrimary(Boolean.TRUE.equals(request.getIsPrimary()));

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findByIdAndCompany_Id(request.getCustomerId(), companyId)
                    .orElse(null);
            contact.setCustomer(customer);
        }

        Contact saved = contactRepository.save(contact);
        return mapToResponse(saved);
    }

    @Transactional
    public ContactResponse updateContact(String id, ContactRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Contact contact = contactRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));

        if (request.getFirstName() != null) contact.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) contact.setLastName(request.getLastName().trim());
        if (request.getEmail() != null) contact.setEmail(request.getEmail().trim());
        if (request.getPhone() != null) contact.setPhone(request.getPhone().trim());
        if (request.getTitle() != null) contact.setTitle(request.getTitle().trim());
        if (request.getDepartment() != null) contact.setDepartment(request.getDepartment().trim());
        if (request.getIsPrimary() != null) contact.setIsPrimary(request.getIsPrimary());

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findByIdAndCompany_Id(request.getCustomerId(), companyId)
                    .orElse(null);
            contact.setCustomer(customer);
        }

        Contact updated = contactRepository.save(contact);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteContact(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Contact contact = contactRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));
        contactRepository.delete(contact);
    }

    private ContactResponse mapToResponse(Contact c) {
        ContactResponse res = new ContactResponse();
        res.setId(c.getId());
        res.setCompanyId(c.getCompanyId());
        res.setCustomerId(c.getCustomerId());
        res.setFirstName(c.getFirstName());
        res.setLastName(c.getLastName());
        res.setEmail(c.getEmail());
        res.setPhone(c.getPhone());
        res.setTitle(c.getTitle());
        res.setDepartment(c.getDepartment());
        res.setIsPrimary(c.getIsPrimary());
        return res;
    }
}
