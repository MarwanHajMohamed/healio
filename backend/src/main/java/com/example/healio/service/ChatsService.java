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

}
