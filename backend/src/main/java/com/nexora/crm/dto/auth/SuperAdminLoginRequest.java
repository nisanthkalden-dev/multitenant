package com.nexora.crm.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class SuperAdminLoginRequest {

    @NotBlank(message = "Email or User ID is required")
    private String email;

    private String userId;

    @NotBlank(message = "Password is required")
    private String password;

    public SuperAdminLoginRequest() {}

    public SuperAdminLoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email != null ? email : userId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserId() {
        return userId != null ? userId : email;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
