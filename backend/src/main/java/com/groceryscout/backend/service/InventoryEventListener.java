package com.groceryscout.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groceryscout.backend.dto.OrderEvent;
import com.groceryscout.backend.entity.Product;
import com.groceryscout.backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true", matchIfMissing = false)
public class InventoryEventListener {

    private static final Logger log = LoggerFactory.getLogger(InventoryEventListener.class);
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;
    private final TrendingService trendingService;

    @KafkaListener(topics = "orders.created", groupId = "inventory-group")
    @Transactional
    public void handleOrderCreated(Object message) {
        try {
            OrderEvent event;
            // Handle different deserialization cases (LinkedHashMap vs Typed Object)
            if (message instanceof LinkedHashMap) {
                event = objectMapper.convertValue(message, OrderEvent.class);
            } else if (message instanceof OrderEvent) {
                event = (OrderEvent) message;
            } else {
                log.warn("Unknown message type received: {}", message.getClass());
                return;
            }

            log.info("Received 'orders.created' for Order ID: {}. Updating inventory...",
                    event.getOrderId());

            for (OrderEvent.OrderItemDto item : event.getItems()) {
                // Update Trending Score
                trendingService.incrementProductPopularity(item.getProductId());

                Optional<Product> productOpt = productRepository.findById(item.getProductId());
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    int newStock = product.getInventoryCount() - item.getQuantity();

                    // Basic check, though OrderService likely checked this too.
                    // In a real distributed system, we'd handle race conditions here or via
                    // optimistic locking.
                    if (newStock < 0) {
                        log.warn("Stock went negative for Product ID: {}", product.getId());
                        newStock = 0;
                    }

                    product.setInventoryCount(newStock);
                    productRepository.save(product);
                    log.info("Updated stock for Product ID {}: {} -> {}", product.getId(),
                            product.getInventoryCount() + item.getQuantity(), newStock);
                } else {
                    log.error("Product ID {} not found in inventory update!",
                            item.getProductId());
                    // Do NOT throw exception to avoid infinite retry loop for bad data
                }
            }
        } catch (Exception e) {
            log.error("Error processing inventory update for message: {}", message, e);
        }
    }
}
