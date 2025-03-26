package com.webapp.bankingportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty
    private String name;

    @NotEmpty
    private String password;

    @Email
    @NotEmpty
    @Column(unique = true)
    private String email;

    @NotEmpty
    private String countryCode;

    @NotEmpty
    @Column(unique = true)
    private String phoneNumber;

    @NotEmpty
    private String address;
    
    // Establishing a one-to-one relationship with the account
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Account account;

    // Trimming inputs before storing
    public void setName(String name) {
        this.name = name != null ? name.trim() : null;
    }

    public void setPassword(String password) {
        this.password = password != null ? password.trim() : null;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode != null ? countryCode.trim() : null;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber != null ? phoneNumber.trim() : null;
    }

    public void setAddress(String address) {
        this.address = address != null ? address.trim() : null;
    }
}