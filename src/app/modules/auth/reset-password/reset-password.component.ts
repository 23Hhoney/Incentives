import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseValidators } from '@fuse/validators';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'app/shared/notification/notification';

@Component({
    selector     : 'auth-reset-password',
    templateUrl  : './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthResetPasswordComponent implements OnInit
{
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    email = null;
    code = null;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private notificationService: NotificationService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.email = params.userId
            this.code = params.token;
        })
        // Create the form
        this.resetPasswordForm = this._formBuilder.group({
                password       : ['', [Validators.required, this.passwordValidator(), Validators.minLength(8)]],
                passwordConfirm: ['', Validators.required]
            },
            {
                validators: FuseValidators.mustMatch('password', 'passwordConfirm')
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset password
     */
    resetPassword(): void {
        if ( this.resetPasswordForm.invalid ) {
            return;
        }
        this.resetPasswordForm.disable();
        
        this.showAlert = false;
        const requestObj = {
            "email": this.email,
            "password": this.resetPasswordForm.value.password,
            "confirmPassword": this.resetPasswordForm.value.passwordConfirm,
            "code": this.code
        }
        this._authService.ResetPassword(requestObj).subscribe((resp) => {
            if(resp.isSuccess) {
                this.router.navigate(['/sign-in'])
                this.notificationService.successTopRight('Password Reset Successfully.')
            } else {
                this.notificationService.errorTopRight('Something went wrong.')
            }
        })
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
}
