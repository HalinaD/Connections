import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss'],
})
export class NotFoundPageComponent {
  currentUrl: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
  ) {
    this.currentUrl = this.location.path();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
