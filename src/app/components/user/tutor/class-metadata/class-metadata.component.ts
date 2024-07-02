import { NotificationsService } from './../../../../../services/Shared/notifications.service';
import { Component } from '@angular/core';
import { StudentService } from '../../../../../services/student.service';
import { ClassMetadataService, ClassMetaData } from '../../../../../services/class-metadata.service';
import { TutorService } from '../../../../../services/tutor.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SelectItem } from 'primeng/api';
import { NotificationTypes } from '../../../../app.enums';

@Component({
  selector: 'app-class-metadata',
  providers: [StudentService],
  templateUrl: './class-metadata.component.html',
  styleUrls: ['./class-metadata.component.css']
})
export class ClassMetadataComponent {
  public Subjects: SelectItem[] = [];
  public TutorGrades : SelectItem[] = [];
  public classMetaData: ClassMetaData[] = [];
  public addClassDialogueBox: boolean = false;
  public insertClassData: ClassMetaData = {} as ClassMetaData;

  constructor(private studentService: StudentService,
              private tutorService: TutorService,
              private classMetaServices: ClassMetadataService,
              private notificationsService: NotificationsService,
              private ngxSpinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.viewClassMetaData();
    this.getTutorSubjects();    
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
      this.Subjects = response
    });
  }

  private viewUserGrades(subjectId: string) {
    this.studentService.viewUserGrades(subjectId).subscribe((response) => {
      this.TutorGrades = response
    });
  }

  toggleClassDialogueBox() {
    this.addClassDialogueBox = !this.addClassDialogueBox
  }
  
  public onSubjectChange(event: any){   
    this.insertClassData.SubjectId = event.value;
    if(this.insertClassData.SubjectId){
      this.viewUserGrades(this.insertClassData.SubjectId);
    }
  }

  public onGradeChange(event: any){   
    this.insertClassData.GradeId = event.value;
  }

  public saveClassMetaData() {    
    console.log(this.insertClassData) 
    this.classMetaServices.saveClassMetaData(this.insertClassData).subscribe((response) => {
      if(response.Success){
        this.notificationsService.showNotification(
          'Success',
          response.ResponseMessage,
          NotificationTypes.Success
        );
        this.addClassDialogueBox = false;
        this.insertClassData = new ClassMetaData();
      }
      else{
        this.notificationsService.showNotification(
          'Error',
          response.ResponseMessage,
          NotificationTypes.Error
        );
      }
    })
  }
  addOutline() {
    this.insertClassData.CourseOutline.push({
      Id: '',
      ClassId: '',
      SectionTitle: '',
      SectionDescription: '',
      Order: this.insertClassData.CourseOutline.length + 1
    });
  }

  removeOutline(index: number) {
    this.insertClassData.CourseOutline.splice(index, 1);
  }


}
