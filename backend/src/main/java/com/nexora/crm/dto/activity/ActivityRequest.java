package com.nexora.crm.dto.activity;

import jakarta.validation.constraints.NotBlank;

public class ActivityRequest {

    @NotBlank(message = "Action is required")
    private String action;

    private String target;
    private String type;
    private String activityType;

    public ActivityRequest() {}

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
