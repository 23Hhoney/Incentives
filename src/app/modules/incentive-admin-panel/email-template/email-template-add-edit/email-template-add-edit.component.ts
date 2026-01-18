import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailTemplateService } from '../email-template.service';
import { NotificationService } from 'app/shared/notification/notification';
import { Router, ActivatedRoute } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-email-template-add-edit',
  templateUrl: './email-template-add-edit.component.html',
  styleUrls: ['./email-template-add-edit.component.scss']
})
export class EmailTemplateAddEditComponent implements OnInit {
  EmailForm: FormGroup;
  isEditMode = false;
  isSavingemail = false;
  emailId: string | null = null;
  editor = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'redo', 'undo', 
      'heading', 'bold', 'italic', 'strong',
      'blockQuote',
      'unlink', 'imageUpload',
      'insertTable', 'bulletedList', 'numberedList', 
    ],
  };
  constructor(
    private router: Router,
    private service: EmailTemplateService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialize form with default values and validators
    this.EmailForm = this._formBuilder.group({
      name: [''],
      subject: [''],
      fromEmail: [''],
      emailTo: [''],
      body: [''],
      emailBcc: [[]],
      emailCC: [[]]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.emailId = params['id'];
        this.GetDetailsById(this.emailId);
      }
    });
  }

  GetDetailsById(emailId: string): void {
    this.service.GetEmailTemplateDetails(emailId).subscribe(
      data => {
        // Populate form with fetched details
        this.EmailForm.patchValue({
          name: data.name,
          subject: data.subject,
          fromEmail: data.emailFrom,
          emailTo: data.emailTo,
          body: data.body,
          emailBcc: data.emailBcc || [],
          emailCC: data.emailCC || []
        });
      },
      error => {
        this._notificationService.errorTopRight('Failed to fetch email template details.');
      }
    );
  }

  SaveOrupdateEmail() {
    // Perform validation
    const isValid = this.checkvalidation();
    if (!isValid) {
      return;
    }
  
    const formValue = this.EmailForm.getRawValue();
  
    // Ensure emailBcc and emailCC are arrays of strings
    const formatEmails = (emails: string | string[]): string[] => {
      if (!emails) {
        return [];
      }
      if (Array.isArray(emails)) {
        return emails
          .join(',')
          .split(',')
          .map((email) => email.trim()) 
          .filter((email) => email);
      }
      return emails
        .split(',') 
        .map((email) => email.trim()) 
        .filter((email) => email); 
    };
    
    const reqBody = {
      id: this.isEditMode ? this.emailId : null,
      name: formValue.name,
      subject: formValue.subject,
      emailFrom: formValue.fromEmail,
      emailTo: formValue.emailTo,
      body: formValue.body,
      emailBcc: formatEmails(formValue.emailBcc),
      emailCC: formatEmails(formValue.emailCC),
    };
  
    this.isSavingemail = true;
  
    this.service.UpdateEmailTemplate(reqBody).subscribe(
      () => {
        this.isSavingemail = false;
        this._notificationService.successTopRight('Email template updated successfully.');
        this.router.navigate(['/email-template']);
      },
      (error) => {
        this.isSavingemail = false;
        this._notificationService.errorTopRight('Failed to update email template.');
        console.error('Error updating email template:', error);
      }
    );
  }
  
  
  
  checkvalidation(): boolean {
    if (!this.EmailForm.get('name')?.value?.trim()) {
      this._notificationService.errorTopRight('Please fill in the title field.');
      return false;
    } else if (!this.EmailForm.get('subject')?.value?.trim()) {
      this._notificationService.errorTopRight('Please fill in the Subject field.');
      return false;
    } else if (!this.EmailForm.get('fromEmail')?.value?.trim()) {
      this._notificationService.errorTopRight('Please fill in the From Email field.');
      return false;
    } else if (!this.EmailForm.get('emailTo')?.value?.trim()) {
      this._notificationService.errorTopRight('Please fill in the To Email field.');
      return false;
    } else if (!this.EmailForm.get('body')?.value?.trim()) {
      this._notificationService.errorTopRight('Please fill in the Email Body.');
      return false;
    } else {
      return true;
    }
  }
  

  cancel(): void {
    this.router.navigate(['/email-template']);
  }
  onReady(eventData) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader) {
      return new UploadAdapter(loader);
    };
  }
}

export class UploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  public async upload(): Promise<any> {
    const file = await this.loader.file;
    return this.readThis(file);
  }

  private readThis(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve({ default: base64String });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

 
}