import { Tutor, TutorService, TutorSubject } from './../../../../services/tutor.service';
import { Component, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-tutor',
  templateUrl: './tutor.component.html',
  styleUrl: './tutor.component.css',
  providers: [TutorService]
})
export class AdminTutorComponent {
  @ViewChild('dt1') dt1: Table | undefined;
  public tutors: Tutor[] = [];
  public showSubjectDialogue: boolean = false;
  public selectedTutorSubjects: TutorSubject[] = []
  public selectedTutor!: Tutor;
  // tutors: any[] = [
  //   {
  //     Id: "1000",
  //     Image: "bamboo-watch.jpg",
  //     Address: "123, Some Street, Some Colony",
  //     City: "Lahore",
  //     Country: "Pakistan",
  //     Email: "fasih@gmail.com",
  //     FullName: "Fasih",
  //     Hon: "Mr.",
  //     Phone: "123123123",
  //     PostalCode: "38000",
  //     Qualification: "Null",
  //     State: "Punjab",
  //     Subjects: [
  //       {
  //         SelectedSubject: [
  //           { label : "Mathematics", value : "Mathematics", grades: [ { label: "Grade 9", value : "Grade 9"}, { label: "Grade 10", value : "Grade 10"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 9", value : "Grade 9"},
  //         ]
  //       },
  //       {
  //         SelectedSubject: [
  //           { label : "English", value : "English", grades: [ { label: "Grade 5", value : "Grade 5"}, { label: "Grade 11", value : "Grade 11"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 5", value : "Grade 5"},
  //         ]
  //       },
  //     ]
  //   },
  //   {
  //     Id: "1000",
  //     Image: "bamboo-watch.jpg",
  //     Address: "123, Some Street, Some Colony",
  //     City: "Lahore",
  //     Country: "Pakistan",
  //     Email: "fasih@gmail.com",
  //     FullName: "Fasih",
  //     Hon: "Mr.",
  //     Phone: "123123123",
  //     PostalCode: "38000",
  //     Qualification: "Null",
  //     State: "Punjab",
  //     Subjects: [
  //       {
  //         SelectedSubject: [
  //           { label : "Mathematics", value : "Mathematics", grades: [ { label: "Grade 9", value : "Grade 9"}, { label: "Grade 10", value : "Grade 10"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 9", value : "Grade 9"},
  //         ]
  //       },
  //       {
  //         SelectedSubject: [
  //           { label : "English", value : "English", grades: [ { label: "Grade 5", value : "Grade 5"}, { label: "Grade 11", value : "Grade 11"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 5", value : "Grade 5"},
  //         ]
  //       },
  //     ]
  //   },
  //   {
  //     Id: "1000",
  //     Image: "bamboo-watch.jpg",
  //     Address: "123, Some Street, Some Colony",
  //     City: "Lahore",
  //     Country: "Pakistan",
  //     Email: "fasih@gmail.com",
  //     FullName: "Fasih",
  //     Hon: "Mr.",
  //     Phone: "123123123",
  //     PostalCode: "38000",
  //     Qualification: "Something, Something, Something",
  //     State: "Punjab",
  //     Subjects: [
  //       {
  //         SelectedSubject: [
  //           { label : "Mathematics", value : "Mathematics", grades: [ { label: "Grade 9", value : "Grade 9"}, { label: "Grade 10", value : "Grade 10"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 9", value : "Grade 9"},
  //         ]
  //       },
  //       {
  //         SelectedSubject: [
  //           { label : "English", value : "English", grades: [ { label: "Grade 5", value : "Grade 5"}, { label: "Grade 11", value : "Grade 11"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 5", value : "Grade 5"},
  //         ]
  //       },
  //     ]
  //   },{
  //     Id: "1000",
  //     Image: "bamboo-watch.jpg",
  //     Address: "123, Some Street, Some Colony",
  //     City: "Lahore",
  //     Country: "Pakistan",
  //     Email: "fasih@gmail.com",
  //     FullName: "Ali",
  //     Hon: "Mr.",
  //     Phone: "123123123",
  //     PostalCode: "38000",
  //     Qualification: "Something, Something, Something",
  //     State: "Punjab",
  //     Subjects: [
  //       {
  //         SelectedSubject: [
  //           { label : "Mathematics", value : "Mathematics", grades: [ { label: "Grade 9", value : "Grade 9"}, { label: "Grade 10", value : "Grade 10"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 9", value : "Grade 9"},
  //         ]
  //       },
  //       {
  //         SelectedSubject: [
  //           { label : "English", value : "English", grades: [ { label: "Grade 5", value : "Grade 5"}, { label: "Grade 11", value : "Grade 11"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 5", value : "Grade 5"},
  //         ]
  //       },
  //       {
  //         SelectedSubject: [
  //           { label : "Science", value : "Science", grades: [ { label: "Grade 5", value : "Grade 5"}, { label: "Grade 11", value : "Grade 11"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 5", value : "Grade 5"},
  //         ]
  //       },
  //       {
  //         SelectedSubject: [
  //           { label : "Biology", value : "Biology", grades: [ { label: "Grade 5", value : "Grade 5"}, { label: "Grade 11", value : "Grade 11"} ] },
  //         ],
  //         selectedGrades: [
  //           { label: "Grade 5", value : "Grade 5"},
  //         ]
  //       },
  //     ]
  //   }

  // ];

  constructor(private tutorService: TutorService, private ngxSpinnerService: NgxSpinnerService) {  }

  ngOnInit() {
    this.getTutors();
  }

  public getTutors() {
    this.ngxSpinnerService.show();
    this.tutorService.getTutor().subscribe({
      next: (tutors: Tutor[]) => {
        this.ngxSpinnerService.hide();
        this.tutors = tutors;
        console.log(this.tutors)
      },
      error: (err) => {
        console.error('Error fetching student list', err);
      },
      complete: () => {
        console.log('Student list fetch complete');
      }
    });
  }

  onInput(event: any): void {
    const value = event.target.value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
  }

  showSubjectDialogueBox(event:Event, tutor: Tutor):void {
    console.log(this.tutors)
    this.showSubjectDialogue = !this.showSubjectDialogue  
    this.selectedTutorSubjects = tutor.TutorSubjects
    this.selectedTutor = tutor

    console.log(this.selectedTutor)
    console.log(this.selectedTutorSubjects)
  }
}
