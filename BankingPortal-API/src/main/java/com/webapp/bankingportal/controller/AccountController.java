package com.webapp.bankingportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.bankingportal.dto.AmountRequest;
import com.webapp.bankingportal.dto.FundTransferRequest;
import com.webapp.bankingportal.dto.PinRequest;
import com.webapp.bankingportal.dto.PinUpdateRequest;
import com.webapp.bankingportal.service.AccountService;
import com.webapp.bankingportal.service.TransactionService;
import com.webapp.bankingportal.util.ApiMessages;
import com.webapp.bankingportal.util.JsonUtil;
import com.webapp.bankingportal.util.LoggedinUser;

import lombok.RequiredArgsConstructor;
import lombok.val;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final TransactionService transactionService;


    @GetMapping("/pin/check")
    public ResponseEntity<Map<String, Object>> checkAccountPIN() {
        boolean isPINValid = accountService.isPinCreated(LoggedinUser.getAccountNumber());

        // Return JSON response instead of plain text
        Map<String, Object> response = new HashMap<>();
        response.put("pinCreated", isPINValid);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/pin/create")
    public ResponseEntity<String> createPIN(@RequestBody PinRequest pinRequest) {
        accountService.createPin(
                LoggedinUser.getAccountNumber(),
                pinRequest.password().trim(),
                pinRequest.pin().trim());

        return ResponseEntity.ok(ApiMessages.PIN_CREATION_SUCCESS.getMessage());
    }

    @PostMapping("/pin/update")
    public ResponseEntity<String> updatePIN(@RequestBody PinUpdateRequest pinUpdateRequest) {
        accountService.updatePin(
                LoggedinUser.getAccountNumber(),
                pinUpdateRequest.oldPin().trim(),
                pinUpdateRequest.password().trim(),
                pinUpdateRequest.newPin().trim());

        return ResponseEntity.ok(ApiMessages.PIN_UPDATE_SUCCESS.getMessage());
    }

    @PostMapping("/deposit")
    public ResponseEntity<String> cashDeposit(@RequestBody AmountRequest amountRequest) {
        accountService.cashDeposit(
                LoggedinUser.getAccountNumber(),
                amountRequest.pin().trim(),
                amountRequest.amount());

        return ResponseEntity.ok(ApiMessages.CASH_DEPOSIT_SUCCESS.getMessage());
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> cashWithdrawal(@RequestBody AmountRequest amountRequest) {
        accountService.cashWithdrawal(
                LoggedinUser.getAccountNumber(),
                amountRequest.pin().trim(),
                amountRequest.amount());

        return ResponseEntity.ok(ApiMessages.CASH_WITHDRAWAL_SUCCESS.getMessage());
    }

    @PostMapping("/fund-transfer")
    public ResponseEntity<String> fundTransfer(@RequestBody FundTransferRequest fundTransferRequest) {
        accountService.fundTransfer(
                LoggedinUser.getAccountNumber(),
                fundTransferRequest.targetAccountNumber(),
                fundTransferRequest.pin(),
                fundTransferRequest.amount());

        return ResponseEntity.ok(ApiMessages.CASH_TRANSFER_SUCCESS.getMessage());
    }

    @GetMapping("/transactions")
    public ResponseEntity<String> getAllTransactionsByAccountNumber() {
        val transactions = transactionService
                .getAllTransactionsByAccountNumber(LoggedinUser.getAccountNumber());
        return ResponseEntity.ok(JsonUtil.toJson(transactions));
    }

}
