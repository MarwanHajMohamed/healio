package com.example.healio.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.healio.model.Chats;
import com.example.healio.repository.ChatsRepository;

@Service
public class ChatsService {

    @Autowired
    ChatsRepository chatsRepository;

    public ChatsService() {
        super();
    }

    public List<Chats> getChats() {
        return chatsRepository.findAll();
    }

    public List<Chats> getChatsByUserId(long userId) {
        return chatsRepository.findByUserId(userId);
    }

    public void addChats(Chats chats) {
        chatsRepository.save(chats);
    }

    public Chats updateChatByChatId(long chatId, Chats chat) {
        Chats existingChat = chatsRepository.findById(chatId).orElseThrow();
        existingChat.setTitle(chat.getTitle());
        existingChat.setDate(chat.getDate());
        existingChat.setRecipientMessage(chat.getRecipientMessage());
        existingChat.setSenderMessage(chat.getSenderMessage());
        existingChat.setTitle(chat.getTitle());
        existingChat.setUserId(chat.getUserId());
        return chatsRepository.save(existingChat);
    }

}
