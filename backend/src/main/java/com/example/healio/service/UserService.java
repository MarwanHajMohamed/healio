package com.example.healio.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.healio.model.User;
import com.example.healio.repository.UserRepository;

import java.util.List;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    public UserService() {

    }

    public List<User> getUsers() {
        return (List<User>) userRepository.findAll();
    }

    public void addUser(User newUser) {
        userRepository.save(newUser);
    }

    public User findByUserID(int userID) {
        return userRepository.findByUserID(userID);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

}
