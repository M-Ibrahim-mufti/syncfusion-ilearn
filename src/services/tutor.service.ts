import { Injectable } from '@angular/core';
import { ServiceBase } from './service.base';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService, ResponseObject } from './auth.service';
import { StudentRegistrationModel } from './student.service';
import { Event, SelectItem } from './event.service';

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

  public fetchTutorDropdownData(): Observable<SelectItem[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Tutor';
    const method: string = '/dropdown';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<SelectItem[]>(url, httpOptions);
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
    const method: string = '/view-subjects-with-grads';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<any[]>(url, httpOptions);
  }

  public getAllAvalabilities(tutorId: string | null = null): Observable<TutorAvailability[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Tutor';
    const method: string = '/fetch-availabilty' + '/' + tutorId;
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

  public tutorProfile(id:string): Observable<Tutor>{
    const httpOptions = this.RequestHeaders();
    const api:string = '/user/'
    const method:string = `${id}/detail`
    const url: string = environment.BASE_API_PATH + api + method
    return this.http.get<Tutor>(url, httpOptions)
  }

  public getRequestHeaders(): { [key: string]: string } {
    const headers = this.RequestHeaders().headers;
    const headerObj: { [key: string]: string } = {};
    headers.keys().forEach(key => {
      headerObj[key] = headers.get(key)!;
    });
    return headerObj;
  }

  public getTutorConsultancy(tutorId:string): Observable<any> {
    const httpOptions = this.RequestHeaders();
    const api:string = '/tutor/';
    const method:string = `general-consultant/${tutorId}`;
    const url:string = environment.BASE_API_PATH + api + method;
    return this.http.get<any>(url, httpOptions);
  }

  public getTutorEditorDetails(tutorId:string): Observable<any> {
    const httpOptions = this.getRequestHeaders();
    const api:string = `/User/${tutorId}/`;
    const method:string = 'editor-detail'
    const url:string = environment.BASE_API_PATH + api + method;
    return this.http.get<any>(url, httpOptions);
  }

  public getAllCoreSubjects():Observable<any> {
    const httpOptions = this.RequestHeaders();
    const api:string = '/Subject';
    const method:string = '/core-subjects';
    const url:string = environment.BASE_API_PATH + api + method;
    return this.http.get<any>(url, httpOptions);
    
  }

  public getSubSubjects(subjectId:string):Observable<any> {
    const httpOptions = this.RequestHeaders();
    const api:string = '/Subject/'
    const method:string = `fetch/${subjectId}`
    const url:string = environment.BASE_API_PATH + api + method
    return this.http.get<any>(url, httpOptions)
  }

  public saveSubjects(Subject:AddSubjects): Observable<any> {
    const httpOptions = this.RequestHeaders();
    const api:string = '/Subject/';
    const method:string = 'save-tutor-subject/'
    const url:string = environment.BASE_API_PATH + api + method;
    return this.http.post<any>(url, Subject, httpOptions)
  }

  public getAllSubjectandTheirGrades():Observable<any> {
    const httpOptions = this.RequestHeaders();
    const api:string = '/Subject/';
    const method:string = 'subjects-grades/'
    const url = environment.BASE_API_PATH + api + method;
    return this.http.get<any>(url, httpOptions);
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
  Degree!:string;
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
  StartTime?: number | null;
  Query?: string;
}

export class Grade {
  Id!: string;
  TutorSubjectId!: string;
  GradeLevel!: number;
}

export class Tutor {
  Id!: string;
  AboutMe!:string;
  WorkHistory!:string;
  Certification!:string;
  Degree!:string;
  FullName!: string;
  Title!: string;
  Name!:string;
  Hon?: string;
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
  PoliceFormCheckDate?: Date;
  CreateEvents?:Event[];
  TutorAvailabilities!: TutorAvailability[];
  TutorSubjects!: TutorSubject[];
  TotalMeetings!: number;
  TotalStudents!: number;
  Description!: string;

}


export class GeneralConsultancy {
  TutorId?:string;
  EventStartTime?:string;
  MeetingStartTime?:Date;
  Duration?:number;
  Comment!:string;
}


export class ShowTutor extends Tutor {
  isExpanded?:boolean = false;
}

export interface AddSubjects {
  SubjectId: string;
  Grades: any[];
}