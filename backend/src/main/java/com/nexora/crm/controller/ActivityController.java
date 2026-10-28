package com.nexora.crm.controller;

import com.nexora.crm.dto.activity.ActivityRequest;
import com.nexora.crm.dto.activity.ActivityResponse;
import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.common.PaginationMetadata;
import com.nexora.crm.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@Tag(name = "Activity Management", description = "CRM activity timeline and audit log")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    @Operation(summary = "Get activity feed with pagination")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ActivityResponse> pageResult = activityService.getActivities(pageable);
        PaginationMetadata meta = new PaginationMetadata(
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
        return ResponseEntity.ok(ApiResponse.ok("Activities retrieved successfully", pageResult.getContent(), meta));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get top 10 recent activities")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getRecentActivities() {
        List<ActivityResponse> list = activityService.getRecentActivities();
        return ResponseEntity.ok(ApiResponse.ok("Recent activities retrieved successfully", list));
    }

    @PostMapping
    @Operation(summary = "Log an activity (call, deal change, note, document)")
    public ResponseEntity<ApiResponse<ActivityResponse>> createActivity(@Valid @RequestBody ActivityRequest request) {
        ActivityResponse created = activityService.createActivity(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Activity logged successfully", created));
    }
}
