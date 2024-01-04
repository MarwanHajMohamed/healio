package com.example.healio.event.listener;

import java.io.UnsupportedEncodingException;
import java.util.UUID;

import org.springframework.context.ApplicationListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.example.healio.event.RegistrationCompleteEvent;
import com.example.healio.exception.EmailSendingException;
import com.example.healio.model.User;
import com.example.healio.service.UserService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RegistrationCompleteEventListener implements ApplicationListener<RegistrationCompleteEvent> {
    private final UserService userService;

    private final JavaMailSender mailSender;

    private User user;

    @Override
    public void onApplicationEvent(RegistrationCompleteEvent event) {
        user = event.getUser();
        String verificationToken = UUID.randomUUID().toString();
        userService.saveUserVerificationToken(user, verificationToken);
        String url = event.getApplicationUrl() + "/register/verifyEmail?token=" + verificationToken;

        try {
            sendVerificationEmail(url);
        } catch (UnsupportedEncodingException | MessagingException e) {
            e.printStackTrace();
            // Optionally, rethrow a custom exception to be handled in the controller
            throw new EmailSendingException("Failed to send verification email.");
        }

        log.info("Click the link to verify your email : {}", url);
    }

    public void sendVerificationEmail(String url) throws UnsupportedEncodingException, MessagingException {
        String subject = "Email verification";
        String senderName = "Healio";
        String body = "<p> Hi, " + user.getFirst_name() + ", </p>" +
                "<p>Thank you for registering with us," + "" +
                "Please, follow the link below to complete your registration.</p>" +
                "<a href=\"" + url + "\">Verify your email to activate your account</a>" +
                "<p> Thank you <br> Healio";
        MimeMessage message = mailSender.createMimeMessage();
        var messageHelper = new MimeMessageHelper(message);
        messageHelper.setFrom("marwan.khaj@gmail.com", senderName);
        messageHelper.setTo(user.getEmail());
        messageHelper.setSubject(subject);
        messageHelper.setText(body, true);
        mailSender.send(message);
    }

}
