import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { Student, StudentService } from '../../../../services/student.service';

@Component({
  selector: 'app-view-children',
  templateUrl: './view-children.component.html',
  styleUrl: './view-children.component.css',
  providers: [StudentService]
})
export class ViewChildrenComponent implements OnInit {
  public students!: Student[];
  
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

}
