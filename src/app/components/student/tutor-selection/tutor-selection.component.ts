import { Tutor, TutorRequest, TutorService, TutorSubject, ShowTutor, TutorAvailability } from './../../../../services/tutor.service';
import { Component,ElementRef, Renderer2, ViewChildren,ViewChild ,AfterViewInit, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../../../services/student.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { EventService } from '../../../../services/event.service';
import { columnSelected } from '@syncfusion/ej2-angular-grids';
@Component({
  selector: 'app-tutor-selection',
  templateUrl: './tutor-selection.component.html',
  styleUrls: ['./tutor-selection.component.css'],
  providers: [TutorService]
})
export class TutorSelectionComponent {
  public today = new Date();
  public currentDayIndex = this.today.getDay();
  // public currentDayAbbreviation = this.getDayAbbreviation(this.currentDayIndex);
  public availableTutor: ShowTutor[] = [];
  public currentAvailableTutor: number = 0;
  public filters: TutorRequest = {};
  public isAvailable: any[] = [];
  public selectedTutorSubjects: TutorSubject[] = []
  public selectedTutor!: Tutor;
  public tutorEvents:any[] = []
  selectedTutors: { [key: string]: any[] } = {};
  draggedTutor: any | undefined | null;
  public showSubjectDialogue: boolean = false;
  isExpanded: boolean = false;
  Subjects: any[] = [];
  Grades = Array.from({ length: 13 }, (v, i) => ( i === 0 ? {label:'Select Grade', value:null } : { label: `Grade ${i }`, value: i}));
  TimeGroup = Array.from({ length: 24 }, (v, i) => {
    const hour12 = i % 12 == 0 ? 12 : i % 12;
    const period = i < 12 ? 'AM' : 'PM';
    return { label: `${hour12.toString().padStart(2, '0')}:00 ${period}`, value: i };
  });
  public days: any[] = [
    { label: 'Select Day', value: null},
    { label: 'Sunday', value: 'Sun' },
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
    { label: 'Saturday', value: 'Sat' }
  ];
  public selectedDay = this.days[0].value
  public selectedSubject!: string | null
  public selectedGrade = this.Grades[0].value
  public selectedTimegroup!: number
  public selectedTutorAvailibilities: any = []
  public availabilityCont: string = ''
  @ViewChildren('tutorCard') tutorCards!: QueryList<ElementRef>;
  @ViewChild('availabilityContainer') availabilityContainers!: ElementRef;
  public availabilityContainerHeight: number | null = null;

  constructor( private spinnerService:SpinnerService,
               private tutorService: TutorService,
               private studentService: StudentService,
               private router: Router,
               private renderer: Renderer2,
               private eventService: EventService
  ) { 
    this.TimeGroup.unshift({
      label:'Select Timegroup', value: -1
    })
  }

  ngOnInit() {
    this.getSubjects()
    this.getTutors();
  }

  ngAfterViewInit() {
    // Initial height set for all tutor cards
    this.tutorCards.forEach((tutorCard, index) => {
      const height = tutorCard.nativeElement.offsetHeight;
      const availabilityContainer = this.availabilityContainers.nativeElement;
      if (availabilityContainer) {
        this.renderer.setStyle(availabilityContainer.nativeElement, 'height', `${height}px`);
      }
    });
  }

  private getTutors(filters: TutorRequest = {}) {
    this.spinnerService.show();
    this.tutorService.getTutor(filters).subscribe(tutors => {
      this.spinnerService.hide();
      this.availableTutor = tutors;
      this.currentAvailableTutor = tutors.length;
    })
  }

 

  public getTutorEvents(tutorId:string, index:number) {
    const tutor = this.availableTutor.filter((tutor) => tutor.Id === tutorId);
    this.tutorEvents = tutor[0].CreateEvents ? tutor[0].CreateEvents.filter((event) => event.IsOneOnOne === false) : [];
    console.log(this.tutorEvents)
    setTimeout(() => {
      const tutorCard = this.tutorCards.toArray()[index];
      const availabilityContainer = this.availabilityContainers;
      
      if (tutorCard && availabilityContainer) {
        const height = tutorCard.nativeElement.firstChild.offsetHeight;
        this.renderer.setStyle(availabilityContainer.nativeElement, 'max-height', `${height}px`);
      }
    }, 0);
    this.availabilityCont = tutorId
  }

  public removeAvailabilities() {
    this.selectedTutorAvailibilities = [];
    this.availabilityCont = ''

  }

  getSubjects(){
    this.studentService.getAllUserSubjects().subscribe(
      (response) => {
        this.Subjects = response;
        this.Subjects.unshift({
          label:"Select Subjects", value:null
        });
        this.selectedSubject = this.Subjects[0].value;
        this.selectedTimegroup = this.TimeGroup[0].value
      }
    )
  }

  public onDayChange($event: any){
    this.filters.Day = $event.target.value.split(': ')[1];
    this.getTutors(this.filters);
  }

  public onSubjectChange($event: any){
    this.filters.SubjectId = $event.target.value.split(": ")[1];
    this.getTutors(this.filters);
  }

  public onGradeChange($event: any){
    this.filters.Grade = 0
  
    if($event.target.value){
      this.filters.Grade = $event.target.value.split(': ')[1];
    }
    this.getTutors(this.filters);
  }

  public onStartTimeChange($event: any){
    this.filters.StartTime = null
    if($event.target.value){
      this.filters.StartTime = $event.target.value.split(': ')[1];
    }
    this.getTutors(this.filters);
  }

  public onGlobalFilterTutor($event: any): void {
    if (this.filters.Query && this.filters.Query.length >= 3) {
      this.getTutors(this.filters);
    }
  }

  public clearAllFilters($event: any) {
    this.filters = {};
    this.selectedDay = this.days[0].value
    this.selectedSubject = this.Subjects[0].value
    this.selectedGrade = this.Grades[0].value
    this.selectedTimegroup = this.TimeGroup[0].value

    this.getTutors(this.filters);
  }


  getSelectedTutorsBySubject(subject: string) {
    return this.selectedTutors[subject] || [];
  }



  // isTutorAvailable(tutors: any[]) {
  //   const currentDayAbbreviation = this.currentDayAbbreviation; // Assuming this is defined elsewhere in your component
  //   const currentHour = this.today.getHours();
  //   const currentMinute = this.today.getMinutes();
  //   const currentTimeInMinutes = currentHour * 60 + currentMinute;

  //   tutors.forEach(tutor => {
  //     let isCurrentlyAvailable = false;

  //     // Check tutor availabilities
  //     if (tutor.TutorAvailabilities) {
  //       tutor.TutorAvailabilities.forEach((availability: any) => {
  //         if (availability.Day === currentDayAbbreviation) {
  //           const openTimeInMinutes = availability.OpenTimeHours * 60 + availability.OpenTimeMinutes;
  //           const closeTimeInMinutes = availability.CloseTimeHours * 60 + availability.CloseTimeMinutes;

  //           if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
  //             isCurrentlyAvailable = true;
  //           }
  //         }
  //       });
  //     }

  //     // Check tutor events
  //     if (tutor.CreateEvents) {
  //       tutor.CreateEvents.forEach((event: any) => {
  //         const eventStartTimeString = event.EventStartTime;
  //         const eventStartTime = new Date(eventStartTimeString);
  //         const eventStartTimeInMinutes = eventStartTime.getHours() * 60 + eventStartTime.getMinutes();
  //         const eventEndTimeInMinutes = eventStartTimeInMinutes + event.Duration;
  //         if (currentTimeInMinutes >= eventStartTimeInMinutes && currentTimeInMinutes < eventEndTimeInMinutes) {
  //           isCurrentlyAvailable = false;
  //         }
  //       });
  //     }

  //     this.isAvailable.push({
  //       id: tutor.Id,
  //       value: isCurrentlyAvailable
  //     });

  //   });
  // }

  // getValueOfAvalability(tutorId: string): string {
  //   if (this.isAvailable.length > 0) {
  //     let avalablility = this.isAvailable.find(x => x.id == tutorId)
  //     if (avalablility.value == true) {
  //       return 'Available'
  //     }
  //     return 'Not Available'
  //   }
  //   return ''
  // }

  // checkTodayAvalabilities(tutor: Tutor): boolean {
  //   let aval = false;
  //   if (tutor.TutorAvailabilities) {
  //     tutor.TutorAvailabilities.forEach(x => {
  //       if (x.Day == this.currentDayAbbreviation) {
  //         aval = true;
  //       }
  //     })
  //   }
  //   return aval;
  // }

  // public getDayAbbreviation(dayIndex: number): string {
  //   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  //   return days[dayIndex];
  // }

  // formatTimeTo12Hours(hours: number, minutes: number): string {
  //   const period = hours >= 12 ? 'pm' : 'am';
  //   let formattedHours = hours % 12;
  //   formattedHours = formattedHours ? formattedHours : 12; // the hour '0' should be '12'
  //   const formattedMinutes = minutes.toString().padStart(2, '0');
  //   return `${formattedHours}:${formattedMinutes}${period}`;
  // }

  enrollStudentRequest(tutor: Tutor) {
    this.router.navigate(['/student/event/add'], { state: { tutor: tutor } });
  }


  navigateTutorDetailPage(tutor:Tutor){
    this.router.navigate(['student/tutor-detail/' + tutor.Id])
  }

  toggleReadMore(tutorId: number) {
    this.availableTutor[tutorId].isExpanded = !this.availableTutor[tutorId].isExpanded;
  }
}
