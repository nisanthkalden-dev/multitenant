package com.nexora.crm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.crm.dto.settings.PlatformSettingsDto;
import com.nexora.crm.entity.PlatformSetting;
import com.nexora.crm.repository.PlatformSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class PlatformSettingService {

    private final PlatformSettingRepository settingRepository;
    private final ObjectMapper objectMapper;

    public PlatformSettingService(PlatformSettingRepository settingRepository, ObjectMapper objectMapper) {
        this.settingRepository = settingRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public PlatformSettingsDto getPlatformSettings() {
        PlatformSettingsDto dto = new PlatformSettingsDto();
        dto.setPlatformName(getSettingValue("platform_name", "NEXORA CRM"));
        dto.setPlatformEmail(getSettingValue("platform_email", "support@nexoracrm.com"));
        dto.setSupportPhone(getSettingValue("support_phone", "+91 98765 00000"));
        dto.setDefaultCurrency(getSettingValue("default_currency", "INR - ₹"));
        dto.setDefaultTimezone(getSettingValue("default_timezone", "Asia/Kolkata"));
        dto.setDateFormat(getSettingValue("date_format", "DD/MM/YYYY"));
        dto.setLogoUrl(getSettingValue("logo_url", null));

        String extraJson = getSettingValue("extra_settings", null);
        if (extraJson != null && !extraJson.isBlank()) {
            try {
                dto.setExtra(objectMapper.readValue(extraJson, new TypeReference<Map<String, Object>>() {}));
            } catch (Exception ignored) {
                dto.setExtra(new HashMap<>());
            }
        }
        return dto;
    }

    @Transactional
    public PlatformSettingsDto updatePlatformSettings(PlatformSettingsDto request) {
        if (request.getPlatformName() != null) {
            saveOrUpdateSetting("platform_name", request.getPlatformName().trim());
        }
        if (request.getPlatformEmail() != null) {
            saveOrUpdateSetting("platform_email", request.getPlatformEmail().trim());
        }
        if (request.getSupportPhone() != null) {
            saveOrUpdateSetting("support_phone", request.getSupportPhone().trim());
        }
        if (request.getDefaultCurrency() != null) {
            saveOrUpdateSetting("default_currency", request.getDefaultCurrency().trim());
        }
        if (request.getDefaultTimezone() != null) {
            saveOrUpdateSetting("default_timezone", request.getDefaultTimezone().trim());
        }
        if (request.getDateFormat() != null) {
            saveOrUpdateSetting("date_format", request.getDateFormat().trim());
        }
        if (request.getLogoUrl() != null) {
            String logo = request.getLogoUrl().trim();
            if (logo.isEmpty()) {
                settingRepository.findBySettingKey("logo_url").ifPresent(settingRepository::delete);
            } else {
                saveOrUpdateSetting("logo_url", logo);
            }
        }
        if (request.getExtra() != null) {
            try {
                String json = objectMapper.writeValueAsString(request.getExtra());
                saveOrUpdateSetting("extra_settings", json);
            } catch (Exception ignored) {}
        }
        return getPlatformSettings();
    }

    @Transactional
    public PlatformSettingsDto removeLogo() {
        settingRepository.findBySettingKey("logo_url").ifPresent(settingRepository::delete);
        return getPlatformSettings();
    }

    private String getSettingValue(String key, String defaultValue) {
        return settingRepository.findBySettingKey(key)
                .map(PlatformSetting::getSettingValue)
                .orElse(defaultValue);
    }

    private void saveOrUpdateSetting(String key, String value) {
        PlatformSetting setting = settingRepository.findBySettingKey(key)
                .orElseGet(() -> new PlatformSetting(key, value));
        setting.setSettingValue(value);
        settingRepository.save(setting);
    }
}
