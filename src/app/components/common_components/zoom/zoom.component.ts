import {Component, OnInit, NgZone, OnDestroy} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ZoomMtg } from '@zoom/meetingsdk';
import {AuthService} from "../../../../services/auth.service";
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.css']
})
export class ZoomComponent implements OnInit, OnDestroy {
  zoomMeeting: any;
  meetindata:any = {
    studentId:'',
    tutorId:'',
    meetingId:'',
  }

  private userName:string = "";
  private userEmail:string = "";
  constructor(private router: Router, private httpClient: HttpClient, private ngZone: NgZone,private authService: AuthService) {}

  ngOnInit() {
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();
    this.zoomMeeting = history.state.zoomMeeting;
    console.log(this.zoomMeeting)
    var currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.FullName;
      this.userEmail = currentUser.EmailAddress;
    }
    if (this.zoomMeeting) {
      this.startMeeting(this.zoomMeeting.signature);
    } else {
      console.error('No zoomMeeting data available');
    }
  }

  startMeeting(signature: string) {
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) {
      zoomRoot.style.display = 'block';
      zoomRoot.style.top = '90px';
      zoomRoot.style.left = '18%';
      zoomRoot.style.width = '80%';  // Set the desired width
      zoomRoot.style.height = '650px';  // Set the desired height
    }

    this.ngZone.runOutsideAngular(() => {
      ZoomMtg.init({
        leaveUrl: `${environment.LEAVE_MEETING_URL}/${this.zoomMeeting.meetingId}/${this.zoomMeeting.userId}`,
        patchJsMedia: true,
        leaveOnPageUnload: true,
        success: (success:any) => {
          ZoomMtg.join({
            signature: signature,
            sdkKey: environment.SDK_KEY,
            meetingNumber: this.zoomMeeting.meetingId,
            passWord: this.zoomMeeting.passWord,
            userName: this.userName,
            userEmail: this.userEmail,
            success: (success:any) => {
              this.removeParticipantButton();
            },
            error: (error:any) => {
              console.log(error);
            }
          });
        },
        error: (error:any) => {
          console.log(error);
        }
      });
    });
  }

  removeParticipantButton() {
    // Select the div based on class and attribute
    const participantsElement = document.querySelector('div.footer__button-wrap[feature-type="participants"]') as HTMLElement;

    // Check if the element exists before trying to remove it
    if (participantsElement) {
      participantsElement.remove(); // Remove the element from the DOM
    }

    const chatElement = document.querySelector('div.footer__button-wrap[feature-type="chat"]') as HTMLElement;
    if(chatElement){
      chatElement.remove();
    }
  }
  ngOnDestroy() {
    this.hideMeetingRoot();
    this.zoomMeeting = undefined;
  }

  hideMeetingRoot() {
    const meetingRootElement = document.getElementById('zmmtg-root');
    if (meetingRootElement) {
      meetingRootElement.style.display = 'none'; // Hide the element
    }
  }
}
