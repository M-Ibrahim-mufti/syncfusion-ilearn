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

    this.pageSettings = { pageSize: 6 };
  }

  public viewClassMetaData() {
    this.ngxSpinner.show();
    this.classMetaServices.viewClassMetaData().subscribe((response) => {
      this.ngxSpinner.hide();
      this.classMetaData = response;
      this.filterClasses = this.classMetaData;
      console.log(this.classMetaData)
    });
  }

  public getTutorSubjects() {
    this.ngxSpinner.show();
    this.studentService.getAllUserSubjects().subscribe((response) => {
      this.ngxSpinner.hide();
      this.Subjects = response;
      console.log(response);
      
    });
  }

  private viewUserGrades(subjectId: string) {
    this.studentService.viewUserGrades(subjectId).subscribe((response: SelectItem[]) => {
      this.TutorGrades = response;
      this.insertClassData.GradeId = response.map(p => p.value)[0]!;
    });
  }

  public addNewClass() {
    this.insertClassData = new ClassMetaData();
    this.insertClassData.SubjectId = '';
    console.log("data", this.insertClassData);
    this.addClassDialogueBox = true;
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
    this.ngxSpinner.show();
    this.classMetaServices.saveClassMetaData(this.insertClassData).subscribe((response) => {
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
  public editMetaData(selectedRow: ClassMetaData) {
    this.addClassDialogueBox = true;
    this.insertClassData = { ...selectedRow };
    if (this.insertClassData.SubjectId) {
      this.viewUserGrades(this.insertClassData.SubjectId);
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
}

