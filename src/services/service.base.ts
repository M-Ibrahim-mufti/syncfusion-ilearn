import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
export class ServiceBase {

  constructor(public authService: AuthService) {}

  protected RequestHeaders() {
    var token = this.authService.getAccessToken();
    if (token) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
      return httpOptions;
    } else {
      //if token is not found, don't send the authorization header
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };
      return httpOptions;
    }
  }
}
