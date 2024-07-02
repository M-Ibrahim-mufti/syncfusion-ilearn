import { Injectable, OnDestroy } from "@angular/core";
import { NavigationStart, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from './../environments/environment';
import { RefreshTokenRequestSources } from './app.enums';
import { getTokenRefreshTimeOut } from "./app.functions";
import { AuthService, RefreshTokenResponse } from "../services/auth.service";
import { SharedUtilityService } from "../services/Shared/shared.utility.service";

@Injectable()
export abstract class BaseAppComponent implements OnDestroy {
    public isAuthenticated: boolean = false;
    public isPageStateVisible: boolean = document.visibilityState == 'visible';
    private tokenRefreshCounter: number = 0;
    private refreshTokenTimeout: any;
    private lastAccessTokenExpiry: any;
    public ngUnsubBase: Subject<any> = new Subject();

    public initBaseComponent(){
        this.isAuthenticated = this.authService.isAuthenticated();

        //attach page visibility event
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        }, false);

        //attach the one second timer observable to check the health of access token validity
        this.sharedUtilityService.attachNotifyOneSecondTimerObservable.pipe(takeUntil(this.ngUnsubBase)).subscribe(() => {
            this.checkRefreshToken();
        });
    }

    constructor(protected jwtHelper: JwtHelperService,
        protected authService: AuthService,
        protected sharedUtilityService: SharedUtilityService){
    }

    protected navigationInterceptor(event: any): void {
        if (event instanceof NavigationStart) {
            return;
        }
        if (event instanceof NavigationEnd) {
            //on each navigation change, set the authentication status of the user so incase user's access token expired while navigating,
            //we hide the menus and headers that only the logged in user must see.
            this.isAuthenticated = this.authService.isAuthenticated();
            return;
        }
    }

    //handles the page state visibility
    private handleVisibilityChange(): void {
        if (document.visibilityState == "visible") {
            //this checks if some changes were made to localStorage outside of this current tab that are related to the user's login status
            //for example: if user logged out from another tab of this same browser and then switches to this tab/page, we need to annoymously log him out from here too.
            this.checkUserLoginStatus();
    
            //check if the token is expired and this page is visible again to the user, try to refresh the token and if
            //the refresh token is expired too, logout the user and reload the page.
            if (this.isTokenAvailableButExpired()) {
                console.log('Refreshing Token (PageVisibility Event)');
                //if the user has a token in localStorage but its expired, refresh his token
                this.refreshExpiredToken();
            }
        } else if (document.visibilityState == "hidden") {
            //user has moved away from this tab
        }
    }

    private checkUserLoginStatus() {
        var authServiceAuthenticationStatus: boolean = this.authService.isAuthenticated();
        //if user is authenticated in our component state isAuthenticated variable but has logged out from some other tab meaning the token is NULL in most recent state
        if (this.isAuthenticated && !authServiceAuthenticationStatus) {
          //generate a notification that login stautus has changed (user has logged out from some other tab)
          //this.sharedUtilityService.notifyLoginStatusChanged({ IsAuthenticated: false, UserId: null });
          window.location.reload();
        }
        //if user is not authenticated in our component state isAuthenticated variable but has logged in from some other tab on this device, we need to log him in here too
        if (!this.isAuthenticated && authServiceAuthenticationStatus) {
          //generate a notification that login stautus has changed (user is logged in from some other tab)
          //this.sharedUtilityService.notifyLoginStatusChanged({ IsAuthenticated: true, UserId: this.authService.getUserId() });
          window.location.reload();
        }
    }

    private isTokenAvailableButExpired(): boolean {
        //check if the user's access token is available in localStorage but expired
        var token: string = this.authService.getAccessToken();
        if (token && this.jwtHelper.isTokenExpired(token)) {
          return true;
        }
        return false;
    }

    //this function gets called after X seconds and checks the flow where we've a token (active or expired)
    //if we've an expired token, it'll try to refresh it (and if it fails to refresh, we log the user out and reload the page)
    //if we've an active token, it'll check its expiry and if its X seconds away from expiry, we replace the current access token with a new one
    private checkRefreshToken() {
        //this will be called after one second each
        this.tokenRefreshCounter++;
        //if x seconds have been passed, check if we need to refresh the access token
        if (this.tokenRefreshCounter == environment.CHECK_TOKEN_REFRESH_AFTER_X_SECONDS) {
            //if the user has a token in localStorage but its expired, refresh his token
            if (this.isTokenAvailableButExpired()) {
                this.refreshExpiredToken();
                this.tokenRefreshCounter = 0;
                return;
            }

            //check if user's access token is expired already
            var token: string = this.authService.getAccessToken();
            //decode the access token to get details about its expiry times to check if we need to refresh it now!
            if (token) {
                var jwtToken = this.jwtHelper.decodeToken(token);
                if (jwtToken) {
                    //check if access token has changed (which mean that we need to update the timeout for settimeout according to the expiry of this new function)
                    if (this.lastAccessTokenExpiry != jwtToken.exp) {
                        //as the expiry of current access token does not match with the expiry of the last token when this function was executed
                        //means that the access token has changed therefore we need to reconfigure the "setTimeOut"
                        this.startRefreshTokenTimer(jwtToken.exp);
                    }
                    //set the last access token expiry because we've found one
                    this.lastAccessTokenExpiry = jwtToken.exp;
                } else {
                    this.lastAccessTokenExpiry = null;
                }
            } else {
                this.lastAccessTokenExpiry = null;
            }
            //reset the refresh token counter
            this.tokenRefreshCounter = 0;
        }
    }

    private refreshExpiredToken(): void {
        //if the user has a token in localStorage but its expired, refresh his token
        this.authService.refreshToken(RefreshTokenRequestSources.AdminAppComponent).subscribe(r => {
            if (r.Success) { //token refreshed successfully
            } else { //error in refreshing the token may mean the cookie might be null or even expired
                this.onRefreshTokenErrorResponse(r);
            }
        }, e => {
            //failed to refresh the access token (might be internal server error and not related to the backend code)
        });
    }

    private startRefreshTokenTimer(tokenExpiry: any) {
        var refreshTokenInXSeconds: number = getTokenRefreshTimeOut(tokenExpiry);

        var expectedTokenRefreshDate = new Date();
        expectedTokenRefreshDate.setSeconds(expectedTokenRefreshDate.getSeconds() + (refreshTokenInXSeconds / 1000));
        console.log('Renewing the token in ' + (refreshTokenInXSeconds / 1000).toFixed(2) + ' seconds. Token is expiring in ' +
            ((refreshTokenInXSeconds / 1000) + environment.REFRESH_TOKEN_X_SECONDS_BEFORE_EXPIRY).toFixed(2) + ' seconds. ' +
            'Expected renew date ' + (expectedTokenRefreshDate));

        //if there's already an instance of timer, clear it first before hooking up with another
        if (this.refreshTokenTimeout != null) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null;
        }

        //start the refresh timeout counter so that we can refresh the access token before its expiry date to give user a smooth flow
        this.refreshTokenTimeout = setTimeout(() => {
        //refresh the token
        this.authService.refreshToken(RefreshTokenRequestSources.AdminAppComponent).subscribe(r => {
            if (r.Success) {
                //token refreshed successfully
            } else {
                //error in refreshing the token might mean the cookie might be null or even expired
                this.onRefreshTokenErrorResponse(r);
            }
        });
        }, refreshTokenInXSeconds);
    }

    private onRefreshTokenErrorResponse(errorResponse: RefreshTokenResponse) {
        //failed to refresh the access token so stop the timer
        this.stopRefreshTokenTimer();

        if (!errorResponse.IsRefreshCookieExists) {
            //refresh token cookie does not even exists which mean we should log this user out and do a reload
            this.authService.logout().subscribe(r => {
                //reload the window after user has been logged out
                window.location.reload();
            });
        }
    }

    protected stopRefreshTokenTimer() {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null;
        }
    }

    public ngOnDestroy() {

    }
}