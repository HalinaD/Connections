import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import {
  ConversationResponse,
  GroupMessage,
  GroupResponse,
  PersonalMessage,
} from '../../core/interfaces/interfaces';
import { GroupEndpoints, PeopleEndpoints } from '../../core/Utils/Utils';
import { HandleErrorService } from './handle-error.service';
import { ReadTimeService } from './read-time.service';
import { PeopleService } from './people.service';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private groupEndpoint = GroupEndpoints.GROUP;
  private conversationEndpoint = PeopleEndpoints.CONVERSATION;
  conversationMessages: PersonalMessage[] = [];
  private conversationsCache: { [key: string]: PersonalMessage[] } = {};
  messages: GroupMessage[] | null = null;
  private messagesCache: { [key: string]: GroupMessage[] } = {};
  constructor(
    private authService: AuthService,
    public peopleService: PeopleService,
    private http: HttpClient,
    private handleErrorService: HandleErrorService,
    private readTimeService: ReadTimeService,
  ) {}
  getMessages(
    groupID: string,
  ): Observable<{ Count: number; Items: GroupMessage[] }> {
    const headers = this.authService.getAuthHeaders();
    const since = this.readTimeService.getLastReadMessageTime(groupID) || '';

    return this.http
      .get<{ Count: number; Items: GroupMessage[] }>(
        `${this.groupEndpoint}/read?groupID=${groupID}&since=${since}`,
        { headers },
      )
      .pipe(
        catchError(this.handleErrorService.handleGroupServiceError),
        map((response) => {
          if (response.Items.length > 0) {
            const lastMessage = response.Items[response.Items.length - 1];
            this.readTimeService.setLastReadMessageTime(
              groupID,
              lastMessage.createdAt.S,
            );
          }
          return response;
        }),
      );
  }

  setMessages(messages: GroupMessage[]): void {
    this.messages = messages;
  }

  getGroupMessagesCache(groupID: string): GroupMessage[] | null {
    return this.messagesCache[groupID] || null;
  }

  setGroupMessagesCache(
    groupID: string,
    messages: GroupMessage[] | null,
  ): void {
    if (messages) {
      this.messagesCache[groupID] = messages;
    } else {
      delete this.messagesCache[groupID];
    }
  }

  getGroupMessages(
    groupID: string,
    queryParams: { since?: string },
  ): Observable<GroupResponse> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.groupEndpoint}/read?groupID=${groupID}`;
    return this.http.get<GroupResponse>(url, { headers, params: queryParams });
  }

  sendMessageToGroup(
    groupID: string,
    messageContent: string,
    headers: HttpHeaders,
  ): Observable<GroupResponse> {
    const body = { groupID, message: messageContent };
    const url = `${this.groupEndpoint}/append`;
    return this.http.post<GroupResponse>(url, body, { headers });
  }

  getPersonalConversationMessages(
    conversationID: string,
    queryParams: { since?: string },
  ): Observable<ConversationResponse> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.conversationEndpoint}/read?conversationID=${conversationID}`;
    return this.http.get<ConversationResponse>(url, {
      headers,
      params: queryParams,
    });
  }

  sendMessageToPersonalConversation(
    conversationID: string,
    messageContent: string,
    headers: HttpHeaders,
  ): Observable<PersonalMessage> {
    const body = { conversationID, message: messageContent };
    const url = `${this.conversationEndpoint}/append`;
    return this.http.post<PersonalMessage>(url, body, { headers });
  }

  getConversationMessages(
    conversationID: string,
  ): Observable<{ Count: number; Items: PersonalMessage[] }> {
    const headers = this.authService.getAuthHeaders();
    const since =
      this.readTimeService.getLastReadMessageTime(conversationID) || '';

    return this.http
      .get<{ Count: number; Items: PersonalMessage[] }>(
        `${this.conversationEndpoint}/read?conversationID=${conversationID}&since=${since}`,
        { headers },
      )
      .pipe(
        catchError(this.handleErrorService.handleGroupServiceError),
        map((response) => {
          if (response.Items.length > 0) {
            const lastMessage = response.Items[response.Items.length - 1];
            this.readTimeService.setLastReadMessageTime(
              conversationID,
              lastMessage.createdAt.S,
            );
          }
          return response;
        }),
      );
  }

  setConversationMessages(conversationMessages: PersonalMessage[]): void {
    this.conversationMessages = conversationMessages;
  }
  setConversationMessagesCache(
    conversationID: string,
    messages: PersonalMessage[] | null,
  ): void {
    if (messages) {
      this.conversationsCache[conversationID] = messages;
    } else {
      delete this.conversationsCache[conversationID];
    }
  }
  getConversatioMessagesCache(
    conversationID: string,
  ): PersonalMessage[] | null {
    return this.conversationsCache[conversationID] || null;
  }
}
