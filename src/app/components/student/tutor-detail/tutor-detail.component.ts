import { Component, OnInit, ViewChild } from '@angular/core';
import { TutorService, Tutor, TutorAvailability, GeneralConsultancy } from '../../../../services/tutor.service';
import { ActivatedRoute } from '@angular/router';
import { Event,GroupedAvailabilities,EventService, SelectItem } from '../../../../services/event.service';
import { StudentService } from '../../../../services/student.service';
import { RequestBooking, SlotBookingService } from '../../../../services/slot-booking.service';
import { NotificationTypes } from '../../../app.enums';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { NgIfContext } from '@angular/common';


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
  public allConsultancy:any[] = []
  public consultancyDate:any[] = [];
  public enableTimeFrame:boolean = true
  public generalConsultancy: GeneralConsultancy = {
    TutorId: '',
    EventStartTime: '',
    MeetingStartTime: new Date(),
    Duration: 0,  
    Title:''  
  };
  public consultancyTimeFrames:any[] = [];
  public consultancyDuration:any[] =[
    { value:'30', label:30},
    { value:'60', label:60},
    { value:'90', label:90}
  ]
  public frameTimeSet:boolean = true 

  constructor(
    private tutorService: TutorService,
    private eventService: EventService,
    private router: ActivatedRoute,
    private studentService: StudentService,
    private toastr: ToastrService,
    private spinnerService: SpinnerService,
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
      // this.loadAvalabilites(tutorId);
    })
  }

  // public loadAvalabilites(tutorId: string) {
  //   this.tutorService.getAllAvalabilities(tutorId).subscribe(response => {
  //     this.sortedAvailabilities = response;

  //     // this.totalCounters();
  //     this.sortedAvailabilities = this.sortedAvailabilities.sort((el, compareEl) => {
  //       return this.dayOrder.indexOf(el.Day) - this.dayOrder.indexOf(compareEl.Day)
  //     })
  //   });
  // }

  public getTutorDetail() {
    this.spinnerService.show()
    this.tutorService.tutorProfile(this.tutorId).subscribe(async (response) => {      
      this.tutor = await response;      
      this.getTutorEvents(this.tutorId);
      this.spinnerService.hide();
      this.tutor.TutorSubjects.forEach((subject) => {
        if(subject.Grades.length > 0) {
          this.totalGrades += subject.Grades.length
        }
      })
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
      this.allConsultancy = response;
      console.log(this.allConsultancy)
      this.allConsultancy.forEach((consultancy, index) => {
        let date = new Date(consultancy.StartTime);
        let formattedDate = date.getFullYear() + "/" + (date.getMonth() + 1 )+ "/" + date.getDate()
        this.consultancyDate.push({value:`Date${index+1}`, label: formattedDate})
      })
      console.log(this.consultancyDate)
    })
    this.consultDialog = true;
  }
  public setConsultancyMeetingTime(event:any) {

    const timeFrame = this.consultancyTimeFrames.filter((timeFrame) => timeFrame.value == event.target.value);
    const [hours, minutes] = timeFrame[0].label.split(':').map(Number);
    let formattedTime = new Date()
    formattedTime.setHours(hours,minutes);
    let meetingDate = this.generalConsultancy.MeetingStartTime
    let formattedMeetingStartTime = 
        meetingDate?.getFullYear() + '/' + (meetingDate!.getMonth() + 1) + '/' + meetingDate?.getDate() + " " + formattedTime.getHours() + ':' + formattedTime.getMinutes()
    this.generalConsultancy.MeetingStartTime = new Date(formattedMeetingStartTime);
    this.frameTimeSet = false 
  }

  public setConsultancyDate(event:any) {
    this.consultancyTimeFrames = []
    let date = this.consultancyDate.filter((date) => date.value === event.target.value);
    let formattedDate = new Date(date[0].label);
    let selectedFormattedDate = formattedDate.getFullYear() + "/" + (formattedDate.getMonth() + 1) + "/" + formattedDate.getDate()
    this.allConsultancy.forEach((consultancy) => {
      let date = new Date(consultancy.StartTime);
      let innerFormattedDate = date.getFullYear() + "/" + (date.getMonth() + 1)+ "/" + date.getDate();
      if (selectedFormattedDate === innerFormattedDate) {
        const startTime = new Date(consultancy.StartTime);
        const endTime = new Date(consultancy.EndTime);
        let i = 0;
        while (startTime <= endTime) {
          const hours = startTime.getHours();
          const minutes = startTime.getMinutes();
          const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
          this.consultancyTimeFrames.push({value:i+1 ,label:formattedTime});
          startTime.setMinutes(startTime.getMinutes() + 15);
          i = i+1;      
        }
        this.generalConsultancy.EventStartTime = consultancy.StartTime
        this.generalConsultancy.MeetingStartTime = formattedDate
        this.generalConsultancy.Title = consultancy.Title
        this.enableTimeFrame = false
      }
    })
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
    const model: RequestBooking = new RequestBooking(event.TutorId!, event.EventStartTime)
    this.slotBookingService.slotBookingRequest(model).subscribe(response => {
      if (response.Success) {
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
      }
    })
  }
  
}
