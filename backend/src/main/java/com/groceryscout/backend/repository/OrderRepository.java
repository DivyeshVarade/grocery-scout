package com.groceryscout.backend.repository;

import com.groceryscout.backend.entity.Order;
import com.groceryscout.backend.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatus(OrderStatus status);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query(value = "SELECT DATE(created_at) as day, SUM(total_price) as revenue " +
            "FROM orders GROUP BY DATE(created_at) ORDER BY day DESC", nativeQuery = true)
    List<Object[]> getRevenuePerDay();

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.status = com.groceryscout.backend.entity.OrderStatus.DELIVERED")
    java.math.BigDecimal sumTotalRevenue();

    long countByStatus(OrderStatus status);
}
