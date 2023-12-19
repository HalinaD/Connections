import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from 'src/app/core/interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$: Observable<UserProfile | null> =
    this.userProfileSubject.asObservable();

  setProfile(profile: UserProfile | null): void {
    this.userProfileSubject.next(profile);
  }

  getProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }
}
