import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NavigationComponent } from './header/navigation/navigation.component';

@NgModule({
  declarations: [HeaderComponent, NavigationComponent],
  imports: [CommonModule, RouterModule, MatIconModule],
  exports: [HeaderComponent],
})
export class CoreModule {}
