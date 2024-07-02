import { Component, OnInit, ViewChild } from '@angular/core';
import { TutorService, Tutor, TutorAvailability } from '../../../../services/tutor.service';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../../../services/event.service';
import { StudentService } from '../../../../services/student.service';
import { SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { RequestBooking, SlotBookingService } from '../../../../services/slot-booking.service';
import { NotificationsService } from '../../../../services/Shared/notifications.service';
import { NotificationTypes } from '../../../app.enums';
import { Location } from '@angular/common';

@Component({
  selector: 'app-tutor-profile',
  providers: [TutorService, SlotBookingService],
  templateUrl: './tutor-detail.component.html',
  styleUrl: './tutor-detail.component.css'
})
export class TutorDetailComponent {
  @ViewChild('dt1') dt1: Table | undefined
  @ViewChild('dt2') dt2: Table | undefined

  availableTutor!: Tutor
  tutorAvailabilities: TutorAvailability[] = []
  subjects!: SelectItem[]
  eventSubject?: any[] = []
  tutorEvents: Event[] = []

  constructor(private location: Location,
    private route: ActivatedRoute,
    private notificationsService: NotificationsService,
    private slotBookingService: SlotBookingService,
    private studentService: StudentService
  ) {
    this.subjects = []
  }
  ngOnInit(): void {
    this.getTutor();
    this.getAllSubjectName();
  }

  goBack() {
    this.location.back();
  }
  filteredEvents:Event[] = []
  getTutor() {
    this.route.url.subscribe((segments) => {
      
      const todayDateTime = new Date();
      if (segments.length > 0) {
        this.availableTutor = history.state.availableTutor
        this.tutorAvailabilities = this.availableTutor.TutorAvailabilities
        this.tutorEvents = this.availableTutor?.CreateEvents || [];
        const data: Event[] = []
        this.tutorEvents.forEach( x => {
          const eventdate = new Date(x.EventStartTime)
          if(eventdate > todayDateTime){
            data.push(x)
          }
        })
        this.filteredEvents = data
        console.log(this.filteredEvents)
      }
    })
  }

  getAllSubjectName() {
    this.studentService.getAllSubjects().subscribe((subject: SelectItem[]) => {
      this.subjects = subject
    })
  }

  getEventSubject(Id: string): string {
    this.eventSubject = this.subjects.filter((e) => e.value === Id)
    return this.eventSubject[0]?.label ?? "";
  }

  onInputFilterEvent(event: any): void {
    const value = event.target.value;
    if (this.dt2) {
      this.dt2.filterGlobal(value, 'contains');
    }
  }
  onInputFilterAvailabilities(event: any): void {
    const value = event.target.value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
  }

  public  enRollClass(event: Event) {
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
