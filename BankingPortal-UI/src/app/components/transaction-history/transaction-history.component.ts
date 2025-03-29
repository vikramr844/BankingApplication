// transaction-history.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { TransactionComponent } from '../transaction/transaction.component';
import { EMPTY, catchError, tap } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { VoiceService } from 'src/app/services/voice.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
})
export class TransactionHistoryComponent implements OnInit {
  transactionHistory: any[] = [];
  userAccountNumber: string | null = null;
  filteredTransactionHistory: any[] = [];
  filterForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private voiceService: VoiceService
  ) {
    // Initialize the form with a default empty value
    this.filterForm = new FormGroup({
      filterCriteria: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.voiceService.setTransactionHistoryComponent(this);
    this.loadTransactionHistory();
    
    // Subscribe to form value changes
    this.filterForm.get('filterCriteria')?.valueChanges.subscribe(value => {
      this.filterTransactions(value);
    });
  }

  // loadTransactionHistory(): void {
  //   this.userAccountNumber = TransactionComponent.getAccountNumberFromToken();

  //   this.apiService.getTransactions().pipe(
  //     tap((data) => {
  //       this.transactionHistory = data;
  //       // Apply initial filter
  //       this.filterTransactions(this.filterForm.value.filterCriteria);
  //     }),
  //     catchError((error) => {
  //       console.error('Error fetching transaction history:', error);
  //       return EMPTY;
  //     })
  //   ).subscribe();
  // }
  loadTransactionHistory(): void {
    this.userAccountNumber = TransactionComponent.getAccountNumberFromToken();
  
    this.apiService.getTransactions().pipe(
      tap((data) => {
        console.log('Raw transaction data:', data); // Debug log
        this.transactionHistory = data;
        this.filterTransactions(this.filterForm.value.filterCriteria);
      }),
      catchError((error) => {
        console.error('Error fetching transaction history:', error);
        return EMPTY;
      })
    ).subscribe();
  }
  getTransactionStatus(transaction: any): string {
    let status = transaction.transactionType.slice(5).toLowerCase();
    if (status === 'transfer' && transaction.targetAccountNumber === this.userAccountNumber) {
      return 'Credit';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  filterTransactions(criteria: string): void {
    try {
      this.filteredTransactionHistory = [...this.transactionHistory];
  
      if (!criteria) return; // Show all if no criteria
  
      const filterMap = {
        'Deposit': 'CASH_DEPOSIT',
        'Withdrawal': 'CASH_WITHDRAWAL',
        'Transfer': 'CASH_TRANSFER'
      };
  
      const filterValue = filterMap[criteria as keyof typeof filterMap];
      if (!filterValue) {
        console.warn('Unknown filter criteria:', criteria);
        return;
      }
  
      this.filteredTransactionHistory = this.filteredTransactionHistory.filter(
        t => t.transactionType.toUpperCase() === filterValue
      );
    } catch (error) {
      console.error('Error filtering transactions:', error);
      this.filteredTransactionHistory = [...this.transactionHistory];
    }
  }



  // Voice command methods
  showDepositTransactionsOnly(): void {
    this.filterForm.patchValue({ filterCriteria: 'Deposit' });
  }

  showWithdrawalTransactionsOnly(): void {
    this.filterForm.patchValue({ filterCriteria: 'Withdrawal' });
  }

  showTransferTransactionsOnly(): void {
    this.filterForm.patchValue({ filterCriteria: 'Transfer' });
  }

  resetFilters(): void {
    this.filterForm.patchValue({ filterCriteria: '' });
  }
}