package com.groceryscout.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tracks which manager-created recipes a user has "dismissed" (soft-deleted
 * from their view).
 * The recipe still exists in the database for the manager; it's just hidden
 * from this user's feed.
 */
@Entity
@Table(name = "hidden_recipes", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "recipe_id" }))
@Data
@NoArgsConstructor
public class HiddenRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    public HiddenRecipe(User user, Recipe recipe) {
        this.user = user;
        this.recipe = recipe;
    }
}
