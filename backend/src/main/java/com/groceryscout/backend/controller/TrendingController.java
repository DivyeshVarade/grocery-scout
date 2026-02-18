package com.groceryscout.backend.controller;

import com.groceryscout.backend.entity.Product;
import com.groceryscout.backend.service.TrendingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trending")
public class TrendingController {

    private final TrendingService trendingService;

    public TrendingController(TrendingService trendingService) {
        this.trendingService = trendingService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getTrendingProducts(@RequestParam(defaultValue = "10") int limit) {
        List<Product> products = trendingService.getTrendingProducts(limit);
        return ResponseEntity.ok(products);
    }
}
