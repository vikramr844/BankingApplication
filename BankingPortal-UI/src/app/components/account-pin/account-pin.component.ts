import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { ApiService } from 'src/app/services/api.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { passwordMismatch } from 'src/app/util/formutil';

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
    private cdr: ChangeDetectorRef // Added for change detection
  ) {}

  ngOnInit(): void {
    this.apiService.checkPinCreated().subscribe({
      next: (response: any) => {
        if (response && response.hasPIN) {
          this.showGeneratePINForm = false; // Switch to "Change PIN" form
        }
        this.initPinChangeForm();
        this.loading = false;
        this.cdr.detectChanges(); // Force update the UI
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
          password: new FormControl('', Validators.required),
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
  }

  onSubmitGeneratePIN(): void {
    if (this.pinChangeForm.valid) {
      const newPin = this.pinChangeForm.get('newPin')?.value;
      const password = this.pinChangeForm.get('password')?.value;

      this.loader.show('Generating PIN...');
      this.apiService.createPin(newPin, password).subscribe({
        next: (response: any) => {
          this.loader.hide();
          this._toastService.success('PIN generated successfully');
          this.showGeneratePINForm = false; // Switch to "Change PIN" form
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
      const oldPin = this.pinChangeForm.get('oldPin')?.value;
      const newPin = this.pinChangeForm.get('newPin')?.value;
      const password = this.pinChangeForm.get('password')?.value;

      this.loader.show('Changing PIN...');
      this.apiService.updatePin(oldPin, newPin, password).subscribe({
        next: (response: any) => {
          this.loader.hide();
          this._toastService.success('PIN changed successfully');
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
