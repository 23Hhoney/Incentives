import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from "@angular/router";
import { firstValueFrom, map, Observable, of, switchMap } from "rxjs";
import { AuthService } from "app/core/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  /**
   * Constructor
   */
  constructor(private _authService: AuthService, private _router: Router) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Can activate
   *
   * @param route
   * @param state
   */
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
  
    const redirectUrl = state.url === "/sign-out" ? "/" : state.url;
    var authenticated =  await firstValueFrom(this._check(redirectUrl));

    if (authenticated) {

      const requiredType = next.data["userType"]; // Get required role from route data
     
      const userType = window.sessionStorage.getItem("usertype");
      if (requiredType) {

        if(requiredType == 'onebeuser') {
          const onebeConfig = window.sessionStorage.getItem("userOnbe");
          if(onebeConfig == 'true') {
            return true;
          } else  {
            this._router.navigate(['/sign-out']);
            return false;
          }
        } else if(requiredType == 'neocurruser') {
          const neoCurrConfig = window.sessionStorage.getItem("userNeoCurrency");
          if(neoCurrConfig == 'true') {
            return true;
          } else  {
            this._router.navigate(['/sign-out']);
            return false;
          }
        } else {
          if (userType === requiredType) {
            return true;
          } else {
            this._router.navigate(['/sign-out']);
            // this._router.navigate(['/notfound']);
            // this._router.navigateByUrl('/notfound');
            return false;
          }
        }
        
      } else
      return true;
    }
    return false;
  }

  /**
   * Can activate child
   *
   * @param childRoute
   * @param state
   */
  async canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    Promise<boolean | UrlTree>{
   
    // const redirectUrl = state.url === "/sign-out" ? "/" : state.url;
    // return this._check(redirectUrl);
   
    const redirectUrl = state.url === "/sign-out" ? "/" : state.url;
    if (state.url.startsWith('/kohler-studio-course')) {
      // Allow access for this specific route
      return true;
    }
    var authenticated =  await firstValueFrom(this._check(redirectUrl));
    if (authenticated) {
    
      const requiredType = next.data["userType"]; // Get required role from route data

      const userType = window.sessionStorage.getItem("usertype");
      // console.log('requiredType '+ requiredType);
      // console.log('userType '+ userType);
      if(Array.isArray(requiredType)) {
        if(requiredType.includes(userType)) {
          return true;
        } else {
          return false;
        }
      } else if (requiredType) {
        
        // one be route
        if(requiredType == 'onebeuser') {
          const onebeConfig = window.sessionStorage.getItem("userOnbe");
          if(onebeConfig == 'true') {
            return true;
          } else  {
            this._router.navigate(['/sign-out']);
            return false;
          }
        } else if(requiredType == 'neocurruser') {
          const neoCurrConfig = window.sessionStorage.getItem("userNeoCurrency");
          if(neoCurrConfig == 'true') {
            return true;
          } else  {
            this._router.navigate(['/sign-out']);
            return false;
          }
        } else {
          if (userType === requiredType) {
            return true;
          } else {
            this._router.navigate(['/sign-out']);
            // this._router.navigateByUrl('/notfound');
            return false;
          }
        }
      } else
      return true;
    }
    return false;
  }

  /**
   * Can load
   *
   * @param route
   * @param segments
   */
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this._check("/");
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Check the authenticated status
   *
   * @param redirectURL
   * @private
   */
  private _check(redirectURL: string): Observable<boolean> {
    // Check the authentication status
    return this._authService.check().pipe(
      switchMap((authenticated) => {
        // If the user is not authenticated...
        if (!authenticated) {
          // Redirect to the sign-in page
          this._router.navigate(["sign-in"], { queryParams: { redirectURL } });

          // Prevent the access
          return of(false);
        }

        // Allow the access
        return of(true);
      })
    );
  }
}
