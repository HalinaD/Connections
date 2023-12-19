import { Component, OnDestroy, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Group,
  Person,
  Conversation,
} from 'src/app/core/interfaces/interfaces';
import { PeopleService } from '../../services/people.service';
import { ConversationService } from '../../services/conversation.service';
import { TimerService } from '../../services/timer.service';
import { ModalService } from '../../services/modal.service';
import { handleErrorAndSnackBar, Pages } from 'src/app/core/Utils/Utils';
import { UpdateListService } from '../../services/update-list.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
  isGroupUpdateDisabled = false;
  isPeopleUpdateDisabled = false;
  updateCountdown: number = Pages.TIMER_FOR_UPDATE;
  groupList: Group[] = [];
  peopleList: Person[] = [];
  conversations: Conversation[] = [];
  groupCountdown: number = 0;
  peopleCountdown: number = 0;
  conversationsLoaded: boolean = false;
  constructor(
    private groupService: GroupService,
    public peopleService: PeopleService,
    private conversationService: ConversationService,
    private timerService: TimerService,
    private updateListService: UpdateListService,
    private snackBar: MatSnackBar,
    private modalService: ModalService,
  ) {}
  ngOnInit() {
    this.subscribeToGroupCreation();
    this.subscribeToGroupDeletion();
    this.restoreTheme();
    this.loadGroups();
    this.loadPeople();
    this.loadConversations();
    this.setupUpdateTimers();
  }
  ngOnDestroy() {
    this.timerService.ngOnDestroy();
  }

  private restoreTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('theme', savedTheme);
    }
  }

  private loadGroups(): void {
    if (!this.groupService.hasGroupsLoaded()) {
      this.groupService.getGroups().subscribe({
        next: (response) => {
          this.groupList = response.Items;
          this.groupService.setGroups(response.Items);
        },
        error: (error) => {
          console.error('Error loading groups:', error);
          handleErrorAndSnackBar(this.snackBar, error);
        },
      });
    } else {
      this.groupList = this.groupService.getCachedGroups() || [];
    }
  }

  private loadPeople(): void {
    if (!this.peopleService.hasPersonLoaded()) {
      this.peopleService.getPersonsForOwner().subscribe({
        next: (response) => {
          this.peopleList = response.Items;
          this.peopleService.setPersons(response.Items);
        },
        error: (error) => {
          console.error('Error loading people:', error);
          handleErrorAndSnackBar(this.snackBar, error);
        },
      });
    } else {
      this.peopleList = this.peopleService.getCachedPersons() || [];
    }
  }

  private loadConversations(): void {
    if (!this.conversationService.hasConversationsLoaded()) {
      this.conversationService.loadConversations().subscribe({
        next: (conversations) => {
          this.conversations = conversations.Items;
          this.conversationsLoaded = true;
        },
        error: (error) => {
          console.error('Error getting conversations:', error.message);
        },
      });
    } else {
      this.conversations =
        this.conversationService.getCachedConversations() || [];
      this.conversationsLoaded = true;
    }
  }

  private setupUpdateTimers(): void {
    this.timerService.resumeUpdateTimer(
      'group',
      this.updateCountdown,
      (value, isDisabled) => {
        this.isGroupUpdateDisabled = isDisabled;
        this.groupCountdown = value;
      },
    );

    this.timerService.resumeUpdateTimer(
      'people',
      this.updateCountdown,
      (value, isDisabled) => {
        this.isPeopleUpdateDisabled = isDisabled;
        this.peopleCountdown = value;
      },
    );
  }

  onPersonClick(person: Person): void {
    this.conversationService.onPersonClick(person);
  }

  hasConversationWith(companionID: string): boolean {
    return this.conversationService.hasConversationWith(companionID);
  }

  hasActiveConversationWith(uid: string): boolean {
    return this.conversationService.hasActiveConversationWith(uid);
  }
  updateGroupList() {
    return this.updateListService.updateGroupList();
  }
  updatePeopleList() {
    return this.updateListService.updatePeopleList();
  }
  openCreateGroupModal() {
    this.modalService.openCreateGroupModal();
  }
  private subscribeToGroupCreation() {
    this.modalService.groupCreated$.subscribe((newGroup: Group) => {
      this.groupList = [...this.groupList, newGroup];
    });
  }
  private subscribeToGroupDeletion() {
    this.modalService.groupDeleted$.subscribe((deletedGroupId: string) => {
      this.groupList = this.groupList.filter((g) => g.id.S !== deletedGroupId);
    });
  }
  public isUserGroupOwner(group: Group): boolean {
    return this.modalService.isUserGroupOwner(group);
  }

  public deleteGroup(group: Group): void {
    this.modalService.deleteGroup(group);
  }

  truncateName(name: string): string {
    const maxLength = 20;
    return name.length > maxLength
      ? name.substring(0, maxLength) + '...'
      : name;
  }
}
