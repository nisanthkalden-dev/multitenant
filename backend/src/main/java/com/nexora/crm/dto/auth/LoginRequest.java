package com.nexora.crm.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "User ID or Email is required")
    private String userId;

    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String loginType; // "company" or "super_admin"

    public LoginRequest() {}

    public LoginRequest(String userId, String password) {
        this.userId = userId;
        this.password = password;
    }

    public LoginRequest(String userId, String password, String loginType) {
        this.userId = userId;
        this.password = password;
        this.loginType = loginType;
    }

    public String getUserId() {
        return userId != null ? userId : email;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email != null ? email : userId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getLoginType() {
        return loginType;
    }

    public void setLoginType(String loginType) {
        this.loginType = loginType;
    }
}
