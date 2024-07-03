import { Tutor } from './tutor.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, ResponseObject } from './auth.service';
import { ServiceBase } from './service.base';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ClassMetadataService extends ServiceBase {

  constructor (private http:HttpClient,authService:AuthService) {
    super(authService);
   }

   public viewClassMetaData(): Observable<ClassMetaData[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/ClassMetaData';
    const method: string = '/view-class';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<ClassMetaData[]>(url, httpOptions);
  }

  public saveClassMetaData(insertClassData:ClassMetaData ):Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = "/ClassMetaData"
    const method: string = "/save-metadata"
    const url = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url,insertClassData, httpOptions);
  
  } 

  public deleteClassMetaData(id:string): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/ClassMetaData';
    const method: string = '/delete/' + id;    
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.delete<ResponseObject>(url, httpOptions);
  }

}

export class ClassMetaData {
  Id!: string;
  TutorId!: string;
  SubjectId!: string;
  GradeId!: string;
  Title!: string;
  Description!: string;
  IsActive!: boolean;

  //helper property
  SubjectName!: string;
  GradeLevel!: number;
}
export class CourseOutline {  
  Id!: string;
  ClassId!: string;
  SectionTitle!: string;
  SectionDescription!: string;
  Order!: number
}
