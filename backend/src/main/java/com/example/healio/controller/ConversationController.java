package com.example.healio.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.healio.dto.ConversationDTO;
import com.example.healio.model.Conversations;
import com.example.healio.service.ConversationService;

@RestController
public class ConversationController {

    @Autowired
    ConversationService conversationService;

    @GetMapping("/conversations")
    public List<Conversations> getConversations() {
        return conversationService.getConversations();
    }

    @GetMapping("/conversations/{conversationId}")
    public List<Conversations> getConversationsById(@PathVariable(value = "conversationId") long conversationId) {
        return conversationService.getConversationById(conversationId);
    }

    @GetMapping("/conversations/user/{userId}")
    public List<Conversations> getConversationsByUserId(@PathVariable(value = "userId") long userId) {
        return conversationService.getConversationByUserId(userId);
    }

    @PostMapping("/conversations")
    public ResponseEntity<?> addConversation(@RequestBody ConversationDTO newConversation) {
        Conversations conversations = new Conversations(newConversation.getTitle(), newConversation.getUserId());
        Conversations savedConversations = conversationService.addConversation(conversations);

        ConversationDTO responseDTO = new ConversationDTO();
        responseDTO.setConversationId(savedConversations.getConversationId());
        responseDTO.setTitle(savedConversations.getTitle());

        return ResponseEntity.ok(responseDTO);
    }

}
