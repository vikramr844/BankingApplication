import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { VoiceService } from 'src/app/services/voice.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
})
export class OtpComponent implements OnInit, OnDestroy, AfterViewInit {
  identifier: string = '';
  otp: string = '';
  otpGenerated: boolean = false;
  authTokenName = environment.tokenName;
  otpForm: FormGroup;
  resendDisabled: boolean = false;
  resendCountdown: number = 0;
  componentInitialized = false;

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;

  config = {
    allowNumbersOnly: true,
    length: 6,
    placeholder: '',
    inputStyles: {
      width: '50px',
      height: '50px',
    },
  };

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private loader: LoadermodelService,
    private formBuilder: FormBuilder,
    private voiceService: VoiceService
  ) {
    this.otpForm = this.formBuilder.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  ngOnInit(): void {
    const storedAccountNumber = sessionStorage.getItem('accountNumber');
    if (storedAccountNumber) {
      this.identifier = storedAccountNumber;
      this.otpGenerated = true;
      this.otpForm.patchValue({ identifier: this.identifier });
    }

    setTimeout(() => {
      this.voiceService.initializeVoiceCommands(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.otpForm,
        this
      );
      this.componentInitialized = true;
    }, 300);
  }

  ngAfterViewInit() {
    this.voiceService.setOtpComponent(this);
  }

  ngOnDestroy(): void {
    this.voiceService.resetState();
  }

  setOtpValue(value: string): void {
    if (!value || typeof value !== 'string') {
      console.error('Invalid OTP value:', value);
      return;
    }

    // Clean the input to only include digits
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length !== 6) {
      console.error('OTP must be 6 digits');
      return;
    }

    if (this.ngOtpInput) {
      this.ngOtpInput.setValue(cleanValue);
      this.onOtpChange(cleanValue);
      console.log('OTP value set:', cleanValue);
      
      // Provide visual feedback
      this.highlightOtpInputs();
    }
  }

  private highlightOtpInputs(): void {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach(input => {
      input.classList.add('highlight');
      setTimeout(() => input.classList.remove('highlight'), 1000);
    });
  }

  onOtpChange(otp: string): void {
    this.otp = otp;
    this.otpForm.patchValue({ otp: this.otp });
  }

  setVal(val: string): void {
    this.ngOtpInput.setValue(val);
    this.onOtpChange(val);
  }

  formatIdentifier(identifier: string): string { 
    identifier = identifier.trim().replace(/\s+/g, '');
  
    // Check if the identifier is purely numeric (assuming an account number)
    if (!identifier.includes('@') && !/^[0-9]+$/.test(identifier)) {
        return identifier + '@gmail.com';
    }
  
    return identifier;
  }
  

  generateOTP(): void {
    const identifierControl = this.otpForm.get('identifier');
  
    if (!identifierControl?.value || identifierControl.invalid) {
      this.toastService.error('Please enter a valid identifier.');
      return;
    }
  
    this.identifier = this.formatIdentifier(identifierControl.value);
    this.otpForm.patchValue({ identifier: this.identifier });
  
    this.loader.show('Generating OTP...');
    this.authService
      .generateOTP(this.identifier)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (response: any) => {
          this.toastService.success(response.message + ', Check Email');
       
          this.otpGenerated = true;
          sessionStorage.setItem('accountNumber', this.identifier);
          sessionStorage.setItem('otpTimestamp', Date.now().toString());
          this.startResendCountdown();
        },
        error: (error: any) => {
          const errorMessage = error.error?.message || error.message || 'Failed to generate OTP.';
          this.toastService.error(errorMessage);
          this.voiceService.speak("Email id dose not exist. try again"); 
          console.error('Generate OTP Error:', error);
        },
      });
  }
  

  verifyOTP(): void {
    this.identifier = this.formatIdentifier(this.identifier);

    const storedTime = sessionStorage.getItem('otpTimestamp');
    if (storedTime && Date.now() - parseInt(storedTime) > 5 * 60 * 1000) {
      this.toastService.error('OTP has expired. Please generate a new one.');
      this.otpGenerated = false;
      return;
    }

    if (!this.identifier || !this.otp || this.otp.length !== 6) {
      const errorMessage = 'Please enter a valid 6-digit OTP.';
      this.toastService.error(errorMessage);
      this.voiceService.speak(errorMessage);
      return;
    }

    this.loader.show('Verifying OTP...');
    const otpVerificationRequest = {
      identifier: this.identifier,
      otp: this.otp,
    };

    this.authService
      .verifyOTP(otpVerificationRequest)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (response: any) => {
          this.toastService.success('Account Logged In');
          localStorage.setItem(this.authTokenName, response.token);
          sessionStorage.removeItem('otpTimestamp');
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          const errorMessage = error.error?.message || error.message || 'OTP verification failed. Please try again.';
          this.toastService.error(errorMessage);
          this.voiceService.speak(errorMessage);
          console.error('OTP Verification Error:', error);
        },
      });
  }

  resendOTP(): void {
    if (this.resendDisabled) {
      this.toastService.info(`Please wait ${this.resendCountdown} seconds before resending.`);
      return;
    }

    this.loader.show('Resending OTP...');
    this.authService
      .generateOTP(this.identifier)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (response: any) => {
          this.toastService.success('New OTP sent successfully');
          sessionStorage.setItem('otpTimestamp', Date.now().toString());
          this.startResendCountdown();
        },
        error: (error: any) => {
          const errorMessage = error.error?.message || error.message || 'Failed to resend OTP.';
          this.toastService.error(errorMessage);
          console.error('Resend OTP Error:', error);
        },
      });
  }

  private startResendCountdown(): void {
    this.resendDisabled = true;
    this.resendCountdown = 30;
    const countdownInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(countdownInterval);
        this.resendDisabled = false;
      }
    }, 1000);
  }
}