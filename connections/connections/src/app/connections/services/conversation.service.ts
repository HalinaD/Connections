import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, Observable, tap } from 'rxjs';
import {
  handleErrorAndSnackBar,
  openSnackBar,
  PeopleEndpoints,
} from 'src/app/core/Utils/Utils';
import { AuthService } from '../../auth/services/auth.service';
import {
  Conversation,
  Person,
  PersonalMessage,
  Response,
} from '../../core/interfaces/interfaces';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private conversationEndpoint = PeopleEndpoints.CONVERSATION;
  private conversations: Conversation[] = [];
  private conversationsLoaded: boolean = false;
  private conversationsCache: { [key: string]: PersonalMessage[] } = {};
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private handleErrorService: HandleErrorService,
  ) {}

  setConversations(conversations: Conversation[]): void {
    this.conversations = conversations;
  }

  hasConversationsLoaded(): boolean {
    return this.conversationsLoaded;
  }

  getConversations(): Observable<Response<Conversation>> {
    return this.http.get<Response<Conversation>>(
      `${this.conversationEndpoint}/list`,
    );
  }

  getCachedConversations(): Conversation[] | undefined {
    return this.conversations;
  }

  setConversationsLoaded(loaded: boolean): void {
    this.conversationsLoaded = loaded;
  }

  createConversation(
    companion: string,
  ): Observable<{ conversationID: string }> {
    const headers = this.authService.getAuthHeaders();
    const body = { companion };
    return this.http
      .post<{ conversationID: string }>(
        `${this.conversationEndpoint}/create`,
        body,
        { headers },
      )
      .pipe(
        tap((response) => {
          this.conversations.push({
            id: { S: response.conversationID },
            companionID: { S: companion },
          });
          this.router.navigate(['/conversation', response.conversationID]);
        }),
      );
  }

  deleteConversation(conversationID: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();

    return this.http
      .delete<void>(
        `${this.conversationEndpoint}/delete?conversationID=${conversationID}`,
        {
          headers,
        },
      )
      .pipe(
        tap(() => {
          if (this.conversations) {
            this.conversations = this.conversations.filter(
              (g) => g.id.S !== conversationID,
            );
          }
          this.clearConversationCache(conversationID);
          this.snackBar.open('Conversation deleted successfully', 'Close', {
            duration: 3000,
          });
        }),
        catchError(this.handleErrorService.handleGroupServiceError),
      );
  }

  onPersonClick(person: Person): void {
    const companionID = person.uid.S;
    if (this.hasConversationWith(companionID)) {
      this.router.navigate([
        '/conversation',
        this.getConversationID(companionID),
      ]);
    } else {
      this.createConversation(companionID).subscribe({
        next: (response) => {
          openSnackBar(this.snackBar, 'Conversation created successfully');
          this.router.navigate(['/conversation', response.conversationID]);
        },
        error: (error) => {
          console.error('Error creating conversation:', error.message);
          handleErrorAndSnackBar(this.snackBar, error);
        },
      });
    }
  }

  getConversationID(companionID: string): string | undefined {
    const conversation = this.conversations.find(
      (conv) => conv.companionID.S === companionID,
    );
    return conversation?.id.S;
  }

  hasConversationWith(companionID: string): boolean {
    return this.conversations.some(
      (conv) => conv.companionID.S === companionID,
    );
  }

  loadConversations(): Observable<{ Count: number; Items: Conversation[] }> {
    const headers = this.authService.getAuthHeaders();

    return this.http
      .get<{ Count: number; Items: Conversation[] }>(
        `${this.conversationEndpoint}/list`,
        { headers },
      )
      .pipe(
        tap((response) => {
          this.conversations = response.Items;
          this.conversationsLoaded = true;
        }),
      );
  }

  hasActiveConversationWith(uid: string): boolean {
    return this.conversations.some((conv) => conv.companionID.S === uid);
  }

  clearConversationCache(conversationID: string): void {
    delete this.conversationsCache[conversationID];
    localStorage.removeItem(`lastReadTime_${conversationID}`);
  }
}
