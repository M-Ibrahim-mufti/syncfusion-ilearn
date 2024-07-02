import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { JwtHelperService } from "@auth0/angular-jwt";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  Router
} from '@angular/router';
import { UserRoles } from './app.enums';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
    private jwtHelper: JwtHelperService,
    private authService: AuthService) { 
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    var allowedRoles: UserRoles[] = route.data['allowedRoles'] as UserRoles[];
    return this.hasAccess(state.url, allowedRoles);
  }

  private hasAccess(url: string, allowedRoles: UserRoles[]): Observable<boolean> {
    let isAuthenticated: boolean = this.authService.isAuthenticated();
    if (isAuthenticated) {
      var accessToken = this.authService.getAccessToken();
      if (accessToken && !this.jwtHelper.isTokenExpired(accessToken)) {
        if (!allowedRoles) { 
          return of(true);
        }
        
        if (this.authService.isInAnyRole(allowedRoles)) {        
          return of(true);
        } else {
          this.router.navigate(['/']); // Redirect to default route if not in allowed roles
          return of(false);
        }
      }
    }

    if (url.endsWith('/login')) {
      return of(true);
    }

    if (isAuthenticated) {
      this.router.navigate(['/']); // Redirect to admin view if authenticated
    } else {
      this.router.navigate(['/login']); // Redirect to login if not authenticated
    }
    return of(false);
  }
}
