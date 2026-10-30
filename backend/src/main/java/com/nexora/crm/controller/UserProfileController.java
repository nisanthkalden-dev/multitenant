package com.nexora.crm.controller;

import com.nexora.crm.dto.auth.UserSummaryDto;
import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.user.PasswordChangeRequest;
import com.nexora.crm.dto.user.UserUpdateRequest;
import com.nexora.crm.service.AuthService;
import com.nexora.crm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@Tag(name = "User Profile", description = "Current authenticated user profile and password operations")
public class UserProfileController {

    private final UserService userService;
    private final AuthService authService;

    public UserProfileController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getProfile() {
        UserSummaryDto user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved successfully", user));
    }

    @PutMapping
    @Operation(summary = "Update current user profile (name, phone, department)")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateProfile(@RequestBody UserUpdateRequest request) {
        UserSummaryDto updated = userService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @DeleteMapping("/avatar")
    @Operation(summary = "Remove current user profile picture")
    public ResponseEntity<ApiResponse<UserSummaryDto>> removeAvatar() {
        UserSummaryDto updated = userService.removeCurrentUserAvatar();
        return ResponseEntity.ok(ApiResponse.ok("Profile picture removed successfully", updated));
    }

    @PutMapping("/password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        userService.changeCurrentUserPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully", null));
    }
}
