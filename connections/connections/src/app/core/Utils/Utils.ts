import {
  MatSnackBar,
  MatSnackBarRef,
  SimpleSnackBar,
} from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

export enum ProfileEndpoints {
  LOGIN = 'https://tasks.app.rs.school/angular/login',
  LOGOUT = 'https://tasks.app.rs.school/angular/logout',
  REGISTRATION = 'https://tasks.app.rs.school/angular/registration',
  PROFILE = 'https://tasks.app.rs.school/angular/profile',
}
export enum GroupEndpoints {
  GROUP = 'https://tasks.app.rs.school/angular/groups',
  USER_UID = 'https://tasks.app.rs.school/angular/',
}
export enum PeopleEndpoints {
  PEOPLE = 'https://tasks.app.rs.school/angular/users',
  CONVERSATION = 'https://tasks.app.rs.school/angular/conversations',
}
export enum Pages {
  TIMER_FOR_UPDATE = 60,
  CONFIRM_DELETE_MESSAGE = 'Are you sure you want to delete this ',
}

export function openSnackBar(
  snackBar: MatSnackBar,
  message: string,
  duration: number = 3000,
): MatSnackBarRef<SimpleSnackBar> {
  return snackBar.open(message, 'Close', { duration });
}

export function handleErrorAndSnackBar(
  snackBar: MatSnackBar,
  error: HttpErrorResponse,
): void {
  console.error('Error:', error);

  const errorMessage = error.error?.message || 'Unknown error';
  const durationCountdown = 7000;
  openSnackBar(snackBar, `Error: ${errorMessage}`, durationCountdown);

  throw error;
}
