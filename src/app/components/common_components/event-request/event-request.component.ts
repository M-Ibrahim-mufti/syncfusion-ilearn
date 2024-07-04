import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import { RequestBooking, SlotBookingService } from '../../../../services/slot-booking.service';

@Component({
  selector: 'app-event-request',
  templateUrl: './event-request.component.html',
  styleUrls:['./event-request.component.css']
})
export class EventRequestComponent implements OnInit{
  
  public authConfig!: AuthConfig;
  public isSlotBookingDialogVisible: boolean = false;
  public slotBookingDetail!: RequestBooking;
  public allDays: any[] = [
    { label: 'Sunday', value: 'Sun' },
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
    { label: 'Saturday', value: 'Sat' }
  ];

  public isRequestSent: boolean = false;
  public bookingRequests!:RequestBooking[];
  public totalStudentRequest: number = 0;
  public joinUrl!: string;
  constructor(
    private authService: AuthService,
    private ngxSpinnerService: NgxSpinnerService,
    private slotBookingService: SlotBookingService, 
    private cdr: ChangeDetectorRef
  ){}
  
  ngOnInit(){
    this.authConfig = this.authService.getAuthConfig();
    this.getAllSlotBookingRequests();
  }

  public getAllSlotBookingRequests(){
    this.ngxSpinnerService.show();
    this.slotBookingService.getRequests().subscribe(response => {
      this.bookingRequests = response;
      this.totalStudentRequest = response.length;
      this.ngxSpinnerService.hide();
      this.cdr.detectChanges()
    })
  }

   // Method to open the dialog
   public openSlotBookingDialog(bookingRequest: RequestBooking) {
    this.slotBookingDetail = bookingRequest;
    this.isSlotBookingDialogVisible = true;
  }

  // Method to close the dialog
  public closeSlotBookingDialog() {
    this.isSlotBookingDialogVisible = false;
  }

  public approveBookingRequest(bookingRequestId:string){
    
    this.ngxSpinnerService.show();
    this.slotBookingService.acceptBookingRequest(bookingRequestId).subscribe(resposne => {
      this.ngxSpinnerService.hide();
      if (resposne.Success) {
        this.joinUrl = resposne.join_url;
        this.isSlotBookingDialogVisible = false;
        // this.toastr.success(
        //   'Success',
        //   resposne.Message
        // );
      } else {
        // this.toastr.error(
        //   'Error',
        //   resposne.Message
        // );
      }
    })
  }

  public rejectBookingRequest(bookingRequestId:string){
    this.slotBookingService.rejectBookingRequest(bookingRequestId).subscribe(async response => {
      // this.toastr.success(
      //   'Success',
      //   await response.ResponseMessage
      // );
      this.getAllSlotBookingRequests()
    })
  }

  public getDayLabel(dayValue: string): string {
    const day = this.allDays.find(day => day.value === dayValue);
    return day ? day.label : '';
  }

}
