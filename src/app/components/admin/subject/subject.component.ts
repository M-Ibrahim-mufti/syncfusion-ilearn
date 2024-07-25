import { Component } from '@angular/core';
import { PageSettingsModel } from '@syncfusion/ej2-angular-grids';
import { DialogUtility } from '@syncfusion/ej2-angular-popups';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { ClassMetaData, ClassMetadataService } from '../../../../services/class-metadata.service';
import { SelectItem } from '../../../../services/event.service';
import { StudentService } from '../../../../services/student.service';
import { TutorService } from '../../../../services/tutor.service';
import { CoreSubjects, Subject, SubjectService } from '../../../../services/subject.service';

@Component({
  selector: 'app-subject',
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.css'
})
export class SubjectComponent {
  public Subjects: Subject[] = [];
  public addSubjectDialogueBox: boolean = false;
  public isCoreSubjectVisible: boolean = false;
  public insertSubjectData!:Subject; 
  public pageSettings?: PageSettingsModel;
  public dialogInstance: any;
  public filterSubjects: Subject[] = [];
  public coreSubjects: CoreSubjects [] = [];
  public AllSubjects: CoreSubjects [] = []
  public CoreSubjectId!: string;
  public showSubjects:boolean = false;

  constructor(private subjectService: SubjectService,
    private toastr: ToastrService,
    private ngxSpinner: SpinnerService
  ) { 
    this.insertSubjectData = new Subject();
  }

  ngOnInit() {
    this.viewSubjects();
    this.getAllSubjects();
    this.switchToPrimary();
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

  public viewSubjects() {
    this.ngxSpinner.show();
    this.subjectService.getAllSubjectsOnAdminSide().subscribe((response) => {
      this.ngxSpinner.hide();
      this.Subjects = response;
      this.filterSubjects = this.Subjects
      console.log(this.filterSubjects)
    });
  }

  public addNewSubject() {
    this.insertSubjectData = new Subject();
    this.addSubjectDialogueBox = true;
    this.switchToPrimary();
  }

  public saveSubject() {
    this.insertSubjectData.CoreSubjectId = this.CoreSubjectId
    console.log(this.insertSubjectData)
    if(!this.insertSubjectData.Id){
      this.insertSubjectData.Id = ''
    }
    this.ngxSpinner.show();
    this.subjectService.saveSubject(this.insertSubjectData).subscribe((response) => {
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

  public editSubject(selectedSubject: Subject){
    this.addSubjectDialogueBox = true;
    this.insertSubjectData = selectedSubject;
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

  // checkData(data: any) {
  //   console.log(data);
  // }

  public filterSearch(event: Event) {
    this.filterSubjects = this.Subjects;
    const inputElement = event.target as HTMLInputElement
    const inputValue = inputElement.value;
    
    this.filterSubjects = this.Subjects.filter((data) => {   
      if (data.Name.includes(inputValue)) {
        if(data.Description !== null) {
          if(data.Description.includes(inputValue)){
            return data
          }
        }
        return data
      }
      else {
        if(data.Description !== null) {
          if (data.Description.includes(inputValue)){
            return data
          }
        }
        return undefined
      }
    })
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

  public onCoreSubject($event: any){
     //console.log($event.value.Id)
     if($event.value != null){
      //  if(!$event.value.Id){
      //   return
      //  }
       this.CoreSubjectId = $event.value.Id
     }
  }

  switchToPrimary() {
    this.coreSubjects = this.AllSubjects.filter(p=>p.IsPrimarySchool === true)
    this.isCoreSubjectVisible = true
    this.showSubjects = false;    
  }

  switchToHigh() {
    this.coreSubjects = this.AllSubjects.filter(p=>p.IsPrimarySchool === false)
    this.isCoreSubjectVisible = true
    this.showSubjects = true;
  }
}
