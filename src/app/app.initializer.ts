import { Injector } from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";
import { RefreshTokenRequestSources } from './app.enums';
import { environment } from '../environments/environment';
import { getTokenRefreshTimeOut } from './app.functions';
import { AuthService } from '../services/auth.service';


export function appInitializer(injector: Injector) {
    return () => new Promise<void>(resolve => {
        console.log('Inside app.initializer');
        var authService: AuthService = injector.get(AuthService);
        var jwtHelper: JwtHelperService = injector.get(JwtHelperService);

            var token: string = authService.getAccessToken();
            if (authService.isAuthenticated() && !jwtHelper.isTokenExpired(token)) {
                var isRefreshingToken: boolean = false;

                var jwtToken = jwtHelper.decodeToken(token);
                if (jwtToken) {
                    var refreshTokenTimeoutInMilliseconds: number = getTokenRefreshTimeOut(jwtToken.exp);
                    console.log('Time left in token expiry: '+ (refreshTokenTimeoutInMilliseconds / 1000).toFixed(2) + ' seconds');
                    if (refreshTokenTimeoutInMilliseconds <= environment.REFRESH_TOKEN_X_SECONDS_BEFORE_EXPIRY) {
                        isRefreshingToken = true;
                        console.log('Token is expiring in ' + ((refreshTokenTimeoutInMilliseconds / 1000) + environment.REFRESH_TOKEN_X_SECONDS_BEFORE_EXPIRY).toFixed(2) +
                            ' which is less than ' + environment.REFRESH_TOKEN_X_SECONDS_BEFORE_EXPIRY + ' seconds (our thershold value)' +
                            ' so refreshing token immediately. Current date is ' + (new Date()));
                        authService.refreshToken(RefreshTokenRequestSources.AppIntializer).subscribe().add(resolve);
                    }
                }

                if (!isRefreshingToken) {
                    resolve();
                }
                return;
            }

            if (token && jwtHelper.isTokenExpired(token)) {
                authService.setAccessToken(null);
                authService.setCurrentUser(null);
            }
            authService.refreshToken(RefreshTokenRequestSources.AppIntializer).subscribe().add(resolve);
    });
}