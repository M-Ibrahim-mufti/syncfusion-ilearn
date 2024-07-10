import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CalendarModule } from 'angular-calendar';
import { ZoomMeetingService, ZoomMeetingDetail, StudentMeeting } from '../../../../services/zoom-meeting.service';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../../services/Shared/spinner.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
})
export class MeetingsComponent implements OnInit {
  todayDate = new Date();
  startTime?: string;
  isTeacher: boolean = false;
  isStudent: boolean = false;
  endTime?: string;
  meetings: ZoomMeetingDetail[] = [];
  todayMeetings: ZoomMeetingDetail[] = [];
  tomorrowMeetings: ZoomMeetingDetail[] = [];
  futureMeetings: ZoomMeetingDetail[] = [];
  previousMeetings: ZoomMeetingDetail[] = [];
  public activateBtn: boolean = false
  studentMeetings:any;
  public inProgressMeetingId: string | null = null

  constructor(private router: Router,
    private spinnerService: SpinnerService,
    private zoomService: ZoomMeetingService,
     private authService: AuthService,
      private cdr: ChangeDetectorRef) {
    this.isTeacher = this.authService.isTeacher()
    this.isStudent = this.authService.isStudent()
  }

  ngOnInit(): void {
    this.inProgressMeetingId = localStorage.getItem('inProgressMeetingId');
    this.loadMeetings();
  }

  loadMeetings(): void {
    this.spinnerService.show();
    this.zoomService.getMeetings().subscribe(response => {      
      this.meetings = response;
      this.spinnerService.hide();
      this.filterMeetingsForUpcoming();
      this.filterMeetingsForPrevious(); 
      this.cdr.detectChanges();
    });
  }

  filterMeetingsForUpcoming(): void {
    const todayDate = new Date();   
    
    this.meetings.forEach(meeting => {      
      const meetingDate = new Date(meeting.StartTime);
      const meetingEndTime = this.meetingEndTime(meetingDate, meeting.Duration);
      if (this.isSameDay(meetingDate, todayDate)) {
        if(meetingEndTime >= todayDate)
          this.todayMeetings.push(meeting);
      } else if (this.isTomorrow(meetingDate, todayDate)) {
        if(meetingEndTime >= todayDate)
          this.tomorrowMeetings.push(meeting);
      } else if (meetingDate > todayDate) {
          this.futureMeetings.push(meeting);
      }
    });
  }

  filterMeetingsForPrevious(): void {
    const todayDate = new Date();
    this.meetings.forEach(meeting => {
      const meetingDate = new Date(meeting.StartTime);
      if(meetingDate < todayDate){
        const upcomingmeeting = this.futureMeetings.filter(x => x.Id == meeting.Id)
        if(upcomingmeeting.length == 0)
          this.previousMeetings.push(meeting);
      }
    });
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  isTomorrow(date: Date, today: Date): boolean {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return (
      date.getFullYear() === tomorrow.getFullYear() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getDate() === tomorrow.getDate()
    );
  }

  meetingEndTime(startTime: any, duration: number): Date {
    const dateTime = new Date(startTime);
    const endTime = new Date(dateTime.getTime() + duration * 60000);
    return endTime;
  }

  redirectTo(url:string, meetingId: string){
    this.inProgressMeetingId = meetingId;
    localStorage.setItem('inProgressMeetingId', meetingId);
    window.open(url, '_blank');
  }

  disableStartMeeting(meetingTiming:any):boolean{
    const meetingTime = new Date(meetingTiming)
    
    if(this.todayDate < meetingTime)
      return true
    return false
  }

  toggleContentPreview() {
    this.activateBtn = !this.activateBtn
  }

}