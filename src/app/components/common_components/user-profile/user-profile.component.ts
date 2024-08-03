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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  providers:[UsersService, StudentService,CheckBoxSelectionService ,ToolbarService, LinkService, ImageService, HtmlEditorService, QuickToolbarService ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})

export class UserProfileComponent {
  public user!: ApplicationViewStudent;

  public newProfileImage?: File;
  public meetings: ZoomMeetingDetail[] = []
  public UserEditProfileDialog = false
  isStudent: boolean = false;
  isTeacher: boolean = false;
  public StudentInfo: boolean = true 
  public authConfig!: AuthConfig;
  public logginUserId!: string;
  public  CoreSubjects: any[] = [];
  public toggleAddSubDialogue:boolean = false
  public subjectTypeSelection:any[] = []
  public activeType: string = ''
  public subSubjects: any[] = []
  public grades:any[] = []
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
  public enableGradesFiels:boolean = false;
  public userId!: string;
  public dialogType:string = ''
  public selectedSubject:any;
  public currentSubjectIndex:number = 0

  constructor(private UserService: UsersService,
    private spinner: SpinnerService,
    private toastr: ToastrService,
    private uploadingService: CloudinaryImageService,
    private authService: AuthService,
    private meetingService:ZoomMeetingService,
    private tutorSevice: TutorService,
    private tutorService:TutorService,
    private route: ActivatedRoute
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
   this.userId = this.route.snapshot.paramMap.get('id')!;    
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
    this.UserService.getUserDetail(this.userId).subscribe(response =>{
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
        // grades = grades.map((grade) => 
        //   ( this.grades.filter(innerGrade => {
        //       if(grade.GradeLevel == innerGrade.label) { 
        //           return innerGrade
        //         }
        //     }).pop().label))
          grades = grades.map((grade) => {
            return grade.GradeLevel
          })
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
      console.log(this.TutorSubjectAndGrades);
      
    })
  }

  public callSubSubjectForUpdate(subjectId:string,SubSubjectId:string,index:number){
    const getData:any = this.CoreSubjects.filter((subject) => subject.Id === subjectId);
    console.log(getData)
    this.tutorService.getSubSubjectGrades(SubSubjectId).subscribe((response) => {
      this.filterGradesForUpdation = response;
      console.log(response)
      this.filterGradesForUpdation = this.filterGradesForUpdation.map((grade) => {
        return parseInt(grade.label,10)
      })
      this.filterGradesForUpdation.sort((a,b) => a - b);
    })

    this.tutorService.getSubSubjects(subjectId, true).subscribe((response) => {
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
    this.tutorService.getSubSubjectGrades(event.value).subscribe((response) => {
      this.filterGradesForUpdation = response;
      console.log(response)
      this.filterGradesForUpdation = this.filterGradesForUpdation.map((grade) => {
        return parseInt(grade.label,10)
      })
      this.filterGradesForUpdation.sort((a,b) => a - b);
    })
  }

  public updationOnGrades(event:any) {
    this.updateSubjectData.Grades = event.value
    console.log(this.updateSubjectData)
  }

  public updateSubject(){

    if(!this.updateSubjectData.SubjectId) {
      this.updateSubjectData.SubjectId = this.selectedSubject.SubSubject.Id;
    }
    console.log(this.updateSubjectData)
    if(this.updateSubjectData.Grades.length === 0) {
      let grades:any[] = []
      grades = grades.map((grade) => {
        return grade.label;
      })
      this.updateSubjectData.Grades = this.selectedSubject.Grades;
    }
    const updatedGrades:any[] = this.updateSubjectData.Grades;
    let newArr:any[] = []
    updatedGrades?.forEach((grade) => {
      newArr.push({
        GradeLevel:grade.toLocaleString()
      })
    });
    this.spinner.show();
    console.log(this.updateSubjectData);    
    this.tutorService.saveSubjects(this.updateSubjectData).subscribe((response) => {
      if(response){
        this.updateSubjectData.Grades = newArr
        this.toastr.success('success', 'subject updated successfully');
      }
      else {
        this.toastr.error('error', 'unable to update subject')
      }
      this.spinner.hide()
    })
  }

  public getAllCoreSubjects() {
    this.tutorService.getAllCoreSubjects(true).subscribe((subject: any[]) => {
      this.CoreSubjects = subject
      console.log(this.CoreSubjects)
    })
  } 
  public getSubSubjects(event:any) {
    this.tutorService.getSubSubjects(event.value,true).subscribe((response) => {
      this.subSubjects = response
      console.log(this.subSubjects)
    })
  }
  public AddSubjectDialogue(typeOfDialog:string, subject:any = null, index:number = 0) {
    this.toggleAddSubDialogue = true
    this.dialogType = typeOfDialog
    this.selectedSubject = subject
    console.log(this.selectedSubject)
    if(this.dialogType === 'EditSubject'){
      this.callSubSubjectForUpdate(subject.CoreSubject.Id, subject.SubSubject.value, index)
    }

  }
  public CloseAddSubjectDialogue() {
    this.toggleAddSubDialogue = false
    this.dialogType = ''  
    this.subjectTypeSelection = [];
    this.subSubjects = [];
    this.subSubjectUpdation = [];
    this.grades = [];
    this.filterGradesForUpdation = [];
    this.activeType = '';
    this.updateSubjectData.SubjectId = '';
    this.updateSubjectData.Grades = []
  }

  public filterSubjects(type:string){
    if (type === 'Primary') {
      this.subjectTypeSelection = this.CoreSubjects.filter((subject) => subject.IsPrimarySchool == true)
      this.subjectTypeSelection = this.subjectTypeSelection.map(subject => ({
        label:subject.Name,
        value:subject.Id
      }))
      this.activeType = type
    } else if(type ==='Secondary') {
      this.subjectTypeSelection = this.CoreSubjects.filter((subject) => subject.IsPrimarySchool == false);
      this.subjectTypeSelection = this.subjectTypeSelection.map(subject => ({
        label:subject.Name,
        value:subject.Id
      }))
      this.activeType = type
    }
  }

  public selectSubSubject(event:any) {
    this.AddSubject.SubjectId = event.value
    this.tutorService.getSubSubjectGrades(event.value).subscribe((response) => {
      this.grades = response
      this.grades = this.grades.map((grade) => {
        return grade.label
      })
      this.grades.sort((a,b) => parseInt(a) - parseInt(b))
      console.log(this.grades)

    })
  }

  public selectGrades(event:any) {
    this.selectedGrades = event.value;
    console.log(this.selectedGrades);
    
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

