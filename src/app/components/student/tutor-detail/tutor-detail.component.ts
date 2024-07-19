import { Component, OnInit, ViewChild } from '@angular/core';
import { TutorService, Tutor, TutorAvailability } from '../../../../services/tutor.service';
import { ActivatedRoute } from '@angular/router';
import { Event,GroupedAvailabilities,EventService, SelectItem } from '../../../../services/event.service';
import { StudentService } from '../../../../services/student.service';
import { RequestBooking, SlotBookingService } from '../../../../services/slot-booking.service';
import { NotificationTypes } from '../../../app.enums';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-tutor-profile',
  providers: [TutorService, SlotBookingService],
  templateUrl: './tutor-detail.component.html',
  styleUrl: './tutor-detail.component.css'
})
export class TutorDetailComponent {
  public tutor!: Tutor
  public totalSubjects?: number
  public sortedAvailabilities: TutorAvailability[] = []
  public dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  public Subjects!: SelectItem[];
  public events: Event[] = [];
  public tutorId!: string;
  public groupedAvailabilities: GroupedAvailabilities = [];
  public tutorGrades:any[] = []
  public totalGrade:any[] = []

  constructor(
    private tutorService: TutorService,
    private eventService: EventService,
    private router: ActivatedRoute,
    private studentService: StudentService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private slotBookingService: SlotBookingService,
    // private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.tutorId = this.router.snapshot.paramMap.get("id")!;
    this.getTutorDetail();
    this.getAllSubjectName();
  }

  public getTutorEvents(tutorId: string) {
    this.eventService.getEvents(tutorId).subscribe(response => {
      this.events = response;
      console.log(this.events);
      
      const todayDateTime = new Date();
      const data: any[] = [];
      this.events!.forEach(x => {
        const eventdate = new Date(x.EventStartTime)
        if (eventdate > todayDateTime) {
          data.push(x)
        }
      })
      this.events = data;
      this.loadAvalabilites(tutorId);
    })
  }

  public loadAvalabilites(tutorId: string) {
    this.tutorService.getAllAvalabilities(tutorId).subscribe(response => {
      this.sortedAvailabilities = response;

      // this.totalCounters();
      this.sortedAvailabilities = this.sortedAvailabilities.sort((el, compareEl) => {
        return this.dayOrder.indexOf(el.Day) - this.dayOrder.indexOf(compareEl.Day)
      })
    });
  }

  public getTutorDetail() {
    this.spinnerService.show();
    this.tutorService.tutorProfile(this.tutorId).subscribe(async (response) => {      
      this.tutor = response;
      console.log(this.tutor)
      this.getTutorEvents(this.tutorId);
      this.spinnerService.hide();
    })
  }

  getEventSubject(Id: string): string {
    const eventSubject = this.Subjects.filter((e) => e.value === Id)
    return eventSubject[0]?.label ?? '';
  }

  getAllSubjectName() {
    this.studentService.getAllSubjects().subscribe((subjects: SelectItem[]) => {
      this.Subjects = subjects
    })
  }

  totalCounters() {
    if (this.tutor.TutorSubjects.length > 0 && !this.tutor.TutorSubjects[0].SubjectName) {
      this.totalSubjects = 0
    }
    else {
      this.totalSubjects = this.tutor.TutorSubjects.length
    }
  }
  public enRollClass(event: Event) {
    this.spinnerService.show();
    const model: RequestBooking = new RequestBooking(event.TutorId!, event.EventStartTime)
    this.slotBookingService.slotBookingRequest(model).subscribe(response => {
      if (response.Success) {
        this.spinnerService.hide();
        this.toastr.success(
          'Success',
          'Student enroll this class successfully'
        );
      }
      else {
        this.toastr.error(
          'Error',
          response.ResponseMessage
        );
       this.spinnerService.hide();
      }
    })
  }
}
