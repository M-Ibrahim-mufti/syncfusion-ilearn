// import { Component } from '@angular/core';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { NotificationsService } from '../../../../services/Shared/notifications.service';
// import { StudentService } from '../../../../services/student.service';
// import { NotificationTypes } from '../../../app.enums';
// import { SaveTutorRequest, TutorService, TutorSubject } from '../../../../services/tutor.service';
// import { CloudinaryImageService } from '../../../../services/cloudinary-image.service';

// @Component({
//   selector: 'app-tutor-registration',
//   templateUrl: './tutor-registration.component.html',
//   styleUrl: './tutor-registration.component.css',
//   providers: [TutorService]
// })
// export class TutorRegistrationComponent {
//   tutor: SaveTutorRequest = {} as SaveTutorRequest;
//   activeIndex: number = 0;
//   currentSelectedImage?: File;
//   selectedSubjects: any[] = [];

//   stepValues = [
//     { label: 'Personl Detail' },
//     { label: 'Policy Check' },
//     { label: 'Subjects & Availability' },
//   ];

//   constructor(private ngxSpinnerService: NgxSpinnerService,
//     private notificationsService: NotificationsService,
//     private uploadService: CloudinaryImageService,
//     private tutorService: TutorService) { }

//   handleSelectedSubjectsChange(selectedSubjects: any[]) {
//     this.selectedSubjects = selectedSubjects;
//   }

//   public next() {
//     if (this.activeIndex < this.stepValues.length - 1) {
//       this.activeIndex++;
//     }
//   }

//   public back() {
//     this.activeIndex--;
//   }

//   private updateTutorSubjects() {
//     this.tutor.TutorSubjects = this.selectedSubjects.map((selectedSubject, index) => {
//       return {
//         Id: null, // or appropriate value
//         TutorId: null, // or appropriate value
//         SubjectId: selectedSubject.selectedSubject ? selectedSubject.selectedSubject.Id : null,
//         Grades: selectedSubject.selectedGrades
//       } as unknown as TutorSubject;
//     });
//   }

//   public register() {
//     this.updateTutorSubjects()
//     // let selectedSubjects = this.selectedSubjects
//     // this.tutor.TutorSubjects[0].SubjectId = selectedSubjects[0].value;

//     this.ngxSpinnerService.show();
//     this.tutorService.saveTutor(this.tutor).subscribe(
//       (response) => {
//         this.ngxSpinnerService.hide();
//         if (response.Success) {
//           this.notificationsService.showNotification(
//             'Success',
//             response.ResponseMessage,
//             NotificationTypes.Success
//           );
//         } else {
//           this.notificationsService.showNotification(
//             'Error',
//             response.ResponseMessage,
//             NotificationTypes.Error
//           );
//         }
//       },
//       (error) => {
//         this.ngxSpinnerService.hide();
//       }
//     );
//   }

//   public onFileSelected(files: File[], isAdditionalImage: boolean) {
//     if (files.length > 0) {
//       this.currentSelectedImage = files[0];
//       const isImage: boolean = this.currentSelectedImage['type'].includes('image');
//       const formData = new FormData();
//       formData.append('ImageFile', this.currentSelectedImage);
//       if (isImage) {
//         this.uploadService.uploadImage(formData).subscribe((imgUrl) => {
//           this.tutor.ImgUrl = imgUrl;
//         })
//       }
//     }
//   }

//   public removeImg($event: any) {
//     this.tutor.ImgUrl = null!;
//   }

// }
