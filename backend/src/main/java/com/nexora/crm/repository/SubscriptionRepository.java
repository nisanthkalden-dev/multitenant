package com.nexora.crm.repository;

import com.nexora.crm.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    Optional<Subscription> findTopByCompany_IdOrderByCreatedAtDesc(String companyId);

    List<Subscription> findByCompany_IdOrderByCreatedAtDesc(String companyId);

    Page<Subscription> findAll(Pageable pageable);

    long countByStatusIgnoreCase(String status);
}
