package com.nexora.crm.repository;

import com.nexora.crm.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {

    boolean existsByIdIgnoreCase(String id);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT c FROM Company c WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR :status = 'All' OR LOWER(c.status) = LOWER(:status))")
    Page<Company> searchCompanies(@Param("search") String search, @Param("status") String status, Pageable pageable);

    long countByStatusIgnoreCase(String status);
}
