import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationsService } from '../../../../services/Shared/notifications.service';
import { AuthConfig, AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit {
  public isAuthenticated!: boolean;
  public isAdministrator!: boolean;
  public firstName!: string;
  public UserEmail!: string;
  public userLogoUrl!: string;
  public authConfig!: AuthConfig;
  public ImgUrl!: string;
  
  constructor(private spinnerService: NgxSpinnerService,
    private authService: AuthService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.authConfig = this.authService.getAuthConfig();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdministrator = this.authService.isAdministrator();

    if (this.isAuthenticated) {

      this.authConfig = this.authService.getAuthConfig();
      var currentUser = this.authService.getCurrentUser();
      
      if (currentUser) {
        this.firstName = currentUser.FullName;
        this.UserEmail = currentUser.EmailAddress;
        this.ImgUrl = currentUser.ImgUrl;
      }
    }
  }

  public logout($event: any) {
    this.authService.logout().subscribe(async (res) => {
      await this.router.navigate(['/'])
      window.location.reload();
    });
  }
}
