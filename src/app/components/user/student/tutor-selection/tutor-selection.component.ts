import { Tutor, TutorRequest, TutorService, TutorSubject, ShowTutor, TutorAvailability } from './../../../../../services/tutor.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService, SelectItem } from 'primeng/api';
import { StudentService } from '../../../../../services/student.service';
@Component({
  selector: 'app-tutor-selection',
  templateUrl: './tutor-selection.component.html',
  styleUrls: ['./tutor-selection.component.css'],
  providers: [TutorService]
})
export class TutorSelectionComponent {
  public today = new Date();
  public currentDayIndex = this.today.getDay();
  public currentDayAbbreviation = this.getDayAbbreviation(this.currentDayIndex);
  public availableTutor: ShowTutor[] = [];
  public currentAvailableTutor: number = 0;
  public filters: TutorRequest = {};
  public isAvailable: any[] = [];
  public selectedTutorSubjects: TutorSubject[] = []
  public selectedTutor!: Tutor;
  public tutorAvailaibility: TutorAvailability[] = []
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

  constructor( private ngxSpinnerService:NgxSpinnerService,
               private tutorService: TutorService,
               private studentService: StudentService,
               private router: Router,
  ) { 
    this.TimeGroup.unshift({
      label:'Select Timegroup', value: -1
    })
  }

  ngOnInit() {
    this.getSubjects()
    this.getTutors();
  }

  private getTutors(filters: TutorRequest ={}) {
    this.ngxSpinnerService.show();
    this.tutorService.getTutor(filters).subscribe(tutors => {
      this.ngxSpinnerService.hide();
      this.availableTutor = tutors;
      this.currentAvailableTutor = tutors.length;
      this.loadAvailabilities();
    })
  }

  public loadAvailabilities() {
    this.tutorService.getAllAvalabilities().subscribe((response) => {
      console.log(response)
      this.tutorAvailaibility = response
      console.log(this.tutorAvailaibility)
    })
  }

  public getTutorAvailabilities(tutorId:string) {
    this.selectedTutorAvailibilities = []
    console.log(tutorId, this.tutorAvailaibility)
    this.tutorAvailaibility.forEach((availibility) => {
        if (availibility.TutorId === tutorId){
          this.selectedTutorAvailibilities.push(availibility)
        }
    })
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

  dragStart(tutor: any) {
    this.draggedTutor = tutor;
  }

  // drop(event: any, subject: string) {
  //   if (this.draggedTutor) {
  //     const teachesSubject = this.draggedTutor.Subjects.some((sub: any) => sub.SelectedSubject[0].label === subject);
  //     if (teachesSubject) {
  //       if (!this.selectedTutors[subject]) {
  //         this.selectedTutors[subject] = [];
  //       }
  //       if (!this.selectedTutors[subject].includes(this.draggedTutor)) {
  //         this.selectedTutors[subject].push(this.draggedTutor);
  //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'The tutor is selected successfully.' });
  //       } else {
  //         this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You have already selected this tutor for ' + subject + '.' });
  //       }
  //     } else {
  //       this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'The tutor is not related to this subject.' });
  //     }
  //     this.draggedTutor = null;
  //   }
  // }

  dragEnd() {
    this.draggedTutor = null;
  }

  deselectProduct(tutor: any, subject: string) {
    const index = this.selectedTutors[subject].indexOf(tutor);
    if (index > -1) {
      this.selectedTutors[subject].splice(index, 1);
    }
  }

  findIndex(tutor: any, list: any[]) {
    return list.findIndex((t: any) => t.id === tutor.id);
  }

  // determineEducationLevel(subjects: any[]) {
  //   const results: string[] = [];

  //   subjects.forEach(subject => {
  //     subject.selectedGrades.forEach((grade: { value: string; }) => {
  //       const gradeNumber = parseInt(grade.value.split(' ')[1], 10);
  //       if (gradeNumber >= 7) {
  //         if (!results.includes("Secondary")) {
  //           results.push("Secondary");
  //         }
  //       } else {
  //         if (!results.includes("Primary")) {
  //           results.push("Primary");
  //         }
  //       }
  //     });
  //   });

  //   return results;
  // }

  getSelectedTutorsBySubject(subject: string) {
    return this.selectedTutors[subject] || [];
  }

  isTutorAvailable(tutors: any[]) {
    const currentDayAbbreviation = this.currentDayAbbreviation; // Assuming this is defined elsewhere in your component
    const currentHour = this.today.getHours();
    const currentMinute = this.today.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    tutors.forEach(tutor => {
      let isCurrentlyAvailable = false;

      // Check tutor availabilities
      if (tutor.TutorAvailabilities) {
        tutor.TutorAvailabilities.forEach((availability: any) => {
          if (availability.Day === currentDayAbbreviation) {
            const openTimeInMinutes = availability.OpenTimeHours * 60 + availability.OpenTimeMinutes;
            const closeTimeInMinutes = availability.CloseTimeHours * 60 + availability.CloseTimeMinutes;

            if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
              isCurrentlyAvailable = true;
            }
          }
        });
      }

      // Check tutor events
      if (tutor.CreateEvents) {
        tutor.CreateEvents.forEach((event: any) => {
          const eventStartTimeString = event.EventStartTime;
          const eventStartTime = new Date(eventStartTimeString);
          const eventStartTimeInMinutes = eventStartTime.getHours() * 60 + eventStartTime.getMinutes();
          const eventEndTimeInMinutes = eventStartTimeInMinutes + event.Duration;
          if (currentTimeInMinutes >= eventStartTimeInMinutes && currentTimeInMinutes < eventEndTimeInMinutes) {
            isCurrentlyAvailable = false;
          }
        });
      }

      this.isAvailable.push({
        id: tutor.Id,
        value: isCurrentlyAvailable
      });

    });
  }

  getValueOfAvalability(tutorId: string): string {
    if (this.isAvailable.length > 0) {
      let avalablility = this.isAvailable.find(x => x.id == tutorId)
      if (avalablility.value == true) {
        return 'Available'
      }
      return 'Not Available'
    }
    return ''
  }

  checkTodayAvalabilities(tutor: Tutor): boolean {
    let aval = false;
    if (tutor.TutorAvailabilities) {
      tutor.TutorAvailabilities.forEach(x => {
        if (x.Day == this.currentDayAbbreviation) {
          aval = true;
        }
      })
    }
    return aval;
  }

  public getDayAbbreviation(dayIndex: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  }

  formatTimeTo12Hours(hours: number, minutes: number): string {
    const period = hours >= 12 ? 'pm' : 'am';
    let formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${period}`;
  }

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