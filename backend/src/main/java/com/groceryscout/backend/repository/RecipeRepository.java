package com.groceryscout.backend.repository;

import com.groceryscout.backend.entity.Recipe;
import com.groceryscout.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByCreatorId(Long creatorId);

    // For fuzzy matching existing recipes
    List<Recipe> findByTitleContainingIgnoreCase(String title);

    // Find all recipes created by users with a specific role (e.g., MANAGER)
    @Query("SELECT r FROM Recipe r WHERE r.creator.role = :role")
    List<Recipe> findByCreatorRole(@Param("role") Role role);
}
