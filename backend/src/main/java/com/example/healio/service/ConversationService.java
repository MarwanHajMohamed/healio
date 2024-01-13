package com.example.healio.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.healio.model.Conversations;
import com.example.healio.repository.ConversationRepository;

@Service
public class ConversationService {

    @Autowired
    ConversationRepository conversationRepository;

    public ConversationService() {
        super();
    }

    public List<Conversations> getConversations() {
        return conversationRepository.findAll();
    }

    public List<Conversations> getConversationById(long id) {
        return conversationRepository.findByConversationId(id);
    }

    public List<Conversations> getConversationByUserId(long userId) {
        return conversationRepository.findConversationByUserId(userId);
    }

    public Conversations addConversation(Conversations conversations) {
        return conversationRepository.save(conversations);
    }

    public Conversations updateConversationTitle(long conversationId, Conversations conversations) {
        Conversations existingConversation = conversationRepository.findById(conversationId).orElseThrow();
        existingConversation.setTitle(conversations.getTitle());

        return conversationRepository.save(existingConversation);
    }

    public void deleteConversationById(long conversationId) {
        Conversations conversation = conversationRepository.findById(conversationId)
                .orElseThrow();
        conversationRepository.delete(conversation);
    }

}
