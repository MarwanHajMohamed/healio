package com.example.healio.service;

public record RegistrationRequest(
                String first_name,
                String surname,
                String email,
                String password,
                String role) {

}
