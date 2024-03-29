package com.example.healio.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.healio.dto.ChatsDTO;
import com.example.healio.model.Chats;
import com.example.healio.service.ChatsService;

@RestController
public class ChatsController {

    @Autowired
    ChatsService chatsService;

    @GetMapping("/chats")
    public List<Chats> getChats() {
        return chatsService.getChats();
    }

    @GetMapping("/chats/{userId}")
    public List<Chats> getChatsBuUserId(@PathVariable(value = "userId") long userId) {
        return chatsService.getChatsByUserId(userId);
    }

    @GetMapping("/chats/conversation/{conversationId}")
    public List<Chats> getChatsBuConversationId(@PathVariable(value = "conversationId") long conversationId) {
        return chatsService.getChatsByConversationId(conversationId);
    }

    @PostMapping("/chats")
    public ResponseEntity<?> addChats(@RequestBody ChatsDTO newChat) {
        Chats chats = new Chats(
                newChat.getId(),
                newChat.getConversationId(),
                newChat.getUserId(),
                newChat.getTitle(),
                newChat.getSenderMessage(),
                newChat.getRecipientMessage(),
                newChat.getDate());
        chatsService.addChats(chats);

        return ResponseEntity.ok(newChat);

    }

    @PutMapping("/chats/{chatId}")
    public Chats updateChatByChatId(@PathVariable long chatId, @RequestBody Chats chat) {
        return chatsService.updateChatByChatId(chatId, chat);
    }

    @DeleteMapping("/chats/delete/{conversationId}")
    public void deleteChatsByConversationId(@PathVariable(value = "conversationId") long conversationId) {
        chatsService.deleteChatsByConversationId(conversationId);
    }

}
