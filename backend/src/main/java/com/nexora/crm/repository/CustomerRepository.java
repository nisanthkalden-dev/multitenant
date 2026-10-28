package com.nexora.crm.repository;

import com.nexora.crm.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    Optional<Customer> findByIdAndCompany_Id(String id, String companyId);

    List<Customer> findByCompany_Id(String companyId);

    @Query("SELECT c FROM Customer c WHERE c.company.id = :companyId AND " +
           "(:assignedTo IS NULL OR c.assignedTo = :assignedTo) AND " +
           "(:tier IS NULL OR :tier = '' OR :tier = 'All' OR c.tier = :tier) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.industry) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Customer> searchCustomers(
            @Param("companyId") String companyId,
            @Param("assignedTo") String assignedTo,
            @Param("tier") String tier,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCompany_Id(String companyId);
    long countByCompany_IdAndAssignedTo(String companyId, String assignedTo);
}
