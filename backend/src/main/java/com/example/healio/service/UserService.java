package com.example.healio.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.healio.exception.UserAlreadyExistsException;
import com.example.healio.model.User;
import com.example.healio.model.VerificationToken;
import com.example.healio.repository.UserRepository;
import com.example.healio.repository.VerificationTokenRepository;

import lombok.RequiredArgsConstructor;

import java.util.Calendar;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenRepository tokenRepository;

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    public User registerUser(RegistrationRequest request) {
        Optional<User> user = findByEmail(request.email());
        if (user.isPresent()) {
            throw new UserAlreadyExistsException("User with email " + request.email() + " already exists.");
        }
        var newUser = new User();
        newUser.setFirst_name(request.first_name());
        newUser.setSurname(request.surname());
        newUser.setEmail(request.email());
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setRole(request.role());
        return userRepository.save(newUser);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public void saveUserVerificationToken(User user, String token) {
        var verificationToken = new VerificationToken(token, user);
        tokenRepository.save(verificationToken);
    }

    @Override
    public String validateToken(String verifyToken) {
        VerificationToken token = tokenRepository.findByToken(verifyToken);
        if (token == null) {
            return "Invalid verification token";
        }
        Calendar calendar = Calendar.getInstance();
        if ((token.getExpirationTime().getTime() - calendar.getTime().getTime()) <= 0) {
            tokenRepository.delete(token);
            return "Token already expired.";
        }
        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        return "Valid";
    }

}
