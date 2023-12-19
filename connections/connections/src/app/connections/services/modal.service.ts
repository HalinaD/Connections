import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Subject, tap, throwError } from 'rxjs';
import { Group } from '../../core/interfaces/interfaces';
import { GroupService } from './group.service';
import { ConfirmationModalComponent } from '../modals/confirmation-modal/confirmation-modal.component';
import { CreateGroupModalComponent } from '../modals/create-group-modal/create-group-modal.component';
import { openSnackBar, handleErrorAndSnackBar } from 'src/app/core/Utils/Utils';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  createGroupForm: FormGroup;
  private groupCreatedSource = new Subject<Group>();
  groupCreated$ = this.groupCreatedSource.asObservable();
  private groupDeletedSource = new Subject<string>();
  groupDeleted$ = this.groupDeletedSource.asObservable();
  groupList: Group[] = [];
  private groupListSource = new Subject<Group[]>();
  groupList$ = this.groupListSource.asObservable();
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private groupService: GroupService,
  ) {
    this.createGroupForm = this.formBuilder.group({
      groupName: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z\d][a-zA-Z\d ]*$/),
        ],
      ],
    });
  }

  openCreateGroupModal() {
    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      width: '400px',
      data: { form: this.createGroupForm },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newGroup: Group = {
          id: { S: result.groupID },
          name: { S: this.createGroupForm.value.groupName },
          createdAt: { S: new Date().toISOString() },
          createdBy: { S: localStorage.getItem('uid')! },
        };

        this.groupService.addGroup(newGroup);
        this.groupCreatedSource.next(newGroup);

        this.createGroupForm.reset();
        openSnackBar(this.snackBar, 'Group created successfully');
      }
    });
  }

  deleteGroup(group: Group): void {
    const groupId = group.id.S;
    const groupName = group.name.S;
    const isOwner = this.isUserGroupOwner(group);

    if (isOwner) {
      const dialogRef = this.dialog.open(ConfirmationModalComponent, {
        width: '400px',
        data: {
          message: `Are you sure you want to delete the group ${groupName}?`,
        },
      });

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.groupService
            .deleteGroup(groupId)
            .pipe(
              tap(() => {
                this.groupDeletedSource.next(groupId);
                openSnackBar(this.snackBar, 'Group deleted successfully');
              }),
              catchError((error) => {
                console.error('Error deleting group:', error.message);
                handleErrorAndSnackBar(this.snackBar, error.message);
                return throwError(() => error);
              }),
            )
            .subscribe();
        }
      });
    }
  }

  isUserGroupOwner(group: Group): boolean {
    const currentUserId = localStorage.getItem('uid');
    return !!group && group.createdBy.S === currentUserId;
  }
}
