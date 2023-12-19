import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, Subject, take } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import {
  GroupMessage,
  PersonalMessage,
} from 'src/app/core/interfaces/interfaces';
import { ConversationService } from '../../services/conversation.service';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { PeopleService } from '../../services/people.service';
import { TimerConversationService } from '../../services/timer-conversation.service';
import {
  handleErrorAndSnackBar,
  openSnackBar,
  Pages,
} from 'src/app/core/Utils/Utils';
import { UserService } from '../../services/user.service';
import { MessagesService } from '../../services/messages.service';
import { ReadTimeService } from '../../services/read-time.service';
import { UpdateListService } from '../../services/update-list.service';

@Component({
  selector: 'app-personal-conversation',
  templateUrl: './personal-conversation.component.html',
  styleUrls: ['./personal-conversation.component.scss'],
})
export class PersonalConversationComponent implements OnInit, OnDestroy {
  conversationID: string = '';
  messages: PersonalMessage[] = [];
  message: GroupMessage[] = [];
  lastMessageTime: number = 0;
  private destroy$: Subject<void> = new Subject();
  messageForm!: FormGroup;
  usersNames: { [key: string]: string } = {};
  firstLoad: boolean = true;
  updateCountdown: number = Pages.TIMER_FOR_UPDATE;
  isConversationMessageUpdateDisabled = false;
  conversationMessageCountdown: number = 0;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private conversationService: ConversationService,
    private timerConversationService: TimerConversationService,
    private authService: AuthService,
    private peopleService: PeopleService,
    private userService: UserService,
    private messagesService: MessagesService,
    private readTimeService: ReadTimeService,
    private updateListService: UpdateListService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.messageForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getUserName('authorId');
    this.subscribeToRouteParams();
    this.loadUserNames();
    this.setupUpdateTimer();
  }

  private subscribeToRouteParams() {
    this.route.paramMap.subscribe((params) => {
      const groupIdFromRoute = params.get('conversationID');
      if (groupIdFromRoute) {
        this.conversationID = groupIdFromRoute;
        this.loadInitGroupData();
      }
    });
  }

  private setupUpdateTimer() {
    this.timerConversationService.resumeUpdateTimer(
      this.conversationID,
      'updateConversation',
      this.updateCountdown,
      (value, isDisabled) => {
        this.isConversationMessageUpdateDisabled = isDisabled;
        this.conversationMessageCountdown = value;
      },
    );
  }

  private loadInitGroupData() {
    const cachedMessages = this.messagesService.getConversatioMessagesCache(
      this.conversationID,
    );

    if (!cachedMessages) {
      this.loadMessages(true);
    } else {
      this.messages = cachedMessages;
      const lastReadTime = this.readTimeService.getLastReadMessageTime(
        this.conversationID,
      );
      if (lastReadTime) {
        this.lastMessageTime = +lastReadTime;
      }
      this.loadMessages(false);
    }
  }

  private loadUserNames() {
    this.peopleService.getPersonsForOwner().subscribe({
      next: (response) => {
        response.Items.forEach((person) => {
          this.usersNames[person.uid.S] = person.name.S;
        });
        this.updateUserNamesInMessages();
      },
      error: (error) => {
        console.error('Error loading user names:', error);
      },
    });
  }

  private updateUserNamesInMessages() {
    this.message.forEach((message) => {
      const userName = this.usersNames[message.authorID.S] || 'User not found';
      message.userName = userName;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerConversationService.ngOnDestroy();
    this.saveLastReadMessageTime();
  }

  private saveLastReadMessageTime() {
    if (this.messages.length > 0) {
      const lastMessageTime =
        this.messages[this.messages.length - 1].createdAt.S;
      this.readTimeService.setLastReadMessageTime(
        this.conversationID,
        lastMessageTime,
      );
    }
  }

  loadMessages(loadAll: boolean = this.firstLoad) {
    if (!this.conversationID) return;
    const queryParams = loadAll
      ? {}
      : { since: this.lastMessageTime.toString() };
    this.messagesService
      .getPersonalConversationMessages(this.conversationID, queryParams)
      .subscribe({
        next: (response) => {
          const newMessages = response.Items;
          newMessages.sort(
            (a, b) => parseInt(a.createdAt.S, 10) - parseInt(b.createdAt.S, 10),
          );
          if (newMessages.length > 0) {
            this.messages = loadAll
              ? newMessages
              : [...this.messages, ...newMessages];
            this.lastMessageTime = Math.max(
              ...newMessages.map((m) => +m.createdAt.S),
            );
          }
          if (loadAll) {
            this.firstLoad = false;
          }
          this.messagesService.setConversationMessagesCache(
            this.conversationID,
            this.messages,
          );
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Error loading messages';
          console.error('Error loading messages:', errorMessage);
          handleErrorAndSnackBar(this.snackBar, errorMessage);
          if (loadAll) {
            this.firstLoad = true;
          }
        },
      });
  }

  updateMessageConversationList() {
    return this.updateListService.updateMessageConversationList(
      this.conversationID,
    );
  }

  sendMessage(messageContent: string) {
    if (!messageContent.trim()) {
      console.error('Message content cannot be empty');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    this.messagesService
      .sendMessageToPersonalConversation(
        this.conversationID,
        messageContent,
        headers,
      )
      .subscribe({
        next: () => {
          openSnackBar(this.snackBar, 'Message sent');

          this.loadMessages(false);
        },
        error: (error) => {
          console.error('Error sending message:', error);
          handleErrorAndSnackBar(this.snackBar, error);
        },
      });
  }

  deleteConversation() {
    const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: Pages.CONFIRM_DELETE_MESSAGE + 'conversation?' },
    });
    confirmDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.conversationService
            .deleteConversation(this.conversationID)
            .subscribe({
              next: () => {
                this.router.navigate(['/']);
              },
              error: (error) => {
                console.error('Error deleting the group:', error);
                handleErrorAndSnackBar(this.snackBar, error);
              },
            });
        }
      });
  }

  isMessageOwner(authorId: string): boolean {
    const currentUserId = this.authService.currentUserId;
    return authorId === currentUserId;
  }

  getUserName(authorID: string): Observable<string> {
    return this.userService
      .getUserProfile(authorID)
      .pipe(
        map((userProfile) =>
          userProfile && userProfile.name && userProfile.name.S
            ? userProfile.name.S
            : 'User not found',
        ),
      );
  }
}
