import { ToastService } from 'angular-toastify';
import { ICountry } from 'ngx-countries-dropdown';
import { AuthService } from 'src/app/services/auth.service';
import { invalidPhoneNumber } from 'src/app/services/country-code.service';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StrongPasswordRegx } from 'src/app/util/formutil';
import { VoiceService } from 'src/app/services/voice.service'; // Import VoiceService

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showRegistrationData = false;
  registrationData: any;

  constructor(
    private authService: AuthService,
    private _toastService: ToastService,
    private voiceService: VoiceService // Inject VoiceService
  ) { }

  ngOnInit() {
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required]), // Removed Validators.email
      countryCode: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(127),
        Validators.pattern(StrongPasswordRegx)
      ]),
      confirmPassword: new FormControl('', Validators.required),
    });

    console.log("✅ Register Form Initialized:", this.registerForm);

    // Initialize voice commands with the register form
    this.voiceService.initializeVoiceCommands(
      undefined, // loginForm (not used here)
      undefined, // loginComponent (not used here)
      this.registerForm,
      this // Pass the current component as registerComponent
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
      // Mark all fields as touched to display validation errors
      this.registerForm.markAllAsTouched();
      return;
    }

    // Get the email value from the form
    let email = this.registerForm.get('email')?.value;

    // Check if the email is valid and append '@gmail.com' if necessary
    if (email && !email.includes('@') && isNaN(email as any)) {
      email += '@gmail.com';
      this.registerForm.get('email')?.setValue(email); // Update the form value
    }

    console.log(this.registerForm.value);
    this.authService.registerUser(this.registerForm.value).subscribe({
      next: (response: any) => {
        this.registrationData = response;
        this.showRegistrationData = true;
      },
      error: (error: any) => {
        console.error('Registration failed:', error);
        this._toastService.error(error.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}