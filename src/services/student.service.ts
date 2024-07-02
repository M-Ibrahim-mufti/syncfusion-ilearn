import { Injectable } from '@angular/core';
import { ServiceBase } from './service.base';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService, ResponseObject } from './auth.service';
import { SelectItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends ServiceBase{

  constructor(private http: HttpClient,
    authService: AuthService) {
    super(authService);
  }

  public saveStudent(model: StudentRegistrationModel): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Student';
    const method: string = '/save';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, model, httpOptions);
  }

  public getAllSubjects(): Observable<SelectItem[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Subject';
    const method: string = '/fetch';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<SelectItem[]>(url, httpOptions);
  }

  public getAllUserSubjects(): Observable<SelectItem[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Subject';
    const method: string = '/fetch-user-subjects';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<SelectItem[]>(url, httpOptions);
  }

  public viewUserGrades(subjectId: string): Observable<SelectItem[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Subject';
    const method: string = '/' + subjectId + '/grade';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<SelectItem[]>(url, httpOptions);
  }

  public getStudent(): Observable<Student[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Student';
    const method: string = '/fetch';    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<Student[]>(url, httpOptions);
  }

  public blockStudent(id: string): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Student';
    const method: string = '/block' + '/' + id;    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, httpOptions);
  }
}

export class StudentRegistrationModel {
  StudentHon!: string;
  StudentFullName!: string;
  StudentEmail!: string;
  StudentPhoneNumber!: string;
  StudentAddress!: string;
  StudentCity!: string;
  StudentState!: string;
  StudentPostalCode!: string;
  StudentCountry!: string;
  StudentSchoolGrade!: number;
  StudentImgUrl!: string;
  StudentSubjectIds!: any[]

  ParentHon!: string;
  ParentFullName!: string;
  ParentEmail!: string;
  ParentPhoneNumber!: string;
  ParentAddress!: string;
  ParentCity!: string;
  ParentState!: string;
  ParentPostalCode!: string;
  ParentCountry!: string;
  ParentRelationship!: string;
}

export class Student {
  Id!: string;
  Hon!: string;
  FullName!: string;
  Email!: string;
  PhoneNumber!: string;
  Address!: string;
  City!: string;
  State!: string;
  PostalCode!: string;
  Country!: string;
  SchoolGrade!: number;
  ImgUrl!: string;
  StudentSubjects!: any[];
  Parent!: Parent;
}

export class Parent {
  Hon!: string;
  FullName!: string;
  Email!: string;
  PhoneNumber!: string;
  Address!: string;
  City!: string;
  State!: string;
  PostalCode!: string;
  Country!: string;
  Relationship!: string;
}
export class ApplicationViewStudent {

  Address!: string; 
  AllowLogin!: boolean;
  City!: string; 
  Country!: string;
  CreateEvents!: string;
  CreatedBy!: string;
  CreatedDate!:  string;
  DeletedBy!: string;
  DeletedDateTime!: string;
  Email!: string;
  Hon!: string;
  ImgUrl!: string | null;
  IsActive!: boolean;
  IsAdministrator!: boolean;
  IsBlocked!: boolean;
  IsDeleted!: boolean;
  IsParent!: boolean;
  IsPoliceFormChecked!: boolean;
  IsStudent!: boolean;
  IsTeacher!: boolean;
  LastLoginDate!: string;
  Name!: string;
  FullName!: string;
  Parent!: string;
  ParentId!: string;
  PhoneNumber!: string;
  PoliceFormCheckDate!: string;
  PostCode!: string;
  Qualifications!: string;
  Relationship!: string;
  SchoolGrade!: number;
  State!: string;
  StudentSlotBookingRequests!: string;
  StudentSubjects!: any[];
  Students!: any[];
  TutorAvailabilities!: any[];
  TutorSlotBookingRequests!: string; 
  TutorSubjects!: any[];
  UserRefreshTokens!: string;
}
