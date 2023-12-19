import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLogining = false;
  isNotFoundException = false;
  private destroy$ = new Subject<void>();
  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      useremail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.valid && !this.isLogining) {
      this.isLogining = true;
      const email = this.loginForm.get('useremail')?.value;
      const password = this.loginForm.get('password')?.value;

      this.authService
        .login(email, password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Login error:', error);
            if (error.error && error.error.type === 'NotFoundException') {
              this.isNotFoundException = true;
            }
            this.isLogining = false;
          },
          complete: () => {
            if (!this.isNotFoundException) {
              this.isLogining = false;
            }
          },
        });
    }
  }

  resetNotFoundException() {
    this.isNotFoundException = false;
  }

  ngOnDestroy() {
    if (!this.destroy$.closed) {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }
}
