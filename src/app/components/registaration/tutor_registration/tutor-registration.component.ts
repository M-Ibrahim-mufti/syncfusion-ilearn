import { Component } from '@angular/core';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
// import { NotificationsService } from '../../../../services/Shared/notifications.service';
import { StudentService } from '../../../../services/student.service';
import { NotificationTypes } from '../../../app.enums';
import { SaveTutorRequest, TutorService, TutorSubject } from '../../../../services/tutor.service';
import { CloudinaryImageService } from '../../../../services/cloudinary-image.service';
import { StepperChangedEventArgs } from "@syncfusion/ej2-navigations";

@Component({
  selector: 'app-tutor-registration',
  templateUrl: './tutor-registration.component.html',
  styleUrl: './tutor-registration.component.css',
  providers: [TutorService]
})
export class TutorRegistrationComponent {
  tutor: SaveTutorRequest = {} as SaveTutorRequest;
  activeIndex: number = 0;
  currentSelectedImage?: File;
  selectedSubjects: any[] = [];

  stepValues = [
    { label: 'Personl Detail' },
    { label: 'Policy Check' },
    { label: 'Subjects & Availability' },
  ];

  constructor(private spinnerService: SpinnerService,
    // private notificationsService: NotificationsService,
    private uploadService: CloudinaryImageService,
    private tutorService: TutorService) { }

  public stepChanged(args: StepperChangedEventArgs): void {
    this.activeIndex = args.activeStep;
  }

  handleSelectedSubjectsChange(selectedSubjects: any[]) {
    this.selectedSubjects = selectedSubjects;
    console.log(this.selectedSubjects)
  }

  public next() {
    if (this.activeIndex < this.stepValues.length - 1) {
      this.activeIndex++;
    }
  }

  public back() {
    this.activeIndex--;
  }

  private updateTutorSubjects() {
    this.tutor.TutorSubjects = this.selectedSubjects.map((selectedSubject, index) => {
      return {
        Id: null, // or appropriate value
        TutorId: null, // or appropriate value
        SubjectId: selectedSubject.selectedSubject ? selectedSubject.selectedSubject.Id : null,
        Grades: selectedSubject.selectedGrades
      } as unknown as TutorSubject;
    });
  }

  public register() {
    this.updateTutorSubjects()
    // let selectedSubjects = this.selectedSubjects
    // this.tutor.TutorSubjects[0].SubjectId = selectedSubjects[0].value;

    this.spinnerService.show();
    this.tutorService.saveTutor(this.tutor).subscribe(
      (response) => {
        this.spinnerService.hide();
        if (response.Success) {
          // this.notificationsService.showNotification(
          //   'Success',
          //   response.ResponseMessage,
          //   NotificationTypes.Success
          // );
        } else {
          // this.notificationsService.showNotification(
          //   'Error',
          //   response.ResponseMessage,
          //   NotificationTypes.Error
          // );
        }
      },
      (error) => {
        this.spinnerService.hide();
      }
    );
  }
  
  public onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("ImageFile", file)
      this.uploadService.uploadImage(formData).subscribe((response) => {
        this.tutor.ImgUrl = response
      })

    }
  }

  public removeImg($event: any) {
    this.tutor.ImgUrl = null!;
  }

}
