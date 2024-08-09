import {Component, OnInit} from '@angular/core';
import {TimelineModule, TimelineAllModule} from '@syncfusion/ej2-angular-layouts';
import { SkeletonModule } from '@syncfusion/ej2-angular-notifications';
import {CommonModule} from "@angular/common";
import {ZoomMeetingService} from "../../../../../../services/zoom-meeting.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-user-meetings',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    TimelineModule,
    TimelineAllModule
  ],
  templateUrl: './user-meetings.component.html',
  styleUrls: ['./user-meetings.component.css']
})
export class UserMeetingsComponent implements OnInit{
  userId: string | null = null;
  public orientation: 'Vertical' = 'Vertical';
  public alignment: 'Alternate' = 'Alternate';
  public timelineItems :any = null;
  isDataLoaded:boolean = false;

  constructor(
      private route: ActivatedRoute,
      private meetingService: ZoomMeetingService) {
  }
  ngOnInit(){
    this.userId = this.route.snapshot.paramMap.get('userId');
    if(this.userId != null){
      this.getMeetingsByStudentId();
    }
  }

  getMeetingsByStudentId(){
    this.meetingService.getStudentMeetingsByStudentId(this.userId!).subscribe(response => {
      this.isDataLoaded = true;
      if (Array.isArray(response)) {
        this.timelineItems = response.map(({ Topic, StartTime }) => {
          const formattedDate = this.formatDate(StartTime)
          return {
            content: Topic,
            oppositeContent: formattedDate
          };

        });
      } else {
        this.timelineItems = [];
      }
    }, error => {
      console.error('Error fetching meetings:', error);
    });
  }

  formatDate(dateTime: string): string {
    const date = new Date(dateTime);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }
}
