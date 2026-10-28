package com.nexora.crm.service;

import com.nexora.crm.dto.task.TaskRequest;
import com.nexora.crm.dto.task.TaskResponse;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.Task;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.TaskRepository;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final CompanyRepository companyRepository;
    private final TenantContext tenantContext;

    public TaskService(TaskRepository taskRepository, CompanyRepository companyRepository, TenantContext tenantContext) {
        this.taskRepository = taskRepository;
        this.companyRepository = companyRepository;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(String search, String status, Pageable pageable) {
        String companyId = tenantContext.getCurrentCompanyId();
        String assignedToFilter = null;
        if (tenantContext.isEmployee()) {
            assignedToFilter = tenantContext.getCurrentUserId();
        }

        Page<Task> page = taskRepository.searchTasks(companyId, assignedToFilter, status, search, pageable);
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasksList() {
        String companyId = tenantContext.getCurrentCompanyId();
        List<Task> list = taskRepository.findByCompany_Id(companyId);
        if (tenantContext.isEmployee()) {
            String userId = tenantContext.getCurrentUserId();
            list = list.stream().filter(t -> userId.equalsIgnoreCase(t.getAssignedTo())).toList();
        }
        return list.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Task task = taskRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (tenantContext.isEmployee() && !tenantContext.getCurrentUserId().equalsIgnoreCase(task.getAssignedTo())) {
            throw new ResourceNotFoundException("Task not found or not assigned to you: " + id);
        }

        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        Task task = new Task();
        task.setId("TASK-" + System.currentTimeMillis());
        task.setCompany(company);
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate() != null ? request.getDueDate() : "Due this week");
        task.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        task.setStatus(request.getStatus() != null ? request.getStatus() : "Pending");
        task.setCategory(request.getCategory() != null ? request.getCategory() : "General");

        String assigned = request.getAssignedTo();
        if (assigned == null || assigned.isBlank()) {
            assigned = tenantContext.getCurrentUserId();
        }
        task.setAssignedTo(assigned);

        String creatorName = request.getAssignedByName();
        if (creatorName == null || creatorName.isBlank()) {
            creatorName = tenantContext.getCurrentUserDetails() != null
                    ? tenantContext.getCurrentUserDetails().getFullName() + " (" + tenantContext.getCurrentRole() + ")"
                    : "Manager";
        }
        task.setAssignedByName(creatorName);
        task.setRelatedTo(request.getRelatedTo() != null ? request.getRelatedTo() : "Operations");

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Transactional
    public TaskResponse updateTask(String id, TaskRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Task task = taskRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (request.getTitle() != null) task.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate().trim());
        if (request.getPriority() != null) task.setPriority(request.getPriority().trim());
        if (request.getStatus() != null) task.setStatus(request.getStatus().trim());
        if (request.getCategory() != null) task.setCategory(request.getCategory().trim());
        if (request.getAssignedTo() != null) task.setAssignedTo(request.getAssignedTo().trim());
        if (request.getRelatedTo() != null) task.setRelatedTo(request.getRelatedTo().trim());

        Task updated = taskRepository.save(task);
        return mapToResponse(updated);
    }

    @Transactional
    public TaskResponse toggleTaskStatus(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Task task = taskRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        String newStatus = "Completed".equalsIgnoreCase(task.getStatus()) ? "Pending" : "Completed";
        task.setStatus(newStatus);
        Task updated = taskRepository.save(task);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTask(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Task task = taskRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    private TaskResponse mapToResponse(Task t) {
        TaskResponse res = new TaskResponse();
        res.setId(t.getId());
        res.setCompanyId(t.getCompanyId());
        res.setTitle(t.getTitle());
        res.setDescription(t.getDescription());
        res.setDueDate(t.getDueDate());
        res.setPriority(t.getPriority());
        res.setStatus(t.getStatus());
        res.setCategory(t.getCategory());
        res.setAssignedTo(t.getAssignedTo());
        res.setAssignedByName(t.getAssignedByName());
        res.setRelatedTo(t.getRelatedTo());
        return res;
    }
}
