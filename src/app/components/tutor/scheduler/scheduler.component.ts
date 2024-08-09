import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import {
  AgendaService,
  DayService,
  EventSettingsModel, MonthAgendaService, MonthService,
  ScheduleComponent,
  ScheduleModule, TimelineMonthService, TimelineViewsService,
  View, WeekService, WorkWeekService, PopupOpenEventArgs
} from "@syncfusion/ej2-angular-schedule";
import { TutorService } from "../../../../services/tutor.service";
// import {DataManager} from "@syncfusion/ej2-data";
import {AuthService} from "../../../../services/auth.service";

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    ScheduleModule
  ],
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css'],
  providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, TutorService]
})
export class SchedulerComponent implements OnInit, OnChanges {
  @Input('meetings') meetings: any;
  @ViewChild('scheduleObj') scheduleObj?: ScheduleComponent;
  // private dataManager!: DataManager;
  public eventSettings!: EventSettingsModel;
  public currentView: View = 'Month';

  data: any = [];
  isTeacher: boolean = false;
  isStudent: boolean = false;

  constructor(
      private tutorService: TutorService,
      private authService: AuthService,
  ) {
    this.isTeacher = this.authService.isTeacher()
    this.isStudent = this.authService.isStudent()
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['meetings'] && changes['meetings'].currentValue) {
      this.initializeDataManager();
    }
  }

  private initializeDataManager() {
    // const headers = this.tutorService.getRequestHeaders();

    this.data = this.meetings.map((meeting: any) => {
      
      return {
        Id: meeting.Id,
        Subject: meeting.Topic,
        StartTime: new Date(meeting.StartTime),
        EndTime: new Date(new Date(meeting.StartTime).getTime() + meeting.Duration * 60000),
        Description: `Start Meeting: ${meeting.StartUrl}`,
        StartUrl: meeting.StartUrl
      };
    });

    this.eventSettings = {
      dataSource: this.meetings.map((meeting: any) => ({
        Id: meeting.Id,
        Subject: meeting.Topic,
        StartTime: new Date(meeting.StartTime),
        EndTime: new Date(new Date(meeting.StartTime).getTime() + meeting.Duration * 60000),
        Description: `Start Meeting: ${meeting.StartUrl}`,
        StartUrl: meeting.StartUrl,
        JoinUrl: meeting.JoinUrl,
        Duration: meeting.Duration,
        Timezone: meeting.Timezone,
        CreatedAt: meeting.CreatedAt,
        MeetingId: meeting.MeetingId
      })),
      allowAdding: false,
      allowEditing: false,
      allowDeleting: false
    };
  }

  onPopupOpen(args: PopupOpenEventArgs): void {
    if (args.type === 'QuickInfo') {
      const meeting = args.data as any;
      const currentTime = new Date();

      const isWithinMeetingTime = currentTime >= new Date(meeting.StartTime)
          && currentTime <= new Date(new Date(meeting.StartTime).getTime() + meeting.Duration * 60000);

      const startUrlLink = this.isTeacher && isWithinMeetingTime
          ? `<p><b>Start URL:</b> <a href="${meeting.StartUrl}" target="_blank">Start Meeting</a></p>`
          : '';

      const joinUrlLink = this.isStudent && isWithinMeetingTime
          ? `<p><b>Join URL:</b> <a href="${meeting.JoinUrl}" target="_blank">Join Meeting</a></p>`
          : '';

      args.element.querySelector('.e-popup-content')!.innerHTML = `
      <div>
        <!--<h5>${meeting.Subject}</h5>-->
        <p><b>Start Time:</b> ${new Date(meeting.StartTime).toLocaleString()}</p>
        <p><b>End Time:</b> ${new Date(new Date(meeting.StartTime).getTime() + meeting.Duration * 60000).toLocaleString()}</p>
        <p><b>Duration:</b> ${meeting.Duration} minutes</p>
        <!--<p><b>Timezone:</b> ${meeting.Timezone}</p>-->
        <!--<p><b>Created At:</b> ${new Date(meeting.CreatedAt).toLocaleString()}</p>-->
        ${startUrlLink}
        ${joinUrlLink}
      </div>
    `;
    }
  }
}
