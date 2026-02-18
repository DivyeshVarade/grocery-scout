package com.groceryscout.backend.service;

import com.groceryscout.backend.entity.*;
import com.groceryscout.backend.repository.HiddenRecipeRepository;
import com.groceryscout.backend.repository.RecipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private static final Logger log = LoggerFactory.getLogger(RecipeService.class);

    private final RecipeRepository recipeRepository;
    private final HiddenRecipeRepository hiddenRecipeRepository;

    public RecipeService(RecipeRepository recipeRepository, HiddenRecipeRepository hiddenRecipeRepository) {
        this.recipeRepository = recipeRepository;
        this.hiddenRecipeRepository = hiddenRecipeRepository;
    }

    /**
     * Returns recipes visible to this user:
     * 1. User's own recipes (created by them)
     * 2. All MANAGER-created recipes (minus the ones this user has hidden)
     */
    public List<Recipe> getRecipesForUser(User user) {
        // 1. Get user's own recipes
        List<Recipe> ownRecipes = recipeRepository.findByCreatorId(user.getId());

        // 2. Get all manager-created recipes
        List<Recipe> managerRecipes = recipeRepository.findByCreatorRole(Role.MANAGER);

        // 3. Get IDs of recipes this user has hidden
        Set<Long> hiddenIds = hiddenRecipeRepository.findByUserId(user.getId())
                .stream()
                .map(hr -> hr.getRecipe().getId())
                .collect(Collectors.toSet());

        // 4. Filter out hidden manager recipes
        List<Recipe> visibleManagerRecipes = managerRecipes.stream()
                .filter(r -> !hiddenIds.contains(r.getId()))
                .filter(r -> !r.getCreator().getId().equals(user.getId())) // avoid duplicates with own
                .toList();

        // 5. Combine: own + visible manager recipes
        List<Recipe> result = new ArrayList<>(ownRecipes);
        result.addAll(visibleManagerRecipes);
        return result;
    }

    /**
     * Delete logic:
     * - If user is the creator → permanently delete the recipe
     * - If recipe was created by a MANAGER → soft-delete (hide from user's view)
     * - ADMIN can always permanently delete
     */
    @Transactional
    public void deleteRecipe(Long recipeId, User user) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        boolean isCreator = recipe.getCreator().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isManagerRecipe = recipe.getCreator().getRole() == Role.MANAGER;

        if (isAdmin || isCreator) {
            // Creator or Admin → permanently delete
            recipeRepository.delete(recipe);
            log.info("Recipe '{}' (ID: {}) permanently deleted by user {}", recipe.getTitle(), recipeId,
                    user.getEmail());
        } else if (isManagerRecipe) {
            // Manager recipe → soft-delete (hide from this user's view)
            if (!hiddenRecipeRepository.existsByUserIdAndRecipeId(user.getId(), recipeId)) {
                hiddenRecipeRepository.save(new HiddenRecipe(user, recipe));
                log.info("Recipe '{}' (ID: {}) hidden from user {} (manager recipe soft-delete)", recipe.getTitle(),
                        recipeId, user.getEmail());
            }
        } else {
            throw new RuntimeException("Not authorized to delete this recipe");
        }
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }
}
