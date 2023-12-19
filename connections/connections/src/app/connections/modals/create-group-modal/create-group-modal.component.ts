import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { handleErrorAndSnackBar } from 'src/app/core/Utils/Utils';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-create-group-modal',
  templateUrl: './create-group-modal.component.html',
  styleUrls: ['./create-group-modal.component.scss'],
})
export class CreateGroupModalComponent {
  createGroupForm: FormGroup;
  isCreatingGroup: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<CreateGroupModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: FormGroup },
    private groupService: GroupService,
    private snackBar: MatSnackBar,
  ) {
    this.createGroupForm = data.form;
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onCreateGroupClick() {
    if (this.createGroupForm.valid && !this.isCreatingGroup) {
      this.isCreatingGroup = true;
      this.createGroupForm.disable();
      const groupName = this.createGroupForm.value.groupName;
      this.groupService.createGroup(groupName).subscribe({
        next: (response: { groupID: string }) => {
          this.dialogRef.close({ groupID: response.groupID });
          this.isCreatingGroup = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error creating group:', error);
          handleErrorAndSnackBar(this.snackBar, error);
          this.createGroupForm.enable();
          this.isCreatingGroup = false;
        },
        complete: () => {
          this.createGroupForm.enable();
          this.isCreatingGroup = false;
        },
      });
    }
  }
}
