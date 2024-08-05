import { Component } from '@angular/core';
import { StudentService } from '../../../../services/student.service';
import { ClassMetadataService, ClassMetaData } from '../../../../services/class-metadata.service';
import { TutorService } from '../../../../services/tutor.service';
import { NotificationTypes } from '../../../app.enums';
import { PageSettingsModel } from '@syncfusion/ej2-angular-grids';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { DialogComponent, DialogUtility } from '@syncfusion/ej2-angular-popups';
import { SelectItem } from '../../../../services/event.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-class-metadata',
  templateUrl: './class-metadata.component.html',
  styleUrls: ['./class-metadata.component.css'],
  providers: [StudentService],
})
export class ClassMetadataComponent {
  public Subjects: SelectItem[] = [];
  public TutorGrades: SelectItem[] = [];
  public classMetaData: ClassMetaData[] = [];
  public addClassDialogueBox: boolean = false;
  public insertClassData: ClassMetaData;
  public pageSettings?: PageSettingsModel;
  public dropdownFields: Object = { text: 'label', value: 'value' };
  public dialogInstance: any;
  public filterClasses!: ClassMetaData[];
  public CoreSubjects: any[] = [];
  public subjectTypeSelection:any[] = []
  public activeType: string = ''
  public subSubjects: any[] = []
  public grades:any[] = []
  public filterGrades:any[] = []
  public selectedRowData:any = {
    SubjectId: '',
    CoreSubjectId:'',
    GradeId:'',
  }

  public isAddData!:boolean;

  constructor(private studentService: StudentService,
    private tutorService: TutorService,
    private classMetaServices: ClassMetadataService,
    private toastr: ToastrService,
    private ngxSpinner: SpinnerService
  ) {
    this.insertClassData = new ClassMetaData();
  }

  ngOnInit() {
    this.viewClassMetaData();
    this.getTutorSubjects();
    this.getAllCoreSubjects();
    this.pageSettings = { pageSize: 6 };
  }

  public viewClassMetaData() {
    this.ngxSpinner.show();
    this.classMetaServices.viewClassMetaData().subscribe((response) => {
      this.ngxSpinner.hide();
      this.classMetaData = response;
      this.filterClasses = this.classMetaData;
      console.log(this.classMetaData);
      
    });
  }

  public getTutorSubjects() {
    this.ngxSpinner.show();
    this.studentService.getAllUserSubjects().subscribe((response) => {
      this.ngxSpinner.hide();
      this.Subjects = response;
    });
  }

  private viewUserGrades(subjectId: string) {
    this.studentService.viewUserGrades(subjectId).subscribe((response: SelectItem[]) => {
      this.TutorGrades = response;
      this.insertClassData.GradeId = response.map(p => p.value)[0]!;
    
    });
  }

  public addNewClass(type:string) {
    this.insertClassData = new ClassMetaData();
    this.insertClassData.SubjectId = '';
    this.addClassDialogueBox = true;
    this.isAddData = true
    this.filterSubjects('Primary')
  }

  public onSubjectChange(subjectId: any) {
    this.insertClassData.SubjectId = subjectId;
    if (this.insertClassData.SubjectId) {
      this.viewUserGrades(this.insertClassData.SubjectId);
    }
  }

  public onGradeChange(gradeId: any) {
    this.insertClassData.GradeId = gradeId;
  }

  public saveClassMetaData() {
    let saveData:ClassMetaData = {} as ClassMetaData 
    if(!this.isAddData) {
      saveData.Id = this.insertClassData.Id
      saveData.CoreSubjectId = this.insertClassData.CoreSubjectId;
      saveData.SubjectId = this.insertClassData.SubjectId;
      saveData.Title = this.insertClassData.Title;
      saveData.Description = this.insertClassData.Description;
      saveData.GradeId = this.insertClassData.GradeId;
      console.log(saveData)
    } else {
      saveData = this.insertClassData
      console.log(saveData)
    }
    this.ngxSpinner.show();
    this.classMetaServices.saveClassMetaData(saveData).subscribe((response) => {
      if (response.Success) {
        this.toastr.success(
          'Success',
          response.ResponseMessage
        );
        this.ngxSpinner.hide();
        this.addClassDialogueBox = false;
        this.insertClassData = new ClassMetaData();
        this.viewClassMetaData();
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
  public editMetaData(selectedRow:ClassMetaData) {
    this.isAddData = false
    this.addClassDialogueBox = true;
    this.insertClassData = { ...selectedRow };

    if (this.insertClassData.SubjectId) {
      console.log("Inside If")
      this.filterSubjects('Primary');
      // this.getSubSubjects(this.insertClassData.CoreSubjectId)
      // this.selectSubSubject(this.insertClassData.SubjectId)
    }
  }

  public deleteClassMetaData(selectedData: ClassMetaData) {
    this.dialogInstance = DialogUtility.confirm({
      title: 'Delete Confirmation',
      content: `Are you sure you want to delete this class metadata with Title ${selectedData.Title}?`,
      okButton: { text: 'Yes', click: this.confirmDelete.bind(this, selectedData) },
      cancelButton: { text: 'No' },
      showCloseIcon: true,
      closeOnEscape: true,
      animationSettings: { effect: 'Zoom' }
    });
  } 
  
  private confirmDelete(selectedData: ClassMetaData): void {
    this.ngxSpinner.show();
    this.classMetaServices.deleteClassMetaData(selectedData.Id).subscribe(
      (response) => {
        this.ngxSpinner.hide();
        if (response.Success) {
          this.viewClassMetaData();
          this.toastr.success(
            'Success',
            response.ResponseMessage
          );
        } else {
          this.toastr.error(
            'Error',
            response.ResponseMessage
          );
        }
        this.dialogInstance.hide();
      },
      (error) => {
        console.error('Error deleting class metadata:', error);
        this.ngxSpinner.hide();
        this.toastr.error(
          'Error',
        );
        this.dialogInstance.hide();
      }
    );
  }
  
  onDialogClose() {
    this.addClassDialogueBox = false;
    this.insertClassData.SubjectId = '';
    this.insertClassData = new ClassMetaData();
  }

  checkData(data:any) {
    console.log(data);
  }

  public filterSearch(event:Event) {
    this.filterClasses = this.classMetaData
    const inputElement = event.target as HTMLInputElement
    const inputValue = inputElement.value
    this.filterClasses = this.classMetaData.filter((data) => {
      if (data.Title.includes(inputValue) || data.Description.includes(inputValue) || data.SubjectName.includes(inputValue)) {
        return data
      }
      else {
        return undefined
      }
    })
  }

  public getAllCoreSubjects() {
    this.tutorService.getAllCoreSubjects(false).subscribe((subject: SelectItem[]) => {
      this.CoreSubjects = subject
      console.log(this.CoreSubjects)
    })
  }

  public getSubSubjects(event:any) {
    const CoreSubId = event.value ? event.value : event;
    this.tutorService.getSubSubjects(CoreSubId, false).subscribe((response) => {
      this.subSubjects = response
      console.log(response)
    })
  }

  public selectGrade(event:any) {
    console.log(event.value)
    this.insertClassData.GradeId = event.value
  }

  public filterSubjects(type:string){
    if (type === 'Primary') {
      this.subjectTypeSelection = this.CoreSubjects.filter((subject) => subject.IsPrimarySchool == true)
      this.subjectTypeSelection = this.subjectTypeSelection.map(subject => ({
        label:subject.Name,
        value:subject.Id
      }))
    
      this.filterGrades = this.grades.filter(grade => {
        const numericGrades = ['prep', '1', '2', '3', '4', '5', '6'];
        return numericGrades.includes(grade.label);        
      });
      this.activeType = type
    } else if(type ==='Secondary') {
      this.subjectTypeSelection = this.CoreSubjects.filter((subject) => subject.IsPrimarySchool == false);
      this.subjectTypeSelection = this.subjectTypeSelection.map(subject => ({
        label:subject.Name,
        value:subject.Id
      }))
      this.filterGrades = this.grades.filter(grade => {
        const numericGrades = ['7', '8', '9', '10', '11', '12'];
        return numericGrades.includes(grade.label);
      });
      this.activeType = type
    }
  }

  public selectSubSubject(event:any) {

    this.tutorService.getSubSubjectGrades(event.value, false).subscribe((response) => {
      this.grades = response
    })
  }
}

interface AddSubjects {
  SubjectId: string;
  Grades: any[];
}