import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { GroupEndpoints, openSnackBar } from 'src/app/core/Utils/Utils';
import { AuthService } from '../../auth/services/auth.service';
import { Group } from '../../core/interfaces/interfaces';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private groupEndpoint = GroupEndpoints.GROUP;
  private groups: Group[] | null = null;
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private handleErrorService: HandleErrorService,
  ) {}

  setGroups(groups: Group[]): void {
    this.groups = groups;
  }

  hasGroupsLoaded(): boolean {
    return this.groups !== null;
  }

  getGroups(): Observable<{ Count: number; Items: Group[] }> {
    const headers = this.authService.getAuthHeaders();

    return this.http
      .get<{ Count: number; Items: Group[] }>(`${this.groupEndpoint}/list`, {
        headers,
      })
      .pipe(catchError(this.handleErrorService.handleGroupServiceError));
  }
  getCachedGroups(): Group[] | null {
    return this.groups;
  }

  createGroup(name: string): Observable<{ groupID: string }> {
    const headers = this.authService.getAuthHeaders();

    return this.http
      .post<{ groupID: string }>(
        `${this.groupEndpoint}/create`,
        { name },
        { headers },
      )
      .pipe(catchError(this.handleErrorService.handleGroupServiceError));
  }

  deleteGroup(groupId: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();

    return this.http
      .delete<void>(`${this.groupEndpoint}/delete?groupID=${groupId}`, {
        headers,
      })
      .pipe(
        tap(() => {
          if (this.groups) {
            this.groups = this.groups.filter((g) => g.id.S !== groupId);
          }
          openSnackBar(this.snackBar, 'Group deleted successfully');
        }),
        catchError(this.handleErrorService.handleGroupServiceError),
      );
  }
  addGroup(group: Group): void {
    if (this.groups) {
      this.groups = [...this.groups, group];
    } else {
      this.groups = [group];
    }
  }

  createGroupIfNotExists(groupId: string): Observable<void> {
    return this.getGroupById(groupId).pipe(
      catchError((error) => {
        if (error.status === 400 && error.error.type === 'InvalidIDException') {
          return this.createGroup('New Group Name');
        }
        return throwError(() => error);
      }),
      map(() => {}),
    );
  }

  getGroupById(groupId: string): Observable<Group> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.groupEndpoint}/read?groupID=${groupId}`;

    return this.http
      .get<Group>(url, { headers })
      .pipe(catchError(this.handleErrorService.handleGroupServiceError));
  }

  getGroupsForOwner(
    forceReload: boolean = false,
  ): Observable<{ Count: number; Items: Group[] }> {
    if (this.groups && !forceReload) {
      return of({ Count: this.groups.length, Items: this.groups });
    }

    const headers = this.authService.getAuthHeaders();
    return this.http
      .get<{ Count: number; Items: Group[] }>(`${this.groupEndpoint}/list`, {
        headers,
      })
      .pipe(
        tap((response) => {
          this.groups = response.Items;
        }),
        catchError(this.handleErrorService.handleGroupServiceError),
      );
  }
}
