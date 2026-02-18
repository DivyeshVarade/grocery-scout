package com.groceryscout.backend.service;

import com.groceryscout.backend.entity.Product;
import com.groceryscout.backend.repository.ProductRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TrendingService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductRepository productRepository;
    private static final String TRENDING_KEY = "trending_products";

    public TrendingService(RedisTemplate<String, Object> redisTemplate, ProductRepository productRepository) {
        this.redisTemplate = redisTemplate;
        this.productRepository = productRepository;
    }

    /**
     * Increment the popularity score of a product.
     * 
     * @param productId The ID of the product.
     */
    public void incrementProductPopularity(Long productId) {
        redisTemplate.opsForZSet().incrementScore(TRENDING_KEY, String.valueOf(productId), 1);
    }

    /**
     * Get the top trending products.
     * 
     * @param limit The number of products to retrieve.
     * @return List of Product entities.
     */
    public List<Product> getTrendingProducts(int limit) {
        // Get top product IDs from Redis ZSET (Highest score first)
        Set<Object> productIds = redisTemplate.opsForZSet().reverseRange(TRENDING_KEY, 0, limit - 1);

        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Convert String IDs to Long
        List<Long> ids = productIds.stream()
                .map(id -> Long.valueOf(id.toString()))
                .collect(Collectors.toList());

        // Fetch products from DB (or Cache via Repository if cached)
        // Ensure order matches the ZSET order
        List<Product> products = productRepository.findAllById(ids);

        // Sort products based on the order of IDs returned by Redis
        List<Product> sortedProducts = new ArrayList<>();
        for (Long id : ids) {
            products.stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .ifPresent(sortedProducts::add);
        }

        return sortedProducts;
    }
}
