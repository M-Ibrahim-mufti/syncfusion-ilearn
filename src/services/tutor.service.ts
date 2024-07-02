import { Injectable } from '@angular/core';
import { ServiceBase } from './service.base';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService, ResponseObject } from './auth.service';
import { StudentRegistrationModel } from './student.service';
import { Event } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class TutorService extends ServiceBase {

  constructor(private http: HttpClient,
    authService: AuthService) {
    super(authService);
  }

  public getTutor(filters: TutorRequest = {}): Observable<Tutor[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Tutor';
    const method: string = '/fetch';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<Tutor[]>(url, filters, httpOptions);
  }

  public saveTutor(model: SaveTutorRequest): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Tutor';
    const method: string = '/save';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, model, httpOptions);
  }

  public getAllSubjects(): Observable<any[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Subject';
    const method: string = '/GetAllSubjectsWithGrades';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<any[]>(url, httpOptions);
  }

  public getAllAvalabilities(): Observable<TutorAvailability[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Tutor';
    const method: string = '/fetch-availabilty';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<TutorAvailability[]>(url, httpOptions);
  }

  public saveTutorAvailability(availabilities: SaveTutorAvailabilityRequest): Observable<ResponseObject> {
    const httpOptions = this.RequestHeaders();
    const api: string = '/Tutor';
    const method: string = '/save-availabilty';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, availabilities, httpOptions);
  }
  

}
export interface SaveTutorAvailabilityRequest {
  Availabilities: TutorAvailability[];
}


export class SaveTutorRequest {
  Id!: string;
  FullName!: string;
  Hon!: string;
  Address!: string;
  City!: string;
  State!: string;
  PostCode!: string;
  Country!: string;
  PhoneNumber!: string;
  Email!: string;
  Password!: string;
  Qualifications!: string;
  ImgUrl!: string;
  IsPoliceFormChecked!: boolean;
  PoliceFormCheckDate!: Date;
  TutorAvailabilities!: TutorAvailability[];
  TutorSubjects!: TutorSubject[];
}

export class TutorAvailability {
  Id!: string;
  TutorId?: string;
  Day!: string;
  CloseTimeHours!: number;
  CloseTimeMinutes!: number;
  OpenTimeHours!: number;
  OpenTimeMinutes!: number;
}

export class TutorSubject {
  Id!: string;
  TutorId!: string;
  SubjectId!: string;
  SubjectName!: string;
  Grades!: Grade[];
}

export class TutorRequest {
  Qualification?: string;
  Grade?: number;
  SubjectId?: string;
  Day?: string;
  StartTime?: number;
  Query?: string;
}

export class Grade {
  Id!: string;
  TutorSubjectId!: string;
  GradeLevel!: number;
}

export interface Tutor {
  Id: string;
  FullName: string;
  Hon?: string;
  Address: string;
  City: string;
  State: string;
  PostCode: string;
  Country: string;
  PhoneNumber: string;
  Email: string;
  Password: string;
  Qualifications: string;
  ImgUrl: string;
  IsPoliceFormChecked: boolean;
  PoliceFormCheckDate?: Date;
  CreateEvents?:Event[];
  TutorAvailabilities: TutorAvailability[];
  TutorSubjects: TutorSubject[];
}
