package com.groceryscout.backend.dto;

import com.groceryscout.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private Role role;
    private String profileData;
}
