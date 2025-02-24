import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ResponsiveVoiceService } from '../services/responsive-voice.service';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { HeaderComponent } from '../components/header/header.component';
import { AuthService } from 'src/app/services/auth.service';
import { AccountPinComponent } from '../components/account-pin/account-pin.component';


declare var annyang: any;

@Injectable({
  providedIn: 'root',
})
export class VoiceService {

  // private isListening = false;
  private loginForm?: FormGroup;
  private registerForm?: FormGroup;
  private loginComponent?: LoginComponent;
  private registerComponent?: RegisterComponent;
  private loader?: LoadermodelService;
  private pinChangeForm?: FormGroup;
  private pinChangeComponent?: AccountPinComponent;

  private step = 0;
  // private loginData: { identifier?: string; password?: string; name?: string; email?: string; countryCode?: string; phoneNumber?: string; address?: string; confirmPassword?: string } = {};
  
  private loginData: { identifier?: string; password?: string } = {};
private registerData: { name?: string; email?: string; countryCode?: string; phoneNumber?: string; address?: string; confirmPassword?: string; password?: string } = {};

private accountPinData: { newPinGenerate?: string; confirmPinGenerate?: string;password?: string } = {};

  constructor( private authService: AuthService,private router: Router, private tts: ResponsiveVoiceService) {}


  private isListening: boolean = false;

  async initializeVoiceCommands(
    loginForm?: FormGroup,
    loginComponent?: LoginComponent,
    registerForm?: FormGroup,
    registerComponent?: RegisterComponent,
    pinChangeForm?:FormGroup,
    pinChangeComponent?:AccountPinComponent
  ): Promise<void> {
    try {
      if (!annyang) {
        console.error('❌ Annyang is not supported in this browser.');
        return;
      }
  
      console.log('✅ Annyang is active! Say "Hello" to wake up.');
  
      if (loginForm && loginComponent) {
        this.loginForm = loginForm;
        this.loginComponent = loginComponent;
      }
  
      if (registerForm && registerComponent) {
        this.registerForm = registerForm;
        this.registerComponent = registerComponent;
      }
  
      // Activation Commands
      const activationCommands: { [key: string]: () => void } = {
        'hello': () => this.startListening(),
        'hello bank': () => this.startListening(),
        'reload': () => this.reloadPage(),
        'try again': () => this.reloadPage(), // Reload page when user says "Try again"
      };
  
      annyang.addCommands(activationCommands);
      annyang.start({ autoRestart: true, continuous: true });
  
    } catch (error) {
      console.error('❌ Error initializing voice commands:', error);
      this.speakError();
    }
  }
  
  private startListening(): void {
    if (!this.isListening) {
      this.isListening = true;
      console.log('🎤 Voice assistant activated.');
      speechSynthesis.resume();
      this.speak('How can I help you?');
  
      // Functional Commands
      const functionalCommands: { [key: string]: (input?: string) => void } = {
        '*input': (input?: string) => this.handleInput(input),
      };
  
      annyang.addCommands(functionalCommands);
      annyang.start({ autoRestart: true, continuous: true });
    }
  }
  
  // Reload the Page
  private reloadPage(): void {
    console.log('🔄 Reloading page...');
    location.reload();
  }
  
  // Error Handling
  private speakError(): void {
    this.speak('An error occurred while setting up voice commands.');
  }
  


  private navigateToHome(): void {
    if (this.isListening) {
      this.router.navigate(['/']);
      this.speak('Redirecting to Home page.');
    }
  }



  private navigateToLogin(): void {
    if (this.isListening) {
      this.router.navigate(['/login']);
      this.speak('Redirecting to login page. Please say your email or account number.');
      this.step = 1;
    }
  }

  private navigateToRegister(): void {
    if (this.isListening) {
      this.router.navigate(['/register']);
      this.speak('Redirecting to create account page. Please say your full name.');
      this.step = 4;
    }
  }


  private navigateToDeposit(): void {
    console.log("Checking login status:", this.authService.isLoggedIn()); 
    if (this.authService.isLoggedIn()) {
        this.router.navigate(['/account/deposit']);
        this.speak('Redirecting to deposit page.');
    } else {
        this.speak('You need to log in first.');
        console.warn("⚠️ Unauthorized access attempt to deposit page.");
    }
}



private navigateToCreatePin(): void {
  console.log("Checking login status:", this.authService.isLoggedIn()); 

  if (this.authService && this.authService.isLoggedIn()) {
    console.log("✅ User is logged in. Navigating to Create PIN page...");
    
    this.router.navigate(['/account/pin']).then(() => {
      this.speak('Redirecting to create PIN page.');
    }).catch(error => {
      console.error("❌ Navigation error:", error);
      this.speak('Failed to navigate to Create PIN page.');
    });

  } else {
    console.warn("⚠️ Unauthorized access attempt to Create PIN page.");
    this.speak('You need to log in first.');
  }
}



private logout(): void {
  console.log("🛑 Logging out...");

  if (this.authService && this.authService.isLoggedIn()) {
    this.authService.logOutUser().subscribe({
      next: () => {
        console.log("✅ Successfully logged out.");
        this.router.navigate(['/']);
        this.speak('You have been logged out.');
        this.resetState();
      },
      error: (error: any) => {
        console.error("❌ Logout error:", error);
        this.speak('An error occurred while logging out.');
      }
    });
  } else {
    console.warn("⚠️ User is not logged in or AuthService is unavailable.");
    this.speak("You are not logged in.");
  }
}

  private stopListening(): void {
    if (this.isListening) {
      this.isListening = false;
      this.speak('Voice recognition stopped.');
      this.step = 0;
    }
  }
  private handleInput(input?: string): void {
    try {
        console.log("🔍 Recognized voice input:", input);

        if (!this.isListening || !input) {
            console.warn('⚠️ Invalid voice command input:', input);
            return this.startListening();
        }

        input = input.trim().toLowerCase();

        const keywordActions: { [key: string]: () => void } = {
            "index": () => this.navigateToHome(),
            "home": () => this.navigateToHome(),
            "login": () => this.navigateToLogin(),
            "sign in": () => this.navigateToLogin(),
            "create account": () => this.navigateToRegister(),
            "register": () => this.navigateToRegister(),
            "sign up": () => this.navigateToRegister(),
            "logout": () => this.logout(),
            "sign out": () => this.logout(),
            "exit": () => this.logout(),
            "stop": () => this.stopListening(),
            "deposit": () => this.navigateToDeposit(),
            "create pin":()=>this.navigateToCreatePin(),
            "create a pin":()=>this.navigateToCreatePin()
        };

        for (const keyword in keywordActions) {
            if (input.includes(keyword)) {
                console.log(`✅ Matched keyword: "${keyword}"`);
                keywordActions[keyword]();
                return;
            }
        }

        this.processLoginOrRegister(input);
    } catch (error) {
        console.error('❌ Error processing voice input:', error);
    }
}

private processLoginOrRegister(input: string): void {
  if (this.router.url.includes('login')) {
    this.processLogin(input);

  } else if (this.router.url.includes('register')) {
    this.processRegister(input);
  }
  else if(this.router.url.includes('account/pin')){
    this.processPin(input);
  }
}

private processLogin(input: string): void {
  try {
    if (!input.trim()) {
      this.speak('Input not recognized. Please try again.');
      return;
    }

    switch (this.step) {
      case 1:
        this.loginData.identifier = input.trim();
        this.updateInputField('identifier', input);
        this.speak(`You said ${input}. Now, please say your password.`);
        this.step = 2;
        this.updateForm(this.loginForm);
        break;

      case 2:
        this.loginData.password = input.trim();
        if (!this.loginData.password) {
          this.speak('Password cannot be empty. Please say your password again.');
          return;
        }
        this.updateInputField('password', this.loginData.password);
        this.speak('Password received. Say "confirm" to log in.');
        this.step = 3;
        this.updateForm(this.loginForm);
        break;

      case 3:
        if (input.toLowerCase() !== 'confirm') {
          this.speak('Please say "confirm" to proceed with login.');
          return;
        }

        if (!this.loginForm || !this.loginComponent) {
          console.error('❌ Login form or component is not initialized.');
          this.speak('Login form is not available. Please restart the login process.');
          return;
        }

        this.loginForm.setValue({
          identifier: this.loginData.identifier,
          password: this.loginData.password
        });

        this.speak('Logging in now.');
        this.loader?.show('Logging in...');
        this.loginComponent.onSubmit();
        this.resetState();
        break;

      default:
        this.speak('Unexpected error occurred. Restarting login process.');
        console.error('❌ Unknown step:', this.step);
        this.resetState();
    }
  } catch (error) {
    console.error('❌ Error in processLogin:', error);
    this.speak('An error occurred during login. Please try again.');
  }
}


private processRegister(input: string): void {
  try {
    if (!input.trim()) {
      this.speak('Input not recognized. Please try again.');
      return;
    }

    switch (this.step) {
      case 4:
        this.registerData.name = input;
        this.updateInputField('name', input);
        this.speak(`You said ${input}. Now, please say your email.`);
        this.step = 5;
        break;

      case 5:
        if (!(input)) {
          this.speak('Invalid email format. Please say a valid email.');
          return;
        }
        this.registerData.email = input;
        this.updateInputField('email', input);
        this.speak(`You said ${input}. Now, please say your country.`);
        this.step = 6;
        break;

      case 6:
        this.registerData.countryCode = input;
        this.updateInputField('countryCode', input);
        this.speak(`you said ${input}. Now, please say your phone number.`);
        this.step = 7;
        break;

      case 7:
        if (!(input)) {
          this.speak('Invalid phone number. Please try again.');
          return;
        }
        this.registerData.phoneNumber = input;
        this.updateInputField('phoneNumber', input);
        this.speak(`You said ${input}. Now, please say your address.`);
        this.step = 8;
        break;

      case 8:
        this.registerData.address = input;
        this.updateInputField('address', input);
        this.speak(`You said ${input}. Now, please say your password.`);
        this.step = 9;
        break;

      case 9:
        if (input.length < 6) {
          this.speak('Password too short. Please say a longer password.');
          return;
        }
        this.registerData.password = input;
        this.updateInputField('password', input);
        this.speak('Password received. Now, please confirm your password.');
        this.step = 10;
        break;

      case 10:
        if (input !== this.registerData.password) {
          this.speak('Passwords do not match. Please confirm your password again.');
          return;
        }
        this.registerData.confirmPassword = input;
        this.updateInputField('confirmPassword', input);
        this.speak('Account created successfully!');
        this.registerComponent?.onSubmit(); // Call onSubmit on the registerComponent
        this.resetState();
        break;

      default:
        this.speak('Unexpected error occurred. Please restart the registration.');
        console.error('❌ Unknown step:', this.step);
        this.resetState();
    }
  } catch (error) {
    console.error('❌ Error in processRegister:', error);
    this.speak('An error occurred during registration. Please try again.');
  }
}


private processPin(input: string): void {
  try {
    if (!input.trim()) {
      this.speak('Input not recognized. Please try again.');
      return;
    }

    switch (this.step) {
      case 11:
        this.accountPinData.newPinGenerate = input;
        this.updateInputField('newPin', input);
        this.speak(`New PIN received. Now, please say your confirm PIN.`);
        this.step = 12;  // Changed from 5 to 12
        break;

      case 12:
        this.accountPinData.confirmPinGenerate = input;
        this.updateInputField('confirmPin', input);
        this.speak(`Confirm PIN received. Now, please say your password.`);
        this.step = 13; // Now it correctly transitions to the next step
        break;

      case 13:
        this.accountPinData.password = input; // Corrected property assignment
        this.updateInputField('password', input);
        this.speak(`Account PIN created successfully.`);
        this.pinChangeComponent?.onSubmitGeneratePIN();
        this.resetState();
        break;

      default:
        this.speak('Unexpected error occurred. Please restart the registration.');
        console.error('❌ Unknown step:', this.step);
        this.resetState();
    }
  } catch (error) {
    console.error('❌ Error in processPin:', error);
    this.speak('An error occurred during registration. Please try again.');
  }
}




private updateInputField(fieldName: string, value: string): void {
  try {
      const trimmedValue = value.trim();
      console.log('Register Form:', this.registerForm); // Log the form
      if (this.registerForm && this.registerForm.controls[fieldName]) {
          this.registerForm.controls[fieldName].setValue(trimmedValue);
          console.log(`✅ Updated field "${fieldName}" with value: ${trimmedValue}`);
      } else {
          console.warn(`⚠️ Form or field "${fieldName}" not found.`);
      }
  } catch (error) {
      console.error(`❌ Error updating field "${fieldName}":`, error);
      this.speak('An error occurred while updating form fields.');
  }
}

  
  private updateForm(form?: FormGroup): void {
    if (form) {
      form.setValue({
        identifier: this.loginData.identifier || '',
        password: this.loginData.password || '',
        name: this.registerData.name || '',
        email: this.registerData.email || '',
        countryCode: this.registerData.countryCode || '',
        phoneNumber: this.registerData.phoneNumber || '',
        address: this.registerData.address || '',
        confirmPassword: this.registerData.confirmPassword || ''
      });
    }
  }

  speak(message: string): void {
    try {
      this.tts.speak(message);
    } catch (error) {
      console.error('❌ Error in text-to-speech:', error);
    }
  }
  
  private resetState(): void {
    this.isListening = false;
    this.startListening();
    this.loginData = {};
  }
}
