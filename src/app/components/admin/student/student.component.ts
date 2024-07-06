import { Component, ViewChild } from '@angular/core';
import { Student, StudentRegistrationModel, StudentService } from '../../../../services/student.service';
import { NotificationTypes } from '../../../app.enums';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { DialogUtility } from '@syncfusion/ej2-angular-popups';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrl: './student.component.css',
  providers: [StudentService]
})
export class AdminStudentComponent {
  students!: Student[];
  studentDialogue:boolean = false
  studentSubject:any[] = []
  dialogInstance!: any;

  constructor(private studentService: StudentService,
    private toastr: ToastrService,
    private spinnerService: SpinnerService) { }

  ngOnInit() {
    this.getStudentList();
  }

  public getStudentList() {
    this.spinnerService.show();
    this.studentService.getStudent().subscribe({
      next: (response: any[]) => {
        this.spinnerService.hide();
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
    this.dialogInstance = DialogUtility.confirm({
      title: 'Delete Confirmation',
      content: `Are you sure you want to delete ${selectedStudent.FullName}?`,
      okButton: { text: 'Yes', click: this.confirmDelete.bind(this, selectedStudent) },
      cancelButton: { text: 'No' },
      showCloseIcon: true,
      closeOnEscape: true,
      animationSettings: { effect: 'Zoom' }
    });
  } 

  public confirmDelete(selectedStudent: Student) {
    this.spinnerService.show();
        this.studentService.blockStudent(selectedStudent.Id).subscribe(
          (response) => {
            this.spinnerService.hide();
            if (response.Success) {
              this.toastr.success(
                'Success',
                response.ResponseMessage
              );
              var index = this.students.findIndex(p => p.Id == selectedStudent.Id);
              this.students.splice(index, 1);
            } else {
              this.toastr.error(
                'Error',
                response.ResponseMessage
              );
            }
            this.dialogInstance.hide();
          },
          (error) => {
            console.error('Error deleting student:', error);
            this.spinnerService.hide();
            this.toastr.error(
              'Error',
              'An error occurred while deleting student. Please try again later.',
            );
          }
        );
        this.dialogInstance.hide();
      }
  
  public viewSubjectBox(subjects:any){
    this.studentDialogue = true;
    this.studentSubject = subjects;
    console.log(this.studentSubject);    
  }
}
