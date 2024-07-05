// import { Component } from '@angular/core';
// import { MessageService, SelectItem } from 'primeng/api';
// import { CloudinaryImageService } from '../../../../services/cloudinary-image.service';
// import { StudentRegistrationModel, StudentService } from '../../../../services/student.service';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { NotificationsService } from '../../../../services/Shared/notifications.service';
// import { NotificationTypes } from '../../../app.enums';

// interface UploadEvent {
//   originalEvent: Event;
//   files: File[];
// }

// interface Subject {
//   name: string
// }

// @Component({
//   selector: 'app-student-registration',
//   templateUrl: './student-registration.component.html',
//   styleUrl: './student-registration.component.css',
//   providers: [CloudinaryImageService, StudentService]
// })
// export class StudentRegistrationComponent {
//   public activeIndex: number = 0;
//   public enableCropper: boolean = true;
//   public currentSelectedImage?: File;  //this is the image that will be displayed on the image cropper
//   public showCropperDialog: boolean = false;  //show cropper
//   public isAdditionalImage: boolean = false;
//   public studentRegistrationForm: StudentRegistrationModel = {} as StudentRegistrationModel;

//   // Step navigation model
//   public stepValues = [
//     { label: 'Parent/Guardian Details' },
//     { label: 'Student Details' },
//     // Add more steps if needed
//   ];
//   public uploadedFiles: any[] = [];
//   public subjects: SelectItem[] = [];

//   public selectedSubjects: SelectItem[] = [];

//   ngOnInit() {
//     this.getAllSubjects()
//   }

//   constructor(private messageService: MessageService,
//     private uploadService: CloudinaryImageService,
//     private ngxSpinnerService: NgxSpinnerService,
//     private notificationsService: NotificationsService,
//     private studentService: StudentService) { }

//   // Panel header based on active index
//   get panelHeader(): string {
//     return this.activeIndex === 0 ? 'Parent Registration' : 'Student Registration';
//   }

//   public next() {
//     if (this.activeIndex < this.stepValues.length - 1) {
//       this.activeIndex++;
//     }
//   }
  
//   public back() {
//     this.activeIndex--;
//   }

//   private getAllSubjects() {
//     this.ngxSpinnerService.show();
//     this.studentService.getAllSubjects().subscribe((subject: SelectItem[]) => {
//       this.subjects = subject;
//       console.log(this.subjects);
      
//       this.ngxSpinnerService.hide();
//     }, (error) => { this.ngxSpinnerService.hide(); });
//   }
   
//   public register() {
//     this.ngxSpinnerService.show();
//     this.studentRegistrationForm.StudentSubjectIds = this.selectedSubjects.map(p => p.value);
//     this.studentService.saveStudent(this.studentRegistrationForm).subscribe(
//       (response) => {
//         this.ngxSpinnerService.hide();
//         if (response.Success) {
//           this.notificationsService.showNotification(
//             'Success',
//             response.ResponseMessage,
//             NotificationTypes.Success
//           );
//           this.studentRegistrationForm = new StudentRegistrationModel();
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
//           this.studentRegistrationForm.StudentImgUrl = imgUrl;
//         })
//       }
//     }
//   }

//   public removeImg($event: any) {
//     this.studentRegistrationForm.StudentImgUrl = null!;
//   }

// }
