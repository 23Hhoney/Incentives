import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CurriculumService } from '../curriculum.service';
import { NotificationService } from 'app/shared/notification/notification';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { checkValidText } from 'app/shared/validation/validation-utils';

@Component({
  selector: 'app-curriculum-edit-add',
  templateUrl: './curriculum-edit-add.component.html',
  styleUrls: ['./curriculum-edit-add.component.scss']
})
export class CurriculumEditAddComponent {
  CirriculumManagerForm: FormGroup;
  cirriculumId: any;
  languages: string[] = [];
  selectedLanguage: string = 'English';
  isSpanishActive: boolean = false;
  isFrenchActive: boolean = false;
  lang: any;
  cirruiculumId: any;
  showSpanishVersion: boolean = false;
  manageCourseVersions: any[] = [];
  showFrenchVersion: boolean = false;
  showLanguage: boolean = false;
  buttonAction: string = '';
  isEditMode: boolean;
  modalReferenceforSlideDelete: any;
  Message: any;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private service: CurriculumService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.cirriculumId = this.route.snapshot.params['id'];
    this.cirruiculumId= this.route.snapshot.params['ids'];
    this.lang = this.route.snapshot.params['lang'];
    this.buttonAction = this.route.snapshot.params['buttonAction'];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.handleButtonAction();
  }

  private initializeForm() {
    this.CirriculumManagerForm = this.fb.group({
      name: [''],
      description: [''],
      language: ['English'],
      isActive: true,
      isSpanishActive: true,
      isFrenchActive: true,
      isSpanish: false,
      isFrench: false
    });
  }

  private handleButtonAction() {
    if (this.buttonAction === 'for_language') {
      this.showLanguage = true;
      this.isEditMode = true;
      this.GetAllLanguages();
      this.EditData();
    } else if (this.buttonAction === 'for_edit') {
      this.showLanguage = false;
      this.isEditMode = true;
      this.EditData();
    }
  }

  onLanguageChange(event) {
    const lang = this.CirriculumManagerForm.get('language')?.value;
    this.service.GetCirriculumByCurriculumCopyId(this.cirriculumId, lang).subscribe((data: any) => {
      if (data && data.id !== '00000000-0000-0000-0000-000000000000') {
        // If data exists for the selected language
        const baseName = data.name?.replace(/_FR$|_SP$/, '') || '';
        const suffix = lang === 'French' ? '_FR' : lang === 'Spanish' ? '_SP' : '';
        
        this.CirriculumManagerForm.patchValue({
          name: baseName + suffix,
          description: data.description,
          isActive: data.isActive
        });
      } else {
        // If creating new language version
        this.service.GetCirriculumByCurriculumCopyId(this.cirriculumId, 'English').subscribe((englishData: any) => {
          const baseName = englishData.name || '';
          const suffix = lang === 'French' ? '_FR' : lang === 'Spanish' ? '_SP' : '';
          
          this.CirriculumManagerForm.patchValue({
            name: baseName + suffix,
            description: englishData.description,
            isActive: englishData.isActive
          });
        });
      }
    });
  }
  

  private updateFormWithData(data: any) {
    this.CirriculumManagerForm.patchValue({
      name: data.name,
      isActive: data.isActive,
      description: data.description,
      language: data.language,
      isSpanishActive: data.manageCourseVersions.some(v => v.language === 'Spanish' && v.languageVersion),
      isFrenchActive: data.manageCourseVersions.some(v => v.language === 'French' && v.languageVersion)
    });
    this.updateVersionFlags(data);
  }

  private updateVersionFlags(data: any) {
    this.showSpanishVersion = data.manageCourseVersions.some(v => v.language === 'Spanish');
    this.showFrenchVersion = data.manageCourseVersions.some(v => v.language === 'French');
    this.manageCourseVersions = data.manageCourseVersions;
  }

  private resetForm() {
    this.CirriculumManagerForm.patchValue({
      name: null,
      description: null,
      isActive: false
    });
    this.showSpanishVersion = false;
    this.showFrenchVersion = false;
  }

  onLanguageVersionEdit(language: 'Spanish' | 'French' | 'English') {
    this.selectedLanguage = language;
    this.updateVersionVisibility(language);
    this.CirriculumManagerForm.patchValue({ language });
    this.EditData();
  }

  private updateVersionVisibility(language: string) {
    switch(language) {
      case 'Spanish':
        this.showSpanishVersion = false;
        this.showFrenchVersion = true;
        break;
      case 'French':
        this.showFrenchVersion = false;
        this.showSpanishVersion = true;
        break;
      case 'English':
        this.showSpanishVersion = true;
        this.showFrenchVersion = true;
        break;
    }
  }

  EditData() {
    if (this.cirriculumId) {
      this.service.GetCirriculumByCurriculumCopyId(this.cirriculumId, this.selectedLanguage)
        .subscribe((data: any) => this.updateFormWithData(data));
    }
  }


  GetAllLanguages() {
    this.service.GetCirriculumByCurriculumCopyId(this.cirriculumId, 'English').subscribe((data: any) => {
      this.manageCourseVersions = data.manageCourseVersions;
      
      this.service.GetAllLanguages().subscribe(languages => {
        const existingLanguages = this.manageCourseVersions.map(v => v.language);
        const availableLanguages = languages.filter(x => !existingLanguages.includes(x.name));
        this.languages = availableLanguages.map(x => x.name);
      });
    });
  }

  

  SaveOrupdateCirriculum() {
    const validateForm = this.checkvalidation();
    if (validateForm) {
      const curriculumRequests = [];
      const baseName = this.CirriculumManagerForm.get('name')?.value;
      const description = this.CirriculumManagerForm.get('description')?.value;
      const isActive = this.CirriculumManagerForm.get('isActive')?.value;
      
      // Add English version (base version)
      curriculumRequests.push({
        id: this.cirruiculumId || '00000000-0000-0000-0000-000000000000',
        name: baseName,
        language: "English",
        description: description,
        isActive: isActive,
        curriculumCopyId: this.cirriculumId,
        languageVersion: true,  // English is always a language version
        manageCourseVersions: [{
          id: '00000000-0000-0000-0000-000000000000',
          language: "English",
          languageVersion: true
        }]
      });
  
      // Add Spanish version if selected
      if (this.CirriculumManagerForm.get('isSpanish')?.value) {
        curriculumRequests.push({
          id: '00000000-0000-0000-0000-000000000000',
          name: `${baseName}_SP`,
          language: "Spanish",
          description: description,
          isActive: isActive,
          curriculumCopyId: this.cirriculumId,
          languageVersion: true,  // Explicitly set to true for Spanish
          manageCourseVersions: [{
            id: '00000000-0000-0000-0000-000000000000',
            language: "Spanish",
            languageVersion: true  // Explicitly set to true
          }]
        });
      }
  
      // Add French version if selected
      if (this.CirriculumManagerForm.get('isFrench')?.value) {
        curriculumRequests.push({
          id: '00000000-0000-0000-0000-000000000000',
          name: `${baseName}_FR`,
          language: "French",
          description: description,
          isActive: isActive,
          curriculumCopyId: this.cirriculumId,
          languageVersion: true,  // Explicitly set to true for French
          manageCourseVersions: [{
            id: '00000000-0000-0000-0000-000000000000',
            language: "French",
            languageVersion: true  // Explicitly set to true
          }]
        });
      }
  
      if (!this.cirriculumId) {
        // New Record
        this.service.BulkSaveAndUpdateLmsCurriculum(curriculumRequests).subscribe(data => {
          if (data.isSuccess) {
            this.notificationService.successTopRight('Data saved Successfully');
            this.router.navigate(['/curriculum']);
          } else {
            this.notificationService.errorTopRight('Curriculum Name already exists.');
          }
        });
      }
    }
  }
  
  UpdateCirriculum() {
    const validateForm = this.checkvalidation();
    if (validateForm) {
      const lang = this.CirriculumManagerForm.get('language')?.value;
      
      // Get the correct ID from manageCourseVersions based on selected language
      const currentVersionId = this.manageCourseVersions.find(
        v => v.language === lang
      )?.id || this.cirruiculumId;
      
      const object = {
        id: currentVersionId,
        name: this.CirriculumManagerForm.get('name')?.value,
        language: lang,
        description: this.CirriculumManagerForm.get('description')?.value,
        isActive: this.CirriculumManagerForm.get('isActive')?.value,
        curriculumCopyId: this.cirriculumId,
        languageVersion: true,  // Always set to true for all languages
        manageCourseVersions: this.manageCourseVersions.map(version => ({
          id: version.id,
          languageVersion: true,  // Always set to true for all versions
          language: version.language
        }))
      };
      
      this.service.SaveOrUpdateCirriculumManager(object).subscribe(data => {
        if (data.isSuccess) {
          this.notificationService.successTopRight(data.message);
          this.router.navigate(['/curriculum']);
        } else {
          this.notificationService.errorTopRight(data.message);
        }
      });
    }
  }
  checkvalidation(): boolean {
    if (!checkValidText(this.CirriculumManagerForm.get('name').value)) {
      this.notificationService.errorTopRight('Please Fill Name');
      return false;
    } else {
      return true;
    }
  }

  cancel() {
    this.router.navigate(['/curriculum']);
  }
 
  onCheckboxChange(isActiveValue: boolean, deletebox: TemplateRef<any>): void {
    this.CirriculumManagerForm.get('isActive')?.setValue(isActiveValue);
    if(isActiveValue === false){
      const body={
        "copyCurriculumId":this.route.snapshot.params['id'],
        "isActive": true
    }
    this.service.CheckLmsCurriculumnInactiveWithCourse(body).subscribe((data: any) => {
    
      if(data.isSuccess === true){
        this.Message = data.message;
        this.modalReferenceforSlideDelete = this.dialog.open(deletebox, {
          width: '400px'
        });
      }else{
        
      }
    });
    }
   
    
  }
  InactiveCurriculumn(){
    const body={
      "copyCurriculumId":this.route.snapshot.params['id'],
      "isActive": false
  }
    this.service.LmsCurriculumnInactiveWithCourse(body).subscribe((data: any) => {
    
      if(data.isSuccess === true){
        this.notificationService.successTopRight(data.message);
        this.router.navigate(['/curriculum']);
      }else{
        this.notificationService.errorTopRight('Some internal error!');
      }
    });
  }
  InactiveCurriculumnCan(){
    this.CirriculumManagerForm.get('isActive')?.setValue(true);
  }
}
