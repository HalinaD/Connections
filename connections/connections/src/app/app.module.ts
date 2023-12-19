import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConnectionsModule } from './connections/connections.module';
import { AuthGuard } from './auth/guard/auth.guard';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AuthRedirectGuard } from './auth/guard/authredirect.guard';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    CoreModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ConnectionsModule,
  ],
  providers: [
    AuthRedirectGuard,
    AuthGuard,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
