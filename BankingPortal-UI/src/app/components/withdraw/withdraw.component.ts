import { ToastService } from 'angular-toastify';
import { ApiService } from 'src/app/services/api.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VoiceService } from 'src/app/services/voice.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css'],
})
export class WithdrawComponent implements OnInit {
  withdrawForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private _toastService: ToastService,
    private router: Router,
    private loader: LoadermodelService, // Inject the LoaderService
    private voiceService: VoiceService
  ) {}

  ngOnInit(): void {
    this.initWithdrawForm();
    this.voiceService.setWithdrawComponent(this);
  }

  private initWithdrawForm(): void {
    this.withdrawForm = this.fb.group({
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

    this.voiceService.setWithdrawForm(this.withdrawForm); // ✅ Set up voice service
  }

  onSubmit(): void {
    if (!this.withdrawForm.valid) {
      this._toastService.error('Please fill in all fields correctly.');
      return;
    }

    let amount = this.withdrawForm.get('amount')?.value;
    let pin = this.withdrawForm.get('pin')?.value;

    // Clean input values
    const cleanedAmount = typeof amount === 'string' ? amount.trim().replace(/\s+/g, '') : String(amount);
    const cleanedPin = typeof pin === 'string' ? pin.trim().replace(/\s+/g, '') : String(pin);

    this.loader.show('Withdrawing...'); // Show loader

    this.apiService.withdraw(cleanedAmount, cleanedPin).subscribe({
      next: (response: any) => {
        this.loader.hide(); // Hide loader
        this._toastService.success(response.msg);
        this.withdrawForm.reset();
        this.router.navigate(['/dashboard']);
        console.log('Withdrawal successful!', response);
      },
      error: (error: any) => {
        this.loader.hide(); // Hide loader
        this._toastService.error(error.error || 'Withdrawal failed');
        console.error('Withdrawal failed:', error);
      }
    });
  }
}
