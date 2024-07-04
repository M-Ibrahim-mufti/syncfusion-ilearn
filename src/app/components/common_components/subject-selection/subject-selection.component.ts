import { Component, EventEmitter, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SelectItem } from 'primeng/api';
import { TutorService } from '../../../../services/tutor.service';


@Component({
  selector: 'app-subject-selection',
  templateUrl: './subject-selection.component.html',
  styleUrls: ['./subject-selection.component.css']
})
export class SubjectSelectionComponent {
  @Output() selectedSubjectsChange = new EventEmitter<any[]>();

  public subjects: any[] = [];

  public selectedSubjects: any[] = [];

  constructor(private ngxSpinnerService: NgxSpinnerService, private tutorService: TutorService){
    this.getAllSubjects();
  }

  public addSubject() {
    if (this.selectedSubjects.length < this.subjects.length) {
      this.selectedSubjects.push({ selectedSubject: null, selectedGrades: [] });
      this.selectedSubjectsChange.emit(this.selectedSubjects);
    }
  }

  public removeSubject(index: number) {
    this.selectedSubjects.splice(index, 1);
    this.selectedSubjectsChange.emit(this.selectedSubjects);
  }

  public updateSelectedSubjects() {
    this.selectedSubjectsChange.emit(this.selectedSubjects);
  }

  getGrades(selectedSubject: any) {
    return selectedSubject ? selectedSubject.Grades : [];
  }

  private getAllSubjects() {
    this.ngxSpinnerService.show();
    this.tutorService.getAllSubjects().subscribe((subject: any[]) => {
      this.subjects = subject;
      this.ngxSpinnerService.hide();
    }, (error) => { this.ngxSpinnerService.hide(); });
  }
}