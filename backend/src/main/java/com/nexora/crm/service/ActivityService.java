package com.nexora.crm.service;

import com.nexora.crm.dto.activity.ActivityRequest;
import com.nexora.crm.dto.activity.ActivityResponse;
import com.nexora.crm.entity.Activity;
import com.nexora.crm.entity.Company;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.ActivityRepository;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final CompanyRepository companyRepository;
    private final TenantContext tenantContext;

    public ActivityService(ActivityRepository activityRepository, CompanyRepository companyRepository, TenantContext tenantContext) {
        this.activityRepository = activityRepository;
        this.companyRepository = companyRepository;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public Page<ActivityResponse> getActivities(Pageable pageable) {
        String companyId = tenantContext.getCurrentCompanyId();
        if (tenantContext.isEmployee()) {
            return activityRepository.findByCompany_IdAndUserId(companyId, tenantContext.getCurrentUserId(), pageable)
                    .map(this::mapToResponse);
        }
        return activityRepository.findByCompany_Id(companyId, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getRecentActivities() {
        String companyId = tenantContext.getCurrentCompanyId();
        List<Activity> list;
        if (tenantContext.isEmployee()) {
            list = activityRepository.findTop10ByCompany_IdAndUserIdOrderByCreatedAtDesc(companyId, tenantContext.getCurrentUserId());
        } else {
            list = activityRepository.findTop10ByCompany_IdOrderByCreatedAtDesc(companyId);
        }
        return list.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public ActivityResponse createActivity(ActivityRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        Activity act = new Activity();
        act.setId("ACT-" + System.currentTimeMillis());
        act.setCompany(company);
        act.setUserId(tenantContext.getCurrentUserId());
        act.setUserName(tenantContext.getCurrentUserDetails() != null ? tenantContext.getCurrentUserDetails().getFullName() : "User");
        act.setUserRole(tenantContext.getCurrentRole() != null ? tenantContext.getCurrentRole().name() : "EMPLOYEE");
        act.setAction(request.getAction().trim());
        act.setTarget(request.getTarget());
        act.setActivityType(request.getType() != null ? request.getType() : "general");

        Activity saved = activityRepository.save(act);
        return mapToResponse(saved);
    }

    private ActivityResponse mapToResponse(Activity a) {
        ActivityResponse res = new ActivityResponse();
        res.setId(a.getId());
        res.setCompanyId(a.getCompanyId());
        res.setUserId(a.getUserId());
        res.setUserName(a.getUserName());
        res.setUserRole(a.getUserRole());
        res.setAction(a.getAction());
        res.setTarget(a.getTarget());
        res.setTime("Recently");
        res.setType(a.getActivityType());
        res.setActivityType(a.getActivityType());
        return res;
    }
}
