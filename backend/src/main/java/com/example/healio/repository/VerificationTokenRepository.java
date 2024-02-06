package com.example.healio.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.healio.model.VerificationToken;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    VerificationToken findByToken(String token);
}
