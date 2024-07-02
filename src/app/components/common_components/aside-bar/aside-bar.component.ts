import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-aside-bar',
  templateUrl: './aside-bar.component.html',
  styleUrl: './aside-bar.component.css'
})
export class AsideBarComponent implements OnInit {
  public items!: MenuItem[];
  public authConfig!: AuthConfig;
  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authConfig = this.authService.getAuthConfig();
    // this.initializeMenuItems();
  }

  isActive(url: string): boolean {
    return this.router.url === url;
  }

  private initializeMenuItems() {
    var authConfig = { isAdministrator: this.authService.isAdministrator(), isStudent: this.authService.isStudent(), isTutor: this.authService.isTeacher() };

    this.items = [
      {
        label: 'Favorites',
        icon: 'fa fa-heart',
        items: [
          {
            label: 'Dashboard',
            icon: 'fa fa-dashboard',
            routerLink: ['/dashboard'],
            visible: authConfig.isAdministrator || authConfig.isStudent || authConfig.isTutor
          },
          {
            label: 'Student',
            icon: 'pi pi-user',
            routerLink: ['/admin', 'view'],
            visible: authConfig.isAdministrator
          },
          {
            label: 'Tutor',
            icon: 'pi pi-user',
            routerLink: ['/admin', 'tutor'],
            visible: authConfig.isAdministrator
          },
          {
            label: 'Tutor-Selection',
            icon: 'pi pi-user',
            routerLink: ['/student', 'tutor-selection'],
            visible: authConfig.isStudent
          },
        ]
      },
    ]
  }
}
