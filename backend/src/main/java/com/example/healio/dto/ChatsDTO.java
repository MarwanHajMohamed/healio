package com.example.healio.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatsDTO {
    private long id;
    private long conversationId;
    private long userId;
    private String title;
    private String senderMessage;
    private String recipientMessage;
    private long date;
}
