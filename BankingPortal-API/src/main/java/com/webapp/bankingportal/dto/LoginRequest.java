package com.webapp.bankingportal.dto;

public record LoginRequest(String identifier, String password) {

    public LoginRequest {

        identifier = identifier.trim().replaceAll("\\s+", "");
        password = password.trim().replaceAll("\\s+", "");
    }

    public String getEmail() {
        if (!identifier.contains("@")) {
            return identifier + "@gmail.com";
        }
        return identifier;
    }
}
