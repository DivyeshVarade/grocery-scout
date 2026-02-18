package com.groceryscout.backend.controller;

import com.groceryscout.backend.dto.RegisterRequest;
import com.groceryscout.backend.dto.UserResponse;
import com.groceryscout.backend.entity.Role;
import com.groceryscout.backend.entity.User;
import com.groceryscout.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepository = userRepo;
        this.passwordEncoder = encoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            if (req.getEmail() == null || req.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (!req.getEmail().matches("^[\\w.-]+@[\\w.-]+\\.\\w{2,}$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
            }
            if (req.getPassword() == null || req.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
            }
            if (userRepository.existsByEmail(req.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists"));
            }

            User user = new User();
            user.setEmail(req.getEmail());
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            user.setRole(Role.CUSTOMER);
            user.setProfileData(req.getProfileData());
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity
                .ok(new UserResponse(user.getId(), user.getEmail(), user.getRole(), user.getProfileData()));
    }
}
