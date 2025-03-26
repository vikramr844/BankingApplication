import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
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
export class OtpComponent implements OnInit {
  identifier: string = '';
  otp: string = '';
  otpGenerated: boolean = false;
  authTokenName = environment.tokenName;
  otpForm: FormGroup;

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
    // Initialize the OTP form
    this.otpForm = this.formBuilder.group({
      identifier: [''],
      otp: [''],
    });

    // Initialize voice commands
    this.voiceService.initializeVoiceCommands(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this.otpForm,
    );
  }

  ngOnInit(): void {
    const storedAccountNumber = sessionStorage.getItem('accountNumber');
    if (storedAccountNumber) {
      this.identifier = storedAccountNumber;
      this.otpGenerated = true;
      this.otpForm.patchValue({ identifier: this.identifier });
    }
  }

  onOtpChange(otp: string): void {
    this.otp = otp;
    this.otpForm.patchValue({ otp: this.otp });
  }

  setVal(val: string): void {
    this.ngOtpInput.setValue(val);
  }

  formatIdentifier(identifier: string): string { 
    identifier = identifier.trim().replace(/\s+/g, '');

    if (!identifier.includes('@') && !/^\d+$/.test(identifier)) {
        return identifier + '@gmail.com';
    }

    return identifier;
}


  generateOTP(): void {
    this.identifier = this.otpForm.get('identifier')?.value?.trim();
    if (!this.identifier) {
      this.toastService.error('Please enter a valid identifier.');
      return;
    }
  
    this.identifier = this.formatIdentifier(this.identifier);
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
        },
        error: (error: any) => {
          
            const errorMessage = error.error || 'Failed to generate OTP.';
            this.toastService.error(errorMessage);
            this.voiceService.speak(errorMessage); 
            console.error(error);
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
      const errorMessage = 'Please enter both email and OTP.';
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
          console.log(response);
          this.toastService.success('Account Logged In');
          localStorage.setItem(this.authTokenName, response.token);
          sessionStorage.removeItem('otpTimestamp');
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          const errorMessage = error.error || 'OTP verification failed. Please try again.';
          this.toastService.error(errorMessage);
          this.voiceService.speak(errorMessage); // Speak out the error
          console.error(' OTP Verification Error:', error);
        },
        
      });
  }
}
