package com.example.healio.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.healio.model.Chats;

public interface ChatsRepository extends JpaRepository<Chats, Long> {

    List<Chats> findByUserId(long userId);

}
