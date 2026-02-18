package com.groceryscout.backend.repository;

import com.groceryscout.backend.entity.HiddenRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HiddenRecipeRepository extends JpaRepository<HiddenRecipe, Long> {

    List<HiddenRecipe> findByUserId(Long userId);

    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);

    void deleteByUserIdAndRecipeId(Long userId, Long recipeId);
}
