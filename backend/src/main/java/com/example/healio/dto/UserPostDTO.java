package com.example.healio.dto;

public class UserPostDTO {
    int id;
    String first_name;
    String surname;
    String email;
    String password;

    public UserPostDTO(int id, String first_name, String surname, String email, String password) {
        super();
        this.id = id;
        this.first_name = first_name;
        this.surname = surname;
        this.email = email;
        this.password = password;
    }

    public int getId() {
        return this.id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFirstName() {
        return this.first_name;
    }

    public void setFirstName(String first_name) {
        this.first_name = first_name;
    }

    public String getSurname() {
        return this.surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
