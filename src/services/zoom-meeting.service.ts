import { Injectable } from '@angular/core';
import { ServiceBase } from './service.base';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService, ResponseObject } from './auth.service';
import { Tutor } from './tutor.service';

@Injectable({
  providedIn: 'root'
})
export class ZoomMeetingService extends ServiceBase{

  constructor(private http: HttpClient,
    authService: AuthService) {
    super(authService);
  }

  public ConnectWithZoom(): Observable<string> {
    const api: string = '/Zoom';
    const method: string = '/connect';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get(url, { responseType: 'text' });
  }

  public Callback(code: string): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Zoom';
    const method: string = '/callback/' + code;    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, {}, httpOptions);
  }

  getConnectionsWithZoom():Observable<any>{
    var httpOptions = this.RequestHeaders();
    const api: string = '/Connection';
    const method: string = '/connection';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<any>(url, httpOptions);
  }

  disconnectZoomAccount():Observable<any>{
    var httpOptions = this.RequestHeaders();
    const api: string = '/Connection';
    const method: string = '/disconnect';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.delete<any>(url, httpOptions);
  }

  getMeetings():Observable<ZoomMeetingDetail[]>{
    var httpOptions = this.RequestHeaders();
    const api: string = '/Zoom';
    const method: string = '/meetings';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<ZoomMeetingDetail[]>(url, httpOptions);
  }
}

export class ZoomMeetingDetail {
  Uuid!:string;
  Id!: string;
  HostId!: string;
  HostEmail!: string;
  Topic!: string;
  Type!: number;
  Status!: string;
  StartTime!: Date;
  Duration!: number;
  Timezone!: string;
  CreatedAt!: Date;
  StartUrl!: string;
  JoinUrl!: string;
  Password!: string;
  H323Password!: string;
  PstnPassword!: string;
  EncryptedPassword!: string;
  PreSchedule!: boolean;
  MeetingId!: number;
}

export class StudentMeeting {
  Id!: string;
  StudentId!: string;
  MeetingId!: string;
  TutorId!: string;
  IsMeetingCompleted!: boolean;
}
