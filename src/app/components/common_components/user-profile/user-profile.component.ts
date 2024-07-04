import { Component } from '@angular/core';
import { UsersService } from '../../../../services/users.service';
import { ApplicationViewStudent } from '../../../../services/student.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StudentService } from '../../../../services/student.service';
import { SelectItem } from 'primeng/api';
import { CloudinaryImageService } from '../../../../services/cloudinary-image.service';
import { NotificationsService } from '../../../../services/Shared/notifications.service';
import { NotificationTypes } from '../../../app.enums';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  providers:[UsersService, StudentService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  public student!: ApplicationViewStudent;
  public subjects!: SelectItem[];
  public selectedSubjects: any[] = [];
  public newProfileImage?: File;
  isStudent: boolean = false;
  isTeacher: boolean = false;

  constructor(private UserService: UsersService,
    private NgxSpinner: NgxSpinnerService,
    private studentService: StudentService,
    private notificationsService: NotificationsService,
    private uploadingService: CloudinaryImageService,
    private authService: AuthService
  ) { 
    this.isStudent = this.authService.isStudent()
    this.isTeacher = this.authService.isTeacher()
  }

  async ngOnInit():Promise<void> {
    await this.getAllSubjects();
    this.getStudentDetail()
  }
  

  public getStudentDetail(){
    this.NgxSpinner.show();
    this.UserService.getStudentDetail().subscribe(res =>{
      if(res){
        this.student = res;
        this.populateSelectedSubjects();    
      }
      this.NgxSpinner.hide();       
    })
  }

  public getAllSubjects() {
    this.studentService.getAllSubjects().subscribe((subject: SelectItem[]) => {
      this.subjects = subject
      this.populateSelectedSubjects();
    })
  }

  public onImageSelected(files:File[], isAdditionalImage:boolean) {
    this.newProfileImage = files[0];
    const isImage:boolean = this.newProfileImage['type'].includes('image');
    const formData = new FormData();
    formData.append('ImageFile', this.newProfileImage);
    if (isImage) {
      this.uploadingService.uploadImage(formData).subscribe((imgUrl)=> {
        this.student.ImgUrl = imgUrl;
      })
    }
  }

  public removeImg() {
    this.student.ImgUrl = null;
  }

  public updateStudentData() {
    if(this.isStudent){
      this.student.StudentSubjects = []
      this.selectedSubjects.forEach(subject => {
        this.student.StudentSubjects.push(subject.value)
      })
    }
    if(this.isTeacher){
      this.student.TutorSubjects = []
      this.selectedSubjects.forEach(subject => {
        this.student.TutorSubjects.push(subject.value)
      })
    }
    this.NgxSpinner.show();
    this.UserService.updateStudent(this.student).subscribe((response) => {
      this.NgxSpinner.hide();
      if(response.Success){
        this.notificationsService.showNotification(
          'Success',
          response.ResponseMessage,
          NotificationTypes.Success
        );
      }
    })
  }

  private populateSelectedSubjects(): void {
    if(this.isStudent){
      if (this.student && this.student.StudentSubjects.length > 0 && this.subjects) {      
        this.selectedSubjects = this.student.StudentSubjects.map(subject => ({
          label: subject.Name,
          value: subject.Id
        }));
      }
    }
    if(this.isTeacher){
      if (this.student && this.student.TutorSubjects.length > 0 && this.subjects) {
        this.selectedSubjects = this.student.TutorSubjects.map(subject => ({
          label: subject.SubjectName,
          value: subject.SubjectId
        }))
      }
    }
  }

}
