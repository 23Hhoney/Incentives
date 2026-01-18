import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'app/shared/notification/notification';
import { EmailTemplateService } from '../email-template.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview-email-template',
  templateUrl: './preview-email-template.component.html',
  styleUrls: ['./preview-email-template.component.scss']
})
export class PreviewEmailTemplateComponent {
  templateId: string | null = null;
  emailData: any = {};
  safeHtml: SafeHtml;
  constructor(
    private service: EmailTemplateService,
    private route: ActivatedRoute,
    private _router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.templateId = params['id'];
      if (this.templateId) {
        this.loadTemplateDetails(this.templateId);
      }
    });
    

  }

  loadTemplateDetails(templateId: string) {
    this.service.GetTemplateDetails(templateId).subscribe((data: any) => {
      if (data) {
        this.emailData = data;
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.emailData.body);
      }
    });
  }

  goBack() {
    this._router.navigate(['/email-template']); // Adjust the route as needed
  }
}
