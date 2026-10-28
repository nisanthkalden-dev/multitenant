package com.nexora.crm.repository;

import com.nexora.crm.entity.RoleType;
import com.nexora.crm.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUserIdIgnoreCase(String userId);
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByUserIdIgnoreCase(String userId);
    boolean existsByEmailIgnoreCase(String email);

    List<User> findByCompany_Id(String companyId);

    @Query("SELECT u FROM User u WHERE u.company.id = :companyId AND " +
           "(:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.userId) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role)")
    Page<User> searchCompanyUsers(@Param("companyId") String companyId, @Param("search") String search, @Param("role") RoleType role, Pageable pageable);

    long countByCompany_Id(String companyId);
    long countByCompany_IdAndStatusIgnoreCase(String companyId, String status);
}
