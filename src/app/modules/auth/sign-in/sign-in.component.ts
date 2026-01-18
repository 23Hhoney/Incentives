import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth/auth.service';
import { NotificationService } from 'app/shared/notification/notification';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { cloneDeep } from 'lodash-es';
import { TranslocoService } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';
import { NavigationMockApi } from 'app/mock-api/common/navigation/api';
import { BsModalService } from 'ngx-bootstrap/modal';
import { MatDialog } from '@angular/material/dialog';
import { LoggedInSessionContract, SharedService } from 'app/shared/shared-service';
import { IncentiveAdminPanelService } from 'app/modules/incentive-admin-panel/incentive-admin-panel.service';
import { environment } from 'environments/environment';
@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    styleUrls: ['./sign-in.component.scss']
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    @ViewChild('loginButton', { static: false }) loginElement!: ElementRef;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    hide = true;
    auth: any;
    IsMultipleOrg: boolean = false;
    _authenticated: boolean = false;
    showGoogleSignIn: boolean = false;

    _defaultNavigation: FuseNavigationItem[] = [];

    loginuser: any;
    users: any;
    /**
     * Constructor
     */
    orgs=[]
    role: any;
    modalRef: any;
    emailLabel: string;
    emailPlaceholder: string;
    constructor(
        private _matDialog: MatDialog,
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _notificationService: NotificationService,
        private translate: TranslateService,
        private _fuseMockApiService: FuseMockApiService,
        private _sharedService: SharedService,
        private _transloco: TranslocoService,
        private _incentiveAdminService :  IncentiveAdminPanelService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required]],
            password: ['', Validators.required],
            rememberMe: false
        });
        this.signInForm.enable();
        

        this._incentiveAdminService.getProgramConfigruationdata().subscribe(data => {
            this.showGoogleSignIn = data[0].isgoogleSign;
            if (data[0]?.userEmailAsUserId === false) {
                this.emailLabel = 'User ID';
                this.emailPlaceholder = 'Enter User ID';
            } else {
                this.emailLabel = 'Username';
                this.emailPlaceholder = 'username@gmail.com';
            }
        });
        this.googleAuthSDK();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }
    
        // Disable the form
        // this.signInForm.disable();
    
        // Hide the alert
        this.showAlert = false;
    
        const payload = this.signInForm.getRawValue();
        payload.rememberMe = payload.rememberMe ? payload.rememberMe : false;
    
        // Sign in
        this._authService.signIn(payload).subscribe((ele: any) => {
            if (ele.isSuccesfull) {
                window.sessionStorage.setItem('email', this.signInForm.value.email);
                window.sessionStorage.setItem('password', this.signInForm.value.password);
                window.sessionStorage.setItem('rememberMe', this.signInForm.value.rememberMe);
                window.sessionStorage.setItem('accessToken', ele.sessionID);
                window.sessionStorage.setItem("userId", ele.userID);
                window.sessionStorage.setItem("name", ele.name);
                window.sessionStorage.setItem("bpNumber", ele.bpNumber);
                window.sessionStorage.setItem("emailId", encodeURIComponent(ele.email));               
                window.sessionStorage.setItem("isLmsAdmin", ele.isLmsAdmin);
    
                const userObj = {
                    accessToken: ele.sessionID,
                    firstName: ele.name,
                    iat: '',
                    lastName: '',
                    role: '',
                    id: ele.userId,
                    showIncentiveAdmin: false,
                    showLemsAdmin: false,
                    showUserIdasEmail: false,
                    showLMSAdmin: false,
                };
    
                this._incentiveAdminService.GetProgramConfiguration().subscribe((settings: any) => {
                    let showLems = true;
                    let showIncentive = true;
                    let showUserIdasEmail = true;
                    let showLMSAdmin = window.sessionStorage.getItem("isLmsAdmin") === 'true';
    
                    if (settings && settings.length > 0) {
                        showIncentive = settings[0].includePointsSystem;
                        showLems = settings[0].includeAcademySystem;
                        showUserIdasEmail = settings[0].userEmailAsUserId;
                        window.sessionStorage.setItem("includePointsSystem", JSON.stringify(settings[0].includePointsSystem));
                        window.sessionStorage.setItem("userEmailAsUserId", JSON.stringify(settings[0].userEmailAsUserId));
                        window.sessionStorage.setItem("userOnbe", JSON.stringify(settings[0].userOnbe));
                        window.sessionStorage.setItem("userNeoCurrency", JSON.stringify(settings[0].userNeoCurrency));
                    }
    
                    this._incentiveAdminService.GetUserNotificationRequiredCourses(window.sessionStorage.getItem("userId")).subscribe(data => {
                        // Handle courses data if necessary
                    });
    
                    const expirationMessage = ele.message; // "Token Will Expire At 3/2/2025 12:47:38 PM"
                    const expirationDate = new Date(expirationMessage.split("At ")[1]);
                    
                    // Store the actual expiration timestamp instead of duration
                    const expiryTimestamp = Math.floor(expirationDate.getTime() / 1000);
                    window.sessionStorage.setItem('expiry', expiryTimestamp.toString());
    
                    const roles = ele.roles;
                    if (roles && roles.length > 0) {
                        const roleName = roles[0].role;
                        const roleId = roles[0].id;
                        window.sessionStorage.setItem('role', roleName);
                        window.sessionStorage.setItem('roleId', roleId);
    
                        if (environment.deployAdmin) {
                            if (roleName === 'User') {
                                window.sessionStorage.clear();
                                this._notificationService.errorTopRight('You are trying to login with user to the admin portal');
                                return;
                            } else {
                                window.sessionStorage.setItem("usertype", 'admin'); // same type for both lems and incentive
    
                                if (showIncentive && ele.userModulePermissions) {
                                    const enabledModulePermissions = ele.userModulePermissions.filter(permission => permission.isEnabled);
                                    this._sharedService.setModulePermission(enabledModulePermissions);
                                    this._sharedService.setModuleSettingsPermission(ele.userModulesSettingData);
                                }
    
                                userObj.role = roleName;
                                userObj.showIncentiveAdmin = showIncentive;
                                userObj.showLemsAdmin = showLems;
                                userObj.showUserIdasEmail = showUserIdasEmail;
                                userObj.showLMSAdmin = showLMSAdmin;
                                this._authService.setAuthenticated(true);
                            }
                        } else {
                            if (roleName === 'User') {
                                window.sessionStorage.setItem("usertype", 'normaluser');
                                userObj.role = roleName;
    
                                this._authService.setAuthenticated(true);
                            } else {
                                window.sessionStorage.clear();
                                this._notificationService.errorTopRight('You are trying to login with admin to the user portal');
                                return;
                            }
                        }
    
                        this._sharedService.setLoggedInObject(userObj);
                        const vardb={
                            "id": window.sessionStorage.getItem("userId"),
                            "isLogin": true
                          }
                        this._authService.SignInforCheckingUser(vardb).subscribe((data: any) => {
                            console.log('checking logged in user',data)
                            if (data.isSuccess) {
                            }
                        });

                        this._authService.getUseLoggedinList().subscribe((resp:any) => {
      
                            if (resp && resp.length > 1) {
                       
                              window.sessionStorage.setItem('isDraftLocked', 'true');
                            } else {
                                window.sessionStorage.setItem('isDraftLocked', 'false');
                            }
                          }, error => {
                            
                            window.sessionStorage.setItem('isDraftLocked', 'false');
                          });
                        // Set the redirect URL based on user type
                        let redirectURL = '/incentive-admin-home'; // Default redirect URL
                        if (window.sessionStorage.getItem("usertype") === 'normaluser') {
                            redirectURL = '/signed-in-redirect'; // Redirect for normal users
                        } else {
                            redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || redirectURL;
                        }
    
                        this._router.navigateByUrl(redirectURL);
                        new NavigationMockApi(this._fuseMockApiService).registerHandlers();
                    } else {
                        this._notificationService.errorTopRight('User does not have any valid role assigned');
                    }
                });
            } else {
                this._notificationService.errorTopRight(ele.message);
                // Re-enable the form
                this.signInForm.enable();
    
                // Reset the form
                this.signInNgForm.resetForm();
            }
        });
    }


    
   

  togglePasswordVisibility() {
    this.hide = !this.hide;
  }
    GetUserModulePermissionByUserId(){
        let payload ={
             userId:  window.sessionStorage.getItem('userId')
         }
         this._authService.getPermissionsByUserId(payload).subscribe(data=>{
          console.log('check data',data)
         })
        }

    googleAuthSDK() {
        (<any>window)['googleSDKLoaded'] = () => {
            (<any>window)['gapi'].load('auth2', () => {
            this.auth = (<any>window)['gapi'].auth2.init({
                client_id: environment.clientId,
                plugin_name: 'login',
                cookiepolicy: 'single_host_origin',
                scope: 'profile email',
            });
            this.googleLogin();
            });
        };
        const existingScript = document.getElementById('google-jssdk');
        if (existingScript) {
            existingScript.remove();
        }

        (function (d, s, id) {
            const fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
            return;
            }
            const js = d.createElement('script');
            js.id = id;
            js.src =
            'https://apis.google.com/js/platform.js?onload=googleSDKLoaded';
            fjs?.parentNode?.insertBefore(js, fjs);
        })(document, 'script', 'google-jssdk');
    }
    googleLogin() {
        this.auth.attachClickHandler(this.loginElement.nativeElement,{},(googleAuthUser: any) => {
            const input = {
                token: googleAuthUser.getAuthResponse().id_token,
            };
            this._authService.googleAuth(input).subscribe((ele: any) => {
                if (ele.isSuccesfull) {

                    window.sessionStorage.setItem('email', this.signInForm.value.email);
                    window.sessionStorage.setItem('password', this.signInForm.value.password);
                    window.sessionStorage.setItem('rememberMe', this.signInForm.value.rememberMe);
                    window.sessionStorage.setItem('accessToken', ele.sessionID);
                    window.sessionStorage.setItem("userId", ele.userID);
                    window.sessionStorage.setItem("name", ele.name);
                    window.sessionStorage.setItem("bpNumber", ele.bpNumber);

                    const userObj = {
                        accessToken: ele.sessionID,
                        firstName:ele.name,
                        iat:'',
                        lastName:'',
                        role:'',
                        id:ele.userId,
                        showIncentiveAdmin:false,
                        showLemsAdmin:false,
                        showUserIdasEmail:false,
                        showLMSAdmin:false
                    }
                    this._incentiveAdminService.GetProgramConfiguration().subscribe((settings:any) =>{
                        let showLems = true;
                        let showIncentive = true;
                        let showUserIdasEmail = true;
                        if(settings && settings.length >0) {
                            showIncentive = settings[0].includePointsSystem
                            showLems = settings[0].includeAcademySystem;
                            showUserIdasEmail=settings[0].userEmailAsUserId
                            window.sessionStorage.setItem("includePointsSystem", JSON.stringify(settings[0].includePointsSystem))
                            window.sessionStorage.setItem("userEmailAsUserId",JSON.stringify(settings[0].userEmailAsUserId))
                            window.sessionStorage.setItem("userOnbe",JSON.stringify(settings[0].userOnbe))
                            window.sessionStorage.setItem("userNeoCurrency",JSON.stringify(settings[0].userNeoCurrency))
                        }
                        const roles = ele.roles
                        if(roles && roles.length>0 ){
                            const roleName = roles[0].role;

                            if(environment.deployAdmin) {
                                if(roleName == 'User') {
                                    window.sessionStorage.clear();
                                    this._notificationService.errorTopRight('You are trying to login with user to the admin portal');
                                    return;
                                }
                                else {
                                    window.sessionStorage.setItem("usertype", 'admin'); // same type for both  lems and incentive
        
                                    if(showIncentive && ele.userModulePermissions) {
                                        const moduleIds = ele.userModulePermissions.map(permission => permission.moduleId);
                                        const moduleIdObject = moduleIds;
                                        this._sharedService.setModulePermission(moduleIdObject);
                                        this._sharedService.setModuleSettingsPermission(ele.userModulesSettingData);
                                    }
        
                                    userObj.role = roleName;
                                    userObj.showIncentiveAdmin = showIncentive;
                                    userObj.showLemsAdmin = showLems;
                                    userObj.showUserIdasEmail=showUserIdasEmail;
    
                                    this._authService.setAuthenticated(true);
                                    this._sharedService.setLoggedInObject(userObj);
                                    const vardb={
                                        "id": window.sessionStorage.getItem("userId"),
                                        "isLogin": true
                                      }
                                    this._authService.SignInforCheckingUser(vardb).subscribe((data: any) => {
                                        if (data.isSuccess) {
                                        }
                                    });
            
                                    this._authService.getUseLoggedinList().subscribe((resp:any) => {
                  
                                        if (resp && resp.length > 1) {
                                   
                                          window.sessionStorage.setItem('isDraftLocked', 'true');
                                        } else {
                                            window.sessionStorage.setItem('isDraftLocked', 'false');
                                        }
                                      }, error => {
                                        
                                        window.sessionStorage.setItem('isDraftLocked', 'false');
                                      });
                                }
                            } else {
                                if(roleName == 'User') {
                                    window.sessionStorage.setItem("usertype", 'normaluser');
                                    userObj.role = roleName;
 
                                    this._authService.setAuthenticated(true);
                                }
                                else {
                                    window.sessionStorage.clear();
                                    this._notificationService.errorTopRight('You are trying to login with admin to the user portal');
                                    return; 
                                }
                            }
                            this._sharedService.setLoggedInObject(userObj);
                            const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                            this._router.navigateByUrl(redirectURL);
                            new NavigationMockApi(this._fuseMockApiService).registerHandlers();
                        } else {
                            this._notificationService.errorTopRight('User does not have any valid role assigned');
                        }
                    });
                }
                else {
                    this._notificationService.errorTopRight(ele.message);
                    this.signInForm.enable();
                    this.signInNgForm.resetForm();
                }
            });
        },
        (error: any) => {
            console.log(JSON.stringify(error, undefined, 2));
        },);
    }
}
