import { Injectable } from '@angular/core';
import { ServiceBase } from './service.base';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService, ResponseObject } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubjectService extends ServiceBase {

  constructor(private http: HttpClient,
    authService: AuthService) {
    super(authService);
  }


  public getAllSubjectsOnAdminSide(): Observable<Subject[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Subject';
    const method: string = '/view-subject';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<Subject[]>(url, httpOptions);
  }

  public saveSubject(data: Subject): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Subject';
    const method: string = '/save';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, data, httpOptions);
  }
}

export class Subject {
  Name!: string;
  Description!: string;
}
