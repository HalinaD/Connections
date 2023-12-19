import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, combineLatest } from 'rxjs';
import { handleErrorAndSnackBar } from '../../core/Utils/Utils';
import { MessagesService } from './messages.service';
import { ConversationService } from './conversation.service';
import { GroupService } from './group.service';
import { PeopleService } from './people.service';
import { TimerConversationService } from './timer-conversation.service';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root',
})
export class UpdateListService {
  constructor(
    private conversationService: ConversationService,
    private snackBar: MatSnackBar,
    public peopleService: PeopleService,
    private timerService: TimerService,
    private timerConversationService: TimerConversationService,
    private groupService: GroupService,
    private messagesService: MessagesService,
  ) {}
  updatePeopleList(): void {
    const currentTime = Date.now();
    const lastUpdatePeopleKey = 'lastPeopleUpdate';
    const lastUpdate = parseInt(
      localStorage.getItem(lastUpdatePeopleKey) ?? '0',
      10,
    );

    if (lastUpdate && currentTime - lastUpdate < 60000) {
      return;
    }

    localStorage.setItem(lastUpdatePeopleKey, currentTime.toString());
    const updatePeople$ = this.peopleService.getPersons().pipe(
      catchError((error) => {
        console.error('Error loading people:', error);
        handleErrorAndSnackBar(this.snackBar, error);
        return [];
      }),
    );
    const updateConversations$ = this.conversationService
      .loadConversations()
      .pipe(
        catchError((error) => {
          console.error('Error getting conversations:', error.message);
          return [];
        }),
      );
    combineLatest([updatePeople$, updateConversations$]).subscribe(
      ([peopleResponse, conversations]) => {
        this.peopleService.setPersons(peopleResponse.Items);

        this.conversationService.setConversations(conversations.Items);
        this.conversationService.setConversationsLoaded(true);
      },
    );
    this.timerService.startCountdown('people', 60);
  }

  updateMessageGroupList(groupID: string) {
    const currentTime = Date.now();
    const lastUpdateGroupKey = `lastGroupMessageUpdate_${groupID}`;
    const lastUpdate = parseInt(
      localStorage.getItem(lastUpdateGroupKey) ?? '0',
      10,
    );
    if (lastUpdate && currentTime - lastUpdate < 60000) {
      return;
    }
    localStorage.setItem(lastUpdateGroupKey, currentTime.toString());
    this.messagesService.getMessages(groupID).subscribe({
      next: (response) => {
        this.messagesService.setMessages(response.Items);
        this.timerConversationService.startCountdown(
          groupID,
          'messageUpdate',
          60,
        );
      },
      error: (error) => {
        console.error('Error loading group messages:', error);
        handleErrorAndSnackBar(this.snackBar, error);
      },
    });
    this.timerConversationService.startCountdown(groupID, 'messageUpdate', 60);
  }

  updateGroupList() {
    const currentTime = Date.now();
    const lastUpdateGroupKey = 'lastGroupUpdate';
    const lastUpdate = parseInt(
      localStorage.getItem(lastUpdateGroupKey) ?? '0',
      10,
    );
    if (lastUpdate && currentTime - lastUpdate < 60000) {
      return;
    }
    localStorage.setItem(lastUpdateGroupKey, currentTime.toString());
    this.groupService.getGroups().subscribe({
      next: (response) => {
        this.groupService.setGroups(response.Items);
        this.timerService.startCountdown('group', 60);
      },
      error: (error) => {
        console.error('Error loading group:', error);
        handleErrorAndSnackBar(this.snackBar, error);
      },
    });
    this.timerService.startCountdown('group', 60);
  }

  updateMessageConversationList(conversationID: string) {
    const currentTime = Date.now();
    const lastUpdateGroupKey = `lastConversationMessageUpdate_${conversationID}`;
    const lastUpdate = parseInt(
      localStorage.getItem(lastUpdateGroupKey) ?? '0',
      10,
    );
    if (lastUpdate && currentTime - lastUpdate < 60000) {
      return;
    }
    localStorage.setItem(lastUpdateGroupKey, currentTime.toString());
    this.messagesService.getConversationMessages(conversationID).subscribe({
      next: (response) => {
        this.messagesService.setConversationMessages(response.Items);
        this.timerConversationService.startCountdown(
          conversationID,
          'updateConversation',
          60,
        );
      },
      error: (error) => {
        console.error('Error loading group messages:', error);
        handleErrorAndSnackBar(this.snackBar, error);
      },
    });
    this.timerConversationService.startCountdown(
      conversationID,
      'messageUpdate',
      60,
    );
  }
}
