package com.nexora.crm.repository;

import com.nexora.crm.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {

    Optional<Activity> findByIdAndCompany_Id(String id, String companyId);

    List<Activity> findTop10ByCompany_IdOrderByCreatedAtDesc(String companyId);

    List<Activity> findTop10ByCompany_IdAndUserIdOrderByCreatedAtDesc(String companyId, String userId);

    Page<Activity> findByCompany_Id(String companyId, Pageable pageable);

    Page<Activity> findByCompany_IdAndUserId(String companyId, String userId, Pageable pageable);

    long countByCompany_Id(String companyId);
}
