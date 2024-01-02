package com.example.healio.repository;

import org.springframework.data.repository.CrudRepository;

import com.example.healio.model.User;

public interface UserRepository extends CrudRepository<User, Long> {

    User findByUserID(int userID);

    User findByEmail(String email);

}
