import { Component, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Student, StudentRegistrationModel, StudentService } from '../../../../services/student.service';
import { ConfirmationService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationsService } from '../../../../services/Shared/notifications.service';
import { NotificationTypes } from '../../../app.enums';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrl: './student.component.css',
  providers: [StudentService]
})
export class AdminStudentComponent {
  @ViewChild('dt1') dt1: Table | undefined;

  students!: Student[];
  studentDialogue:boolean = false
  studentSubject:any[] = []

  constructor(private studentService: StudentService,
    private confirmationService: ConfirmationService,
    private notificationsService: NotificationsService,
    private ngxSpinnerService: NgxSpinnerService) { }

  ngOnInit() {
    this.getStudentList();
  }

  public getStudentList() {
    this.ngxSpinnerService.show();
    this.studentService.getStudent().subscribe({
      next: (response: any[]) => {
        this.ngxSpinnerService.hide();
        this.students = response;
        console.log(this.students)
      },
      error: (err) => {
        console.error('Error fetching student list', err);
      },
      complete: () => {
        console.log('Student list fetch complete');
      }
    });
  }

  public blockStudent(selectedStudent: Student) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete student?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ngxSpinnerService.show();
        this.studentService.blockStudent(selectedStudent.Id).subscribe(
          (response) => {
            this.ngxSpinnerService.hide();
            if (response.Success) {
              this.notificationsService.showNotification(
                'Success',
                response.ResponseMessage,
                NotificationTypes.Success
              );
              var index = this.students.findIndex(p => p.Id == selectedStudent.Id);
              this.students.splice(index, 1);
            } else {
              this.notificationsService.showNotification(
                'Error',
                response.ResponseMessage,
                NotificationTypes.Error
              );
            }
          },
          (error) => {
            console.error('Error deleting student:', error);
            this.ngxSpinnerService.hide();
            this.notificationsService.showNotification(
              'Error',
              'An error occurred while deleting student. Please try again later.',
              NotificationTypes.Error
            );
          }
        );
      }
    });
  }


  onInput(event: any): void {
    const value = event.target.value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
  }

  public viewSubjectBox(subjects:any){
    this.studentDialogue = true;
    this.studentSubject = subjects;
    console.log(this.studentSubject);
    
  }

}
