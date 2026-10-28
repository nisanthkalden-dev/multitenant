package com.nexora.crm.repository;

import com.nexora.crm.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, String> {

    Optional<Lead> findByIdAndCompany_Id(String id, String companyId);

    List<Lead> findByCompany_Id(String companyId);

    @Query("SELECT l FROM Lead l WHERE l.company.id = :companyId AND " +
           "(:assignedTo IS NULL OR l.assignedTo = :assignedTo) AND " +
           "(:stage IS NULL OR :stage = '' OR :stage = 'All' OR l.stage = :stage) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.contactName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Lead> searchLeads(
            @Param("companyId") String companyId,
            @Param("assignedTo") String assignedTo,
            @Param("stage") String stage,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCompany_Id(String companyId);
    long countByCompany_IdAndAssignedTo(String companyId, String assignedTo);
}
