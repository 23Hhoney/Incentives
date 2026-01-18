import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, of, switchMap, throwError} from 'rxjs';
import {AuthUtils} from 'app/core/auth/auth.utils';
import {UserService} from 'app/core/user/user.service';
import {environment} from '../../../environments/environment';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    orgsId=[]
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private httpservice:HttpService,
        private _httpClients:HttpService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        sessionStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return sessionStorage.getItem('accessToken') ?? '';
    }

    setAuthenticated(auth: boolean) {
        this._authenticated = auth;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------



    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        return this._httpClient.post(`${environment.apiUrl}Login`, credentials)
    }
    ResetPassword(req): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}ResetPassword`, req)
    }
    ForgotPassword(bpNumber): Observable<any> {
        const encodedBpNumber = encodeURIComponent(bpNumber);
        return this._httpClient.get(`${environment.apiUrl}ForgotPasswordUsingBpnumber/${encodedBpNumber}`);
    }
    getUserName(email): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}ForgotYourUserId/${email}`);
    }
    googleAuth(req): Observable<any> {
        // Throw error, if the user is already logged in
        return this._httpClient.post(`${environment.apiUrl}googleAuth`, req)
    }
    GetUserSession(req): Observable<any>
    {
        // Throw error, if the user is already logged in
        return this._httpClient.post(`${environment.apiUrl}GetUserSession`, req)
    }
    

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient.post('api/auth/sign-in-with-token', {
            accessToken: this.accessToken
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {

                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if (response.accessToken) {
                    this.accessToken = response.accessToken;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        sessionStorage.removeItem('accessToken');
        window.sessionStorage.clear();
        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }
    signOutUser(request)
    {
        return this._httpClient.post(`${environment.apiUrl}api/CourseSlideMedia/UpdateLoginReport`, request);
    }
    SignInforCheckingUser(request)
    {
        return this._httpClients.post(`api/User/UpdateUserLogin/`+'flatworld', request);
    }
    getUseLoggedinList(){
        return this._httpClients.get('api/User/ListAdminUserLogin/'+environment.tentantcode)
      }
    /**
     * Sign up
     *
     * @param user
     */

    signUp(user: any): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}Regsiter`, user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        const currentUrl = window.location.href;
        if (currentUrl.includes('/kohler-studio-course')) {
          return of(true); 
        }
      
        // Regular session validation
        if (this._authenticated) {
          return of(true);
        }
      
        if (this.accessToken) {
          return of(true);
        }
      
        if (!this.accessToken || AuthUtils.isTokenExpired(this.accessToken)) {
          return of(false);
        }
      
        return this.signInUsingToken();
      }

    getUserSubscription(userId): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}api/user/getUserSubscription/`+userId);
    }

    getOrgSubscription(orgId): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}api/user/getOrgSubscription/`+orgId);
    }

    getPermissionsByUserId(request){ 
        return this.httpservice.post('api/Module/GetUserModulePermissionByUserId',request);
    }
}
