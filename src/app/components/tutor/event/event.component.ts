import { ConfirmationService } from 'primeng/api';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EventService } from '../../../../services/event.service';
import { Event } from '../../../../services/event.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationsService } from '../../../../services/Shared/notifications.service';
import { NotificationTypes } from '../../../app.enums';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import { ZoomMeetingService } from '../../../../services/zoom-meeting.service';
import { RequestBooking, SlotBookingService } from '../../../../services/slot-booking.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
  providers: [EventService, ZoomMeetingService]
})
export class EventComponent implements OnInit {
  @ViewChild('dt1') dt1: Table | undefined;
  public events: Event[] = [];
  public authConfig!: AuthConfig;
  public allDays: any[] = [
    { label: 'Sunday', value: 'Sun' },
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
    { label: 'Saturday', value: 'Sat' }
  ];

  public bookingRequests!:RequestBooking[];

  constructor(private eventService: EventService,
    private ngxSpinnerService: NgxSpinnerService,
    private confirmationService: ConfirmationService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private zoomMeetingService: ZoomMeetingService,
    private slotBookingService: SlotBookingService,
    private router: Router) { }

  ngOnInit(): void {
    this.authConfig = this.authService.getAuthConfig();
    this.getAllEvents();
  }

  public getAllEvents() {
    this.ngxSpinnerService.show();
    this.eventService.getEvents().subscribe(response => {
      this.events = response;
      this.ngxSpinnerService.hide();
    })
  }

  public removeEvent(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to Cancel event?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventService.removeEvent(id).subscribe(response => {
          if (response.Success) {
            var index = this.events.findIndex(p => p.Id == id);
            if (index > -1) {
              this.events.splice(index, 1);
            }
          }
        })
      }
    });
  }

  public connectWithZoom() {
    this.zoomMeetingService.ConnectWithZoom().subscribe((res: string) => {
      window.location.href = res;
    }, (error) => {
      console.error('Authorization error:', error);
    }
    );
  }

  onInput(event: any): void {
    const value = event.target.value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
  }

  redirectToAddEvent() {
    this.router.navigate(['/tutor/event/add'], { state: { events: this.events } });
  }

  public getDayLabel(dayValue: string): string {
    const day = this.allDays.find(day => day.value === dayValue);
    return day ? day.label : '';
  }

  formatTimeTo12Hours(hours: number, minutes: number): string {
    const period = hours >= 12 ? 'pm' : 'am';
    let formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${period}`;
  }

  public requestEvent(event: Event) {
    const model: RequestBooking = new RequestBooking(event.TutorId!, event.EventStartTime)
    this.slotBookingService.slotBookingRequest(model).subscribe(response => {
      if (response.Success) {
        this.notificationsService.showNotification(
          'Success',
          response.ResponseMessage,
          NotificationTypes.Success
        );
      }
    })
  }
}
