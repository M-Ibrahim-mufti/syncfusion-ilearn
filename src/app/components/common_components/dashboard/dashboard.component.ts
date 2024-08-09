import { Component } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { ZoomMeetingDetail, ZoomMeetingService } from '../../../../services/zoom-meeting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  public isTutor!:boolean
  public meetings:ZoomMeetingDetail[] = []
  public latestMeeting!:ZoomMeetingDetail

  constructor( private authService:AuthService,
               private meetingService:ZoomMeetingService,
                private router: Router,
                private zoomService: ZoomMeetingService
  ) {
    this.isTutor = this.authService.isTeacher();
  }

  ngOnInit() {
    this.getAllmeetings()
  }

  getImgUrl(imgUrl:string) {
    return `#f1f1f1 url(${imgUrl}) no-repeat center/cover`;
  }

  private getAllmeetings() {
    this.meetingService.getMeetings().subscribe((response) => {
      this.meetings = response;
      const todayDate = new Date();
      this.meetings = this.meetings.filter((meeting) => {
        const eventDate = new Date(meeting.StartTime);
        eventDate.setMinutes(eventDate.getMinutes() + meeting.Duration);
        console.log(eventDate)
        if (eventDate >= todayDate){
          return meeting
        }else {
          return
        }
      })
      this.latestMeeting = this.meetings[0];
      console.log(this.latestMeeting);
    })
  }

  public getEndTime(time:Date, duration:number) {
    const newTime = new Date(time);    
    newTime.setMinutes(newTime.getMinutes() + duration);
    return newTime;
  } 
  currentDate() {
    const today = new Date();
    return today
  }
  meetingStartTime(time:Date){
    const startTime = new Date(time);
    return startTime
  }

  redirectToZoomClass(meeting: any) {
    let startTime = new Date(meeting.StartTime);
    let duration = meeting.Duration;
    let expireTime = new Date(startTime.getTime() + duration * 60000);
    let currentTime = new Date();

    // Calculate the expire time in seconds from the current time
    let expireTimeInSeconds = Math.floor((expireTime.getTime() - currentTime.getTime()) / 1000);
    let role = 0;
    if(this.isTutor){
      role = 1
    }
    let isMeetingDisable = this.disableStartMeeting(meeting.StartTime)
    // if(isMeetingDisable){
    //   console.log("Kaka g Kidhr?")
    //
    //   return;
    // }
    this.zoomService.getSignature(meeting.MeetingId.toString(), role, 7200).subscribe((data: any) => {
      if (data.signature) {
        const zoomMeeting = {
          signature: data.signature,
          meetingId: meeting.MeetingId,
          role:role,
          userId: meeting.UserId,
          Id: meeting.Id,
          userName: meeting.UserName,
          userEmail: meeting.UserEmail,
          passWord: meeting.Password
        }
        this.router.navigate(['/zoom'], { state: { zoomMeeting } });
      }
    })
  }
  disableStartMeeting(meetingTiming: any): boolean {
    const meetingTime = new Date(meetingTiming)
    const currentDate = new Date();
    if (currentDate < meetingTime)
      return true
    return false
  }

}
