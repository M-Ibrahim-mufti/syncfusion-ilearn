import {Component, OnInit} from '@angular/core';
import {ButtonModule} from "@syncfusion/ej2-angular-buttons";
import { SkeletonModule } from '@syncfusion/ej2-angular-notifications';
import {CommonModule} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {StudentService} from "../../../../../../services/student.service";

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    SkeletonModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent implements OnInit{
  user: any = null;
  userId: string | null = null;
  constructor(
      private route: ActivatedRoute,
      private studentService: StudentService) {
  }
  ngOnInit(){
    this.userId = this.route.snapshot.paramMap.get('userId');
    if(this.userId != null){
      this.getStudentById();
    }
  }

  getStudentById(){
    this.studentService.getStudentById(this.userId!).subscribe(response => {
      this.user = response;
    })
  }
}
