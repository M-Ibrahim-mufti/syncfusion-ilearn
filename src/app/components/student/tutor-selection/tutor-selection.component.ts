import { Tutor, TutorRequest, TutorService, TutorSubject, ShowTutor, TutorAvailability } from './../../../../services/tutor.service';
import { Component,ElementRef, Renderer2, ViewChildren,ViewChild ,AfterViewInit, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../../../services/student.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { EventService } from '../../../../services/event.service';
import { columnSelected } from '@syncfusion/ej2-angular-grids';
import { ReviewService } from '../../../../services/review.service';
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
  public disableGrades:boolean = true;
  public disableSubject:boolean = true
  public disableCoreSubject:boolean = true;

  public selectedDay = this.days[0].value
  public selectedSubject!: string | null
  public selectedTimegroup!: number
  public selectedTutorAvailibilities: any = []
  public availabilityCont: string = ''
  @ViewChildren('tutorCard') tutorCards!: QueryList<ElementRef>;
  @ViewChild('availabilityContainer') availabilityContainers!: ElementRef;
  public availabilityContainerHeight: number | null = null;

  public CoreSubjects:any[] = []
  public SubSubjects:any[] = [];
  public Grades:any[] = [];
  public SchoolTypes:any[] = [
    { label:'Filter by School', value:null},
    { label:'Primary', value:true},
    { label:'Secondary', value:false}
  ]
  public toggleDialogBox:boolean = false
  public reviews:any[] = []
  public todayDate:Date = new Date();

  constructor( private spinnerService:SpinnerService,
               private tutorService: TutorService,
               private studentService: StudentService,
               private router: Router,
               private renderer: Renderer2,
               private eventService: EventService,
               private reviewService: ReviewService
  ) { 
    this.SubSubjects.push({
      value:null,
      label:'Filter By Sub Subject'
    })
    this.Grades.push({
      value:null,
      label:'Filter By Grades'
    })
    this.CoreSubjects.push({
      Id: null,
      Name: 'Filter By Core Subject'
    })
    this.TimeGroup.unshift({
      label:'Select Timegroup', value: -1
    })
  }

  ngOnInit() {
    this.getSubjects();
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

  private getAllCoreSubjects(type:string)  {
    this.tutorService.getAllCoreSubjects(true).subscribe((response) => {
      this.CoreSubjects = response;
      this.CoreSubjects = this.CoreSubjects.filter((subject) => subject.IsPrimarySchool === JSON.parse(type));
      this.CoreSubjects.unshift({
        Id: null,
        Name: 'Filter By Core Subject'
      })
      this.disableCoreSubject = false 
    })
  }

  public getTutorEvents(tutorId:string, index:number) {
    const tutor = this.availableTutor.filter((tutor) => tutor.Id === tutorId);
    const todayDate = new Date()
    this.tutorEvents = tutor[0].CreateEvents ? tutor[0].CreateEvents.filter((event) => {
      const eventDate = new Date(event.EventStartTime)
      if(!event.IsOneOnOne && eventDate >= todayDate) {
        return event
      }
      return
    }) : [];
    setTimeout(() => {
      const tutorCard = this.tutorCards.toArray()[index];
      const availabilityContainer = this.availabilityContainers;

      if (tutorCard && availabilityContainer) {
        const height = tutorCard.nativeElement.firstChild.offsetHeight;
        this.renderer.setStyle(availabilityContainer.nativeElement, 'max-height', `${height}px`);
        const firstChild = this.availabilityContainers.nativeElement.firstChild.childNodes[0];
        const secondChild = this.availabilityContainers.nativeElement.firstChild.childNodes[1];
        const finalHeight = height - firstChild.offsetHeight - 10;
        this.renderer.setStyle(secondChild, 'max-height', `${finalHeight}px`);
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

  public schoolType(event:any) {
    this.getAllCoreSubjects(event.target.value);
  }

  public onCoreChange(event: any){
    this.tutorService.getSubSubjects(event.target.value, false).subscribe((response) => {
      this.SubSubjects = response;
      this.SubSubjects.unshift({
        value: null,
        label: 'Filter By Sub Subject'
      })
      console.log(this.SubSubjects)
      this.disableSubject = false;
    })
  }

  public onSubjectChange(event: any){
    this.tutorService.getSubSubjectGrades(event.target.value, true).subscribe((response) => {
      this.Grades = response;
      this.Grades.sort((a,b) => parseInt(a.label,10) - parseInt(b.label,10) );
      this.Grades.unshift({
        label:'Filter By Grades',
        value:null
      })      
      this.disableGrades = false;
    });

    this.filters.SubjectId = event.target.value;
    this.getTutors(this.filters);
  }

  public onGradeChange($event: any){
    this.filters.GradeId = $event.target.value;
    // this.getTutors(this.filters);
  }

  // public onStartTimeChange($event: any){
  //   this.filters.StartTime = null
  //   if($event.target.value){
  //     this.filters.StartTime = $event.target.value.split(': ')[1];
  //   }
  // }

  public onGlobalFilterTutor($event: any): void {
    if (this.filters.Query && this.filters.Query.length >= 3) {
      this.getTutors(this.filters);
    }
  }

  public clearAllFilters($event: any) {
    const types:any[]= this.SchoolTypes;
    this.SubSubjects = []; this.Grades = []; this.CoreSubjects = []; this.SchoolTypes = []
    this.disableCoreSubject = true; this.disableGrades = true; this.disableSubject = true;

    setTimeout(() => {
      this.SchoolTypes = types
    },100)
    this.CoreSubjects.push({
      Id:null,
      Name:'Filter By Core Subject'
    })
    this.SubSubjects.push({
      value:null,
      label:'Filter By Sub Subject'
    })
    this.Grades.push({
      value:null,
      label:'Filter By Grades'
    })
  this.getTutors();
  }


  getSelectedTutorsBySubject(subject: string) {
    return this.selectedTutors[subject] || [];
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

  showReviews(tutorId:string) {
    this.toggleDialogBox = true;
    this.reviewService.getReviews(tutorId).subscribe((response) => {
      this.reviews = response
      console.log(this.reviews)
      setTimeout(() => {
        this.changeStarColors();
      },200)
    })
  }

  changeStarColors() {
    const stars = document.querySelectorAll('.e-rating-selected') as NodeList;
    stars.forEach((star) => {
      const selectedStar = star as HTMLElement;
      const computedStyle = getComputedStyle(selectedStar);
      const ratingValue = computedStyle.getPropertyValue('--rating-value');
      const ratingPercentage = parseFloat(ratingValue);
      const innerStar = selectedStar.querySelector('.e-rating-icon') as HTMLElement
      if (innerStar) {
          innerStar.style.background = `linear-gradient(to right, #ce9f30 ${ratingPercentage}%, transparent ${ratingPercentage}%)`;
          innerStar.style.backgroundClip = 'text';
          innerStar.style.webkitBackgroundClip = 'text';
          innerStar.style.webkitTextStroke ='1px #ce9f30';
      }
    })
  }
  closeReviewDialog(resetBox:boolean) {
    this.toggleDialogBox = resetBox
  }

}

