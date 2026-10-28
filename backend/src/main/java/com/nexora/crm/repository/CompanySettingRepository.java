package com.nexora.crm.repository;

import com.nexora.crm.entity.CompanySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanySettingRepository extends JpaRepository<CompanySetting, String> {
}
