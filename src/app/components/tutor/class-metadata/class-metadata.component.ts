import { NotificationsService } from './../../../../services/Shared/notifications.service';
import { Component } from '@angular/core';
import { StudentService } from '../../../../services/student.service';
import { ClassMetadataService, ClassMetaData } from '../../../../services/class-metadata.service';
import { TutorService } from '../../../../services/tutor.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService, SelectItem } from 'primeng/api';
import { NotificationTypes } from '../../../app.enums';
import { PageSettingsModel } from '@syncfusion/ej2-angular-grids';

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

  constructor(private studentService: StudentService,
    private tutorService: TutorService,
    private classMetaServices: ClassMetadataService,
    private notificationsService: NotificationsService,
    private ngxSpinner: NgxSpinnerService
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
      this.insertClassData.GradeId = response.map(p => p.value)[0];
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
    console.log(this.insertClassData)
    this.classMetaServices.saveClassMetaData(this.insertClassData).subscribe((response) => {
      if (response.Success) {
        this.notificationsService.showNotification(
          'Success',
          response.ResponseMessage,
          NotificationTypes.Success
        );
        this.addClassDialogueBox = false;
        this.insertClassData = new ClassMetaData();
      }
      else {
        this.notificationsService.showNotification(
          'Error',
          response.ResponseMessage,
          NotificationTypes.Error
        );
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
    this.ngxSpinner.show();
    this.classMetaServices.deleteClassMetaData(selectedData.Id).subscribe(
      (response) => {
        this.ngxSpinner.hide();
        if (response.Success) {
          this.viewClassMetaData();
          this.notificationsService.showNotification(
            'Success',
            response.ResponseMessage,
            NotificationTypes.Success
          );
        } else {
          this.notificationsService.showNotification(
            'Error',
            response.ResponseMessage,
            NotificationTypes.Error
          );
        }
      },
      (error) => {
        console.error('Error deleting student:', error);
        this.ngxSpinner.hide();
        this.notificationsService.showNotification(
          'Error',
          'An error occurred while deleting student. Please try again later.',
          NotificationTypes.Error
        );
      }
    );
  }

  onDialogClose() {
    this.addClassDialogueBox = false;
    this.insertClassData.SubjectId = '';
    this.insertClassData = new ClassMetaData();
  }
}
