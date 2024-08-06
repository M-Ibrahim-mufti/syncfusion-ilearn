import { Component } from '@angular/core';
import { PageSettingsModel } from '@syncfusion/ej2-angular-grids';
import { DialogUtility } from '@syncfusion/ej2-angular-popups';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ClassMetaData, ClassMetadataService } from '../../../../services/class-metadata.service';
import { SelectItem } from '../../../../services/event.service';
import { StudentService } from '../../../../services/student.service';
import { TutorService } from '../../../../services/tutor.service';
import { CoreSubjects, FetchSubjectRequestParam, Subject, SubjectGradesRequest, SubjectService } from '../../../../services/subject.service';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-subject',
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.css',
  providers: [CheckBoxSelectionService]
})
export class SubjectComponent {
  public Subjects: Subject[] = [];
  public addSubjectDialogueBox: boolean = false;
  public addSubjectGradeDialogueBox: boolean = false;
  public isCoreSubjectVisible: boolean = false;
  public insertSubjectData: Subject = {} as Subject ;
  public subjectGrades: SubjectGradesRequest = {} as SubjectGradesRequest; 
  public pageSettings?: PageSettingsModel;
  public dialogInstance: any;
  public filterSubjects: Subject[] = [];
  public coreSubjects: CoreSubjects [] = [];
  public AllSubjects: CoreSubjects [] = []
  public CoreSubjectId!: string;
  public showSubjects:boolean = false;
  public mode:string = 'CheckBox';
  public subjectType: any[] = [
    {label:'Primary', value:'Primary'},
    {label:'Secondary', value:'Secondary'},
  ]
  public isEditing: boolean = false
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
  public filterGrades:any[] = [];
  public SelectedGrades:any[] = []
  public filters: FetchSubjectRequestParam = {};

  constructor(private subjectService: SubjectService,
    private toastr: ToastrService,
    private ngxSpinner: SpinnerService
  ) { 
    this.insertSubjectData = new Subject();
  }

  ngOnInit() {
    this.viewSubjects();   
    this.getAllSubjects();
    // this.getTutorSubjects();
    this.pageSettings = { pageSize: 6 };
  }

  public getAllSubjects(){
    this.ngxSpinner.show();
    this.subjectService.getAllSubjects().subscribe((response: CoreSubjects[])=>{
      this.ngxSpinner.hide();
      this.AllSubjects = response;
    })
  }

  private viewSubjects(filters: FetchSubjectRequestParam = {}) {
    this.ngxSpinner.show();
    this.subjectService.getAllSubjectsOnAdminSide(filters).subscribe((response) => {
      this.ngxSpinner.hide();
      this.Subjects = response;
      this.filterSubjects = this.Subjects;     
    });
  }

  public addNewSubject() {
    this.insertSubjectData = new Subject();
    this.addSubjectDialogueBox = true;    
    this.switchToPrimary();
  }

  public saveSubject() {
    let data:any = {
        Id: '',
        CoreSubjectId: '',
        Name: '',
        Description: '',
        Grades: []
    }  as object
     
    data.Id = this.insertSubjectData.Id;
    data.CoreSubjectId = this.insertSubjectData.CoreSubjectId;
    data.Description = this.insertSubjectData.Description
    data.Name = this.insertSubjectData.Name
    data.Grades = this.SelectedGrades.map((grade) => ({
      GradeLevel: parseInt(grade,10)
    }))
    
    console.log(data);
    this.ngxSpinner.show();
    this.subjectService.saveSubject(data).subscribe((response) => {
      if (response.Success) {
        this.toastr.success(
          'Success',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
       this.onDialogClose();
        this.insertSubjectData = new Subject();
        this.viewSubjects();
      }
      else {
        this.toastr.error(
          'Error',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
      }
    })
  }

  public saveSubjectGrade() {
    const newGradeArr:any[] = []
    this.subjectGrades.Grades.forEach((grade) => {
      newGradeArr.push({
          GradeLevel:grade
        })
    });
    this.subjectGrades.Grades = newGradeArr;
    this.subjectGrades.SubjectId = this.insertSubjectData.Id;    
    this.ngxSpinner.show();
    this.subjectService.saveSubjectGrade(this.subjectGrades).subscribe((response) => {
      if (response.Success) {
        this.toastr.success(
          'Success',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
       this.onGradeDialogClose();
       this.subjectGrades = new SubjectGradesRequest();
      }
      else {
        this.toastr.error(
          'Error',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
      }
    })
  }

  public editSubject(selectedSubject: Subject, grades:any[]){
    this.addSubjectDialogueBox = true;
    this.isEditing = true
    
    this.insertSubjectData = selectedSubject;
    console.log(this.insertSubjectData.CoreSubjectId);
    this.insertSubjectData.Grades = [];
    this.SelectedGrades = grades.map((Grade) => {
      return Grade.GradeLevel.toLocaleString();
    })

    console.log("EDIT SUBJECT : ",selectedSubject)
    console.log("FITLER GRADES",this.filterGrades)
    if(selectedSubject.IsPrimarySchool) {
      this.switchToPrimary()
    } else {
      this.switchToHigh()
    } 
  }

  public addSubjectGrade(selectedRow: Subject){
    this.addSubjectGradeDialogueBox = true;
    

    if(selectedRow.IsPrimarySchool  ){
      this.filterGrades = [ '1', '2', '3', '4', '5', '6'];
    }
    else{
      this.filterGrades = ['7', '8', '9', '10', '11', '12'];
    }    
  
    this.insertSubjectData = selectedRow;     
  }

  public onGradeChange($event: any){    
    this.subjectGrades.Grades = $event.value
  }

  // public editMetaData(selectedRow: ClassMetaData) {
  //   this.addClassDialogueBox = true;
  //   this.insertClassData = { ...selectedRow };
  //   if (this.insertClassData.SubjectId) {
  //     this.viewUserGrades(this.insertClassData.SubjectId);
  //   }
  // }

  // public deleteClassMetaData(selectedData: ClassMetaData) {
  //   this.dialogInstance = DialogUtility.confirm({
  //     title: 'Delete Confirmation',
  //     content: `Are you sure you want to delete this class metadata with Title ${selectedData.Title}?`,
  //     okButton: { text: 'Yes', click: this.confirmDelete.bind(this, selectedData) },
  //     cancelButton: { text: 'No' },
  //     showCloseIcon: true,
  //     closeOnEscape: true,
  //     animationSettings: { effect: 'Zoom' }
  //   });
  // }

  // private confirmDelete(selectedData: ClassMetaData): void {
  //   this.ngxSpinner.show();
  //   this.classMetaServices.deleteClassMetaData(selectedData.Id).subscribe(
  //     (response) => {
  //       this.ngxSpinner.hide();
  //       if (response.Success) {
  //         this.viewClassMetaData();
  //         this.toastr.success(
  //           'Success',
  //           response.ResponseMessage
  //         );
  //       } else {
  //         this.toastr.error(
  //           'Error',
  //           response.ResponseMessage
  //         );
  //       }
  //       this.dialogInstance.hide();
  //     },
  //     (error) => {
  //       console.error('Error deleting class metadata:', error);
  //       this.ngxSpinner.hide();
  //       this.toastr.error(
  //         'Error',
  //       );
  //       this.dialogInstance.hide();
  //     }
  //   );
  // }

  onDialogClose() {
    this.addSubjectDialogueBox = false;
    this.insertSubjectData = new Subject();
  }
  onGradeDialogClose() {
    this.addSubjectGradeDialogueBox = false;
    this.subjectGrades = new SubjectGradesRequest();
  }

  // checkData(data: any) {
  //   console.log(data);
  // }

  public filterSearch(event: Event) {
    // this.filterSubjects = this.Subjects;
    // const inputElement = event.target as HTMLInputElement
    // const inputValue = inputElement.value;
    
    // this.filterSubjects = this.Subjects.filter((data) => {   
    //   if (data.Name.includes(inputValue) || data.CoreSubjectName.includes(inputValue) ) {
    //     if(data.Description !== null) {
    //       if(data.Description.includes(inputValue)){
    //         return data
    //       }
    //     }
    //     return data
    //   }
    //   else {
    //     if(data.Description !== null) {
    //       if (data.Description.includes(inputValue)){
    //         return data
    //       }
    //     }
    //     return undefined
    //   }
    // })

    if (this.filters.Query && this.filters.Query.length >= 3) {
      this.viewSubjects(this.filters);
    }
  }

  // public onPrimayChange(){
  //   this.courseSubjects = this.AllSubjects.filter(p=>p.IsPrimarySchool === true)
  //   console.log("courseSubjects",this.courseSubjects)
  //   this.isCoreSubjectVisible = true
  // }

  // public onHighChange(){
  //   this.courseSubjects = this.AllSubjects.filter(p=>p.IsPrimarySchool === false)
  //   console.log("courseSubjects",this.courseSubjects)
  //   this.isCoreSubjectVisible = true
  // }

  public onCoreSubject(event: any){
     if(event.target.value != null){
       this.CoreSubjectId = event.target.value;
       this.filters.CoreSubjectId = this.CoreSubjectId;          
       this.viewSubjects(this.filters);
     }
  }

  public onSubjectType(event: any){
    this.filters.SubjectType = event.target.value;
    this.viewSubjects(this.filters);
 }

 public clearAll(){
  this.viewSubjects();
  this.filters = {};
  this.filters.SubjectType = '';
  this.insertSubjectData = new Subject();
 }

  switchToPrimary() {
    console.log("subjects",this.AllSubjects);
    this.filterGrades = ['prep', '1', '2', '3', '4', '5', '6'];
    this.coreSubjects = this.AllSubjects.filter(p=>p.IsPrimarySchool === true)
    this.isCoreSubjectVisible = true
    this.showSubjects = false;    
  }

  switchToHigh() {
    this.coreSubjects = this.AllSubjects.filter(p=>p.IsPrimarySchool === false)
    this.filterGrades = ['7', '8', '9', '10', '11', '12'];  
    this.isCoreSubjectVisible = true
    this.showSubjects = true;
  }
}
