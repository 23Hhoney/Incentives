import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { NotificationService } from 'app/shared/notification/notification';

@Component({
    selector     : 'auth-forgot-password',
    templateUrl  : './forgot-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    styleUrls: ['./forgot-password.component.scss']
})
export class AuthForgotPasswordComponent implements OnInit
{
    @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;
    forgotPasswordForm: UntypedFormGroup;
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
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
    ngOnInit(): void
    {
        // Create the form
        this.forgotPasswordForm = this._formBuilder.group({
            email: [''],
            username: ['']
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Send the reset link
     */
    sendResetLink(): void {
        if (!this.forgotPasswordForm.get('username').value || this.forgotPasswordForm.get('username')?.value?.trim() === '') {
            this.notificationService.errorTopRight('Please enter the username')
            return;
        }
        this._authService.ForgotPassword(this.forgotPasswordForm.value.username.trim()).subscribe((resp) => {
            if(resp.isSuccess) {
                this.notificationService.successTopRight('Reset password link sent successfully.');
            } else {
                this.notificationService.errorTopRight(resp.message);
            }
          })
    }

    getUserName() {
        if (!this.forgotPasswordForm.get('email').value || this.forgotPasswordForm.get('email')?.value?.trim() === '') {
            this.notificationService.errorTopRight('Please enter the email')
            return;
        }
        this._authService.getUserName(this.forgotPasswordForm.value.email.trim()).subscribe((resp) => {
            if(resp.isSuccess) {
                this.notificationService.successTopRight('Username sent successfully to your email.');
            } else {
                this.notificationService.errorTopRight(resp.message);
            }
          })
    }
}
