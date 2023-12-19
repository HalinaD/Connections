import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/guard/auth.guard';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { CreateGroupModalComponent } from './modals/create-group-modal/create-group-modal.component';
import { ConfirmationModalComponent } from './modals/confirmation-modal/confirmation-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { GroupDialogComponent } from './pages/group-dialog/group-dialog.component';
import { PersonalConversationComponent } from './pages/personal-conversation/personal-conversation.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
const routes: Routes = [
  { path: '', component: MainPageComponent, canActivate: [AuthGuard] },
  {
    path: 'group/:groupID',
    component: GroupDialogComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'conversation/:conversationID',
    component: PersonalConversationComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [
    MainPageComponent,
    NotFoundPageComponent,
    CreateGroupModalComponent,
    ConfirmationModalComponent,
    GroupDialogComponent,
    PersonalConversationComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class ConnectionsModule {}
