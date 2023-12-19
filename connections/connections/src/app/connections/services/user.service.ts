import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { UserProfile } from '../../core/interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userProfiles: { [key: string]: UserProfile } = {};
  private userProfilesCache: { [uid: string]: UserProfile } = {};
  constructor(private http: HttpClient) {}
  getUserProfile(uid: string): Observable<UserProfile | undefined> {
    if (!this.userProfiles[uid]) {
      return this.http
        .get<UserProfile>(`https://tasks.app.rs.school/angular/${uid}`)
        .pipe(
          tap((userProfile: UserProfile) => {
            this.userProfiles[uid] = userProfile;
          }),
          catchError((error) => {
            console.error('Error loading user profile', error);
            return of(undefined);
          }),
        );
    } else {
      return of(this.userProfiles[uid]);
    }
  }
  isUserProfileCached(uid: string): boolean {
    return !!this.userProfilesCache[uid];
  }

  getCachedUserProfile(uid: string): UserProfile | undefined {
    return this.userProfilesCache[uid];
  }

  cacheUserProfile(uid: string, profile: UserProfile): void {
    this.userProfilesCache[uid] = profile;
  }
}
