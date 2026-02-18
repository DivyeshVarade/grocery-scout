package com.groceryscout.backend.controller;

import com.groceryscout.backend.entity.Order;
import com.groceryscout.backend.entity.OrderStatus;
import com.groceryscout.backend.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    private final OrderService orderService;

    public ManagerController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return orderService.getOrdersByStatus(OrderStatus.valueOf(status.toUpperCase()));
        }
        return orderService.getAllOrders();
    }

    @GetMapping("/orders/paged")
    public ResponseEntity<?> getOrdersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Order> orderPage = orderService.getOrdersPaginated(page, size);
        return ResponseEntity.ok(Map.of(
                "content", orderPage.getContent(),
                "totalPages", orderPage.getTotalPages(),
                "totalElements", orderPage.getTotalElements(),
                "currentPage", orderPage.getNumber(),
                "hasMore", orderPage.hasNext()));
    }

    @PatchMapping("/orders/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        OrderStatus newStatus = OrderStatus.valueOf(body.get("status").toUpperCase());
        return orderService.updateOrderStatus(id, newStatus);
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<?> getRevenuePerDay() {
        return ResponseEntity.ok(orderService.getRevenuePerDay());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(orderService.getDashboardStats());
    }
}
