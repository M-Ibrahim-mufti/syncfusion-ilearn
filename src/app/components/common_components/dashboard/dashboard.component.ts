import { Component } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { ZoomMeetingDetail, ZoomMeetingService } from '../../../../services/zoom-meeting.service';

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
               private meetingService:ZoomMeetingService
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
}
