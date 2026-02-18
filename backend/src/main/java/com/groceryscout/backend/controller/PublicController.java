package com.groceryscout.backend.controller;

import com.groceryscout.backend.entity.Product;
import com.groceryscout.backend.entity.Recipe;
import com.groceryscout.backend.repository.RecipeRepository;
import com.groceryscout.backend.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ProductService productService;
    private final RecipeRepository recipeRepository;

    public PublicController(ProductService productService, RecipeRepository recipeRepository) {
        this.productService = productService;
        this.recipeRepository = recipeRepository;
    }

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/products/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProductById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @GetMapping("/recipes")
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return productService.getAllCategories();
    }
}
