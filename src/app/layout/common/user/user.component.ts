import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, catchError, takeUntil, of } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { SharedService } from 'app/shared/shared-service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'app/shared/notification/notification';
import { MyAccountService } from 'app/modules/pages/my-account/my-account.service';
import { environment } from 'environments/environment';

@Component({
    selector       : 'user',
    templateUrl    : './user.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'user'
})
export class UserComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    @Input() editMode: boolean = false;
    user: User;
    userProfilePicture = 'assets/images/default_user.png'
    email:string;
    userName: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    orgName: string;
    userRole = '';
    profileAndPasswordForm: FormGroup;
    permissionsForm: FormGroup;
    isUserProfileLoading = false;
    modal: any;
    modalForRolesandPermissions: any;
    isProfileUpdating = false;
    userModulesSettingData: any[] = [];


    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private _sharedService: SharedService,
        private _formbuilder:FormBuilder,
        private _matDialog: MatDialog,
        private _notificationService: NotificationService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.userRole = window.sessionStorage.getItem("usertype");
        this.email = window.sessionStorage.getItem('userLogin');
        
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this._sharedService._profilePicture$.subscribe((data)=>{
            if(data) {
                this.userProfilePicture = data;
                this._changeDetectorRef.markForCheck();
            }
        })
        this._sharedService._userName$.subscribe((data) => {
            this.userName = data;
        })
        this.getProfilePicture();
        this.userName = window.sessionStorage.getItem('name');
        this.profileAndPasswordForm = this._formbuilder.group({
            id: new FormControl(''),
            firstName: new FormControl(''),
            lastName: new FormControl(''),
            contactNumber: new FormControl(''),
            email: new FormControl({ value: '', disabled:true}),
            currentPassword: new FormControl(null),
            newPassword: [null, [this.passwordValidator(), Validators.minLength(8)]],
            confirmNewPassword: new FormControl(null)
        }, { validator: this.passwordMatchValidator.bind(this) });
        
        this.permissionsForm = this._formbuilder.group({

        })
    }

    getProfilePicture() {
        // setting default image until it fetches the actual profile picture.
        this._sharedService.setProfilePicture('assets/images/default_user.png');
        this._userService.getProfileImage(window.sessionStorage.getItem('userId')).pipe(
            catchError(error => {
                this._sharedService.setProfilePicture(this.userProfilePicture);
                return of(null);
            })
        ).subscribe(data=>{
          if (data) {
            var blob = new Blob([data]);
            var objectUrl = URL.createObjectURL(blob);
            this._sharedService.setProfilePicture(objectUrl);
          }
        })
      }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void
    {
        // Return if user is not available
        if ( !this.user )
        {
            return;
        }

        // Update the user
        this._userService.update({
            ...this.user,
            status
        }).subscribe();
    }

    /**
     * Sign out
     */
    signOut(): void
    {
        // sessionStorage.clear();
        this._router.navigate(['/sign-out']);
    }
    passwordValidator() {
        return (control: { value: string }) => {
          const value = control.value;
          const hasNumber = /\d/.test(value);
          const hasUpper = /[A-Z]/.test(value);
          const hasLower = /[a-z]/.test(value);
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          const valid = hasNumber && hasUpper && hasLower && hasSpecial;
          if (!valid) {
            return { passwordStrength: true };
          }
          return null;
        };
      }
    
    passwordMatchValidator(formGroup: FormGroup) {
        const { newPassword, confirmNewPassword } = formGroup.controls;
        if (!newPassword.value) {
          return;
        }
        return newPassword.value === confirmNewPassword.value ? null : { mismatch: true };
      }
    Routetoaccount()
    {
        this._router.navigate(['/account'])
    }
    RoutetoPerformance()
    {
        this._router.navigate(['/performance'])
    }
    handleProfileAndPasswordChange(modalName) {
        this.isUserProfileLoading = true;
        this._userService.getUserProfileInfo(window.sessionStorage.getItem('userId'), environment.tentantcode).pipe(
          catchError(error => {
            this._notificationService.errorTopRight('Something went wrong. Unable to get user data')
            console.log(error);
            this.isUserProfileLoading =  false;
            return of(null);
          })
        ).subscribe(data=>{
          this.isUserProfileLoading =  false;
          console.log(this.profileAndPasswordForm.getRawValue());
          if (data && Object.keys(data).length) {
            this.profileAndPasswordForm.patchValue({
              id: data.id,
              firstName: data.firstName,
              lastName: data.lastName,
              contactNumber: data.phone,
              email: data.email,
            });
            console.log(this.profileAndPasswordForm.getRawValue());
          } else {
            this._notificationService.errorTopRight('Something went wrong. Invalid user data')
            return;
          }
        })
        this.modal = this._matDialog.open(modalName, { panelClass: 'edit-profile-picture' });
      }

    handleProfileAndPasswordSubmit() {
        const formData = this.profileAndPasswordForm.getRawValue();
    
        formData.contactNumber = formData.contactNumber ? formData.contactNumber.trim() : '';
        if (formData.newPassword) {
          if (formData.newPassword === formData.currentPassword) {
            this._notificationService.errorTopRight('The new password must be different from the current password.');
            return;
          } else if (this.profileAndPasswordForm.invalid) {
            return;
          } else if (!formData.currentPassword) {
            this._notificationService.errorTopRight('Please enter current password.');
            return;
          }
        }
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      
        if (!formData.firstName || formData.firstName === '') {
          this._notificationService.errorTopRight('Please Enter First Name');
        } else if (!formData.lastName || formData.lastName === '') {
          this._notificationService.errorTopRight('Please Enter Last Name');
        } else if (!formData.contactNumber || formData.contactNumber === '') {
          this._notificationService.errorTopRight('Please Enter Contact Number');
        } else if (!phoneRegex.test(formData.contactNumber)) {
          this._notificationService.errorTopRight('Please Enter a valid Contact Number in the format (xxx) xxx-xxxx');
        } else if (!formData.email || formData.email === '') {
          this._notificationService.errorTopRight('Please Enter Email');
        } else {
          this.isProfileUpdating = true;
    
          const payload = {
            "id": formData.id,
            "firstName": formData.firstName,
            "lastName": formData.lastName,
            "email": formData.email,
            "phone": formData.contactNumber,
            "oldPassword": formData.currentPassword,
            "newPassword": formData.newPassword
          };
      
          this._userService.updateUserProfileInfo(environment.tentantcode, payload).pipe(
            catchError(error => {
              this.isProfileUpdating = false;
              console.log("Error:", error);
              this._notificationService.errorTopRight('Something went wrong, unable to update profile');
              return of(null);
            })
          ).subscribe(data => {
            this.isProfileUpdating = false;
            if (data.isSuccess) {
              const userName = (formData.firstName + " " + formData.lastName).trim();
              this._notificationService.successTopRight("Profile updated successfully!");
              this._sharedService.setUserName(userName);
              this.handleCanceProfileAndPasswordUpdate();
            } else {
              this._notificationService.errorTopRight(data?.message ?? 'Please enter a valid old password. The password you provided does not match.');
            }
            
          });
        }
      }
      
      
    
      handleCanceProfileAndPasswordUpdate() {
        this.modal.close();
        this.profileAndPasswordForm.reset();
      }
      initializeForm() {
        const formGroup: any = {};
        this.userModulesSettingData.forEach((module, index) => {
          formGroup[`module_${index}`] = new FormControl(module.isEnabled);
        });
        this.permissionsForm = this._formbuilder.group(formGroup);
      }
      RolesAndPermissionChanges(modalName: any) {
        this.isUserProfileLoading = true;
      
        const role = window.sessionStorage.getItem('role');
      
        this._userService
          .getUserProfileInfo(window.sessionStorage.getItem('userId'), environment.tentantcode)
          .pipe(
            catchError((error) => {
              this._notificationService.errorTopRight('Something went wrong. Unable to get user data');
              console.error(error);
              this.isUserProfileLoading = false;
              return of(null);
            })
          )
          .subscribe((data: any) => {
            if (data) {
              if (role === 'Super Admin') {
               
                this.userModulesSettingData = data.userModulesSettingData;
              } else {
                this.userModulesSettingData = data.userModulesSettingData.filter(
                  (module: any) => module.moduleId !== 'proc' && module.moduleId !== 'ordm'
                );
              }
              this.initializeForm();
            }
            this.isUserProfileLoading = false;
          });
      
        this.modalForRolesandPermissions = this._matDialog.open(modalName, {
          panelClass: 'manage-module-permission',
          width: '900px',
        });
      }
      
      CanceRolesAndPermission() {
        this.modalForRolesandPermissions.close();
        
      }

      updateModulePermissions() {
        this.isProfileUpdating = true;
    
        const updatedPermissions = this.userModulesSettingData.map((module, index) => {
          return {
            id: module.id,
            moduleId: module.moduleGuidId,
            userId: window.sessionStorage.getItem('userId'),
            isEnabled: this.permissionsForm.get(`module_${index}`).value,
          };
        });
    
        this._userService.UpdateSoftPermissionsforUser(updatedPermissions).subscribe(
          (response) => {
            if (response.isSuccess) {
              this._notificationService.successTopRight('Permissions updated successfully');
              this.isProfileUpdating = false;
  
          
              this._userService.getUserProfileInfo(window.sessionStorage.getItem('userId'), environment.tentantcode).subscribe((data: any) => {
                if (data) {
         
                  const enabledModulePermissions = data.userModulesSettingData.filter(permission => permission.isEnabled);
                  this._sharedService.setModulePermission(enabledModulePermissions);
                   window.location.reload();
                }
                this.isUserProfileLoading = false;
              });
              
              this.modalForRolesandPermissions.close();
            } else {
              this._notificationService.errorTopRight('Failed to update permissions');
              console.error('Permission update failed:', response);
              this.isProfileUpdating = false;
            }
          },
          (error) => {
            this._notificationService.errorTopRight('Failed to update permissions');
            console.error(error);
            this.isProfileUpdating = false;
          }
        );
        
      }

}
