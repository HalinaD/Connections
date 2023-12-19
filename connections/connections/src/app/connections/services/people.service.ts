import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { PeopleEndpoints } from 'src/app/core/Utils/Utils';
import { AuthService } from '../../auth/services/auth.service';
import { Person, PersonResponse } from '../../core/interfaces/interfaces';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  private personEndpoint = PeopleEndpoints.PEOPLE;
  private person: Person[] | null = null;
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private handleErrorService: HandleErrorService,
  ) {}

  setPersons(persons: Person[]): void {
    this.person = persons;
  }

  hasPersonLoaded(): boolean {
    return this.person !== null;
  }

  getPersons(): Observable<{ Count: number; Items: Person[] }> {
    const headers = this.authService.getAuthHeaders();

    return this.http
      .get<{ Count: number; Items: Person[] }>(`${this.personEndpoint}`, {
        headers,
      })
      .pipe(catchError(this.handleErrorService.handleGroupServiceError));
  }

  getCachedPersons(): Person[] | null {
    return this.person;
  }

  getPersonsForOwner(): Observable<PersonResponse> {
    const currentUserId = this.authService.currentUserId;
    if (this.person) {
      const filteredPersons = this.person.filter(
        (person) => person.uid.S !== currentUserId,
      );
      return of({ Count: filteredPersons.length, Items: filteredPersons });
    }
    const headers = this.authService.getAuthHeaders();
    return this.http
      .get<PersonResponse>(`${this.personEndpoint}`, {
        headers,
      })
      .pipe(
        tap((response) => {
          const filteredPersons = response.Items.filter(
            (person) => person.uid.S !== currentUserId,
          );
          this.setPersons(filteredPersons);
        }),
        catchError(this.handleErrorService.handleGroupServiceError),
      );
  }
}
