import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService, ResponseObject} from "./auth.service";
import {ServiceBase} from "./service.base";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ReviewService extends ServiceBase {

  constructor(private http: HttpClient,
              authService: AuthService) {
    super(authService);
  }

  public getReviews(userId: string): Observable<any[]> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Review';
    const method: string = '/view-all-tutor-reviews' + '/' + userId;
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.get<any[]>(url, httpOptions);
  }
  public saveReviewFromStudentForTutor(model: any): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Review';
    const method: string = '/save-tutor-reviews';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, model, httpOptions);
  }

  public saveReviewFromTutorForStudent(model: any): Observable<ResponseObject> {
    var httpOptions = this.RequestHeaders();
    const api: string = '/Review';
    const method: string = '/save-student-reviews';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<ResponseObject>(url, model, httpOptions);
  }
}
