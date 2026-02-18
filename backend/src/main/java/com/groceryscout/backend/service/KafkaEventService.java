package com.groceryscout.backend.service;

import com.groceryscout.backend.dto.OrderEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class KafkaEventService {

    private static final Logger log = LoggerFactory.getLogger(KafkaEventService.class);

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOrderCreated(OrderEvent event) {
        if (kafkaTemplate == null) {
            log.warn("Kafka is not available. Skipping 'orders.created' event for Order ID: {}", event.getOrderId());
            return;
        }
        log.info("Sending 'orders.created' event for Order ID: {}", event.getOrderId());
        kafkaTemplate.send("orders.created", event);
    }

    public void sendOrderStatusChanged(Long orderId, String oldStatus, String newStatus) {
        if (kafkaTemplate == null) {
            log.warn("Kafka is not available. Skipping 'notifications.email' event for Order ID: {}", orderId);
            return;
        }
        log.info("Sending 'notifications.email' for Order Status Change");
        kafkaTemplate.send("notifications.email", Map.of("orderId", orderId, "status", newStatus));
    }

    public void sendRecipeGenerated(Long recipeId, String ingredientsCsv) {
        if (kafkaTemplate == null) {
            log.warn("Kafka is not available. Skipping 'recipes.generated' event for Recipe ID: {}", recipeId);
            return;
        }
        log.info("Sending 'recipes.generated' event for Recipe ID: {}", recipeId);
        kafkaTemplate.send("recipes.generated", Map.of("recipeId", recipeId, "ingredients", ingredientsCsv));
    }

    public void sendInventoryUpdate(Long productId, String productName, int oldCount, int newCount) {
        if (kafkaTemplate == null) {
            log.warn("Kafka is not available. Skipping 'inventory.updates' event for Product: {}", productName);
            return;
        }
        log.info("Sending 'inventory.updates' event: {} ({} → {})", productName, oldCount, newCount);
        kafkaTemplate.send("inventory.updates", Map.of(
                "productId", productId,
                "productName", productName,
                "oldCount", oldCount,
                "newCount", newCount));
    }
}
