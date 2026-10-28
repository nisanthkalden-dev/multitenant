package com.nexora.crm.dto.activity;

public class ActivityResponse {
    private String id;
    private String companyId;
    private String userId;
    private String userName;
    private String userRole;
    private String action;
    private String target;
    private String time;
    private String type;
    private String activityType;

    public ActivityResponse() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getType() {
        return type != null ? type : activityType;
    }

    public void setType(String type) {
        this.type = type;
        this.activityType = type;
    }

    public String getActivityType() {
        return activityType != null ? activityType : type;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
        this.type = activityType;
    }
}
