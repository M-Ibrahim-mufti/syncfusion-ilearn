import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

import { isPlatformServer } from '@angular/common';
import { environment } from '../environments/environment';
import { RefreshTokenRequestSources, UserRoles } from '../app/app.enums';
import { AppSettings } from '../app/app.settings';
import { LoginModel } from '../app/components/common_components/auth/auth.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(@Inject(PLATFORM_ID) readonly platformId: Object,
    private http: HttpClient,
    private jwtHelper: JwtHelperService) {
  }



  public login(data: LoginModel): Observable<ResponseObject> {
    var api: string = '/Auth';
    var method: string = '/signin';
    var url: string = environment.BASE_API_PATH + api + method;
    var postObservable = this.http.post<ResponseObject>(url, data, {
      headers: this.httpOptions.headers,
      withCredentials: true,  //this is important to pass the refresh-token cookie in the request headers
      //observe: 'response'   //if we don't observe the response, it would mean response would only contain body, not headers but we need headers to store the cookie returned as "set-cookie" header in the response
    });

    const subject = new ReplaySubject<ResponseObject>(1);
    subject.subscribe((response: ResponseObject) => {
      if (response.Success && response.ResponseData) {
        var tokenResponse: TokenResponse = response.ResponseData;
        //set the access token in localStorage so we can pass it on to the server plus check for the expiry/login status
        this.setAccessToken(tokenResponse.AccessToken);
        //also set the current user in localStorage so we can retrive it back later
        this.setCurrentUser(tokenResponse.AuthUser);
      }
    }, (error) => { console.error(error); this.handleAuthenticationError(error); });
    postObservable.subscribe(subject);
    return subject;
  }

  //since the refresh token is saved in the http-only cookie so its accessible only on http (server).
  //there's no way we can read or update the http-only cookie in javascript so we need to make a call to server to check if there's
  //a valid refresh token inside the client's browser (which is the http-only cookie)
  public refreshToken(requestSource: RefreshTokenRequestSources): Observable<RefreshTokenResponse> {
    var api: string = '/Auth';
    var method: string = '/refresh-token';
    var url: string = environment.BASE_API_PATH + api + method;
    var postObservable = this.http.post<RefreshTokenResponse>(url, { IsServiceCall: false }, {
      headers: this.httpOptions.headers,
      withCredentials: true,  //this is important to pass the refresh-token cookie in the request headers
    });
    const subject = new ReplaySubject<RefreshTokenResponse>(1);
    subject.subscribe((response: RefreshTokenResponse) => {
      this.onRefreshTokenResponse(requestSource, response);
    }, (error) => { console.error(error); this.handleAuthenticationError(error); });
    postObservable.subscribe(subject);
    return subject;
  }

  private onRefreshTokenResponse(requestSource: RefreshTokenRequestSources, response: RefreshTokenResponse) {
    if (response.Success) {
      if (response.IsValidRefreshToken && response.TokenResponse) {
        console.log('Access token updated on ' + (new Date()) + '. The new token is: ' + response.TokenResponse.AccessToken);
        this.setAccessToken(response.TokenResponse.AccessToken);
        //also set the current user in localStorage so we can retrive it back later
        this.setCurrentUser(response.TokenResponse.AuthUser);
      }
    } else {
      if (requestSource == RefreshTokenRequestSources.AppIntializer) {
        //this request was generated from the APP_INITIALIZER so no need to any error here since there'll always be this request to
        //auto-authenticate the user when he lands on the site (and if he's not logged in meaning there's no refresh token cookie on his browser, there'll be this error)
      } else {
        console.error('Error during refreshing the token');
        console.error(response);
        //error in fetching the new access token from the refresh token
        if (!response.IsRefreshCookieExists) {
          //refresh cookie does not exists
        }
        if (response.IsRefreshCookieExists && !response.IsValidRefreshToken) {
          //refresh token exists in the cookie but is not valid which means that the user has already logged out
        }
      }
    }
  }

  public logout(): Observable<boolean> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getAccessToken()
      }),
      withCredentials: true,  //this is important to pass the refresh-token cookie in the request headers
      //observe: 'response'   //if we don't observe the response, it would mean response would only contain body, not headers but we need headers to store the cookie returned as "set-cookie" header in the response
    };

    var api: string = '/Auth';
    var method: string = '/signout';
    var url: string = environment.BASE_API_PATH + api + method;
    var postObservable = this.http.post<boolean>(url, {}, httpOptions);

    const subject = new ReplaySubject<boolean>(1);
    subject.subscribe((isDeactivated: boolean) => {
      if (isDeactivated) {
        this.setAccessToken(null);
        this.setCurrentUser(null);
      }
    }, (e) => { console.error(e); });
    postObservable.subscribe(subject);
    return subject;
  }

  public postLogoutErrorCleanUp(userId: string): Observable<ResponseObject> {
    var api: string = '/Auth';
    var method: string = '/' + userId + '/postLogoutCleanUp';
    var url: string = environment.BASE_API_PATH + api + method;
    var postObservable = this.http.post<ResponseObject>(url, {}, {
      headers: this.httpOptions.headers,
      withCredentials: true,  //this is important to pass the refresh-token cookie in the request headers
    });

    const subject = new ReplaySubject<ResponseObject>(1);
    subject.subscribe((response: ResponseObject) => {
      console.log(response);
    }, (e) => console.error(e));
    postObservable.subscribe(subject);
    return subject;
  }


  private handleAuthenticationError(err: any) {
    this.setAccessToken(null);
    this.setCurrentUser(null);
  }

  public setAccessToken(accessToken: string | null) {
    if (isPlatformServer(this.platformId)){
      return;
    }

    if (!accessToken) {
      localStorage.removeItem(AppSettings.ACCESS_TOKEN);
    } else {
      localStorage.setItem(AppSettings.ACCESS_TOKEN, accessToken);
    }
  }

  public getAccessToken(): string | null {
    if (isPlatformServer(this.platformId)){
      return null;
    }
    return localStorage.getItem(AppSettings.ACCESS_TOKEN) || '';
  }

  //sets the current user claims in localStorage after user logs in
  public setCurrentUser(user: AuthUser | null) {
    if (isPlatformServer(this.platformId)){
      return;
    }

    if (!user) {
      localStorage.removeItem(AppSettings.AUTH_USER);
    } else {
      var json: string = JSON.stringify(user);
      localStorage.setItem(AppSettings.AUTH_USER, btoa(json));
      this.getCurrentUser();
    }
  }

  public isAdministrator() { return (this.getUserRoleId() == UserRoles.Administrator); }
  public isStudent() { return (this.getUserRoleId() == UserRoles.Student); }
  public isTeacher() { return (this.getUserRoleId() == UserRoles.Teacher); }
  public isParent() { return (this.getUserRoleId() == UserRoles.Parent); }

  public getCurrentUser(): AuthUser | null {
    if (isPlatformServer(this.platformId)){
      return null;
    }

    var token: string | null = this.getAccessToken();
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      //if token is null or exists but expired
      return null;
    }
    var user = null;
    var encodedUserString = localStorage.getItem(AppSettings.AUTH_USER);
    if (encodedUserString) {
      var userJsonString: string = atob(encodedUserString);
      user = JSON.parse(userJsonString);
    }
    return user;
  }

  public isAuthenticated(): boolean {
    var token = this.getAccessToken();
    if (!token) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(token);
  }

  private getDecodedToken(): any {
    var token = this.getAccessToken();
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      return null;
    }
    var decodedToken = this.jwtHelper.decodeToken(token);
    return decodedToken;
  }

  public getUserId(): string {
    var decodedToken = this.getDecodedToken();
    return decodedToken?.nameid;
  }

  public getUserRoleId(): string {
    var decodedToken = this.getDecodedToken();    
    return decodedToken?.role;
  }

  public getAuthConfig(): AuthConfig {
    return { IsAdministrator: this.isAdministrator(), IsStudent: this.isStudent(), IsTeacher: this.isTeacher(), IsParent: this.isParent() };
  }

  public isInAnyRole(allowedRoles: UserRoles[]): boolean {
    if (!allowedRoles) return false;

    var userRoleId = this.getUserRoleId();
    if (userRoleId) {
      return allowedRoles.filter(p => p == userRoleId).length > 0;
    }
    return false;
  }
}

export class TokenResponse {
  Success!: boolean;
  UserId!: string;
  RoleId!: string;
  AccessToken!: string;
  RefreshToken!: string;
  AuthUser!: AuthUser;
}

export class AuthUser {
  UserId!: string;
  FullName!: string;
  EmailAddress!: string;
  ImgUrl!: string;
  PhoneNumber!: string;
  LogoUrl!: string;
  DateJoined!: Date;
  PersonalImgUrl!: string;
}

export class RefreshTokenResponse {
  Success!: boolean;
  ResponseMessage!: string;
  IsRefreshCookieExists!: boolean;
  IsValidRefreshToken!: boolean;
  TokenResponse!: TokenResponse;
}

export class ResetPasswordRequest {
  UserId!: string;
  ResetPasswordToken?: string | null;
  NewPassword!: string;
  ConfirmPassword!: string;
}

export class ResponseObject {
  Success!: boolean;
  ResponseMessage!: string;
  ResponseData: any;
  Errors: string[] = [];
}

export class AuthConfig {
  IsAdministrator?: boolean;
  IsParent?: boolean;
  IsTeacher?: boolean;
  IsStudent?: boolean;
}

export class ApplicationUser {
  Id!: string;
  UserName!: string;
  Email!: string;
  Password!: string;
  PhoneNumber!: string;
  ConfirmPassword!: string;
  MobileNumber!: string;
  state!: string;
  BusinessLogoUrl!: string;
  Name!: string;
  AddressLine1!: string;
  AddressLine2!: string;
  Website!: string;
  IsSuperAdmin!: boolean;
  IsAdministrator!: boolean;
  IsArtist!: boolean;
  IsGallery!: boolean;
  LastLoginDate!: Date | null;
  IsBlocked!: boolean;
  AllowLogin!: boolean;
  CreatedBy!: string;
  CreatedDate!: Date | null;
  ModifiedBy!: string;
  ModifiedDate!: Date | null;
  IsDeleted!: boolean;
  DeletedDateTime!: Date | null;
  DeletedBy!: string;
  IsActive!: boolean;
  ImgUrl!: string;
  GalleryImgUrl!: string;
  // BankName!: string;
  // BankAddress!: string;
  // BankBSB!: string;
  // AccountNumber!: string;
  ShortDescription!: string;
  LongDescription!: string;
  SocialMediaDescription!: string;
  BusinessName!: string;
  GalleryType!: string;
  BusinessNumber!: string;
  StreetAddress!: string;
  Suburb!: string;
  State!: string;
  PostCode!: string;
  ABN!: string;
  InstagramLink!: string;
  FacebookLink!: string;
  LinkedinLink!: string;
  BusinessFacebookLink!: string;
  BusinessInstagramLink!: string;
  BusinessLinkedinLink!: string;
  IsOpenToInvites!: boolean;
  AboutMe!: string;
  Resume!: string;
  CommissionPercentage!: string;
  PaymentTerms?: string;
  ReturnPolicy?: string;
  TermsConditions?: string;
  GallerySaleType?: string;
  CurrencyCode!: string;
  //Helper properties
  ArtistArtTypes: string[] = [];
}

export class ViewUserInfo {
  Email!: string;
  Name!: string;
  ImgUrl!: string;
}

export class DeleteUserInfo {
  Email!: string;
  Password!: string;
}

export class FacebookApiresponceObject {
  CreatedDate!: null
  FaceBookEmail!: string;
  FaceBookId!: string;
  FaceBookName!: string;
  FaceBookOuthPages!: FaceBookOuthPages[];
  FacebookAccessTokken!: string;
  FacebookProfilePicture!: string;
  Id!: null;
  UserId!: null;
  responeObject!: ResponseObject;
}

export class FaceBookOuthPages{
  CreatedDate!: string;
  FaceBookOuth!:  null;
  FacebookOuthId!: string;
  Id!: string;
  PageAccessTokken!: string;
  PageId!: string;
  PageLink!: string;
  PageName!: string;
  PagePicture!: string;
}