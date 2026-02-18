package com.groceryscout.backend.service;

import com.groceryscout.backend.dto.CartRequest;
import com.groceryscout.backend.entity.*;
import com.groceryscout.backend.repository.OrderRepository;
import com.groceryscout.backend.repository.ProductRepository;
import com.groceryscout.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manages order lifecycle, including placement, status updates, and historical
 * retrieval.
 * Interactions with inventory and analytics are decoupled via Kafka events.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final KafkaEventService kafkaEventService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
            UserRepository userRepository, KafkaEventService kafkaEventService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.kafkaEventService = kafkaEventService;
    }

    /**
     * Persists a new order and publishes an creation event.
     * Performs synchronous stock validation; inventory deduction is asynchronous.
     *
     * @param userEmail   Authenticated user email
     * @param cartRequest Request payload containing delivery details and items
     * @return The persisted Order entity
     * @throws RuntimeException on validation failure (User not found, Stock
     *                          insufficient)
     */
    @Transactional
    public Order placeOrder(String userEmail, CartRequest cartRequest) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User lookup failed: " + userEmail));

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(cartRequest.getDeliveryAddress());
        order.setStatus(OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartRequest.CartItemRequest requestItem : cartRequest.getItems()) {
            Product product = productRepository.findById(requestItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + requestItem.getProductId()));

            // Optimistic concurrency check
            if (product.getInventoryCount() < requestItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(requestItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());

            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(requestItem.getQuantity())));
        }

        order.setTotalPrice(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Transform to DTO for event publication
        List<com.groceryscout.backend.dto.OrderEvent.OrderItemDto> orderItems = savedOrder.getItems().stream()
                .map(item -> new com.groceryscout.backend.dto.OrderEvent.OrderItemDto(
                        item.getProduct().getId(),
                        item.getQuantity()))
                .collect(Collectors.toList());

        com.groceryscout.backend.dto.OrderEvent orderEvent = new com.groceryscout.backend.dto.OrderEvent(
                savedOrder.getId(),
                user.getId(),
                orderItems);

        kafkaEventService.sendOrderCreated(orderEvent);

        return savedOrder;
    }

    /**
     * Transitions order status and triggers side-effects (Inventory, Audit).
     *
     * @param orderId   Target order ID
     * @param newStatus Target status
     * @return Updated Order entity
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        String oldStatus = order.getStatus().name();
        order.setStatus(newStatus);

        // Trigger inventory adjustment upon delivery confirmation
        if (newStatus == OrderStatus.DELIVERED && !oldStatus.equals("DELIVERED")) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                int previousStock = product.getInventoryCount();
                int updatedStock = Math.max(0, previousStock - item.getQuantity());

                product.setInventoryCount(updatedStock);
                productRepository.save(product);

                kafkaEventService.sendInventoryUpdate(product.getId(), product.getName(), previousStock, updatedStock);
            }
        }

        Order savedOrder = orderRepository.save(order);
        kafkaEventService.sendOrderStatusChanged(orderId, oldStatus, newStatus.name());
        return savedOrder;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Page<Order> getOrdersPaginated(int page, int size) {
        return orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    /**
     * Aggregates daily revenue for dashboard analytics.
     */
    public List<Map<String, Object>> getRevenuePerDay() {
        return orderRepository.getRevenuePerDay().stream()
                .map(row -> Map.<String, Object>of("day", row[0], "revenue", row[1]))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getDashboardStats() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        BigDecimal revenue = orderRepository.sumTotalRevenue();
        return Map.of(
                "totalOrders", totalOrders,
                "pendingOrders", pendingOrders,
                "revenue", revenue != null ? revenue : BigDecimal.ZERO);
    }
}
