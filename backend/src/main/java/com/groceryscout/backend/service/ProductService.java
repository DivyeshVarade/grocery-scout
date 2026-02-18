package com.groceryscout.backend.service;

import com.groceryscout.backend.dto.ProductRequest;
import com.groceryscout.backend.entity.Product;
import com.groceryscout.backend.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Retrieves a product by ID, utilizing the 'products' cache.
     * 
     * @param id The product ID.
     * @return An Optional containing the product if found.
     */
    @Cacheable(value = "products", key = "#id")
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    /**
     * Creates a new product from a DTO.
     * Used by Admin/Manager controllers.
     */
    public Product createProduct(ProductRequest request) {
        Product product = new Product();
        mapRequestToProduct(request, product);
        return productRepository.save(product);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    /**
     * Updates an existing product and evicts the associated cache entry.
     * 
     * @param id      The product ID to update.
     * @param request The update data DTO.
     * @return The updated product.
     */
    @CacheEvict(value = "products", key = "#id")
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        mapRequestToProduct(request, product);
        return productRepository.save(product);
    }

    @CacheEvict(value = "products", key = "#id")
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setCategory(productDetails.getCategory());
        product.setImageUrl(productDetails.getImageUrl());
        product.setInventoryCount(productDetails.getInventoryCount());
        product.setIsActive(productDetails.getIsActive());

        return productRepository.save(product);
    }

    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> searchByName(String keyword) {
        return productRepository.searchByName(keyword);
    }

    public List<String> getAllCategories() {
        return productRepository.findDistinctCategories();
    }

    private void mapRequestToProduct(ProductRequest source, Product target) {
        if (source.getName() != null)
            target.setName(source.getName());
        if (source.getDescription() != null)
            target.setDescription(source.getDescription());
        if (source.getPrice() != null)
            target.setPrice(source.getPrice());
        if (source.getUnit() != null)
            target.setUnit(source.getUnit());
        if (source.getCategory() != null)
            target.setCategory(source.getCategory());
        if (source.getInventoryCount() != null)
            target.setInventoryCount(source.getInventoryCount());
        if (source.getImageUrl() != null)
            target.setImageUrl(source.getImageUrl());
        if (source.getIsActive() != null)
            target.setIsActive(source.getIsActive());
    }
}
