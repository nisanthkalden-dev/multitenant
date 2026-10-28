package com.nexora.crm.controller;

import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.common.PaginationMetadata;
import com.nexora.crm.dto.contact.ContactRequest;
import com.nexora.crm.dto.contact.ContactResponse;
import com.nexora.crm.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@Tag(name = "Contact Management", description = "Multi-tenant CRM contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    @Operation(summary = "Get contacts with search and pagination")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getContacts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        Page<ContactResponse> contacts = contactService.getContacts(search, pageable);
        PaginationMetadata meta = new PaginationMetadata(contacts.getNumber(), contacts.getSize(), contacts.getTotalElements(), contacts.getTotalPages(), contacts.isLast());
        return ResponseEntity.ok(ApiResponse.ok("Contacts retrieved successfully", contacts.getContent(), meta));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get contact by ID")
    public ResponseEntity<ApiResponse<ContactResponse>> getContactById(@PathVariable String id) {
        ContactResponse contact = contactService.getContactById(id);
        return ResponseEntity.ok(ApiResponse.ok("Contact retrieved successfully", contact));
    }

    @PostMapping
    @Operation(summary = "Create contact")
    public ResponseEntity<ApiResponse<ContactResponse>> createContact(@Valid @RequestBody ContactRequest request) {
        ContactResponse created = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Contact created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update contact")
    public ResponseEntity<ApiResponse<ContactResponse>> updateContact(@PathVariable String id, @RequestBody ContactRequest request) {
        ContactResponse updated = contactService.updateContact(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Contact updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete contact")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable String id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.ok("Contact deleted successfully", null));
    }
}
