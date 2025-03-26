import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { ApiService } from 'src/app/services/api.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { passwordMismatch } from 'src/app/util/formutil';
import { VoiceService } from 'src/app/services/voice.service'; // Import VoiceService

@Component({
  selector: 'app-account-pin',
  templateUrl: './account-pin.component.html',
  styleUrls: ['./account-pin.component.css'],
})
export class AccountPinComponent implements OnInit {
  showGeneratePINForm: boolean = true;
  pinChangeForm!: FormGroup;
  loading: boolean = true;

  constructor(
    private apiService: ApiService,
    private _toastService: ToastService,
    private router: Router,
    private loader: LoadermodelService,
    private cdr: ChangeDetectorRef, // Added for change detection
    private voiceService: VoiceService // Inject VoiceService
  ) {}

  ngOnInit(): void {
    this.apiService.checkPinCreated().subscribe({
      next: (response: any) => {
        if (response && response.hasPIN) {
          this.showGeneratePINForm = false;
        }
        this.initPinChangeForm(); 
        this.loading = false;
        this.cdr.detectChanges();

        this.voiceService.initializeVoiceCommands(
          undefined, 
          undefined, 
          undefined, 
          undefined, 
          this.pinChangeForm, 
          this, 
          undefined, 
          undefined,
          undefined, 
          undefined 
        );

        console.log('pinChangeForm passed to VoiceService:', this.pinChangeForm);
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error checking PIN status:', error);
      },
    });
  }

  initPinChangeForm(): void {
    if (this.showGeneratePINForm) {
      this.pinChangeForm = new FormGroup(
        {
          newPin: new FormControl('', [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(4),
          ]),
          confirmPin: new FormControl('', Validators.required),
          passwordGenerate: new FormControl('', Validators.required),
        },
        {
          validators: passwordMismatch('newPin', 'confirmPin'),
        }
      );
    } else {
      this.pinChangeForm = new FormGroup({
        oldPin: new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
        ]),
        newPin: new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
        ]),
        password: new FormControl('', Validators.required),
      });
    }

    console.log('pinChangeForm initialized:', this.pinChangeForm);
  }

  private getTrimmedFormValues(): { [key: string]: string } {
    const trimmedValues: any = {};
    Object.keys(this.pinChangeForm.controls).forEach((key) => {
      let value = this.pinChangeForm.get(key)?.value;
      trimmedValues[key] = value ? value.toString().trim().replace(/\s+/g, '') : '';
    });
    return trimmedValues;
  }

  onSubmitGeneratePIN(): void {
    if (this.pinChangeForm.valid) {
      const { newPin, passwordGenerate } = this.getTrimmedFormValues();

      this.loader.show('Generating PIN...');
      this.apiService.createPin(newPin, passwordGenerate).subscribe({
        next: () => {
          this.loader.hide();
          this._toastService.success('PIN generated successfully');
          this.voiceService.speak('PIN generated successfully')
          this.showGeneratePINForm = false; 
          this.initPinChangeForm();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.loader.hide();
          console.error('Error generating PIN:', error);
        },
      });
    }
  }

  onSubmitChangePIN(): void {
    if (this.pinChangeForm.valid) {
      const { oldPin, newPin, password } = this.getTrimmedFormValues();

      this.loader.show('Changing PIN...');
      this.apiService.updatePin(oldPin, newPin, password).subscribe({
        next: () => {
          this.loader.hide();
          this._toastService.success('PIN changed successfully');
          this.voiceService.speak('PIN changed successfully');
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.loader.hide();
          console.error('Error changing PIN:', error);
        },
      });
    }
  }
}