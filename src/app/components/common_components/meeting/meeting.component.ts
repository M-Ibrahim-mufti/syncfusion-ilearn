import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { CalendarModule } from 'angular-calendar';
import { ZoomMeetingService, ZoomMeetingDetail, StudentMeeting } from '../../../../services/zoom-meeting.service';
import { AuthService } from '../../../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import {ReviewsComponent} from "../reviews/reviews.component";
import { ReviewService } from '../../../../services/review.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
})
export class MeetingsComponent implements OnInit {
  public showListView: boolean = true;
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
  studentMeetings: any;
  public inProgressMeetingId: string | null = null
  meetingDetails:any = {};
  @ViewChild(ReviewsComponent) reviewsComponent!: ReviewsComponent;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private spinnerService: SpinnerService,
    private zoomService: ZoomMeetingService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef) {
    this.isTeacher = this.authService.isTeacher()
    this.isStudent = this.authService.isStudent()
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      let meetingId = params.get('Id');
      if (meetingId) {
        this.meetingDetails = {
          meetingId: meetingId
        }
      }
    });
    this.inProgressMeetingId = localStorage.getItem('inProgressMeetingId');
    this.loadMeetings();
    if(this.meetingDetails.meetingId){
      this.hasAlreadyReviewed();
    }    
  }

  private hasAlreadyReviewed() {
    this.reviewService.hasAlreadyReviewed(this.meetingDetails.meetingId).subscribe(response => {
      if(response){
        this.showReviewDialog();
      }
    })
  }

  showReviewDialog() {
    if (this.reviewsComponent) {
      this.reviewsComponent.OpenReviewModal = true;
      this.cdr.detectChanges();
    } else {
      console.error('ReviewsComponent is not initialized');
    }
  } 

  //Switch Views::Start
  switchToListView() {
    this.showListView = false;
    this.loadMeetings();
  }

  switchToCalendarView() {
    this.showListView = true;
  }
  //Switch Views::End

  loadMeetings(): void {
    this.spinnerService.show();
    this.zoomService.getMeetings().subscribe(response => {
      this.meetings = response;
      this.spinnerService.hide();
      this.filterMeetings();
      // this.filterMeetingsForPrevious(); 
      this.cdr.detectChanges();
      console.log(this.meetings)
    });
  }

  getImage(meetingUrl:string) {
    return `#f1f1f2 url(${meetingUrl}) no-repeat center/cover`
  }  

  filterMeetings(): void {
    const todayDate = new Date();
    this.todayMeetings = [];
    this.tomorrowMeetings = [];
    this.previousMeetings = [];

    this.meetings.forEach(meeting => {
      const meetingDate = new Date(meeting.StartTime);
      const meetingEndTime = this.meetingEndTime(meetingDate, meeting.Duration);

      // For meetings on the same day
      if (this.isSameDay(meetingDate, todayDate)) {
        if (meetingEndTime >= todayDate) {
          // Meeting is ongoing or will start later today
          this.todayMeetings.push(meeting);
          
        } else {
          // Meeting has ended earlier today
          this.previousMeetings.push(meeting);
        }
      } else if (meetingDate > todayDate) {
        // For future meetings
        this.todayMeetings.push(meeting);       
        
      } else if (meetingDate < todayDate) {
        // For past meetings
        if (meetingEndTime < todayDate) {
          this.previousMeetings.push(meeting);
        }
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

  redirectTo(url: string, meetingId: string) {
    this.inProgressMeetingId = meetingId;
    localStorage.setItem('inProgressMeetingId', meetingId);
    window.open(url, '_blank');
  }

  redirectToZoomClass(meeting: any) {
    let startTime = new Date(meeting.StartTime);
    let duration = meeting.Duration;
    let expireTime = new Date(startTime.getTime() + duration * 60000);
    let currentTime = new Date();

    // Calculate the expire time in seconds from the current time
    let expireTimeInSeconds = Math.floor((expireTime.getTime() - currentTime.getTime()) / 1000);
    let role = 0;
    if(this.isTeacher){
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

    if (this.todayDate < meetingTime)
      return true
    return false
  }

  toggleContentPreview() {
    this.activateBtn = !this.activateBtn
  }

}