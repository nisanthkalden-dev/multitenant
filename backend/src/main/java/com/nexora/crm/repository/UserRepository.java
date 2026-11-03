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

    Optional<User> findByIdAndCompany_Id(Long id, String companyId);
    Optional<User> findByUserIdIgnoreCaseAndCompany_Id(String userId, String companyId);

    boolean existsByUserIdIgnoreCase(String userId);
    boolean existsByEmailIgnoreCase(String email);

    List<User> findByCompany_Id(String companyId);
    List<User> findByCompany_IdAndRole(String companyId, RoleType role);

    @Query("SELECT u FROM User u WHERE u.company.id = :companyId AND " +
           "(:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.userId) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:department IS NULL OR :department = '' OR :department = 'All' OR LOWER(u.department) = LOWER(:department)) AND " +
           "(:status IS NULL OR :status = '' OR :status = 'All' OR LOWER(u.status) = LOWER(:status)) AND " +
           "(:managerId IS NULL OR :managerId = '' OR :managerId = 'All' OR u.managerId = :managerId)")
    Page<User> searchCompanyEmployees(
            @Param("companyId") String companyId,
            @Param("search") String search,
            @Param("role") RoleType role,
            @Param("department") String department,
            @Param("status") String status,
            @Param("managerId") String managerId,
            Pageable pageable
    );

    @Query("SELECT u FROM User u WHERE u.company.id = :companyId AND " +
           "(:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.userId) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role)")
    Page<User> searchCompanyUsers(@Param("companyId") String companyId, @Param("search") String search, @Param("role") RoleType role, Pageable pageable);

    long countByCompany_Id(String companyId);
    long countByCompany_IdAndStatusIgnoreCase(String companyId, String status);
    long countByCompany_IdAndIsActive(String companyId, Boolean isActive);
}
