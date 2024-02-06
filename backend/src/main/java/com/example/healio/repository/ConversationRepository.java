package com.example.healio.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.healio.model.Conversations;

public interface ConversationRepository extends JpaRepository<Conversations, Long> {
    List<Conversations> findByConversationId(Long id);

    List<Conversations> findConversationByUserId(Long id);
}
