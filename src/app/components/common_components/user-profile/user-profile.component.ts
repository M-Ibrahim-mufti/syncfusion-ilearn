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
import { TutorService, AddSubjects } from '../../../../services/tutor.service';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-user-profile',
  providers:[UsersService, StudentService,CheckBoxSelectionService ,ToolbarService, LinkService, ImageService, HtmlEditorService, QuickToolbarService ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})

export class UserProfileComponent {
  public user!: ApplicationViewStudent;
  // public subjects!: SelectItem[];
  // public grades: SelectItem[] = [];
  // public selectedGrades: any[] = []
  // public selectedSubjects: any[] = [];
  // public selectedSubjectGrades: any[] = [];
  public newProfileImage?: File;
  public meetings: ZoomMeetingDetail[] = []
  public UserEditProfileDialog = false
  isStudent: boolean = false;
  isTeacher: boolean = false;
  public StudentInfo: boolean = true 
  public authConfig!: AuthConfig;
  public logginUserId!: string;
  public  CoreSubjects: any[] = [];
  public subjectDrop:boolean = false
  public subjectTypeSelection:any[] = []
  public activeType: string = ''
  public subSubjects: string = ''
  public grades:any[] = [
    {label:'prep', value:'prep'},
    {label:'1', value:'1'},
    {label:'2', value:'2'},
    {label:'3', value:'3'},
    {label:'4', value:'4'},
    {label:'5', value:'5'},
    {label:'6', value:'6'},
    {label:'7', value:'7'},
    {label:'8', value:'8'},
    {label:'9', value:'9'},
    {label:'10', value:'10'},
    {label:'11', value:'11'},
    {label:'12', value:'12'},
  ]
  public filterGrades:any[] = []
  public AddSubject:AddSubjects = {
    SubjectId: '',
    Grades:[]
  }
  public selectedGrades:any[] = []
  public TutorSubjectAndGrades:any[] = []
  public toggleChangeButton:boolean = true
  public subSubjectUpdation:any[] = [];
  public subSubjectIndexes:any[] = [];
  public filterGradesForUpdation:any[] = [];
  public updateSubjectData:AddSubjects = {
    SubjectId:'',
    Grades:[]
  }
  public filterSubjectForUpdation:any[] =[];


  constructor(private UserService: UsersService,
    private spinner: SpinnerService,
    private toastr: ToastrService,
    private uploadingService: CloudinaryImageService,
    private authService: AuthService,
    private meetingService:ZoomMeetingService,
    private tutorSevice: TutorService,
    private tutorService:TutorService,
  ) { 
    this.isStudent = this.authService.isStudent()
    this.isTeacher = this.authService.isTeacher()
  }

  public mode:string = 'CheckBox';
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
    this.getAllCoreSubjects();
    this.getPreviousMeetings();
    this.getUserDetail();
  }

  public getUserDetail(){
    this.spinner.show();
    this.UserService.getUserDetail().subscribe(response =>{
      if(response){
        this.user = response;
        console.log(this.user)
        setTimeout(() => {
          this.toolBarFixation();
        },300)
        this.getAllTutorSubject();
      }
      if(this.authConfig.IsTeacher){
        this.tutorSevice.getTutorEditorDetails(this.logginUserId).subscribe((response) => {
          this.user.Certification = response.Certification;
          this.user.WorkHistory = response.WorkHistory;
          this.user.Qualifications = response.Qualifications;
        })
      }
      this.spinner.hide(); 
    })
  }

  public getAllTutorSubject() {
    this.tutorService.getAllSubjectandTheirGrades().subscribe((response) => {
      this.TutorSubjectAndGrades = response;
      console.log(response)
      let tutorSubjects: any[] = [];
      this.TutorSubjectAndGrades.forEach((subject)  => {
        let grades:any[] = subject.Grades;
        grades = grades.map((grade) => 
          ( this.grades.filter(innerGrade => {
              if(grade.GradeLevel == innerGrade.label) { 
                  return innerGrade
                }
            }).pop().label))
          tutorSubjects.push({
                CoreSubject: {
                  Name: subject.CoreSubjectName,
                  Id:subject.CoreSubjectId
                },
                SubSubject: {
                  label:subject.SubjectName,
                  value:subject.SubjectId
                },
                Grades:grades,
                isEditable: null
          })

      })
      this.TutorSubjectAndGrades = tutorSubjects;
    })
  }

  public callSubSubjectForUpdate(subjectId:string,index:number){
    const getData:any = this.CoreSubjects.filter((subject) => subject.Id === subjectId);
    if(getData.isPrimarySchool){
      this.filterGradesForUpdation = this.grades.filter(grade => {
        const primaryGrades = ['prep', '1', '2', '3', '4', '5', '6'];
        return primaryGrades.includes(grade.label);        
      });
    } else {
      this.filterGradesForUpdation = this.grades.filter(grade => {
        const secondaryGrades = ['7', '8', '9', '10', '11', '12'];
        return secondaryGrades.includes(grade.label);
      });
    }


    this.tutorService.getSubSubjects(subjectId).subscribe((response) => {
      this.subSubjectUpdation = response;
      this.TutorSubjectAndGrades.forEach((subject,innerIndex)=> {
        if(index !== innerIndex){
          subject.isEditable = false
        } else {
          subject.isEditable = true
        }
      })
      console.log(this.TutorSubjectAndGrades)
    })
  }
  public updationOnSubject(event:any) {
    this.updateSubjectData.SubjectId = event.value
  }

  public updationOnGrades(event:any) {
    this.updateSubjectData.Grades = event.value
  }

  public updateSubject(index:number){
    const updatedGrades:any[] = this.updateSubjectData.Grades;
    let newArr:any[] = []
    updatedGrades.forEach((grade) => {
      newArr.push({
        GradeLevel:grade
      })
    });
    console.log(this.updateSubjectData)
    this.updateSubjectData.Grades = newArr
    this.TutorSubjectAndGrades.forEach((subject, innerIndex) => {
      if(index === innerIndex ){
        subject.isEditable = true
      } else {
        subject.isEditable = true
      }
    })
  }

  public getAllCoreSubjects() {
    this.tutorService.getAllCoreSubjects().subscribe((subject: any[]) => {
      this.CoreSubjects = subject;
    })
  } 
  public getSubSubjects(event:any) {
    console.log("subjectId",event.value);    
    this.tutorService.getSubSubjects(event.value).subscribe((response) => {
      this.subSubjects = response
      console.log(this.subSubjects)
    })
  }
  public subjectBox() {
    this.subjectDrop = true
  }

  public filterSubjects(type:string){
    if (type === 'Primary') {
      this.subjectTypeSelection = this.CoreSubjects.filter((subject) => subject.IsPrimarySchool == true)
      this.subjectTypeSelection = this.subjectTypeSelection.map(subject => ({
        label:subject.Name,
        value:subject.Id
      }))
    
      this.filterGrades = this.grades.filter(grade => {
        const primaryGrades = ['prep', '1', '2', '3', '4', '5', '6'];
        return primaryGrades.includes(grade.label);        
      });
      console.log(this.filterGrades)
      this.activeType = type
    } else if(type ==='Secondary') {
      this.subjectTypeSelection = this.CoreSubjects.filter((subject) => subject.IsPrimarySchool == false);
      this.subjectTypeSelection = this.subjectTypeSelection.map(subject => ({
        label:subject.Name,
        value:subject.Id
      }))
      this.filterGrades = this.grades.filter(grade => {
        const secondaryGrades = ['7', '8', '9', '10', '11', '12'];
        return secondaryGrades.includes(grade.label);
      });
      this.activeType = type
    }
  }

  public selectSubSubject(event:any) {
    this.AddSubject.SubjectId = event.value
  }


  public saveSubject() {
    const newArr:any[] = []
    this.selectedGrades.forEach((grade) => {
        newArr.push({
          GradeLevel:grade
        })
    });
    this.AddSubject.Grades = newArr;
    console.log(this.AddSubject)
    this.spinner.show()
    this.tutorService.saveSubjects(this.AddSubject).subscribe((response) => {
      if(response) {
        this.toastr.success(
          'success',
          'Tutor Subject Saved Successfully'
        )
        this.getAllTutorSubject()
      }else {
        this.toastr.error(
          'error',
          'unable to save subject'
        )
      }  
      this.spinner.hide()
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
}

