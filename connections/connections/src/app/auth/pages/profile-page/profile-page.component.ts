import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserProfile } from 'src/app/core/interfaces/interfaces';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  updatedNameControl: FormControl;
  nameForm: FormGroup;
  isEditMode = false;
  isUpdating = false;
  private destroy$ = new Subject<void>();
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private formBuilder: FormBuilder,
    private router: Router,
    private location: Location,
  ) {
    this.nameForm = this.formBuilder.group({
      updatedName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s]*$/),
          Validators.maxLength(40),
        ],
      ],
    });
    this.updatedNameControl = this.nameForm.get('updatedName') as FormControl;
  }

  ngOnInit() {
    this.userProfile = this.profileService.getProfile();
    if (!this.userProfile) {
      this.authService
        .getUserProfile()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile) => {
            this.userProfile = profile;
            this.profileService.setProfile(profile);
          },
          error: (error) => {
            console.error('Error loading profile:', error);
            this.userProfile = null;
          },
          complete: () => {},
        });
    }
  }

  ngOnDestroy() {
    if (!this.destroy$.closed) {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }

  enableEditMode() {
    this.isEditMode = true;
    this.updatedNameControl.setValue(this.userProfile?.name.S || '');
  }

  saveUpdatedName() {
    if (this.nameForm.invalid) {
      return;
    }

    this.isUpdating = true;
    this.authService
      .updateUserName(this.nameForm.value.updatedName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.userProfile!.name.S = this.nameForm.value.updatedName;
          this.isEditMode = false;
        },
        error: (error) => {
          console.error('Error updating name:', error);
        },
        complete: () => {
          this.isUpdating = false;
        },
      });
  }

  cancelEditMode() {
    this.isEditMode = false;
  }

  logout() {
    if (this.isUpdating) {
      return;
    }
    this.isUpdating = true;
    this.authService.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.profileService.setProfile(null);
        this.location.go('/signin');
        window.location.reload();
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.isUpdating = false;
      },
    });
  }
}
