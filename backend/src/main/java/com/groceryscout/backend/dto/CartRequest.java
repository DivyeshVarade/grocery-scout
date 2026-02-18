package com.groceryscout.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartRequest {
    private String deliveryAddress;
    private List<CartItemRequest> items;

    @Data
    public static class CartItemRequest {
        private Long productId;
        private Integer quantity;
    }
}
