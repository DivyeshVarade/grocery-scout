package com.groceryscout.backend.controller;

import com.groceryscout.backend.dto.ProductRequest;
import com.groceryscout.backend.entity.Product;
import com.groceryscout.backend.entity.User;
import com.groceryscout.backend.repository.UserRepository;
import com.groceryscout.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProductService productService;
    private final UserRepository userRepository;

    public AdminController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    // --- Product CRUD ---
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/products")
    public Product createProduct(@RequestBody ProductRequest req) {
        return productService.createProduct(req);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody ProductRequest req) {
        return productService.updateProduct(id, req);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    // --- User Management ---
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
