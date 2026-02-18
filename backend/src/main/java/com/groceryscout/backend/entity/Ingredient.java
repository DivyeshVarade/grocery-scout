package com.groceryscout.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ingredients")
@Data
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @lombok.ToString.Exclude
    private Recipe recipe;

    @Column(nullable = false)
    private String name;

    private String quantity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "linked_product_id")
    private Product linkedProduct;
}
