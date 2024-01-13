package com.example.healio.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Conversations {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long conversationId;
    private String title;
    private long userId;

    public Conversations() {
    }

    public Conversations(String title, long userId) {
        this.title = title;
        this.userId = userId;
    }
}
