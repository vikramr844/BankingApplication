// import { Injectable } from '@angular/core';
// import { FormGroup } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ResponsiveVoiceService } from '../services/responsive-voice.service';
// import { LoadermodelService } from 'src/app/services/loadermodel.service';
// import { AuthService } from 'src/app/services/auth.service';
// import { AccountPinComponent } from '../components/account-pin/account-pin.component';
// import { ToastService } from 'angular-toastify';

// declare var annyang: any;

// @Injectable({
//   providedIn: 'root',
// })
// export class VoiceMainService {
//   private pinChangeForm?: FormGroup;
//   private pinChangeComponent?: AccountPinComponent;
//   private isListening: boolean = false;
//   private step = 0;
//   private accountPinData: { newPinGenerate?: string; confirmPinGenerate?: string; password?: string } = {};

//   constructor(
//     private authService: AuthService,
//     private router: Router,
//     private tts: ResponsiveVoiceService,
//     private loader: LoadermodelService,
//     private toastService: ToastService
//   ) {}

//   async initializeVoiceCommands(
//     pinChangeForm?: FormGroup,
//     pinChangeComponent?: AccountPinComponent
//   ): Promise<void> {
//     try {
//       // Check if the user is logged in
//       if (!this.authService.isLoggedIn()) {
//         console.warn('User is not logged in. VoiceMainService will not activate.');
//         this.speak('You need to log in first to use voice commands.');
//         return;
//       }

//       if (!annyang) {
//         console.error('Annyang is not supported in this browser.');
//         return;
//       } else {
//         console.log('Annyang is active!');
//       }

//       if (pinChangeForm && pinChangeComponent) {
//         this.pinChangeForm = pinChangeForm;
//         this.pinChangeComponent = pinChangeComponent;
//       }

//       const functionalCommands: { [key: string]: () => void } = {
//         reload: () => this.reloadPage(),
//         'try again': () => this.reloadPage(),
//       };

//       const inputCommand: { [key: string]: (input?: string) => void } = {
//         '*input': (input?: string) => {
//           console.log('🎤 Voice input received:', input);

//           if (input) {
//             const normalizedInput = input.trim().toLowerCase();
//             if (functionalCommands[normalizedInput]) {
//               functionalCommands[normalizedInput]();
//               return;
//             }
//             this.handleCoreInput(input);
//           } else {
//             this.speak('Sorry, I did not catch that. Please repeat.');
//           }
//         },
//       };

//       annyang.addCommands(functionalCommands);
//       annyang.addCommands(inputCommand);

//       annyang.start({ autoRestart: true, continuous: true });
//     } catch (error) {
//       console.error('Error initializing voice commands:', error);
//       this.speakError();
//     }
//   }

//   private handleCoreInput(input?: string): void {
//     try {
//       console.log('Recognized voice input:', input);

//       if (!this.isListening || !input) {
//         console.warn('Invalid voice command input:', input);
//         return this.startListening();
//       }

//       input = input.trim().toLowerCase();

//       this.processPin(input);
//     } catch (error) {
//       console.error('Error processing voice input:', error);
//     }
//   }

//   private startListening(): void {
//     if (!this.isListening) {
//       this.isListening = true;
//       console.log('Voice assistant activated.');

//       speechSynthesis.resume();
//       this.speak('How can I help you?');

//       if (!annyang) {
//         console.error('Annyang is not available.');
//         this.speak('Voice recognition is not available on this browser.');
//         return;
//       }

//       const functionalCommands: { [key: string]: (input?: string) => void } = {
//         '*input': (input?: string) => {
//           console.log('Voice input received:', input);
//           if (input) {
//             this.handleInput(input);
//           } else {
//             this.speak('Sorry, I did not catch that. Please repeat.');
//           }
//         },
//       };

//       annyang.removeCommands();
//       annyang.addCommands(functionalCommands);

//       annyang.addCallback('result', (phrases: string[]) => {
//         console.log('🗣 Possible recognized phrases:', phrases);
//       });

//       annyang.addCallback('soundstart', () => {
//         console.log('🎤 Voice detection started.');
//       });

//       annyang.addCallback('end', () => {
//         console.log('🛑 Voice detection stopped.');
//         this.isListening = false;
//       });

//       annyang.start({ autoRestart: true, continuous: true });
//       console.log('Voice assistant is now listening.');
//     }
//   }

//   private reloadPage(): void {
//     console.log('🔄 Reloading page...');
//     location.reload();
//   }

//   private speakError(): void {
//     this.speak('An error occurred while setting up voice commands.');
//   }

//   private navigateToDeposit(): void {
//     console.log('Checking login status:', this.authService.isLoggedIn());
//     if (this.authService.isLoggedIn()) {
//       this.router.navigate(['/account/deposit']);
//       this.speak('Redirecting to deposit page.');
//     } else {
//       this.speak('You need to log in first.');
//       console.warn('Unauthorized access attempt to deposit page.');
//     }
//   }

//   private navigateToCreatePin(): void {
//     console.log('Checking login status:', this.authService.isLoggedIn());

//     if (this.authService && this.authService.isLoggedIn()) {
//       console.log('User is logged in. Navigating to Create PIN page...');

//       this.router.navigate(['/account/pin'])
//         .then(() => {
//           this.speak('Redirecting to create PIN page.');
//         })
//         .catch((error) => {
//           console.error('Navigation error:', error);
//           this.speak('Failed to navigate to Create PIN page.');
//         });
//     } else {
//       console.warn('Unauthorized access attempt to Create PIN page.');
//       this.speak('You need to log in first.');
//     }
//   }

//   private logout(): void {
//     console.log('Logging out...');

//     if (this.authService && this.authService.isLoggedIn()) {
//       this.authService.logOutUser().subscribe({
//         next: () => {
//           console.log('Successfully logged out.');
//           this.router.navigate(['/']);
//           this.speak('You have been logged out.');
//         },
//         error: (error: any) => {
//           console.error('Logout error:', error);
//           this.speak('An error occurred while logging out.');
//         },
//       });
//     } else {
//       console.warn('User is not logged in or AuthService is unavailable.');
//       this.speak('You are not logged in.');
//     }
//   }

//   private stopListening(): void {
//     if (this.isListening) {
//       this.isListening = false;
//       this.speak('Voice recognition stopped.');
//       this.step = 0;
//     }
//   }

//   private handleInput(input?: string): void {
//     try {
//       console.log('Recognized voice input:', input);

//       if (!this.isListening || !input) {
//         console.warn('Invalid voice command input:', input);
//         return this.startListening();
//       }

//       input = input.trim().toLowerCase();

//       const exactKeywordActions: { [key: string]: () => void } = {
//         'create a pin': () => this.navigateToCreatePin(),
//         deposit: () => this.navigateToDeposit(),
//         logout: () => this.logout(),
//         'sign out': () => this.logout(),
//       };

//       if (exactKeywordActions[input]) {
//         console.log(`Exact match: "${input}"`);
//         exactKeywordActions[input]();
//         return;
//       }

//       const keywordActions: { [key: string]: () => void } = {
//         deposit: () => this.navigateToDeposit(),
//         'create pin': () => this.navigateToCreatePin(),
//         logout: () => this.logout(),
//       };

//       for (const keyword in keywordActions) {
//         if (input.includes(keyword)) {
//           console.log(`Matched keyword: "${keyword}"`);
//           keywordActions[keyword]();
//           return;
//         }
//       }

//       this.processPin(input);
//     } catch (error) {
//       console.error('Error processing voice input:', error);
//     }
//   }

//   private processPin(input: string): void {
//     try {
//       if (!input.trim()) {
//         this.speak('Input not recognized. Please try again.');
//         return;
//       }

//       switch (this.step) {
//         case 11:
//           this.accountPinData.newPinGenerate = input;
//           this.updateInputField('newPin', input);
//           this.speak(`New PIN received. Now, please say your confirm PIN.`);
//           this.step = 12;
//           break;

//         case 12:
//           this.accountPinData.confirmPinGenerate = input;
//           this.updateInputField('confirmPin', input);
//           this.speak(`Confirm PIN received. Now, please say your password.`);
//           this.step = 13;
//           break;

//         case 13:
//           this.accountPinData.password = input;
//           this.updateInputField('password', input);
//           this.speak(`Account PIN created successfully.`);
//           this.pinChangeComponent?.onSubmitGeneratePIN();
//           this.resetState();
//           break;

//         default:
//           this.speak('Unexpected error occurred. Please restart the registration.');
//           console.error('Unknown step:', this.step);
//           this.resetState();
//       }
//     } catch (error) {
//       console.error('Error in processPin:', error);
//       this.speak('An error occurred during registration. Please try again.');
//     }
//   }

//   private resetState(): void {
//     this.accountPinData = {
//       newPinGenerate: '',
//       confirmPinGenerate: '',
//       password: '',
//     };
//     this.step = 11;
//     this.speak('PIN creation has been reset. Please say your new PIN to start again.');
//   }

//   private updateInputField(fieldName: string, value: string): void {
//     try {
//       const trimmedValue = value.trim();

//       const forms = [
//         { form: this.pinChangeForm, name: 'Pin Change Form' },
//       ];

//       let fieldUpdated = false;

//       for (const formData of forms) {
//         if (formData.form && formData.form.get(fieldName)) {
//           formData.form.get(fieldName)?.setValue(trimmedValue);
//           console.log(`Updated field "${fieldName}" in ${formData.name} with value: ${trimmedValue}`);
//           fieldUpdated = true;
//           break;
//         }
//       }

//       if (!fieldUpdated) {
//         console.warn(`Field "${fieldName}" not found in any form.`);
//         this.speak(`Field "${fieldName}" not found. Please try again.`);
//       }
//     } catch (error) {
//       console.error(`Error updating field "${fieldName}":`, error);
//       this.speak('An error occurred while updating form fields.');
//     }
//   }

//   speak(message: string): void {
//     try {
//       this.tts.speak(message);
//     } catch (error) {
//       console.error('Error in text-to-speech:', error);
//     }
//   }
// }