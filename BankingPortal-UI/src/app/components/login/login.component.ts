import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { AuthService } from 'src/app/services/auth.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { VoiceService } from 'src/app/services/voice.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword: boolean = false;
  authTokenName = environment.tokenName;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private _toastService: ToastService,
    private loader: LoadermodelService,
    private voiceService: VoiceService
  ) {}

  ngOnInit(): void {
    this.initLoginForm();
  }

  initLoginForm(): void {
    sessionStorage.clear();
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.voiceService.initializeVoiceCommands(this.loginForm, this);
  }

  
  onSubmit(): void {
    if (this.loginForm.valid) {
        let { identifier, password } = this.loginForm.value;

        identifier = identifier.trim();
        password = password.trim();

        if (!identifier.includes('@') && !/^\d+$/.test(identifier)) {
            identifier += '@gmail.com';
        }

        this.loader.show('Logging in...');

        this.authService.login(identifier, password).subscribe({
            next: (response: any) => {
                const token = response.token;
                localStorage.setItem(this.authTokenName, token);
                this.loader.hide();
                this.router.navigate(['/dashboard']);
            },
            error: (error: any) => {
                const errorMessage = error.error || 'Login failed. Please try again.';

                this._toastService.error(errorMessage);
                this.voiceService.speak(errorMessage);

                console.error('Login error:', error);
                this.loader.hide();
            },
        });
    } else {
        const validationMessage = 'Please enter both email and password.';
        this._toastService.error(validationMessage);
        this.voiceService.speak(validationMessage);
    }
}

  
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
