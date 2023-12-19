import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
  canActivate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: RouterStateSnapshot,
  ): boolean {
    if (this.authService.isAuthenticated()) {
      if (state.url === '/signin' || state.url === '/signup') {
        this.router.navigate(['/']);
        return false;
      }
      return true;
    } else {
      this.router.navigate(['/signin'], { skipLocationChange: true });
      return false;
    }
  }
}
