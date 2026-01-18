import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CurriculumManagerService } from '../curriculum-manager.service';
import { NotificationService } from 'app/shared/notification/notification';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { checkValidText } from 'app/shared/validation/validation-utils';

@Component({
  selector: 'app-curriculum-manager-add-edit',
  templateUrl: './curriculum-manager-add-edit.component.html',
  styleUrls: ['./curriculum-manager-add-edit.component.scss']
})
export class CurriculumManagerAddEditComponent {
  CirriculumManagerForm:FormGroup;
  cirriculumId: any;
  languages: string[] =[];
  selectedLanguage: string = ''; // Default value or initialize as needed
  isSpanishActive: boolean = false;
  isFrenchActive: boolean = false;
  lang: any;
  cirruiculumId: any;
  showSpanishVersion: boolean = false;
  manageCourseVersions: any[] = [];
showFrenchVersion: boolean = false;
  constructor(
    private fb: FormBuilder,
    private service: CurriculumManagerService,
    private notificationService: NotificationService,
    private matDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) {this.cirriculumId = this.route.snapshot.params['id'];
    {this.cirruiculumId= this.route.snapshot.params['ids'];}
  this.lang = this.route.snapshot.params['lang']; }

  ngOnInit(): void {
    this.CirriculumManagerForm = this.fb.group({
      name: [''],
      description: [''],
      language: [''],
      isActive: true, 
      isSpanishActive: false, 
     isFrenchActive: false  
    });
    this.EditData();
    this.GetAllLanguages();
  }
  onLanguageChange(event) {
    const lang = this.CirriculumManagerForm.get('language')?.value;
    this.service.GetCirriculumByCurriculumCopyId(this.cirriculumId, lang).subscribe((data: any) => {
      if (data.id != '00000000-0000-0000-0000-000000000000') {
        this.CirriculumManagerForm = this.fb.group({
          name: data.name,
          isActive: data.isActive,
          description: data.description,
          language: data.language,
          isSpanishActive: data.manageCourseVersions.some(version => version.language === 'Spanish' && version.languageVersion),
          isFrenchActive: data.manageCourseVersions.some(version => version.language === 'French' && version.languageVersion)
        });

        this.showSpanishVersion = data.manageCourseVersions.some(version => version.language === 'Spanish');
        this.showFrenchVersion = data.manageCourseVersions.some(version => version.language === 'French');
        this.manageCourseVersions = data.manageCourseVersions;
      } else {
        this.CirriculumManagerForm.controls['name'].setValue(null);
        this.CirriculumManagerForm.controls['description'].setValue(null);
        this.CirriculumManagerForm.controls['isActive'].setValue(false);
        this.showSpanishVersion = false;
        this.showFrenchVersion = false;
      }
    });
  }
    
  EditData() {
    if (this.cirriculumId) {
      this.service.GetCirriculumByCurriculumCopyId(this.cirriculumId, this.lang).subscribe((data: any) => {
        this.CirriculumManagerForm = this.fb.group({
          name: data.name,
          isActive: data.isActive,
          description: data.description,
          language: data.language,
          isSpanishActive: data.manageCourseVersions.some(version => version.language === 'Spanish' && version.languageVersion),
          isFrenchActive: data.manageCourseVersions.some(version => version.language === 'French' && version.languageVersion)
        });

        this.showSpanishVersion = data.manageCourseVersions.some(version => version.language === 'Spanish');
        this.showFrenchVersion = data.manageCourseVersions.some(version => version.language === 'French');

        this.manageCourseVersions = data.manageCourseVersions;
      });
    }
  }
  onCheckboxChange(isActiveValue: boolean): void {
    this.CirriculumManagerForm.get('isActive')?.setValue(isActiveValue);
  }
  GetAllLanguages(){
    this.service.GetAllLanguages().subscribe(data => {
      this.languages = data.map(x => x.name);
    });
  }

  SaveOrupdateCirriculum() {
    const validateForm = this.checkvalidation();
    if (validateForm) {
      const object = {
        id: this.cirruiculumId ? this.cirruiculumId : null,
        name: this.CirriculumManagerForm.get('name')?.value,
        language: this.CirriculumManagerForm.get('language')?.value,
        description: this.CirriculumManagerForm.get('description')?.value,
        isActive: this.CirriculumManagerForm.get('isActive')?.value,
        curriculumCopyId: this.cirriculumId,
        manageCourseVersions: this.manageCourseVersions.map(version => ({
          id: version.id,
          languageVersion: this.CirriculumManagerForm.get(`is${version.language}Active`)?.value,
          language: version.language
        }))
      };

      this.service.SaveOrUpdateCirriculumManager(object).subscribe(data => {
        if (data.isSuccess) {
          const successMessage = this.cirriculumId ? 'Data updated Successfully' : 'Data saved Successfully';
          this.notificationService.successTopRight(successMessage);
          this.router.navigate(['/curriculum-manager']);
        } else {
          const errorMessage = this.cirriculumId ? 'Some error occurred' : 'Curriculum Name already exists.';
          this.notificationService.errorTopRight(errorMessage);
        }
      });
    }
  }
    

  checkvalidation(): boolean {
     if (!checkValidText(this.CirriculumManagerForm.get('name').value)) {
      this.notificationService.errorTopRight('Please Fill Name');
      return false;
    // } else if (!checkValidText(this.CirriculumManagerForm.get('description').value)) {
    //   this.notificationService.errorTopRight('Please Fill Description');
    //   return false;
    } else {
      return true;
    } 
  }

  cancel()
  {
    this.router.navigate(['/curriculum-manager']);
  }

  
}
