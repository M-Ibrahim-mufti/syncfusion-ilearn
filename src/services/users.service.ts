import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApplicationUser, AuthService, ResetPasswordRequest, ResponseObject } from './auth.service';
import { ServiceBase } from './service.base';
import { environment } from '../environments/environment';
import { ApplicationViewStudent } from './student.service';

@Injectable({
    providedIn: 'root'
})
export class UsersService extends ServiceBase {
    
    constructor(private http: HttpClient,
        authService: AuthService) {
        super(authService);
    }
    public getStudentDetail():Observable<ApplicationViewStudent> {
        var httpOptions = this.RequestHeaders();
        const api: string = '/user';
        const method: string = '/profile';
        const url = environment.BASE_API_PATH + api + method;
        return this.http.get<ApplicationViewStudent>(url, httpOptions);
    }
    public updateStudent(updatedStudentData:ApplicationViewStudent):Observable<ResponseObject> {
        var httpOptions = this.RequestHeaders();
        const api: string = '/user';
        const method: string = '/update';
        const url = environment.BASE_API_PATH + api + method;
        return this.http.post<ResponseObject>(url, updatedStudentData, httpOptions);
    }

    public resetPassword(){
        
    }
//     public updateUser(userId: string, updateData: ApplicationUser): Observable<ResponseObject> {
//         var httpOptions = this.RequestHeaders();
//         const api: string = '/User';
//         const method: string = `/${userId}/update`;
//         const url: string = environment.BASE_API_PATH + api + method;
//         return this.http.post<ResponseObject>(url, updateData, httpOptions);
//     }

//     public updateArtistBankingInformation(updateData: ArtistBankingInformation): Observable<ResponseObject> {
//         var httpOptions = this.RequestHeaders();
//         const api: string = '/User';
//         const method: string = `/encrypt-banking-info`;
//         const url: string = environment.BASE_API_PATH + api + method;
//         return this.http.post<ResponseObject>(url, updateData, httpOptions);
//     }

//     public getArtistBankingInfo(password: string): Observable<ResponseObject> {
//         var httpOptions = this.RequestHeaders();
//         const api: string = '/User';
//         const method: string = `/artist-banking-info`;
//         const url: string = environment.BASE_API_PATH + api + method;
//         return this.http.post<ResponseObject>(url, { Password: password }, httpOptions);
//     }

//     public updateArtistAndGallerySetting(userId: string, updateData: ApplicationUser): Observable<ResponseObject> {
//         var httpOptions = this.RequestHeaders();
//         const api: string = '/User';
//         const method: string = `/${userId}/updateSettings`;
//         const url: string = environment.BASE_API_PATH + api + method;
//         return this.http.post<ResponseObject>(url, updateData, httpOptions);
//     }

//     public sendForgotPasswordMail(data: ForgotPasswordMailRequest): Observable<ResponseObject> {
//         var httpOptions = this.RequestHeaders();
//         const api: string = '/User';
//         const method: string = '/forgot-password';
//         const url: string = environment.BASE_API_PATH + api + method;
//         return this.http.post<ResponseObject>(url, data, httpOptions);
//     }

//     public resetForgottenPassword(userId: string, updateData: ResetPasswordRequest): Observable<ResponseObject> {
//         var httpOptions = this.RequestHeaders();
//         const api: string = '/User';
//         const method: string = `/${userId}/reset-forgotten-password`;
//         const url: string = environment.BASE_API_PATH + api + method;
//         return this.http.post<ResponseObject>(url, updateData, httpOptions);
//     }
// }

// export class ForgotPasswordMailRequest {
//     Email!: string;
// }

// export class ArtistBankingInformation {
//     UniqueAccessCode?: string;
//     BankName?: string;
//     BankAddress?: string;
//     BankBSB?: string;
//     AccountNumber?: string;
}