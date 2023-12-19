import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, Subject, take } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import {
  ApiResponse,
  Group,
  GroupMessage,
} from 'src/app/core/interfaces/interfaces';
import { GroupService } from '../../services/group.service';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { PeopleService } from '../../services/people.service';
import { TimerConversationService } from '../../services/timer-conversation.service';
import {
  handleErrorAndSnackBar,
  openSnackBar,
  Pages,
} from 'src/app/core/Utils/Utils';
import { UserService } from '../../services/user.service';
import { UpdateListService } from '../../services/update-list.service';
import { MessagesService } from '../../services/messages.service';
import { ReadTimeService } from '../../services/read-time.service';

@Component({
  selector: 'app-group-dialog',
  templateUrl: './group-dialog.component.html',
  styleUrls: ['./group-dialog.component.scss'],
})
export class GroupDialogComponent implements OnInit, OnDestroy {
  groupID: string = '';
  messages: GroupMessage[] = [];
  lastMessageTime: number = 0;
  private destroy$: Subject<void> = new Subject();
  updateCountdown: number = Pages.TIMER_FOR_UPDATE;
  firstLoad: boolean = true;
  isGroupOwner: boolean = false;
  usersNames: { [key: string]: string } = {};
  messageForm!: FormGroup;
  isGroupMessageUpdateDisabled = false;
  groupMessageCountdown: number = 0;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private groupService: GroupService,
    private authService: AuthService,
    private peopleService: PeopleService,
    private userService: UserService,
    private updateListService: UpdateListService,
    private messagesService: MessagesService,
    private readTimeService: ReadTimeService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private timerConversationService: TimerConversationService,
  ) {
    this.messageForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getUserName('authorId');
    this.subscribeToRouteParams();
    this.isUserGroupOwner();
    this.loadUserNames();
    this.setupUpdateTimer();
  }
  private subscribeToRouteParams() {
    this.route.paramMap.subscribe((params) => {
      const groupIdFromRoute = params.get('groupID');
      if (groupIdFromRoute) {
        this.groupID = groupIdFromRoute;
        this.loadInitGroupData();
      }
    });
  }

  private setupUpdateTimer() {
    this.timerConversationService.resumeUpdateTimer(
      this.groupID,
      'messageUpdate',
      this.updateCountdown,
      (value, isDisabled) => {
        this.isGroupMessageUpdateDisabled = isDisabled;
        this.groupMessageCountdown = value;
      },
    );
  }

  private loadInitGroupData() {
    const cachedMessages = this.messagesService.getGroupMessagesCache(
      this.groupID,
    );
    if (!cachedMessages) {
      this.loadMessages(true);
    } else {
      this.messages = cachedMessages;
      const lastReadTime = this.readTimeService.getLastReadMessageTime(
        this.groupID,
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
    this.messages.forEach((message) => {
      const userName = this.usersNames[message.authorID.S] || 'User not found';
      message.userName = userName;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.saveLastReadMessageTime();
    this.timerConversationService.ngOnDestroy();
  }

  private saveLastReadMessageTime() {
    if (this.messages.length > 0) {
      const lastMessageTime =
        this.messages[this.messages.length - 1].createdAt.S;
      this.readTimeService.setLastReadMessageTime(
        this.groupID,
        lastMessageTime,
      );
    }
  }

  loadMessages(loadAll: boolean = this.firstLoad) {
    if (!this.groupID) return;
    const queryParams = loadAll
      ? {}
      : { since: this.lastMessageTime.toString() };
    this.messagesService.getGroupMessages(this.groupID, queryParams).subscribe({
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
        this.messagesService.setGroupMessagesCache(this.groupID, this.messages);
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

  updateMessageGroupList() {
    return this.updateListService.updateMessageGroupList(this.groupID);
  }

  sendMessage(messageContent: string) {
    if (!messageContent.trim()) {
      console.error('Message content cannot be empty');
      openSnackBar(this.snackBar, 'Message content cannot be empty');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    this.messagesService
      .sendMessageToGroup(this.groupID, messageContent, headers)
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

  deleteGroup(): void {
    const confirmDialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: Pages.CONFIRM_DELETE_MESSAGE + 'group?' },
    });

    confirmDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.groupService.deleteGroup(this.groupID).subscribe({
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

  private isUserGroupOwner() {
    this.groupService
      .getGroupsForOwner(!!localStorage.getItem('needsGroupUpdate'))
      .subscribe({
        next: (response: ApiResponse<Group>) => {
          const group = response.Items.find((g) => g.id.S === this.groupID);
          this.isGroupOwner =
            !!group && group.createdBy.S === this.authService.currentUserId;
        },
        error: (error) => {
          console.error('Error getting groups', error);
          this.isGroupOwner = false;
        },
      });
  }

  isMessageOwner(authorId: string): boolean {
    const currentUserId = localStorage.getItem('uid');
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
