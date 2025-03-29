import { ToastService } from 'angular-toastify';
import { ICountry } from 'ngx-countries-dropdown';
import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StrongPasswordRegx } from 'src/app/util/formutil';
import { VoiceService } from 'src/app/services/voice.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  registerForm!: FormGroup;
  showRegistrationData = false;
  registrationData: any;
  faceDetected = false;
  private mediaStream: MediaStream | null = null;

  constructor(
    private authService: AuthService,
    private _toastService: ToastService,
    private voiceService: VoiceService
  ) {}

  ngOnInit() {
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required]),
      countryCode: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(127),
        Validators.pattern(StrongPasswordRegx),
      ]),
      confirmPassword: new FormControl('', Validators.required),
      faceImage: new FormControl(''),
    });

    console.log(' Register Form Initialized:', this.registerForm);

    this.voiceService.initializeVoiceCommands(
      undefined,
      undefined,
      this.registerForm,
      this
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  onCountryChange(country: ICountry) {
    this.registerForm.patchValue({ countryCode: country.code });
  }



  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }



    const trimmedData = {
      name: this.registerForm.get('name')?.value?.trim() || '',
      email: this.registerForm.get('email')?.value?.trim().replace(/\s/g, '') || '',
      countryCode: this.registerForm.get('countryCode')?.value?.trim() || '',
      phoneNumber: this.registerForm.get('phoneNumber')?.value?.trim().replace(/\s/g, '') || '',
      address: this.registerForm.get('address')?.value?.trim() || '',
      password: this.registerForm.get('password')?.value?.replace(/\s/g, '') || '',
      confirmPassword: this.registerForm.get('confirmPassword')?.value?.replace(/\s/g, '') || '',

    };

    if (trimmedData.email && !trimmedData.email.includes('@') && isNaN(trimmedData.email as any)) {
      trimmedData.email += '@gmail.com';
    }

    this.registerForm.patchValue(trimmedData);

    if (trimmedData.password !== trimmedData.confirmPassword) {
      this._toastService.error('Passwords do not match.');
      this.voiceService.speak('Passwords do not match.');
      return;
    }

    console.log('Form Values:', this.registerForm.value);
    this.authService.registerUser(this.registerForm.value).subscribe({
      next: (response: any) => {
        this.registrationData = response;
        this.showRegistrationData = true;
      },
      error: (error: any) => {
        console.error('Registration failed:', error);
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this._toastService.error('Email already exists. Please use a different email.');
        this.voiceService.speak("'Email already exists. Please use a different email.'")
        if (errorMessage.includes('already exists')) {
          this._toastService.error('Email already exists. Please use a different email.');
        } else {
          this._toastService.error(errorMessage);
          this.voiceService.speak(errorMessage);
        }
      },
    });
  }

  ngOnDestroy() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
  }
}