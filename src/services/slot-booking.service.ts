import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthService, ResponseObject } from './auth.service';
import { ServiceBase } from './service.base';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SlotBookingService extends ServiceBase {

  constructor(private http: HttpClient,
    authService: AuthService) {
    super(authService);
  }

  public getAllTutorRequests(tutorId:string): Observable<any[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/SlotBookingRequest';
    const method: string = '/view-all-tutor-requests';
    const url: string = `${environment.BASE_API_PATH}${api}${method}/${tutorId}`;
    return this.http.get<any[]>(url, httpOptions);
  }

  public getRequests(): Observable<any[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/SlotBookingRequest';
    const method: string = '/view-requests';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<any[]>(url, httpOptions);
  }

  slotBookingRequest(model:RequestBooking){
    var httpOptions = this.RequestHeaders();
    const api: string = '/SlotBookingRequest';
    const method: string = '/send';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, model, httpOptions);
  }

  acceptBookingRequest(bookingRequestId:string): Observable<any>{
    var httpOptions = this.RequestHeaders();
    const api: string = '/SlotBookingRequest';
    const method: string = '/accept-request';
    const requestId:string = '/'+ bookingRequestId;   
    const url: string = environment.BASE_API_PATH + api + method + requestId;
    return this.http.post<any>(url, {}, httpOptions);
  }

  rejectBookingRequest(bookingRequestId:string){
    var httpOptions = this.RequestHeaders();
    const api: string = '/SlotBookingRequest';
    const method: string = '/reject-request';
    const requestId:string = '/'+ bookingRequestId;   
    const url: string = environment.BASE_API_PATH + api + method + requestId;
    return this.http.post<ResponseObject>(url, {}, httpOptions);
  }

  saveGeneralConsultancyRequest(consultancyDetails:any): Observable<any>{
    let httpOptions = this.RequestHeaders();
    const api: string = '/slotBookingRequest/';
    const method: string = `send-consultant-request`;
    const url: string = environment.BASE_API_PATH + api + method
    return this.http.post<any>(url, consultancyDetails ,httpOptions)
  }

}

export class RequestBooking{
  constructor(TutorId:string,EventStartTime:Date){
    this.TutorId = TutorId
    this.EventStartTime = EventStartTime
  }
  Id!:string;
  IsOneOnOne!:boolean;
  TutorId:string;
  EventStartTime:Date;
  Day!:string;
  Duration!:number;
  IsApproved!:boolean;
  IsRejected!:boolean;
  RequestTime!:Date;
  AcceptedTime!:Date;
  StartTime!:Date;
  StudentEmail?:string;
  StudentImgUrl!: string;
  StudentId!:string;
  StudentName!:string;
  SubjectName!:string;
  SubjectTopic!:string;
  TutorName!: string;
}