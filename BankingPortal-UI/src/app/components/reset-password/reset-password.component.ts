import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { VoiceService } from 'src/app/services/voice.service';
import { passwordMismatch, StrongPasswordRegx } from 'src/app/util/formutil';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  newPasswordForm: FormGroup;
  showNewPasswordForm: boolean = false;
  otpSentSuccessfully: boolean = false;
  resetToken: string = '';

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
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
    private loader: LoadermodelService,
    private authService: AuthService,
    private voiceService: VoiceService
  ) {
    this.resetPasswordForm = this.fb.group({
      identifier: [
        '',
        [
          Validators.required,
        ],
      ],
      otp: [''],
    });

    this.newPasswordForm = this.fb.group(
      {
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(127),
          Validators.pattern(StrongPasswordRegx),
        ]),
        confirmPassword: new FormControl('', Validators.required),
      },
      {
        validators: passwordMismatch('newPassword', 'confirmPassword'),
      }
    );

    this.voiceService.initializeVoiceCommands(
      this.resetPasswordForm as FormGroup,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this.newPasswordForm as FormGroup
    );

    console.log('Reset Password Form:', this.resetPasswordForm);
    console.log('Identifier Field:', this.resetPasswordForm.get('identifier'));
  }

  get f() {
    return this.newPasswordForm.controls;
  }

  onOtpChange(otp: string): void {
    this.resetPasswordForm.patchValue({ otp: otp });
  }

  ngOnInit(): void {}

  formatIdentifier(identifier: string): string {
    identifier = identifier.trim().replace(/\s+/g, '');

    if (!identifier.includes('@') && !/^\d+$/.test(identifier)) {
      return identifier + '@gmail.com';
    }

    return identifier;
  }

  sendOtp(): void {
    if (this.resetPasswordForm.invalid) {
      const errorMessage = 'Please provide a valid email or account number.';
      this.toastService.error(errorMessage);
      this.voiceService.speak(errorMessage);
      return;
    }

    const input = this.formatIdentifier(this.resetPasswordForm.value.identifier);
    this.resetPasswordForm.patchValue({ identifier: input });

    this.loader.show('Generating OTP...');
    this.authService
      .sendOtpForPasswordReset(input)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (response: any) => {
          this.toastService.success(response.message);
          this.otpSentSuccessfully = true;
          this.resetPasswordForm.get('otp')?.setValidators(Validators.required);
          this.resetPasswordForm.get('otp')?.updateValueAndValidity();
          sessionStorage.setItem('otpTimestamp', Date.now().toString());
        },
        error: (error: any) => {
          const errorMessage = error.error?.message || 'Failed to send OTP. Please try again.';
          this.toastService.error(errorMessage);
          this.voiceService.speak(errorMessage);
          console.error('Failed to send OTP:', error);
        },
      });
  }

  verifyOtp(): void {
    if (this.resetPasswordForm.invalid) {
      const errorMessage = 'Please provide a valid OTP.';
      this.toastService.error(errorMessage);
      this.voiceService.speak(errorMessage);
      return;
    }

    const storedTime = sessionStorage.getItem('otpTimestamp');
    if (storedTime && Date.now() - parseInt(storedTime) > 5 * 60 * 1000) {
      const errorMessage = 'OTP has expired. Please generate a new one.';
      this.toastService.error(errorMessage);
      this.voiceService.speak(errorMessage);
      this.otpSentSuccessfully = false;
      return;
    }

    const identifier = this.formatIdentifier(this.resetPasswordForm.value.identifier);
    const otp = this.resetPasswordForm.value.otp;

    this.loader.show('Verifying OTP...');
    this.authService
      .verifyOtpForPasswordReset(identifier, otp)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (response) => {
          this.toastService.success('OTP Verified');
          this.showNewPasswordForm = true;
          this.resetToken = response.passwordResetToken;
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'OTP verification failed. Please try again.';
          this.toastService.error(errorMessage);
          this.voiceService.speak(errorMessage);
          console.error('Error verifying OTP:', error);
        },
      });
  }

  resetPassword(): void {
    if (this.newPasswordForm.invalid) {
      const errorMessage = 'Please provide a valid new password.';
      this.toastService.error(errorMessage);
      this.voiceService.speak(errorMessage);
      return;
    }

    const identifier = this.formatIdentifier(this.resetPasswordForm.value.identifier);
    const newPassword = this.newPasswordForm.value.newPassword;

    this.loader.show('Setting new Password...');
    this.authService
      .resetPassword(identifier, this.resetToken, newPassword)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (response) => {
          this.toastService.success('Password reset successfully');
          console.log('Password reset successfully:', response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Error resetting password. Please try again.';
          this.toastService.error(errorMessage);
          this.voiceService.speak(errorMessage);
          console.error('Error resetting password:', error);
        },
      });
  }
}