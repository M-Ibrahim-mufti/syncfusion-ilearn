import { Component } from '@angular/core';
import { UsersService } from '../../../../services/users.service';
import { ApplicationViewStudent } from '../../../../services/student.service';
import { StudentService } from '../../../../services/student.service';
import { CloudinaryImageService } from '../../../../services/cloudinary-image.service';
import { NotificationTypes } from '../../../app.enums';
import { AuthService } from '../../../../services/auth.service';
import { SelectItem } from '../../../../services/event.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { ZoomMeetingDetail, ZoomMeetingService } from '../../../../services/zoom-meeting.service';

@Component({
  selector: 'app-user-profile',
  providers:[UsersService, StudentService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  public user!: ApplicationViewStudent;
  public subjects!: SelectItem[];
  public selectedSubjects: any[] = [];
  public newProfileImage?: File;
  public meetings: ZoomMeetingDetail[] = []
  public UserEditProfileDialog = false
  isStudent: boolean = false;
  isTeacher: boolean = false;

  constructor(private UserService: UsersService,
    private spinner: SpinnerService,
    private studentService: StudentService,
    private toastr: ToastrService,
    private uploadingService: CloudinaryImageService,
    private authService: AuthService,
    private meetingService:ZoomMeetingService
  ) { 
    this.isStudent = this.authService.isStudent()
    this.isTeacher = this.authService.isTeacher()
  }

  async ngOnInit():Promise<void> {
    await this.getAllSubjects();
    this.getUserDetail()
    this.getPreviousMeetings()
  }


  public getUserDetail(){
    this.spinner.show();
    this.UserService.getUserDetail().subscribe(response =>{
      if(response){
        this.user = response;
        console.log(this.user)
        this.populateSelectedSubjects();    
      }
      this.spinner.hide();       
    })
  }

  public getAllSubjects() {
    this.studentService.getAllSubjects().subscribe((subject: SelectItem[]) => {
      this.subjects = subject

      this.populateSelectedSubjects();
    })
  }

  public onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("ImageFile", file)
      this.uploadingService.uploadImage(formData).subscribe((response) => {
        this.user.ImgUrl = response
        this.updateUserData();
      })

    }
  }

  public removeImg() {
    this.user.ImgUrl = null;
  }

  public updateUserData() {
    if(this.isStudent){
      this.user.StudentSubjects = []
      this.selectedSubjects.forEach(subject => {
        this.user.StudentSubjects.push(subject.value)
      })
    }
    if(this.isTeacher){
      this.user.TutorSubjects = []
      this.selectedSubjects.forEach(subject => {
        this.user.TutorSubjects.push(subject.value)
      })
    }
    this.spinner.show();
    this.UserService.updateStudent(this.user).subscribe((response) => {
      this.spinner.hide();
      if(response.Success){
        this.toastr.success(
          'Success',
          response.ResponseMessage
        );
      }
    })
  }

  private populateSelectedSubjects(): void {
    if(this.isStudent){
      if (this.user && this.user.StudentSubjects.length > 0 && this.subjects) {      
        this.selectedSubjects = this.user.StudentSubjects.map(subject => ({
          label: subject.Name,
          value: subject.Id
        }));
      }
    }
    if(this.isTeacher){
      if (this.user && this.user.TutorSubjects.length > 0 && this.subjects) {
        this.selectedSubjects = this.user.TutorSubjects.map(subject => ({
          label: subject.SubjectName,
          value: subject.SubjectId
        }))
      }
    }
  }

  private getPreviousMeetings () {
    this.meetingService.getMeetings().subscribe((response)=> {
      this.meetings = response
      const today = new Date()
      this.meetings = this.meetings.filter((meeting) =>{
        const meetingDate = new Date(meeting.StartTime);
        if(meetingDate < today) {
          return meeting;
        }
        else {
          return
        }
      }) 
    })
  } 

  public openEditProfileDialog() {
    this.UserEditProfileDialog = !this.UserEditProfileDialog
  }


}
