package com.nexora.crm.repository;

import com.nexora.crm.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    Optional<Task> findByIdAndCompany_Id(String id, String companyId);

    List<Task> findByCompany_Id(String companyId);

    List<Task> findByCompany_IdAndAssignedTo(String companyId, String assignedTo);

    @Query("SELECT t FROM Task t WHERE t.company.id = :companyId AND " +
           "(:assignedTo IS NULL OR t.assignedTo = :assignedTo) AND " +
           "(:status IS NULL OR :status = '' OR :status = 'All' OR t.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.relatedTo) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> searchTasks(
            @Param("companyId") String companyId,
            @Param("assignedTo") String assignedTo,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCompany_Id(String companyId);
    long countByCompany_IdAndStatusIgnoreCase(String companyId, String status);
    long countByCompany_IdAndAssignedTo(String companyId, String assignedTo);
    long countByCompany_IdAndAssignedToAndStatusIgnoreCase(String companyId, String assignedTo, String status);
}
