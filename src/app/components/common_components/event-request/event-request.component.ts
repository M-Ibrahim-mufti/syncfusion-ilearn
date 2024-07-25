import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AuthConfig, AuthService } from '../../../../services/auth.service';
import { RequestBooking, SlotBookingService } from '../../../../services/slot-booking.service';
import { SpinnerService } from '../../../../services/Shared/spinner.service';
import { NotificationTypes } from '../../../app.enums';
import { valueAccessor } from '@syncfusion/ej2-angular-grids';

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
  public Status:any = [
    {value: -1, label:'Select Status'},
    {value: 'app', label: 'Approve'},
    {value: 'rej', label: 'Reject'},
    {value: 'pen', label: 'pending'},
  ]

  public filterRequests!: RequestBooking[]
  public selectedStatus: any = this.Status[0].value
  public groupRequests:any[] = []
  public consultancyRequests:any[] = []

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private slotBookingService: SlotBookingService, 
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
      this.filterRequests = this.bookingRequests;
      this.groupRequests = this.bookingRequests.filter((request) => request.IsOneOnOne == false)
      this.consultancyRequests = this.bookingRequests.filter((request) => request.IsOneOnOne == true);

      console.log("Group Requests : ", this.groupRequests);
      console.log("Consultancy Requests : ", this.consultancyRequests)


      const pendingRequest = this.bookingRequests.filter((request) => (request.IsApproved === false && request.IsRejected === false))
      if(pendingRequest.length > 0){
        this.selectedStatus = this.Status[3].value
        this.filterStatus();
      } 

      this.spinnerService.hide();


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
        this.toastr.success(
          'Success',
          resposne.ResponseMessage
        );
        // this.getAllSlotBookingRequests();
      } else {
        this.toastr.error(
          'Error',
          resposne.ResponseMessage
        );
      }
    })
  }

  public rejectBookingRequest(bookingRequestId:string){
    this.slotBookingService.rejectBookingRequest(bookingRequestId).subscribe(async response => {
       this.toastr.success(
          'Success',
          response.ResponseMessage
        );
      this.getAllSlotBookingRequests()
    })
  }

  public getDayLabel(dayValue: string): string {
    const day = this.allDays.find(day => day.value === dayValue);
    return day ? day.label : '';
  }

  public filterStatus() {
    this.filterRequests = this.bookingRequests.filter((request) => {
      if (this.selectedStatus !== undefined && this.selectedStatus !== null) {
        if (this.selectedStatus === 'app') {
         return request.IsApproved === true;
        }
        else if (this.selectedStatus === 'rej') {
          return request.IsRejected === true;
        } 
        else {
          return(request.IsApproved === false && request.IsRejected === false);
        }
      } else {
        // Handle case when selectedStatus is undefined or null
          return(request.IsApproved === false || request.IsRejected === false);
      }
    });

  }
  
  public clearFilter() {
    this.selectedStatus = this.Status[0].value;
    this.filterRequests = this.bookingRequests;
  }
}
