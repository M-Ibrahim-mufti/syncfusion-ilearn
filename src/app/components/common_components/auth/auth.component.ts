import { Component, HostListener, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationTypes } from '../../../app.enums';
import { AuthService } from '../../../../services/auth.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ToastrService } from 'ngx-toastr';

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
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private authService: AuthService,
  ) { }

  public login(): void {
    this.spinnerService.show();
    this.authService.login(this.loginModel).subscribe(
      (response) => {
        console.log(response);

        this.spinnerService.hide();
        if (response.Success) {
          window.location.reload();
          return;
        }
        this.toastr.error('Error', response.ResponseMessage);
      },
      (error) => {
        console.error(error);
        this.spinnerService.hide();
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