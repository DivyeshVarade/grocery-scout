package com.groceryscout.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String unit;
    private String category;
    private Integer inventoryCount;
    private String imageUrl;
    private Boolean isActive;
}
