import { ChangeDetectorRef, Component  } from '@angular/core';
import { UsersService } from '../../../../services/users.service';
import { ApplicationViewStudent } from '../../../../services/student.service';
import { StudentService } from '../../../../services/student.service';
import { CloudinaryImageService } from '../../../../services/cloudinary-image.service';
import { NotificationTypes } from '../../../app.enums';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import { SelectItem } from '../../../../services/event.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { ZoomMeetingDetail, ZoomMeetingService } from '../../../../services/zoom-meeting.service';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import { TutorService } from '../../../../services/tutor.service';


@Component({
  selector: 'app-user-profile',
  providers:[UsersService, StudentService,ToolbarService, LinkService, ImageService, HtmlEditorService, QuickToolbarService ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  public user!: ApplicationViewStudent;
  public subjects!: SelectItem[];
  public grades: SelectItem[] = [];
  public selectedGrades: any[] = []
  public selectedSubjects: any[] = [];
  public selectedSubjectGrades: any[] = [];
  public newProfileImage?: File;
  public meetings: ZoomMeetingDetail[] = []
  public UserEditProfileDialog = false
  isStudent: boolean = false;
  isTeacher: boolean = false;
  public StudentInfo: boolean = true 
  public authConfig!: AuthConfig;
  public logginUserId!: string;

  constructor(private UserService: UsersService,
    private spinner: SpinnerService,
    private studentService: StudentService,
    private toastr: ToastrService,
    private uploadingService: CloudinaryImageService,
    private authService: AuthService,
    private meetingService:ZoomMeetingService,
    private tutorSevice: TutorService,
    private cdr:ChangeDetectorRef
  ) { 
    this.isStudent = this.authService.isStudent()
    this.isTeacher = this.authService.isTeacher()
  }

  public tools: object = {
    items: ['Undo', 'Redo', '|',
        'Bold', 'Italic', 'Underline', 'Strikethrough', '|',
        'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
        'SubScript', 'SuperScript', '|',
        'LowerCase', 'UpperCase', '|',
        'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
        'Indent', 'Outdent', '|', 'CreateLink',
        'Image', '|', 'ClearFormat', 'Print',]
    };

    public quickTools: object = {
      image: [
          'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension']
    };

  async ngOnInit():Promise<void> {
    this.authConfig = this.authService.getAuthConfig();
    if(this.authConfig.IsTeacher){
      this.logginUserId = this.authService.getUserId();
    }
    this.getAllSubjects();
    this.getPreviousMeetings();
    this.getAllGrades();
    this.getUserDetail();
  }

  public getUserDetail(){
    this.spinner.show();
    this.UserService.getUserDetail().subscribe(response =>{
      if(response){
        this.user = response;
        console.log(this.user)
        this.populateSelectedSubjects();  
        setTimeout(() => {
          this.toolBarFixation();
        },300)
      }
      this.spinner.hide(); 
      if(this.authConfig.IsTeacher){
        this.tutorSevice.getTutorEditorDetails(this.logginUserId).subscribe((response) => {
          this.user.Certification = response.Certification;
          this.user.WorkHistory = response.WorkHistory;
          this.user.Qualifications = response.Qualifications;
        })
      }        
    })
     
  }

  public getSubjectGrades(event:any) {
    console.log(event.target.value);
  }

  public getAllSubjects() {
    this.studentService.getAllSubjects().subscribe((subject: SelectItem[]) => {
      this.subjects = subject
      this.populateSelectedSubjects();
    
    })
  }

  public getAllGrades() {
    this.tutorSevice.getAllSubjects().subscribe((grade) =>{
      const AllGrades:any[] = grade[0].Grades
      this.grades = AllGrades.map((grade) => ({
        value: grade.Id,
        label: grade.GradeLevel
      }))
      console.log(this.grades)
      
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
    // if(this.isStudent){
    //   this.user.StudentSubjects = []
    //   this.selectedSubjects.forEach(subject => {
    //     this.user.StudentSubjects.push(subject.value)
    //   })
    // }
    // if(this.isTeacher){
    //   this.user.TutorSubjects = []
    //   this.selectedSubjects.forEach((subject,index) => {
    //     this.user.TutorSubjects.push({subjectId: subject.value , grade: this.selectedGrades[index]})
    //     this.user.TutorSubjects.push(subject.value)
    //   })
    // }
    console.log(this.selectedSubjects)
    console.log(this.selectedGrades)

    console.log(this.user.TutorSubjects)
    this.spinner.show();
    this.UserService.updateStudent(this.user).subscribe((response) => {
      this.spinner.hide();
      this.UserEditProfileDialog = false
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
      if(this.user && this.user.TutorSubjects.length > 0 && this.subjects) {
        this.selectedSubjects = this.user.TutorSubjects.map(subject => ({
          label: subject.SubjectName,
          value: subject.SubjectId
        }))
        // let subjectGrades:any[] = []
        // this.selectedSubjects.forEach((subject) => {
        //   this.user.TutorSubjects.forEach((innerSubject, index) => {
        //     if(subject.value === innerSubject.SubjectId) {
        //       subjectGrades.push(innerSubject.Grades)
        //       let innerArray:any[]= subjectGrades[index]
        //       subjectGrades = [];
        //       innerArray = innerArray.map((grade) => ({
        //         label: grade.GradeLevel,
        //         value: grade.GradeId,
        //       }))
        //       subjectGrades.push(innerArray);
        //       this.selectedGrades.push(subjectGrades);
        //       console.log(this.selectedGrades)
        //     }
        //   })      
        // })
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

  public toolBarFixation() {
    let toolbarButtons = document.querySelectorAll('.e-strike-through')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-strike-through') : null;
      toolbarButton ? toolbarButton.classList.add('e-strikethrough') : null;
    })  
    toolbarButtons = document.querySelectorAll('.e-sub-script')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-sub-script') : null;
      toolbarButton ? toolbarButton.classList.add('e-subscript') : null;
    })
    toolbarButtons = document.querySelectorAll('.e-super-script')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-super-script') : null;
      toolbarButton ? toolbarButton.classList.add('e-superscript') : null;
    })
    toolbarButtons = document.querySelectorAll('.e-justify-left')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-jutify-left') : null;
      toolbarButton ? toolbarButton.classList.add('e-align-left') : null;
    })
    toolbarButtons = document.querySelectorAll('.e-order-list')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-order-list') : null;
      toolbarButton ? toolbarButton.classList.add('e-list-ordered') : null;
    })
    toolbarButtons = document.querySelectorAll('.e-unorder-list')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-unorder-list') : null;
      toolbarButton ? toolbarButton.classList.add('e-list-unordered') : null;
    })
    toolbarButtons = document.querySelectorAll('.e-indent')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-indent') : null;
      toolbarButton ? toolbarButton.classList.add('e-increase-indent') : null;
    })
    toolbarButtons = document.querySelectorAll('.e-outdent')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-outdent') : null;
      toolbarButton ? toolbarButton.classList.add('e-decrease-indent') : null;
    })
    toolbarButtons = document.querySelectorAll('.e-create-link')
    toolbarButtons.forEach((toolbarButton) => {
      toolbarButton ? toolbarButton.classList.remove('e-create-link') : null;
      toolbarButton ? toolbarButton.classList.add('e-link') : null;
    })
  }

  public checkGrades() {
    console.log(this.selectedGrades)
  }
}
