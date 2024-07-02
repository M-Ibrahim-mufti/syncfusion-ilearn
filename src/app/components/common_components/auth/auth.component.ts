import { Component, HostListener, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationTypes } from '../../../app.enums';
import { AuthService } from '../../../../services/auth.service';
import { NotificationsService } from '../../../../services/Shared/notifications.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  loginModel: LoginModel = {};
  //public formData: ForgotPasswordMailRequest = {} as ForgotPasswordMailRequest;
  public showForgotPasswordDialog: boolean = false;
  public ngOnInit() {
    // Check if the user is already authenticated
    if (this.authService.isAuthenticated()) {
      if (this.authService.isAdministrator()) {
        this.router.navigate(['/']);
        return;
      }
      this.router.navigate(['/']);
    }
  }

  constructor(private router: Router,
    private ngxSpinnerService: NgxSpinnerService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
  ) { }

  public login(): void {
    this.ngxSpinnerService.show();
    this.authService.login(this.loginModel).subscribe(
      (response) => {
        console.log(response);

        this.ngxSpinnerService.hide();
        if (response.Success) {
          window.location.reload();
          return;
        }
        this.notificationsService.showNotification('Error', response.ResponseMessage, NotificationTypes.Error);
      },
      (error) => {
        console.error(error);
        this.ngxSpinnerService.hide();
      }
    );
  }

  public onForgotPasswordDialog() {
    this.showForgotPasswordDialog = true;
  }

  public closeDialog() {
    this.showForgotPasswordDialog = false;
    //this.formData = new ForgotPasswordMailRequest();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if(this.showForgotPasswordDialog == true){
        //this.SendForgotPasswordMail();
        return;
      }
      this.login();      
    }
  }
}

export interface LoginModel {
  Username?: string;
  Password?: string;
}