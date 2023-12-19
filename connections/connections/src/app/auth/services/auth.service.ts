import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { UserProfile } from 'src/app/core/interfaces/interfaces';
import {
  handleErrorAndSnackBar,
  openSnackBar,
  ProfileEndpoints,
} from 'src/app/core/Utils/Utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authTokenKey = 'auth_token';
  private uidKey = 'uid';
  private useremailKey = 'user_email';
  private authStatusSource = new BehaviorSubject<boolean>(
    this.isAuthenticated(),
  );
  authStatus = this.authStatusSource.asObservable();
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.authTokenKey);
  }

  login(email: string, password: string) {
    const loginEndpoint = ProfileEndpoints.LOGIN;
    const loginData = { email, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http
      .post<{ token: string; uid: string }>(loginEndpoint, loginData, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Login error:', error);
          handleErrorAndSnackBar(this.snackBar, error);
          return throwError(() => error);
        }),
        tap((response) => {
          localStorage.setItem(this.authTokenKey, response.token);
          localStorage.setItem(this.uidKey, response.uid);
          localStorage.setItem(this.useremailKey, email);
          this.authStatusSource.next(true);
          openSnackBar(this.snackBar, 'Authorization successful!');
        }),
      );
  }

  logout(): Observable<void> {
    const logoutEndpoint = ProfileEndpoints.LOGOUT;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(this.authTokenKey)}`,
      'rs-uid': localStorage.getItem(this.uidKey) || '',
      'rs-email': localStorage.getItem(this.useremailKey) || '',
    });

    return this.http.delete<void>(logoutEndpoint, { headers }).pipe(
      catchError((error) => {
        console.error('Logout error:', error);
        handleErrorAndSnackBar(this.snackBar, error);
        return throwError(() => error);
      }),
      tap(() => {
        openSnackBar(this.snackBar, 'Logout successful!');
      }),
    );
  }

  registerUser(registrationForm: FormGroup) {
    const registrationEndpoint = ProfileEndpoints.REGISTRATION;
    const userData = {
      email: registrationForm.value.useremail,
      name: registrationForm.value.username,
      password: registrationForm.value.password,
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(registrationEndpoint, userData, { headers }).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        handleErrorAndSnackBar(this.snackBar, error);

        return throwError(() => error);
      }),
      tap(() => {
        openSnackBar(this.snackBar, 'Registration successful!');
      }),
    );
  }
  getUserProfile(): Observable<UserProfile> {
    const profileEndpoint = ProfileEndpoints.PROFILE;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(this.authTokenKey)}`,
      'rs-uid': localStorage.getItem(this.uidKey) || '',
      'rs-email': localStorage.getItem(this.useremailKey) || '',
    });

    return this.http.get<UserProfile>(profileEndpoint, { headers }).pipe(
      catchError((error) => {
        console.error('Profile error:', error);
        handleErrorAndSnackBar(this.snackBar, error);
        return throwError(() => error);
      }),
    );
  }
  updateUserName(newName: string): Observable<void> {
    const profileEndpoint = ProfileEndpoints.PROFILE;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(this.authTokenKey)}`,
      'rs-uid': localStorage.getItem(this.uidKey) || '',
      'rs-email': localStorage.getItem(this.useremailKey) || '',
    });

    const updateData = { name: newName };

    return this.http.put<void>(profileEndpoint, updateData, { headers }).pipe(
      catchError((error) => {
        console.error('Name change error:', error);
        handleErrorAndSnackBar(this.snackBar, error);
        return throwError(() => error);
      }),
      tap(() => {
        openSnackBar(this.snackBar, 'Name change successful!');
      }),
    );
  }
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(this.authTokenKey)}`,
      'rs-uid': localStorage.getItem(this.uidKey) || '',
      'rs-email': localStorage.getItem(this.useremailKey) || '',
    });
  }
  get currentUserId(): string | null {
    return localStorage.getItem(this.uidKey);
  }
}
