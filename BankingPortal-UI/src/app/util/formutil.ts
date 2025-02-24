import { FormGroup } from "@angular/forms";

export function passwordMismatch(
  controlName: string,
  matchingControlName: string
): any {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mismatch) {
      return;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mismatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}

// Regular expression to enforce:
// - No uppercase letters
// - At least one lowercase letter
// - At least one digit
// - Minimum 8 characters
export const StrongPasswordRegx: RegExp = /^(?!.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
