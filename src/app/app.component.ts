import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthConfig, AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'iLearn.UI';
  isAuthenticated: boolean = false;
  isAdministrator: boolean = false;
  IsAdministrator: boolean = false;
  IsStudent: boolean = false;
  firstName: string = '';
  UserEmail: string = '';
  userLogoUrl: string = '';
  memberSince: any;
  PersonalImgUrl: string = '';

  constructor(private authService: AuthService, private authConfig: AuthConfig){

  }

  ngOnInit(): void {
    this.authConfig = this.authService.getAuthConfig();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdministrator = this.authService.isAdministrator();

    if (this.isAuthenticated) {
      this.authConfig = this.authService.getAuthConfig();
      this.IsAdministrator = this.authConfig.IsAdministrator || false;
      this.IsStudent = this.authConfig.IsStudent || false;

      const currentUser = this.authService.getCurrentUser(); // Fix: Use const instead of var
      if (currentUser) {
        if(currentUser.FullName){
          this.firstName = currentUser.FullName.split(' ')[0];
        }
        this.UserEmail = currentUser.EmailAddress;
        this.userLogoUrl = currentUser.LogoUrl;
        this.memberSince = currentUser.DateJoined;
        this.PersonalImgUrl = currentUser.PersonalImgUrl;
      }
    }
  }
}
