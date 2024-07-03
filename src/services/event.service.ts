import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService, ResponseObject } from './auth.service';
import { Tutor, TutorAvailability } from './tutor.service';
import { ServiceBase } from './service.base';

@Injectable({
  providedIn: 'root'
})
export class EventService extends ServiceBase {
  
  constructor(private http: HttpClient,
    authService: AuthService) {
    super(authService);
  }

  public getEvents(tutorId: string | null = null): Observable<Event[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Event';
    const method: string = '/fetch' + '/' + tutorId;
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<Event[]>(url, httpOptions);
  }
  
  public getEventById(id:string): Observable<Event> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Event';
    const method: string = '/fetch-event';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<Event>(url+`?Id=${id}`, httpOptions);
  }

  public saveEvent(model: Event): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Event';
    const method: string = '/save';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, model, httpOptions);
  }

  public removeEvent(id:string): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Event';
    const method: string = '/delete';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.delete<ResponseObject>(url+`?Id=${id}`, httpOptions);
  }

}

export class Event{
  Id?:string
  Name!: string;
  Duration!: number
  IsOneOnOne!: boolean
  IsOneTime!: boolean
  IsCompleted!: boolean
  AvailabilityId!: string
  SubjectId!:string
  TutorId?: string
  EventStartTime!:Date
  SubjectName?:string
  Day!:string
}

export type GroupedAvailabilities = { key: string, value: TutorAvailability[] }[];
