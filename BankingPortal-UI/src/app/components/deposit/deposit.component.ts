import { ToastService } from 'angular-toastify';
import { ApiService } from 'src/app/services/api.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { VoiceService } from 'src/app/services/voice.service';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css'],
})
export class DepositComponent implements OnInit {
  depositForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private _toastService: ToastService,
    private router: Router,
    private loader: LoadermodelService,
    private voiceService: VoiceService
  ) {}
  ngOnInit() {
    this.initDepositForm();
    this.voiceService.setDepositForm(this.depositForm); // Pass the form to VoiceService
  }
  
  private initDepositForm(): void {
    this.depositForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      pin: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.pattern(/^\d{4}$/) // Ensures only 4-digit numbers
        ]
      ]
    });
  }

  onSubmit(): void {
    if (!this.depositForm.valid) {
      this._toastService.error('Please fill in all fields correctly.');
      return;
    }

    const amount = this.depositForm.get('amount')?.value;
    const pin = this.depositForm.get('pin')?.value;
    
    const cleanedAmount = typeof amount === 'string' ? amount.trim().replace(/\s+/g, '') : String(amount);
    const cleanedPin = typeof pin === 'string' ? pin.trim().replace(/\s+/g, '') : String(pin);
    

    this.loader.show('Depositing...'); 
    this.apiService.deposit(amount, pin).subscribe({
      next: (response: any) => {
        this.loader.hide();
        this._toastService.success(response.msg);
        this.depositForm.reset();
        this.router.navigate(['/dashboard']);
        console.log('Deposit successful!', response);
      },
      error: (error: any) => {
        this.loader.hide();
        this._toastService.error(error.error || 'Deposit failed');
        console.error('Deposit failed:', error);
      }
    });
  }
}
