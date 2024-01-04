package com.example.healio.controller;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.healio.event.MessageResponse;
import com.example.healio.event.RegistrationCompleteEvent;
import com.example.healio.model.User;
import com.example.healio.model.VerificationToken;
import com.example.healio.repository.VerificationTokenRepository;
import com.example.healio.service.RegistrationRequest;
import com.example.healio.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/register")
public class RegistrationController {

    private final UserService userService;
    private final ApplicationEventPublisher publisher;
    private final VerificationTokenRepository verificationTokenRepository;

    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest registrationRequest,
            final HttpServletRequest request) {
        User user = userService.registerUser(registrationRequest);
        publisher.publishEvent(new RegistrationCompleteEvent(user, applicationUrl(request)));
        return ResponseEntity
                .ok(new MessageResponse("verify email"));
    }

    @GetMapping("/verifyEmail")
    public String verifyEmail(@RequestParam("token") String token) {
        VerificationToken verifyToken = verificationTokenRepository.findByToken(token);
        if (verifyToken.getUser().isEnabled()) {
            return "This account has already been verified, please login.";
        }
        String verificationResult = userService.validateToken(token);

        if (verificationResult.equals("Valid")) {
            return "Email has been successfully verified! You can now login to your account.";
        }
        return "Invalid verification token.";
    }

    public String applicationUrl(HttpServletRequest request) {
        return "http://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
    }

}
