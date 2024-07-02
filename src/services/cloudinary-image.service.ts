import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { ServiceBase } from './service.base';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryImageService extends ServiceBase {

  constructor(private http: HttpClient,
    authService: AuthService) {
    super(authService);
  }

  public uploadImage(formData: FormData): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'enctype': 'multipart/form-data',
        'Accept': 'application/json'
      })
    };
    const api: string = '/Upload';
    const method: string = '/single';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<string>(url, formData, httpOptions);
  }


  public uploadImages(formData: FormData): Observable<string[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    };

    const api: string = '/upload';
    const method: string = '/multi';
    const url: string = environment.BASE_API_PATH + api + method;
    return this.http.post<string[]>(url, formData, httpOptions);
  }
}