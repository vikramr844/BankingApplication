package com.webapp.bankingportal.service;

import java.util.concurrent.CompletableFuture;

import com.webapp.bankingportal.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.scheduling.annotation.Async;

public interface EmailService {

    @Async
    public CompletableFuture<Void> sendEmail(String to, String subject, String text);

    public String getLoginEmailTemplate(String name, String loginTime, String loginLocation);

    public String getOtpLoginEmailTemplate(String name, String accountNumber, String otp);

//    void getFailedLoginNotification(String name, String loginTime, String loginLocation);
}
