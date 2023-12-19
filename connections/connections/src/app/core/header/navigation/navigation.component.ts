import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  isLightMode = true;
  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.loadTheme();
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    const newTheme = this.isLightMode ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  private applyTheme(theme: string) {
    document.documentElement.setAttribute('theme', theme);
    localStorage.setItem('theme', theme);
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isLightMode = savedTheme === 'light';
      this.applyTheme(savedTheme);
    }
  }
}
