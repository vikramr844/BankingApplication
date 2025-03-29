import { ToastService } from 'angular-toastify';
import { ApiService } from 'src/app/services/api.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { VoiceService } from 'src/app/services/voice.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fund-transfer',
  templateUrl: './fund-transfer.component.html',
  styleUrls: ['./fund-transfer.component.css'],
})
export class FundTransferComponent implements OnInit {
  fundTransferForm!: FormGroup;
  @Output() transferSuccess = new EventEmitter<string>();
  @Output() transferError = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private _toastService: ToastService,
    private router: Router,
    private loader: LoadermodelService,
    private voiceService: VoiceService
  ) {}

  ngOnInit(): void {
    this.initFundTransferForm();
    this.voiceService.setFundTransfer(this);
  }

  initFundTransferForm(): void {
    this.fundTransferForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      pin: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
      ],
      targetAccountNumber: ['', [Validators.required]],
    });
    this.voiceService.setFundTransferForm(this.fundTransferForm); 
  }

  onSubmit(): void {
    if (this.fundTransferForm?.valid) {
      const amount = this.fundTransferForm.get('amount')?.value;
      const pin = this.fundTransferForm.get('pin')?.value;
      const targetAccountNumber = this.fundTransferForm.get(
        'targetAccountNumber'
      )?.value;

      if (amount !== null && pin !== null && targetAccountNumber !== null) {
        this.loader.show('Transferring funds...');
        this.apiService
          .fundTransfer(amount, pin, targetAccountNumber)
          .subscribe({
            next: (response: any) => {
              this.loader.hide();
              this.fundTransferForm.reset();
              this._toastService.success(response.msg);
              this.transferSuccess.emit(response.msg);
              this.router.navigate(['/dashboard']);
              console.log('Fund transfer successful!', response);
            },
            error: (error: any) => {
              this.loader.hide();
              this._toastService.error(error.error);
              this.transferError.emit(error.error);
              console.error('Fund transfer failed:', error);
            },
          });
      }
    }
  }
}