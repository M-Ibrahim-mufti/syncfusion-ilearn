import { Component } from '@angular/core';
// import { MessageService, SelectItem } from 'primeng/api';
import { CloudinaryImageService } from '../../../../services/cloudinary-image.service';
import { StudentRegistrationModel, StudentService } from '../../../../services/student.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
// import { NotificationsService } from '../../../../services/Shared/shared.utility.service'
import { NotificationTypes } from '../../../app.enums';
import { SelectItem } from '../../../../services/event.service';
import { StepperChangedEventArgs } from "@syncfusion/ej2-navigations";
import { ToastrService } from 'ngx-toastr';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

interface Subject {
  name: string
}

@Component({
  selector: 'app-student-registration',
  templateUrl: './student-registration.component.html',
  styleUrl: './student-registration.component.css',
})
export class StudentRegistrationComponent {
  public activeIndex: number = 0;
  public enableCropper: boolean = true;
  public currentSelectedImage?: File;  //this is the image that will be displayed on the image cropper
  public showCropperDialog: boolean = false;  //show cropper
  public isAdditionalImage: boolean = false;
  public studentRegistrationForm: StudentRegistrationModel = {} as StudentRegistrationModel;
   public stepItems: { title: string, content: string }[] = [
    { title: 'Step 1', content: 'Step 1 Content' },
    { title: 'Step 2', content: 'Step 2 Content' },
    // Add more steps as needed
  ];  // Step navigation model
  public stepValues = [
    { label: 'Parent/Guardian Details' },
    { label: 'Student Details' },
    // Add more steps if needed
  ];
  public uploadedFiles: any[] = [];
  public subjects: SelectItem[] = [];

  public selectedSubjects: SelectItem[] = [];

  ngOnInit() {
    this.getAllSubjects()
  }

  constructor(
    // private messageService: MessageService,
    private uploadService: CloudinaryImageService,
    private spinnerService: SpinnerService,
    // private ngxSpinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private studentService: StudentService) { }

  // Panel header based on active index
  get panelHeader(): string {
    return this.activeIndex === 0 ? 'Parent Registration' : 'Student Registration';
  }

  public stepChanged(args: StepperChangedEventArgs): void {
    this.activeIndex = args.activeStep;
  }
  public next() {
    if (this.activeIndex < this.stepValues.length - 1) {
      this.activeIndex++;
    }
  }

  public back() {
    this.activeIndex--;
  }

  private getAllSubjects() {
    this.spinnerService.show();
    this.studentService.getAllSubjects().subscribe((subject: SelectItem[]) => {
      this.subjects = subject;
      console.log(this.subjects);

      this.spinnerService.hide();
    }, (error) => { this.spinnerService.hide(); });
  }

  public register() {
    this.spinnerService.show();
    this.studentRegistrationForm.StudentSubjectIds = this.selectedSubjects.map(p => p.value);
    console.log(this.studentRegistrationForm)
    this.studentService.saveStudent(this.studentRegistrationForm).subscribe(
      (response) => {
        this.spinnerService.hide();
        if (response.Success) {
          this.toastr.success('success', response.ResponseMessage);
          this.studentRegistrationForm = new StudentRegistrationModel();
        } else {
          this.toastr.error('Error', response.ResponseMessage);
        }
      },
      (error) => {
        this.spinnerService.hide();
      }
    );
  }

  public onFileSelected(files: File[], isAdditionalImage: boolean) {
    if (files.length > 0) {
      this.currentSelectedImage = files[0];
      const isImage: boolean = this.currentSelectedImage['type'].includes('image');
      const formData = new FormData();
      formData.append('ImageFile', this.currentSelectedImage);
      if (isImage) {
        this.uploadService.uploadImage(formData).subscribe((imgUrl) => {
          this.studentRegistrationForm.StudentImgUrl = imgUrl;
        })
      }
    }
  }
  public onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("ImageFile", file)
      this.uploadService.uploadImage(formData).subscribe((response) => {
        this.studentRegistrationForm.StudentImgUrl = response
      })

    }
  }

  public removeImg($event: any) {
    this.studentRegistrationForm.StudentImgUrl = null!;
  }

}
