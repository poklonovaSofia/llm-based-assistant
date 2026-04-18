package com.domainai.backend.service;

import com.domainai.backend.dto.AuthResponse;
import com.domainai.backend.dto.LoginRequest;
import com.domainai.backend.dto.RegisterRequest;
import com.domainai.backend.models.User;
import com.domainai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        AuthResponse response = new AuthResponse();
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setMessage("User registered successfully");
        response.setToken("fake-jwt-token-" + System.currentTimeMillis());

        return response;
    }
    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        AuthResponse response = new AuthResponse();
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setMessage("Login successful");
        response.setToken("fake-jwt-token-" + System.currentTimeMillis());

        return response;
    }
}