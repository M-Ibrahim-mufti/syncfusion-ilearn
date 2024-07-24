import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { TutorService, Tutor, TutorAvailability, GeneralConsultancy } from '../../../../services/tutor.service';
import { ActivatedRoute } from '@angular/router';
import { Event,GroupedAvailabilities,EventService, SelectItem } from '../../../../services/event.service';
import { StudentService } from '../../../../services/student.service';
import { RequestBooking, SlotBookingService } from '../../../../services/slot-booking.service';
import { NotificationTypes } from '../../../app.enums';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { NgIfContext } from '@angular/common';
import { generate } from '@syncfusion/ej2-schedule';
import {DatePickerComponent} from "@syncfusion/ej2-angular-calendars";


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
    private cdr: ChangeDetectorRef
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

  public enabledDates: Date[] = [];
  avalabilityDates: Date[] = [];
  private currentViewMonth: number = new Date().getMonth(); // Track current month
  private currentViewYear: number = new Date().getFullYear(); // Track current year
  @ViewChild('datepicker', { static: false }) datepicker!: DatePickerComponent;


  getConsultancy() {
    this.tutorService.getTutorConsultancy(this.tutorId).subscribe((response) => {
      // Clear the enabledDates array
      this.allConsultancy = response;
      this.avalabilityDates = response;
      //this.enabledDates = [];

      // Get the current month and year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Process each consultancy record
      response.forEach((consultancy: any) => {
        let startDate = new Date(consultancy.StartTime);

        // Generate dates based on recurrence rules or single date
        let datesToCheck: Date[] = [];
        if (consultancy.RecurrenceRule) {
          datesToCheck = this.getDatesFromRecurrence(consultancy.RecurrenceRule, startDate);
        } else {
          datesToCheck.push(startDate);
        }

        // Filter dates to only include those in the current month and year
        datesToCheck.forEach(date => {
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            this.enabledDates.push(date);
          }
        });
      });

      // Set dialog visibility
      this.consultDialog = true;
    });
  }

  getDatesFromRecurrence(rule: string, startDate: Date): Date[] {
    const dates: Date[] = this.generateDatesFromRecurrence(rule,startDate);
    // Ensure the dates are properly formatted with the start time
    return dates.map(date => {
      date.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
      return date;
    });
  }

  generateDatesFromRecurrence(rule: string, startDate: Date): Date[] {
    const dates: Date[] = [];
    const ruleParts = rule.split(';').map(part => part.split('='));

    // Extract recurrence rule details
    const freq = ruleParts.find(part => part[0] === 'FREQ')?.[1] || 'DAILY';
    const interval = parseInt(ruleParts.find(part => part[0] === 'INTERVAL')?.[1] || '1', 10);
    const count = parseInt(ruleParts.find(part => part[0] === 'COUNT')?.[1] || '1', 10);
    const byDay = ruleParts.find(part => part[0] === 'BYDAY')?.[1]?.split(',') || [];
    const bySetPos = ruleParts.find(part => part[0] === 'BYSETPOS')?.[1] || '1';

    let currentDate = new Date(startDate);

    if (freq === 'DAILY') {
      // Handle daily recurrence
      let occurrences = 0;
      while (occurrences < count) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + interval);
        occurrences++;
      }

    } else if (freq === 'WEEKLY') {
      // Handle weekly recurrence
      const dayOfWeek = byDay[0] || '';
      const dayIndex = this.getDayIndex(dayOfWeek);

      if (dayIndex !== -1) {
        let occurrences = 0;
        while (occurrences < count) {
          dates.push(new Date(currentDate));
          // Move to the next week based on the interval
          currentDate.setDate(currentDate.getDate() + 7 * (interval));
          occurrences++;
        }
      }

    } else if (freq === 'MONTHLY') {
      // Handle monthly recurrence
      const dayOfWeek = byDay[0] || '';
      const dayIndex = this.getDayIndex(dayOfWeek);
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

      let occurrences = 0;
      while (occurrences < count) {
        // Calculate the target date for the current month
        let targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(bySetPos, 10));
        if (dayIndex !== -1) {
          const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
          const daysUntilTargetDay = (dayIndex - firstDayOfMonth + 7) % 7;
          targetDate.setDate(parseInt(bySetPos, 10) + daysUntilTargetDay);

          // Adjust if the target date is beyond the days of the month
          if (targetDate.getDate() > daysInMonth) {
            targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, parseInt(bySetPos, 10));
          }
        }

        if (targetDate) {
          dates.push(new Date(targetDate));
          currentDate.setMonth(currentDate.getMonth() + interval);
        }
        occurrences++;
      }
    }

    return dates;
  }



  getDayIndex(dayOfWeek: string): number {
    const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const index = dayNames.indexOf(dayOfWeek);
    return index !== -1 ? index : -1;
  }





  isEnabled(date: Date): boolean {
    return this.enabledDates.some(enabledDate =>
        enabledDate.getFullYear() === date.getFullYear() &&
        enabledDate.getMonth() === date.getMonth() &&
        enabledDate.getDate() === date.getDate()
    );
  }

  renderDayCell(args: any): void {
    if (!this.isEnabled(args.date)) {
      args.element.classList.add('e-disabled');
      args.isDisabled = true;
    } else {
      args.element.classList.remove('e-disabled');
      args.isDisabled = false;
    }
  }

  onNavigated(args: any): void {
    if (args && args.date) {
      this.currentViewMonth = args.date.getMonth();
      this.currentViewYear = args.date.getFullYear();
      this.updateEnabledDatesForView();
    } else {
      console.error('ViewDate is undefined in navigated event.');
    }
  }

  updateEnabledDatesForView(): void {
    // Clear the enabledDates array
    this.enabledDates = [];
    this.enableTimeFrame = true;

    this.avalabilityDates.forEach((consultancy: any) => {
      let startDate = new Date(consultancy.StartTime);

      // Generate dates based on recurrence rules or single date
      let datesToCheck: Date[] = [];
      if (consultancy.RecurrenceRule) {
        datesToCheck = this.getDatesFromRecurrence(consultancy.RecurrenceRule, startDate);
      } else {
        datesToCheck.push(startDate);
      }

      // Filter dates to only include those in the current month and year
      datesToCheck.forEach(date => {
        if (date.getMonth() === this.currentViewMonth && date.getFullYear() === this.currentViewYear) {
          this.enabledDates.push(date);
        }
      });
    });
    this.datepicker?.refresh();
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

  public setConsultancyDate(event: any) {
    this.consultancyTimeFrames = [];
    const selectedDate = new Date(event.value);

    // Format the selected date as YYYY/MM/DD
    const selectedFormattedDate = `${selectedDate.getFullYear()}/${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`;

    this.allConsultancy.forEach((consultancy: any) => {
      // Generate all dates for the consultancy based on recurrence rules or single date
      let datesToCheck: Date[] = [];
      if (consultancy.RecurrenceRule) {
        datesToCheck = this.getDatesFromRecurrence(consultancy.RecurrenceRule, new Date(consultancy.StartTime));
      } else {
        datesToCheck.push(new Date(consultancy.StartTime));
      }

      datesToCheck.forEach(date => {
        // Format the date to YYYY/MM/DD
        const consultancyFormattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

        if (selectedFormattedDate === consultancyFormattedDate) {
          const startTime = new Date(consultancy.StartTime);
          const endTime = new Date(consultancy.EndTime);
          let i = 0;

          while (startTime <= endTime) {
            const hours = startTime.getHours();
            const minutes = startTime.getMinutes();
            const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
            this.consultancyTimeFrames.push({ value: i + 1, label: formattedTime });
            startTime.setMinutes(startTime.getMinutes() + 15);
            i = i + 1;
          }

          this.generalConsultancy.EventStartTime = consultancy.StartTime;
          this.generalConsultancy.MeetingStartTime = selectedDate;
          this.generalConsultancy.Title = consultancy.Title;
          this.enableTimeFrame = false;
        }
      });
    });
  }


  public setConsultancyDuration(event:any) {
    let DurationArr = this.consultancyDuration.filter((duration) => duration.value == event.target.value);
    let duration = DurationArr[0];
    this.generalConsultancy.Duration = duration.label;
  }
  
  public enrollInGeneralConsultancy() {
    this.generalConsultancy.TutorId = this.tutorId;

    this.slotBookingService.saveGeneralConsultancyRequest(this.generalConsultancy).subscribe((response) => {
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
