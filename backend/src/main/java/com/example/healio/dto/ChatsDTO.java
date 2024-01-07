package com.example.healio.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatsDTO {
    private long id;
    private String senderId;
    private String recipientId;
    private long userId;
    private String title;
    private String message;
    private long date;
}
