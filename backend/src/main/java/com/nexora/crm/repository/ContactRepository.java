package com.nexora.crm.repository;

import com.nexora.crm.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, String> {

    Optional<Contact> findByIdAndCompany_Id(String id, String companyId);

    List<Contact> findByCompany_Id(String companyId);

    List<Contact> findByCompany_IdAndCustomer_Id(String companyId, String customerId);

    @Query("SELECT c FROM Contact c WHERE c.company.id = :companyId AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Contact> searchContacts(@Param("companyId") String companyId, @Param("search") String search, Pageable pageable);

    long countByCompany_Id(String companyId);
}
