import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AuthGuard } from './guard/auth.guard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthRedirectGuard } from './guard/authredirect.guard';

const routes: Routes = [
  {
    path: 'signin',
    component: LoginPageComponent,
    canActivate: [AuthRedirectGuard],
  },
  {
    path: 'signup',
    component: RegistrationPageComponent,
    canActivate: [AuthRedirectGuard],
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [
    RegistrationPageComponent,
    LoginPageComponent,
    ProfilePageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [RouterModule],
})
export class AuthModule {}
