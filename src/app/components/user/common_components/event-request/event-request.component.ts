import { Component, ViewChild } from '@angular/core';
import { RequestBooking, SlotBookingService } from '../../../../../services/slot-booking.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { AuthConfig, AuthService } from '../../../../../services/auth.service';
import { NotificationTypes } from '../../../../app.enums';
import { NotificationsService } from '../../../../../services/Shared/notifications.service';

@Component({
  selector: 'app-event-request',
  templateUrl: './event-request.component.html',
  styleUrl: './event-request.component.css'
})
export class EventRequestComponent {
  @ViewChild('dt1') dt1: Table | undefined;
  
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
    private notificationsService: NotificationsService,
    private slotBookingService: SlotBookingService
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
    console.log(bookingRequestId);
    
    this.ngxSpinnerService.show();
    this.slotBookingService.acceptBookingRequest(bookingRequestId).subscribe(resposne => {
      this.ngxSpinnerService.hide();
      if (resposne.Success) {
        this.joinUrl = resposne.join_url;
        this.isSlotBookingDialogVisible = false;
        this.notificationsService.showNotification(
          'Success',
          resposne.Message,
          NotificationTypes.Success
        );
      } else {
        this.notificationsService.showNotification(
          'Error',
          resposne.Message,
          NotificationTypes.Error
        );
      }
    })
  }

  public rejectBookingRequest(bookingRequestId:string){
    this.slotBookingService.rejectBookingRequest(bookingRequestId).subscribe(async response => {
      this.notificationsService.showNotification(
        'Success',
        await response.ResponseMessage,
        NotificationTypes.Success
      );
      this.getAllSlotBookingRequests()
    })
  }

  onInput(event: any): void {
    const value = event.target.value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
  }

  public getDayLabel(dayValue: string): string {
    const day = this.allDays.find(day => day.value === dayValue);
    return day ? day.label : '';
  }

}
