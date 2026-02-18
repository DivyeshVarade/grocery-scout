package com.groceryscout.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.groceryscout.backend.dto.CartRequest;
import com.groceryscout.backend.entity.HiddenRecipe;
import com.groceryscout.backend.entity.Product;
import com.groceryscout.backend.entity.User;
import com.groceryscout.backend.repository.HiddenRecipeRepository;
import com.groceryscout.backend.repository.ProductRepository;
import com.groceryscout.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for AI-driven recipe generation using Google Gemini API.
 * Handles prompt construction, response parsing, and ingredient mapping to
 * internal inventory.
 */
@Service
public class GeminiRecipeService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String geminiModel;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final ObjectMapper objectMapper;
    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;
    private final HiddenRecipeRepository hiddenRecipeRepository;
    private final UserRepository userRepository;
    private final KafkaEventService kafkaEventService;

    public GeminiRecipeService(ObjectMapper objectMapper, ProductRepository productRepository,
            RestTemplate restTemplate, HiddenRecipeRepository hiddenRecipeRepository, UserRepository userRepository,
            KafkaEventService kafkaEventService) {
        this.objectMapper = objectMapper;
        this.productRepository = productRepository;
        this.restTemplate = restTemplate;
        this.hiddenRecipeRepository = hiddenRecipeRepository;
        this.userRepository = userRepository;
        this.kafkaEventService = kafkaEventService;
    }

    /**
     * Generates a recipe based on user input, mapped to available inventory
     * products.
     *
     * @param prompt    User's culinary request
     * @param servings  Number of servings required
     * @param userEmail Requesting user's email
     * @return Generated HiddenRecipe entity
     */
    public HiddenRecipe generateRecipe(String prompt, int servings, String userEmail) {
        String url = String.format(GEMINI_URL, geminiModel, geminiApiKey);

        // Reference weights for more accurate AI estimation
        String weightReferenceTable = """
                REFERENCE WEIGHTS (approx):
                - 1 tomato ~= 150g
                - 1 onion ~= 150g
                - 1 potato ~= 200g
                - 1 carrot ~= 100g
                - 1 apple ~= 180g
                - 1 cup rice ~= 200g
                - 1 tbsp oil/sauce ~= 15g
                - 1 tsp spice ~= 5g
                - 1 egg ~= 50g
                - 1 chicken breast ~= 200g
                """;

        String systemPrompt = """
                You are a professional chef. Generate a detailed recipe based on the user's request.
                CRITICAL INSTRUCTION: For ingredients, you MUST estimate the quantity in GRAMS (g) or MILLILITERS (ml) where possible.
                Use the following reference weights if needed:
                %s

                Respond ONLY with valid JSON in this exact format, no markdown or code fences:
                {
                  "title": "Recipe Title",
                  "instructions": ["Step 1", "Step 2", "Step 3"],
                  "prepTime": "30 minutes",
                  "difficulty": "Easy|Medium|Hard",
                  "ingredients": [
                    {"name": "Ingredient Name", "quantity": "2 cups", "quantity_grams": 300},
                    {"name": "Another Ingredient", "quantity": "1 tbsp", "quantity_grams": 15}
                  ]
                }
                """
                .formatted(weightReferenceTable);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text",
                        systemPrompt + "\nUser Request: " + prompt + " for " + servings + " people.")))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Publish Kafka event
        kafkaEventService.sendRecipeGenerated(saved.getId(), String.join(",", ingredientNames));

        return saved;
    }

    /**
     * Strict ingredient-to-product matching.
     * Prevents false positives like "water" matching "watermelon".
     */
    public Product matchIngredientToProduct(String ingredientName) {
        if (ingredientName == null || ingredientName.isBlank())
            return null;

        String normalized = ingredientName.toLowerCase().trim();

        // Skip generic/non-purchasable ingredients
        Set<String> skipList = Set.of("water", "salt", "ice", "oil", "sugar");
        if (skipList.contains(normalized))
            return null;

        // 1. Try exact name match first
        List<Product> matches = productRepository.searchByName(ingredientName);
        for (Product p : matches) {
            // Only accept if the product name CONTAINS the full ingredient name
            // OR the ingredient name CONTAINS the full product name
            String pName = p.getName().toLowerCase();
            if (pName.equals(normalized) || pName.contains(normalized) || normalized.contains(pName)) {
                return p;
            }
        }

        // 2. Try individual significant words (min 4 chars to avoid "water" matching
        // "watermelon")
        String[] words = normalized.split("\\s+");
        for (String word : words) {
            if (word.length() >= 4 && !skipList.contains(word)) {
                matches = productRepository.searchByName(word);
                for (Product p : matches) {
                    // Verify the match is meaningful: product name should start with or equal the
                    // word
                    String pName = p.getName().toLowerCase();
                    if (pName.startsWith(word) || pName.contains(" " + word)) {
                        return p;
                    }
                }
            }
        }

        return null;
    }

    public CartRequest convertRecipeToCart(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        CartRequest cart = new CartRequest();
        cart.setDeliveryAddress("From Recipe: " + recipe.getTitle());
        List<CartRequest.CartItemRequest> items = new ArrayList<>();

        for (Ingredient ingredient : recipe.getIngredients()) {
            if (ingredient.getLinkedProduct() != null) {
                Product product = ingredient.getLinkedProduct();
                CartRequest.CartItemRequest item = new CartRequest.CartItemRequest();
                item.setProductId(product.getId());

                int quantityToAdd = 1;

                int requiredGrams = parseGramsFromQuantity(ingredient.getQuantity());

                if (requiredGrams > 0 && product.getWeightInGrams() != null && product.getWeightInGrams() > 0) {
                    quantityToAdd = (int) Math.ceil((double) requiredGrams / product.getWeightInGrams());
                } else {
                    quantityToAdd = parseQuantity(ingredient.getQuantity());
                }

                if (quantityToAdd < 1)
                    quantityToAdd = 1;

                item.setQuantity(quantityToAdd);
                items.add(item);
            }
        }

        if (items.isEmpty()) {
            throw new RuntimeException("No products matched for this recipe's ingredients");
        }

        cart.setItems(items);
        return cart;
    }

    private int parseQuantity(String quantityStr) {
        if (quantityStr == null)
            return 1;
        try {
            Matcher matcher = Pattern.compile("^(\\d+)").matcher(quantityStr);
            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }
        } catch (Exception e) {
            /* ignore */ }
        return 1;
    }

    private int parseGramsFromQuantity(String quantityStr) {
        if (quantityStr == null)
            return 0;
        try {
            Matcher matcher = Pattern.compile("\\((\\d+)g\\)").matcher(quantityStr);
            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }
        } catch (Exception e) {
            /* ignore */ }
        return 0;
    }
}
