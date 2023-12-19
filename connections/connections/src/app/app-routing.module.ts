import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guard/auth.guard';
import { AuthRedirectGuard } from './auth/guard/authredirect.guard';
import { LoginPageComponent } from './auth/pages/login-page/login-page.component';
import { ProfilePageComponent } from './auth/pages/profile-page/profile-page.component';
import { RegistrationPageComponent } from './auth/pages/registration-page/registration-page.component';
import { NotFoundPageComponent } from './connections/pages/not-found-page/not-found-page.component';

const routes: Routes = [
  {
    path: 'signin',
    component: LoginPageComponent,
    canActivate: [AuthRedirectGuard],
  },
  {
    path: 'signup',
    component: RegistrationPageComponent,
    canActivate: [AuthRedirectGuard],
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    loadChildren: () =>
      import('./connections/connections.module').then(
        (m) => m.ConnectionsModule,
      ),
    canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundPageComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
