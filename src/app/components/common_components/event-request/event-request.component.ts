import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import { RequestBooking, SlotBookingService } from '../../../../services/slot-booking.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { NotificationTypes } from '../../../app.enums';
import { NotificationsService } from '../../../../services/Shared/notifications.service';

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
    private spinnerService: SpinnerService,
    private notificationsService: NotificationsService,
    private slotBookingService: SlotBookingService, 
    private cdr: ChangeDetectorRef
  ){}
  
  ngOnInit(){
    this.authConfig = this.authService.getAuthConfig();
    this.getAllSlotBookingRequests();
  }

  public getAllSlotBookingRequests(){
    this.spinnerService.show();
    this.slotBookingService.getRequests().subscribe(response => {
      this.bookingRequests = response;
      this.totalStudentRequest = response.length;
      this.spinnerService.hide();
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
    this.spinnerService.show();
    this.slotBookingService.acceptBookingRequest(bookingRequestId).subscribe(resposne => {
      this.spinnerService.hide();
      if (resposne.Success) {
        this.joinUrl = resposne.join_url;
        this.isSlotBookingDialogVisible = false;
        this.notificationsService.showNotification(
          'Success',
          resposne.ResponseMessage,
          NotificationTypes.Success
        );
      } else {
        this.notificationsService.showNotification(
          'Error',
          resposne.ResponseMessage,
          NotificationTypes.Error
        );
      }
    })
  }

  public rejectBookingRequest(bookingRequestId:string){
    this.slotBookingService.rejectBookingRequest(bookingRequestId).subscribe(async response => {
      this.notificationsService.showNotification(
        'Success',
        response.ResponseMessage,
        NotificationTypes.Success
      );
      this.getAllSlotBookingRequests()
    })
  }

  public getDayLabel(dayValue: string): string {
    const day = this.allDays.find(day => day.value === dayValue);
    return day ? day.label : '';
  }

}
