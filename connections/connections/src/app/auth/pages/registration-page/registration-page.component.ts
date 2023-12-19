import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent implements OnInit, OnDestroy {
  registrationForm!: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();
  constructor(
    public authService: AuthService,
    public router: Router,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s]+$/),
          Validators.maxLength(40),
        ],
      ],
      useremail: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.isPasswordStrongEnough.bind(this),
        ],
      ],
    });
  }

  isPasswordStrongEnough(
    control: AbstractControl,
  ): { [key: string]: boolean } | null {
    const value: string = control.value || '';
    const upperCaseCharacters = /[A-Z]+/g;
    const numberCharacter = /[0-9]+/g;
    const specialCharacters = /[!@#?\]]+/g;
    const errors: { [key: string]: boolean } = {};

    if (!upperCaseCharacters.test(value)) errors['uppercase'] = true;
    if (!numberCharacter.test(value)) errors['number'] = true;
    if (!specialCharacters.test(value)) errors['special'] = true;

    if (Object.keys(errors).length > 0) {
      errors['isPasswordStrongEnough'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  }

  onSubmit() {
    if (this.isSubmitting || !this.registrationForm.valid) {
      return;
    }
    this.isSubmitting = true;

    this.authService
      .registerUser(this.registrationForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.registrationForm.reset();
          this.isSubmitting = false;
          this.router.navigate(['/signin']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          if (
            error.error &&
            error.error.type === 'PrimaryDuplicationException'
          ) {
            const emailControl = this.registrationForm.get('useremail');
            if (emailControl) {
              emailControl.setErrors({ emailDuplicate: true });
            }
          }
          this.isSubmitting = false;
        },
      });
  }

  ngOnDestroy() {
    if (!this.destroy$.closed) {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }
}
