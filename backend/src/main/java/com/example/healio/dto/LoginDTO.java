package com.example.healio.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
    private long userId;
    private String email;
    private String password;
    private String jwt;
}
