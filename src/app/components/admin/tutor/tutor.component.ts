import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { Tutor, TutorService, TutorSubject } from './../../../../services/tutor.service';
import { Component, ViewChild } from '@angular/core';


@Component({
  selector: 'app-tutor',
  templateUrl: './tutor.component.html',
  styleUrl: './tutor.component.css',
  providers: [TutorService]
})
export class AdminTutorComponent {
  public tutors: Tutor[] = [];
  public showSubjectDialogue: boolean = false;
  public selectedTutorSubjects: TutorSubject[] = []
  public selectedTutor!: Tutor;

  constructor(private tutorService: TutorService, private spinnerService: SpinnerService) {  }

  ngOnInit() {
    this.getTutors();
  }

  public getTutors() {
    this.spinnerService.show();
    this.tutorService.getTutor().subscribe({
      next: (tutors: Tutor[]) => {
        this.spinnerService.hide();
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


  showSubjectDialogueBox(tutor: Tutor):void {
    console.log(this.tutors)
    this.showSubjectDialogue = !this.showSubjectDialogue  
    this.selectedTutorSubjects = tutor.TutorSubjects
    this.selectedTutor = tutor

    console.log(this.selectedTutor)
    console.log(this.selectedTutorSubjects)
  }
}
