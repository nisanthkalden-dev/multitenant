package com.nexora.crm.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private PaginationMetadata pagination;
    private Map<String, Object> meta;
    private int status;
    private Instant timestamp;

    public ApiResponse() {
        this.timestamp = Instant.now();
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now();
        this.status = success ? 200 : 400;
    }

    public ApiResponse(boolean success, String message, T data, int status) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.status = status;
        this.timestamp = Instant.now();
    }

    public ApiResponse(boolean success, String message, T data, PaginationMetadata pagination) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.pagination = pagination;
        this.timestamp = Instant.now();
        this.status = 200;
    }

    public ApiResponse(boolean success, String message, T data, PaginationMetadata pagination, Map<String, Object> meta) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.pagination = pagination;
        this.meta = meta;
        this.timestamp = Instant.now();
        this.status = 200;
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, 200);
    }

    public static <T> ApiResponse<T> ok(String message, T data, PaginationMetadata pagination) {
        return new ApiResponse<>(true, message, data, pagination);
    }

    public static <T> ApiResponse<T> ok(String message, T data, PaginationMetadata pagination, Map<String, Object> meta) {
        return new ApiResponse<>(true, message, data, pagination, meta);
    }

    public static <T> ApiResponse<T> error(String message, int status) {
        return new ApiResponse<>(false, message, null, status);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public PaginationMetadata getPagination() {
        return pagination;
    }

    public void setPagination(PaginationMetadata pagination) {
        this.pagination = pagination;
    }

    public Map<String, Object> getMeta() {
        return meta;
    }

    public void setMeta(Map<String, Object> meta) {
        this.meta = meta;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
