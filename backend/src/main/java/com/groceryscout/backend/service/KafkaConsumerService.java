package com.groceryscout.backend.service;

import com.groceryscout.backend.entity.AuditLog;
import com.groceryscout.backend.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * Kafka consumer service.
 * Active only when kafka.enabled=true in application.properties.
 *
 * Listens to:
 * 1. notifications.email — logs order status changes to audit_log table
 * 2. recipes.generated — logs recipe generation events
 * 3. inventory.updates — logs inventory changes when orders are delivered
 */
@Service
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);
    private final AuditLogRepository auditLogRepository;

    public KafkaConsumerService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        log.info(
                "KafkaConsumerService initialized — listeners active on: notifications.email, recipes.generated, inventory.updates");
    }

    @KafkaListener(topics = "notifications.email", groupId = "grocery-scout-group")
    public void handleOrderStatusChanged(String message) {
        log.info("📧 [Kafka] Received ORDER_STATUS_CHANGED: {}", message);
        AuditLog auditLog = new AuditLog();
        auditLog.setEventType("ORDER_STATUS_CHANGED");
        auditLog.setPayload(message);
        auditLogRepository.save(auditLog);
        log.info("📧 [Kafka] Saved audit log. In production, this would trigger an email notification.");
    }

    @KafkaListener(topics = "recipes.generated", groupId = "grocery-scout-group")
    public void handleRecipeGenerated(String message) {
        log.info("🍳 [Kafka] Received RECIPE_GENERATED: {}", message);
        AuditLog auditLog = new AuditLog();
        auditLog.setEventType("RECIPE_GENERATED");
        auditLog.setPayload(message);
        auditLogRepository.save(auditLog);
        log.info("🍳 [Kafka] Saved audit log. In production, this would update trending ingredients cache.");
    }

    @KafkaListener(topics = "inventory.updates", groupId = "grocery-scout-group")
    public void handleInventoryUpdate(String message) {
        log.info("📦 [Kafka] Received INVENTORY_UPDATE: {}", message);
        AuditLog auditLog = new AuditLog();
        auditLog.setEventType("INVENTORY_UPDATE");
        auditLog.setPayload(message);
        auditLogRepository.save(auditLog);
        log.info("📦 [Kafka] Saved audit log for inventory change.");
    }
}
