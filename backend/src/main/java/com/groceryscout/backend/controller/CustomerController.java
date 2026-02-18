package com.groceryscout.backend.controller;

import com.groceryscout.backend.dto.CartRequest;
import com.groceryscout.backend.entity.*;
import com.groceryscout.backend.repository.CartItemRepository;
import com.groceryscout.backend.repository.RecipeRepository;
import com.groceryscout.backend.repository.UserRepository;
import com.groceryscout.backend.service.GeminiRecipeService;
import com.groceryscout.backend.service.OrderService;
import com.groceryscout.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class CustomerController {

    private final OrderService orderService;
    private final ProductService productService;
    private final GeminiRecipeService geminiRecipeService;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final com.groceryscout.backend.service.RecipeService recipeService;

    public CustomerController(OrderService orderService, ProductService productService,
            GeminiRecipeService geminiRecipeService, RecipeRepository recipeRepository,
            UserRepository userRepository, CartItemRepository cartItemRepository,
            com.groceryscout.backend.service.RecipeService recipeService) {
        this.orderService = orderService;
        this.productService = productService;
        this.geminiRecipeService = geminiRecipeService;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.recipeService = recipeService;
    }

    // --- Product Browsing ---
    @GetMapping("/products")
    public List<Product> getActiveProducts() {
        return productService.getAllActiveProducts();
    }

    @GetMapping("/products/search")
    public List<Product> searchProducts(@RequestParam String q) {
        return productService.searchByName(q);
    }

    // --- Cart ---
    @GetMapping("/cart")
    public List<CartItem> getCart(Authentication auth) {
        User user = getUser(auth);
        return cartItemRepository.findByUserId(user.getId());
    }

    @PostMapping("/cart/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            User user = getUser(auth);
            if (body.get("productId") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Product ID is missing"));
            }
            Long productId = Long.valueOf(body.get("productId").toString());
            int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;

            Product product = productService.getProductById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            var existing = cartItemRepository.findByUserIdAndProductId(user.getId(), productId);
            if (existing.isPresent()) {
                CartItem item = existing.get();
                item.setQuantity(item.getQuantity() + quantity);
                cartItemRepository.save(item);
                return ResponseEntity.ok(Map.of("message", "Quantity updated", "quantity", item.getQuantity()));
            } else {
                CartItem item = new CartItem();
                item.setUser(user);
                item.setProduct(product);
                item.setQuantity(quantity);
                cartItemRepository.save(item);
                return ResponseEntity.ok(Map.of("message", "Added to cart"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to add to cart: " + e.getClass().getName() + " - " + e.getMessage()));
        }
    }

    @PutMapping("/cart/{productId}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long productId, @RequestBody Map<String, Integer> body,
            Authentication auth) {
        User user = getUser(auth);
        int quantity = body.getOrDefault("quantity", 1);

        var existing = cartItemRepository.findByUserIdAndProductId(user.getId(), productId);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Item not in cart"));
        }

        if (quantity <= 0) {
            cartItemRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("message", "Removed from cart"));
        }

        CartItem item = existing.get();
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Quantity updated", "quantity", quantity));
    }

    @DeleteMapping("/cart/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId, Authentication auth) {
        User user = getUser(auth);
        var existing = cartItemRepository.findByUserIdAndProductId(user.getId(), productId);
        existing.ifPresent(cartItemRepository::delete);
        return ResponseEntity.ok(Map.of("message", "Removed from cart"));
    }

    @DeleteMapping("/cart")
    @Transactional
    public ResponseEntity<?> clearCart(Authentication auth) {
        User user = getUser(auth);
        cartItemRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }

    @PostMapping("/cart/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> body, Authentication auth) {
        User user = getUser(auth);
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        CartRequest cartRequest = new CartRequest();
        cartRequest.setDeliveryAddress(body.getOrDefault("deliveryAddress", ""));
        cartRequest.setItems(cartItems.stream().map(ci -> {
            CartRequest.CartItemRequest item = new CartRequest.CartItemRequest();
            item.setProductId(ci.getProduct().getId());
            item.setQuantity(ci.getQuantity());
            return item;
        }).toList());

        Order order = orderService.placeOrder(auth.getName(), cartRequest);

        // Clear cart after successful order
        cartItemRepository.deleteByUserId(user.getId());

        return ResponseEntity.ok(Map.of("message", "Order placed!", "orderId", order.getId()));
    }

    // --- Orders ---
    @PostMapping("/orders")
    public Order placeOrder(@RequestBody CartRequest cartRequest, Authentication auth) {
        return orderService.placeOrder(auth.getName(), cartRequest);
    }

    @GetMapping("/orders")
    public List<Order> getMyOrders(Authentication auth) {
        User user = getUser(auth);
        return orderService.getOrdersByUser(user.getId());
    }

    // --- Chef Assistant AI ---
    @PostMapping("/chef/generate")
    public ResponseEntity<?> generateRecipe(@RequestBody Map<String, String> body, Authentication auth) {
        String prompt = body.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required"));
        }
        try {
            Recipe recipe = geminiRecipeService.generateRecipe(prompt, auth.getName());
            return ResponseEntity.ok(recipe);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/recipes")
    public List<Recipe> getMyRecipes(Authentication auth) {
        User user = getUser(auth);
        return recipeService.getRecipesForUser(user);
    }

    @DeleteMapping("/recipes/{id}")

    public ResponseEntity<?> deleteRecipe(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        try {
            recipeService.deleteRecipe(id, user);
            return ResponseEntity.ok(Map.of("message", "Recipe deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/recipe/{id}/to-cart")
    public ResponseEntity<?> recipeToCart(@PathVariable Long id, Authentication auth) {
        try {
            CartRequest cart = geminiRecipeService.convertRecipeToCart(id);
            Order order = orderService.placeOrder(auth.getName(), cart);
            return ResponseEntity.ok(Map.of("message", "Order placed from recipe", "orderId", order.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Helper
    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
