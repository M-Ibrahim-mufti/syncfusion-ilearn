import { Component, OnInit, ViewChild } from '@angular/core';
import { TutorService, Tutor, TutorAvailability, GeneralConsultancy } from '../../../../services/tutor.service';
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
  public totalGrades: number = 0 
  public consultDialog: boolean = false;
  public generalConsultancy: GeneralConsultancy = {
    TutorId: '',
    EventStartTime: '',
    MeetingStartTime: new Date(),
    Duration: 0,    
  };
  public consultancyTimeFrames:any[] = [];
  public consultancyDuration:any[] =[
    { value:'30', label:30},
    { value:'60', label:60},
    { value:'90', label:90}
  ]
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

      const todayDateTime = new Date();
      const data: any[] = [];
      this.events!.forEach(x => {
        const eventdate = new Date(x.EventStartTime)
        if (!x.IsOneOnOne && eventdate >= todayDateTime ) {
          data.push(x)
        }
      })
      this.events = data;
      console.log(this.events)
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

      this.tutor.TutorSubjects.forEach((subject) => {
        if(subject.Grades.length > 0) {
          this.totalGrades += subject.Grades.length
        }
      })
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

  getConsultancy() {  
    this.tutorService.getTutorConsultancy(this.tutorId).subscribe((response) => {
      const startTime = new Date(response.StartTime);
      const endTime = new Date(response.EndTime)
      let i = 0;
      while (startTime <= endTime) {
        const hours = startTime.getHours();
        const minutes = startTime.getMinutes();
        const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
        this.consultancyTimeFrames.push({value:i+1 ,label:formattedTime});
        startTime.setMinutes(startTime.getMinutes() + 15);
        i = i+1;      
      }
      this.generalConsultancy.EventStartTime = response.StartTime
      console.log(this.generalConsultancy)
    })
    this.consultDialog = true;
  }
  public setConsultancyMeetingTime(event:any) {
    let meetingArr = this.consultancyTimeFrames.filter((timeFrame) => timeFrame.value == event.target.value)
    let meetingTime = meetingArr[0];
    const [hours, minutes] = meetingTime.label.split(':').map(Number)
    const formattedTime = new Date()
    formattedTime.setHours(hours, minutes)
    this.generalConsultancy.MeetingStartTime = formattedTime

  }
  public setConsultancyDuration(event:any) {
    let DurationArr = this.consultancyDuration.filter((duration) => duration.value == event.target.value);
    let duration = DurationArr[0];
    this.generalConsultancy.Duration = duration.label;
    console.log(this.generalConsultancy)
  }
  public enrollInGeneralConsultancy() {
    this.generalConsultancy.TutorId = this.tutorId;
    console.log(this.generalConsultancy)
    this.slotBookingService.saveGeneralConsultancyRequest(this.generalConsultancy).subscribe((response) => {
      console.log(response)
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
