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
import { OtpComponent } from '../components/otp/otp.component';
import { ToastService } from 'angular-toastify';
import { ResetPasswordComponent } from '../components/reset-password/reset-password.component';
import { DepositComponent } from '../components/deposit/deposit.component';
import { VoiceAssistantComponent } from '../components/voice-assistant/voice-assistant.component';
import { ApiService } from 'src/app/services/api.service';
import { NgZone } from '@angular/core';
import { WithdrawComponent } from '../components/withdraw/withdraw.component';

declare var annyang: any;

@Injectable({
  providedIn: 'root',
})
export class VoiceService {

  private loginForm?: FormGroup;
  private registerForm?: FormGroup;
  private loginComponent?: LoginComponent;
  private registerComponent?: RegisterComponent;
  private loader?: LoadermodelService;
  private pinChangeForm?: FormGroup;
  private pinChangeComponent?: AccountPinComponent;
  private otpForm?:FormGroup;
  private otpComponent?: OtpComponent;
  private resetPasswordForm?:FormGroup;
  private resetPasswordComponent?:ResetPasswordComponent;
  public step = 0;
  private loginData: { identifier?: string; password?: string; otp?: string } = {};
  private loginOtpData: { identifier?: string; otp?: string } = {};
  private resetPassword: { identifier?: string; otp?: string } = {};
  private registerData: { name?: string; email?: string; countryCode?: string; phoneNumber?: string; address?: string; confirmPassword?: string; password?: string } = {};
  private accountPinData: { newPin?: string; confirmPin?: string; passwordGenerate?: string } = {};
  private assistantComponent?: VoiceAssistantComponent;

  private depositForm?: FormGroup;
  private depositComponent?: DepositComponent;
  private depositMoney: { amount?: string; pin?: string } = {};
 
  private withdrawForm?: FormGroup;
  private withdrawComponent?: WithdrawComponent;
  private withdrawMoney: { amount?: string; pin?: string } = {};

  private isListening: boolean = false;
  private isProcessing = false; // Prevent duplicate transactions

  private resetStatus: 'idle' | 'resetting' | 'reset' = 'idle';
   private _toastService?: ToastService;
   setAssistantComponent(assistant: VoiceAssistantComponent) {
    console.log('Assistant component set:', assistant);
    this.assistantComponent = assistant;
  }
  


  constructor(private authService: AuthService,  private apiService: ApiService,
    private router: Router, private tts: ResponsiveVoiceService) {}
  
  private resetState(): void {
    this.resetStatus = 'resetting';
  this.depositMoney
  this.withdrawMoney
    this.loginData = {};
    this.loginOtpData = {};
    this.resetPassword = {};

    this.registerData = {
      name: '',
      email: '',
      countryCode: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: ''
    };
    this.accountPinData = {
      newPin: '',
      confirmPin: '',
      passwordGenerate: ''
    };
    this.step = 0;
  
    this.loginForm?.reset();
    this.registerForm?.reset();
    this.otpForm?.reset();
    this.resetPasswordForm?.reset();
    this.pinChangeForm?.reset();
  
    this.resetStatus = 'reset';
    this.speak('State has been reset. You can start again.');
  
   
  }
  setDepositComponent(depositComponent: DepositComponent) {
    this.depositComponent = depositComponent;
  }
    setWithdrawComponent(withdrawComponent: WithdrawComponent) {
      this.withdrawComponent = withdrawComponent;
  }

  private fetchBalance(): void {
    this.apiService.getAccountDetails().subscribe({
      next: (data: any) => {
        if (data && data.balance !== undefined) {
          this.speak(`Your current balance is ${data.balance} rupees.`);
        } else {
          this.speak('Unable to retrieve balance. Please try again later.');
        }
      },
      error: () => {
        this.speak('Error fetching balance. Please check your account.');
      },
    });
  }
  
  

  async initializeVoiceCommands(
    loginForm?: FormGroup,
    loginComponent?: LoginComponent,
    registerForm?: FormGroup,
    registerComponent?: RegisterComponent,
    pinChangeForm?: FormGroup,
    pinChangeComponent?: AccountPinComponent,
    otpForm?: FormGroup,
    otpComponent?: OtpComponent,
    resetPasswordForm?: FormGroup,
    resetPasswordComponent?: ResetPasswordComponent,
    depositForm?: FormGroup,
    depositComponent?: DepositComponent,
    withdrawForm?: FormGroup,
    withdrawComponent?: WithdrawComponent
  ): Promise<void> {
    try {
      if (!annyang) {
        console.error('Annyang is not supported in this browser.');
        return;
      } else {
        console.log('Annyang is active! Say "Hello" to wake up.');
      }
  
      if (loginForm && loginComponent) {
        this.loginForm = loginForm;
        this.loginComponent = loginComponent;
      }
  
      if (registerForm && registerComponent) {
        this.registerForm = registerForm;
        this.registerComponent = registerComponent;
      }
  
      if (otpForm && otpComponent) {
        this.otpForm = otpForm;
        this.otpComponent = otpComponent;
      }
  
      if (resetPasswordForm && resetPasswordComponent) {
        this.resetPasswordForm = resetPasswordForm;
        this.resetPasswordComponent = resetPasswordComponent;
      }
  
      if (pinChangeForm && pinChangeComponent) {
        this.pinChangeForm = pinChangeForm;
        this.pinChangeComponent = pinChangeComponent;
      }
  
      if (depositForm && depositComponent) {
        this.depositForm = depositForm;
        this.depositComponent = depositComponent;
        console.log('Deposit component initialized in VoiceService.');
      }

      if (withdrawForm && withdrawComponent) {
        this.withdrawForm = withdrawForm;
        this.withdrawComponent = withdrawComponent;
        console.log('withdraw component initialized in VoiceService.');
      }
      const activationCommands: { [key: string]: () => void } = {
        'hello': () => this.startListening(),
        'hello bank': () => this.startListening(),
        'reload': () => this.reloadPage(),
        'try again': () => this.reloadPage(),
      };
  
      annyang.addCommands(activationCommands);
      annyang.start({ autoRestart: true, continuous: true });
  
    } catch (error) {
      console.error('Error initializing voice commands:', error);
      this.speakError();
    }
  }
  
  private startListening(): void {
    if (!this.isListening) {
      this.isListening = true;
        console.log('Voice assistant activated.');
        speechSynthesis.resume();
        this.speak('How can I help you?');
        const functionalCommands: { [key: string]: (input?: string) => void } = {
            '*input': (input?: string) => this.handleInput(input),
        };
        annyang.addCommands(functionalCommands);
        annyang.start({ autoRestart: true, continuous: true });
    }
}

  private reloadPage(): void {
    console.log('Reloading page...');
    location.reload();
  }
  private speakError(): void {
    this.speak('An error occurred while setting up voice commands. Please try again.');
    console.error('Error setting up voice commands.');
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
        this.speak('Redirecting to deposit page. please say your amount');
    } else {
        this.speak('You need to log in first.');
        console.warn(" Unauthorized access attempt to deposit page.");
    }
}


private navigateToWithdraw(): void {
  console.log("Checking login status:", this.authService.isLoggedIn()); 
  if (this.authService.isLoggedIn()) {
      this.router.navigate(['/account/withdraw']);
      this.speak('Redirecting to Withdraw page. please say your amount');
  } else {
      this.speak('You need to log in first.');
      console.warn(" Unauthorized access attempt to deposit page.");
  }
}


private navigateLoginWithOtp(): void {
  if (this.isListening) {
    this.router.navigate(['/login/otp']);
    this.speak('Redirecting to login with Otp  page. Please say your email or account number.');
    this.step = 14;
  }
}

private navigateForgetPassword(): void {
  if (this.isListening) {
    this.router.navigate(['/forget-password']);
    this.speak('Redirecting to forget password page. Please say your email or account number.');
    this.step = 18;
  }
}

private navigateToCreatePin(): void {
  console.log("Checking login status:", this.authService.isLoggedIn());

  if (this.authService && this.authService.isLoggedIn()) {
    console.log("User is logged in. Navigating to Create PIN page...");

    this.router.navigate(['/account/pin']).then(() => {
      this.step = 11;
      this.speak('Redirecting to create PIN page. Please say your new PIN.');
    }).catch(error => {
      console.error("Navigation error:", error);
      this.speak('Failed to navigate to Create PIN page.');
    });

  } else {
    console.warn("Unauthorized access attempt to Create PIN page.");
    this.speak('You need to log in first.');
  }
}
private navigateToDashboard():void{
  console.log("user navigating to the dashboard");
  this.router.navigate(['/dashboard']).then(()=>{
     this.step=25;
     this.speak('Redirecting to dashboard page.');
  }).catch(error => {
    console.error("Navigation error:", error);
    this.speak('Failed to navigate to dashboard page.');
  });
}


private logout(): void {
  console.log("Logging out...");

  if (this.authService && this.authService.isLoggedIn()) {
    this.authService.logOutUser().subscribe({
      next: () => {
        console.log(" Successfully logged out.");
        this.router.navigate(['/']);
        this.speak('You have been logged out.');
      },
      error: (error: any) => {
        console.error(" Logout error:", error);
        this.speak('An error occurred while logging out.');
      }
    });
  } else {
    console.warn(" User is not logged in or AuthService is unavailable.");
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
        console.log("Recognized voice input:", input);

        if (!this.isListening || !input) {
            console.warn('Invalid voice command input:', input);
            return this.startListening();
        }

        input = input.trim().toLowerCase();

        const isLoggedIn = this.authService.isLoggedIn();
        const isOnDashboard = this.router.url.toLowerCase().includes('/dashboard');

        // If user says "cancel", navigate to the dashboard immediately
        if (input.includes("cancel")) {
            console.log('User said "cancel", navigating to dashboard.');
            this.navigateToDashboard();
            return;
        }

        if (isOnDashboard) {
            const exactKeywordActions: { [key: string]: () => void } = {
                "create a pin": () => this.navigateToCreatePin(),
                "create pin": () => this.navigateToCreatePin(),
                "dashboard": () => this.navigateToDashboard(),
                "deposit": () => this.navigateToDeposit(),
                "withdraw": () => this.navigateToWithdraw(),
                "get money": () => this.navigateToWithdraw(),
                'check balance': () => this.fetchBalance()
            };
            for (const keyword in exactKeywordActions) {
                if (input.includes(keyword)) {
                    console.log(`Matched keyword: "${keyword}"`);
                    exactKeywordActions[keyword]();
                    return;
                }
            }
        }

        const keywordActions: { [key: string]: () => void } = {
            "index": () => this.navigateToHome(),
            "home": () => this.navigateToHome(),
            "login": () => {
                if (!isLoggedIn && !isOnDashboard) {
                    this.navigateToLogin();
                } else {
                    this.speak('You are already logged in.');
                }
            },
            "sign in": () => {
                if (!isLoggedIn && !isOnDashboard) {
                    this.navigateToLogin();
                } else {
                    this.speak('You are already logged in.');
                }
            },
            "login with otp": () => this.navigateLoginWithOtp(),
            "otp": () => this.navigateLoginWithOtp(),
            "create account": () => {
                if (!isLoggedIn && !isOnDashboard) {
                    this.navigateToRegister();
                } else {
                    this.speak('You are already logged in.');
                }
            },
            "register": () => {
                if (!isLoggedIn && !isOnDashboard) {
                    this.navigateToRegister();
                } else {
                    this.speak('You are already logged in.');
                }
            },
            "sign up": () => {
                if (!isLoggedIn && !isOnDashboard) {
                    this.navigateToRegister();
                } else {
                    this.speak('You are already logged in.');
                }
            },
            "log out": () => {
                if (isLoggedIn) {
                    this.logout();
                    this.reloadPage();
                } else {
                    this.speak('You are not logged in.');
                }
            },
            "sign out": () => {
                if (isLoggedIn) {
                    this.logout();
                    this.reloadPage();
                } else {
                    this.speak('You are not logged in.');
                }
            },
            "exit": () => {
                if (isLoggedIn) {
                    this.logout();
                } else {
                    this.speak('You are not logged in.');
                }
            },
            "stop": () => this.stopListening(),
            "forget password": () => {
                if (!isLoggedIn && !isOnDashboard) {
                    this.navigateForgetPassword();
                } else {
                    this.speak('You are already logged in.');
                }
            },
            "reset password": () => {
                if (!isLoggedIn && !isOnDashboard) {
                    this.navigateForgetPassword();
                } else {
                    this.speak('You are already logged in.');
                }
            },
        };

        for (const keyword in keywordActions) {
            if (input.includes(keyword)) {
                console.log(`Matched keyword: "${keyword}"`);
                keywordActions[keyword]();
                return;
            }
        }

        this.processHandler(input);
    } catch (error) {
        console.error('Error processing voice input:', error);
    }
}




private processHandler(input: string): void {
  const currentUrl = this.router.url.toLowerCase();

  if (currentUrl.includes('login/otp')) {
    this.processLoginWithOtp(input);
  }
  else if (currentUrl.includes('forget-password')) {
    this.processForgetPassword(input);
  } else if (currentUrl.includes('login')) {
    this.processLogin(input); 
  } else if (currentUrl.includes('register')) {
    this.processRegister(input); 
  } 
  else if (currentUrl.includes('account/pin')) {
    this.processPin(input);
  }
  else if (currentUrl.includes('account/deposit')) {
    this.processDeposit(input);
  }
  else if (currentUrl.includes('account/withdraw')) {
    this.processWithdraw(input);
  }
}


public processForgetPassword(input: string): void {
  try {
    if (!input.trim()) {
      this.speak('I didn’t catch that. Please try again.');
      return;
    }

    switch (this.step) {
      case 18:
        this.resetPassword.identifier = input.trim();
        this.updateInputField('identifier', input.trim());
        this.resetPasswordForm?.patchValue({ identifier: input.trim() });
        this.speak(`You entered "${input}". Say "confirm" to proceed with sending the OTP.`);
        this.step = 19;
        break;

      case 19:
        if (input.trim().toLowerCase() !== 'confirm') {
          this.speak('To proceed, please say "confirm".');
          return;
        }

        if (!this.resetPasswordComponent) {
          console.error('ResetPasswordComponent is not initialized.');
          this.speak('Reset password form is unavailable. Please restart the process.');
          return;
        }

        this.speak('Generating your OTP now. Once you receive it, say your PIN.');
        this.resetPasswordComponent.sendOtp();
        this.step = 20;
        break;

      case 20:
        this.resetPassword.otp = input.trim();
        this.updateInputField('otp', input.trim());
        this.resetPasswordForm?.patchValue({
          identifier: this.loginOtpData.identifier || '',
          otp: this.resetPassword.otp || '',
        });

        if (!this.resetPassword.identifier || !this.resetPassword.otp) {
          this.speak('Both your identifier and OTP are required. Please provide both.');
          console.error('Both identifier and OTP are required.');
          return;
        }

        this.speak(`You entered "${input}". Say "verify" to continue with OTP verification.`);
        this.step = 21;
        break;

      case 21:
        if (input.trim().toLowerCase() !== 'verify') {
          this.speak('To proceed, please say "verify".');
          return;
        }

        if (!this.resetPasswordComponent) {
          console.error('ResetPasswordComponent is not initialized.');
          this.speak('Reset password form is unavailable. Please restart the process.');
          return;
        }

        this.speak('Verifying your OTP now. Please wait.');
        this.resetPasswordComponent.verifyOtp();
        break;

      default:
        this.speak('Something went wrong. Restarting the reset password process.');
        console.error('Unknown step:', this.step);
       
    }
  } catch (error) {
    console.error('OTP verification failed:', error);
    this.speak('There was an issue verifying your OTP. Please try again.');
  }
}


private processLoginWithOtp(input: string): void {
  try {
    if (!input.trim()) {
      this.speak('I didn’t catch that. Please try again.');
      return;
    }
if (input==='reset'){
  this.resetState();
  return;
}
    switch (this.step) {
      case 14:
        this.loginOtpData.identifier = input.trim();
        this.updateInputField('identifier', input);
        this.otpForm?.patchValue({ identifier: input.trim() });
        this.speak(`You entered "${input}". Say "confirm" to proceed with sending the OTP.`);
        this.step = 15;
        break;

      case 15:
        if (input.toLowerCase() !== 'confirm') {
          this.speak('To proceed, please say "confirm".');
          return;
        }

        if (!this.otpComponent) {
          console.error(' OTP component is not initialized.');
          this.speak('OTP form is unavailable. Please restart the OTP process.');
          return;
        }

        this.speak('Generating your OTP now. Once you receive it, say your PIN.');
        this.otpComponent.generateOTP();
        this.step = 16;
        break;

      case 16:
        this.loginOtpData.otp = input.trim();

        if (this.otpComponent && this.otpComponent.ngOtpInput) {
          this.otpComponent.ngOtpInput.setValue(this.loginOtpData.otp);
        }

        this.updateInputField('otp', input);
        this.otpForm?.patchValue({
          identifier: this.loginOtpData.identifier || '',
          otp: this.loginOtpData.otp || ''
        });

        if (!this.loginOtpData.identifier || !this.loginOtpData.otp) {
          this.speak('Both your identifier and OTP are required. Please provide both.');
          console.error(' Both identifier and OTP are required.');
          return;
        }

        this.speak(`You entered "${input}". Say "verify" to continue with login.`);
        this.step = 17;
        break;

      case 17:
        if (input.toLowerCase() !== 'verify') {
          this.speak('To proceed, please say "verify".');
          return;
        }

        if (!this.otpComponent) {
          console.error(' OTP component is not initialized.');
          this.speak('OTP form is unavailable. Please restart the login process.');
          return;
        }

        this.speak('Verifying your OTP now. Please wait.');
        this.otpComponent.verifyOTP();
        this.resetState();
        break;

      default:
        this.speak('Something went wrong. Restarting the login process.');
        console.error(' Unknown step:', this.step);
        this.resetState();
    }
  } catch (error) {
    console.error(' OTP verification failed:', error);
    this.speak('There was an issue verifying your OTP. Please try again.');
  }
}


private processLogin(input: string):void {
  try {
    if (!input.trim()) {
      this.speak('Input not recognized. Please try again.');
      return;
    }
    
  if (input === 'reset') {
    this.resetState();
    this.step = 1;
    this.speak('Please say your email or account number to continue.');
    return;
  }

    switch (this.step) {
      case 1:
        this.loginData.identifier = input.trim();
        this.updateInputField('identifier', input);
        this.speak(`You said ${input}. Now, please say your password.`);
        this.step = 2;
        this.updateForm(this.loginForm, {
          identifier: this.loginData.identifier,
          password: this.loginData.password || ''
        });
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
        this.updateForm(this.loginForm, {
          identifier: this.loginData.identifier || '',
          password: this.loginData.password
        });
        break;

      case 3:
        if (input.toLowerCase() !== 'confirm') {
          this.speak('Please say "confirm" to proceed with login.');
          return;
        }

        if (!this.loginForm || !this.loginComponent) {
          console.error('Login form or component is not initialized.');
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
        break;

      default:
        this.speak('Unexpected error occurred. Restarting login process.');
        console.error('Unknown step:', this.step);
        this.resetState();
    }
  } catch (error) {
    console.error('Error in processLogin:', error);
    this.speak('An error occurred during login. Please try again.');
  }
}


private processRegister(input: string): void {
  try {
    if (!input.trim()) {
      this.speak('Input not recognized. Please try again.');
      return;
    }

    if (input.toLowerCase() === 'reset') {
      this.resetState();
      this.step = 4;
      this.speak('Please say your name to continue.');
      return;
    }

    if (input.toLowerCase() === 'confirm' && this.step === 11) {
      if (this.registerComponent) {
        this.speak('Submitting your registration details. Please wait...');
        this.registerComponent.onSubmit();
      } else {
        console.error('RegisterComponent is not defined.');
        this.speak('An error occurred. Please try again.');
      }
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
        this.registerData.email = input;
        this.updateInputField('email', input);
        this.speak(`You said ${input}. Now, please say your country name.`);
        this.step = 6; 
        break;

      case 6: 
        this.registerData.countryCode = input;
        this.updateInputField('countryCode', input);
        this.speak(`You said ${input}. Now, please say your phone number.`);
        this.step = 7; 
        break;

      case 7: 
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
        this.speak('Account details are complete. Say "confirm" to submit your registration.');
        this.step = 11; 
        break;

      default: 
        this.speak('Unexpected error occurred. Please restart the registration.');
        console.error('Unknown step:', this.step);
        this.resetState();
        this.step = 4; 
    }
  } catch (error) {
    console.error('Error in processRegister:', error);
    this.speak('An error occurred during registration. Please try again.');
  }
}


private processPin(input: string): void {
  try {
    if (!input.trim()) {
      this.speak('Input not recognized. Please try again.');
      return;
    }

    if (input.toLowerCase() === 'reset') {
      this.resetState();
      this.step = 11;
      this.speak('Please say your new PIN to continue.');
      return;
    }

    switch (this.step) {
      case 11:
        this.accountPinData.newPin = input;
        this.updateInputField('newPin', input); // Update the form field
        this.speak('New PIN received. Now, please say your confirm PIN.');
        this.step = 12;
        break;

      case 12:
        if (this.accountPinData.newPin !== input) {
          this.speak('PINs do not match. Please say your new PIN again.');
          this.step = 11;
          return;
        }
        this.accountPinData.confirmPin = input;
        this.updateInputField('confirmPin', input); // Update the form field
        this.speak('Confirm PIN received. Now, please say your password.');
        this.step = 13;
        break;

      case 13:
        this.accountPinData.passwordGenerate = input;
        this.updateInputField('passwordGenerate', input); // Update the form field

        if (!this.pinChangeComponent) {
          this.speak('PIN change component is missing. Please try again later.');
          this.resetState();
          return;
        }

        this.pinChangeComponent.onSubmitGeneratePIN();
        this.speak('Processing PIN creation. Please wait.');
        break;

      default:
        this.speak('Unexpected error occurred. Restarting the PIN creation process.');
        console.error('Unknown step:', this.step);
        this.resetState();
    }
  } catch (error) {
    console.error('Error in processPin:', error);
    this.speak('An error occurred during PIN creation. Please try again.');
  }
}


public processDeposit(input: string): void {
  try {
    console.log(`processDeposit called with input: "${input}", Step: ${this.step}`);

    if (!input.trim()) {
      this.speak('Input not recognized. Please try again.');
      return;
    }

    if (input.toLowerCase() === 'reset') {
      this.resetProcess('Deposit process reset. Please say your deposit amount.', 22);
      return;
    }

    if (![22, 23, 24].includes(this.step)) {
      console.warn(`Invalid step detected: ${this.step}. Resetting to step 22.`);
      this.step = 22;
    }

    switch (this.step) {
      case 22:
        let amount = this.convertWordsToNumbers(input) || parseFloat(input);
        if (!isNaN(amount) && amount > 0) {
          this.depositMoney.amount = amount.toString();
          this.updateInputField('amount', amount.toString()); 
          this.speak(`You said ${amount} as the amount. Now, please say your PIN.`);
          this.step = 23;
        } else {
          this.speak('Invalid amount. Please say a valid number.');
        }
        break;

      case 23:
        if (!/^\d{4}$/.test(input.trim())) {
          this.speak('Invalid PIN format. Please say a 4-digit number.');
          return;
        }

        if (this.isProcessing) return;
        this.isProcessing = true;

        this.depositMoney.pin = input.trim();
        this.updateInputField('pin', input.trim()); // ✅ Now PIN updates the input field

        this.isProcessing = false;
        this.step = 24;
        this.speak('PIN entered. Say "confirm" to complete the deposit or "reset" to start over.');
        break;

      case 24:
        if (input.toLowerCase() === 'confirm') {
          if (!this.depositMoney.amount || !this.depositMoney.pin) {
            this.handleError('Amount or PIN is missing. Please try again.', 22);
            return;
          }

          if (!this.depositComponent) {
            this.handleError('Deposit component is unavailable. Please restart.', 22);
            return;
          }

          if (this.isProcessing) return;
          this.isProcessing = true;

          this.speak('Processing your deposit. Please wait.');
          this.loader?.show('Processing deposit...');

          try {
            this.depositComponent.onSubmit();
            setTimeout(() => {
              this.speak('Your deposit has been processed successfully.');
              this.isProcessing = false;
              this.step = 22; // Reset process
            }, 500);
          } catch (error) {
            this.handleError('An error occurred while processing your deposit. Please try again later.', 22);
          }
        } else {
          this.speak('Invalid input. Please say "confirm" to proceed or "reset" to start over.');
        }
        break;

      default:
        this.handleError('Unexpected error. Restarting the deposit process.', 22);
    }
  } catch (error) {
    this.handleError('An error occurred during deposit processing. Please try again.', 22);
  }
}


public processWithdraw(input: string): void {
  try {
    console.log(`processWithdraw called with input: "${input}", Step: ${this.step}`);

    if (!input.trim()) {
      this.speak('Input not recognized. Please try again.');
      return;
    }

    if (input.toLowerCase() === 'reset') {
      this.resetProcess('Withdraw process reset. Please say your withdraw amount.', 26);
      return;
    }

    if (![26, 27, 28].includes(this.step)) {
      console.warn(`Invalid step detected: ${this.step}. Resetting to step 26.`);
      this.step = 26;
    }

    switch (this.step) {
      case 26:
        let amount = this.convertWordsToNumbers(input) || parseFloat(input);
        if (!isNaN(amount) && amount > 0) {
          this.withdrawMoney.amount = amount.toString();
          this.updateInputField('amount', amount.toString()); 
          this.speak(`You said ${amount} as the amount. Now, please say your PIN.`);
          this.step = 27;
        } else {
          this.speak('Invalid amount. Please say a valid number.');
        }
        break;

      case 27:
        if (!/^\d{4}$/.test(input.trim())) {
          this.speak('Invalid PIN format. Please say a 4-digit number.');
          return;
        }

        if (this.isProcessing) return;
        this.isProcessing = true;

        this.withdrawMoney.pin = input.trim();
        this.updateInputField('pin', input.trim()); // ✅ Now PIN updates the input field

        this.isProcessing = false;
        this.step = 28;
        this.speak('PIN entered. Say "confirm" to complete the withdrawal or "reset" to start over.');
        break;

      case 28:
        if (input.toLowerCase() === 'confirm') {
          if (!this.withdrawMoney.amount || !this.withdrawMoney.pin) {
            this.handleError('Amount or PIN is missing. Please try again.', 26);
            return;
          }

          if (!this.withdrawComponent) {
            this.handleError('Withdraw component is unavailable. Please restart.', 26);
            return;
          }

          if (this.isProcessing) return;
          this.isProcessing = true;

          this.speak('Processing your withdrawal. Please wait.');
          this.loader?.show('Processing withdrawal...');

          try {
            this.withdrawComponent.onSubmit();
            setTimeout(() => {
              this.speak('Your withdrawal has been processed successfully.');
              this.isProcessing = false;
              this.step = 26; // Reset process
            }, 500);
          } catch (error) {
            this.handleError('An error occurred while processing your withdrawal. Please try again later.', 26);
          }
        } else {
          this.speak('Invalid input. Please say "confirm" to proceed or "reset" to start over.');
        }
        break;

      default:
        this.handleError('Unexpected error. Restarting the withdrawal process.', 26);
    }
  } catch (error) {
    this.handleError('An error occurred during withdrawal processing. Please try again.', 26);
  }
}



private handleError(message: string, step: number): void {
  console.error(message);
  this.speak(message);
  this.resetState();
  this.step = step;
}

private resetProcess(message: string, step: number): void {
  this.speak(message);
  this.resetState();
  this.step = step;
}


private convertWordsToNumbers(input: string): number | null {
  console.log("Received input:", input);

  const wordsToNumbers: { [key: string]: number } = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40,
    "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80,
    "ninety": 90, "hundred": 100, "thousand": 1000, 
    "lakh": 100000, "lakhs": 100000, 
    "crore": 10000000, "crores": 10000000
  };

  let words = input.toLowerCase().replace(/[^a-z\s0-9]/g, '').split(/\s+/);
  let total = 0, current = 0, lastMultiplier = 1;

  for (let word of words) {
    if (wordsToNumbers[word] !== undefined) {
      let num = wordsToNumbers[word];

      if (num >= 100 && num < 1000) {
        current *= num;
      } else if (num >= 1000) {
        total += (current === 0 ? 1 : current) * num;
        current = 0;
        lastMultiplier = num;
      } else {
        current += num;
      }
    }
  }

  total += current;
  console.log("Converted number:", total);
  return total > 0 ? total : null;
}



// Method to set the depositForm
setDepositForm(form: FormGroup): void {
  this.depositForm = form;
  console.log('Deposit form set in VoiceService:', this.depositForm);
}
setWithdrawForm(form: FormGroup): void {
  this.withdrawForm = form;
  console.log('withdraw form set in VoiceService:', this.withdrawForm);
}

private updateInputField(fieldName: string, value: string): void {
  try {
    const trimmedValue = value.trim();
    console.log(`Attempting to update field "${fieldName}" with value: ${trimmedValue}`);

    // Prioritize updating the depositForm if it exists and has the field
    if (this.depositForm && this.depositForm.get(fieldName)) {
      this.depositForm.get(fieldName)?.setValue(trimmedValue);
      console.log(`Updated field "${fieldName}" in Deposit Form with value: ${trimmedValue}`);
      return;
    }

    if (this.withdrawForm && this.withdrawForm.get(fieldName)) {
      this.withdrawForm.get(fieldName)?.setValue(trimmedValue);
      console.log(`Updated field "${fieldName}" in withdraw Form with value: ${trimmedValue}`);
      return;
    }


    // Fallback to other forms if depositForm is not available or doesn't have the field
    const forms = [
      { form: this.resetPasswordForm, name: 'Reset Password Form' },
      { form: this.registerForm, name: 'Register Form' },
      { form: this.loginForm, name: 'Login Form' },
      { form: this.otpForm, name: 'OTP Form' },
      { form: this.pinChangeForm, name: 'PIN Change Form' },
      { form: this.depositForm, name: 'Deposit Form' },
      { form: this.withdrawForm, name: 'withdraw Form' },
    ];

    let fieldUpdated = false;
    for (const formData of forms) {
      if (formData.form && formData.form.get(fieldName)) {
        formData.form.get(fieldName)?.setValue(trimmedValue);
        console.log(`Updated field "${fieldName}" in ${formData.name} with value: ${trimmedValue}`);
        fieldUpdated = true;
        break;
      }
    }

    if (!fieldUpdated) {
      console.warn(`Field "${fieldName}" not found in any form.`);
      this.speak(`Field "${fieldName}" not found. Please try again.`);
    }
  } catch (error) {
    console.error(`Error updating field "${fieldName}":`, error);
    this.speak('An error occurred while updating form fields.');
  }
}
private updateForm(form?: FormGroup, data?: any): void {
  if (form && data) {
    try {
      form.setValue(data);
      console.log('Form updated with data:', data);
    } catch (error) {
      console.error('Error updating form:', error);
      this.speak('An error occurred while updating the form.');
    }
  } else {
    console.warn('Form or data not provided.');
    this.speak('Form or data not provided. Please try again.');
  }
}



speak(message: string): void {
  console.log("Attempting to speak:", message);

  if (window.speechSynthesis.speaking) {
    console.warn("Speech already running. Cancelling and delaying restart...");
    window.speechSynthesis.cancel();

    setTimeout(() => {
      this.tts.speak(message);
    }, 500);  // Add a delay before restarting speech

    return;
  }

  try {
    this.tts.speak(message);
  } catch (error) {
    console.error("Error in text-to-speech:", error);
  }
}



  // private resetState(): void {
  //   this.isListening = false;
  //   this.startListening();
  //   this.loginData = {};
  // }
}
