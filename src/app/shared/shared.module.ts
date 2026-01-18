import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { DateRangePickerModule } from './component/date-range-picker/date-range-picker.module';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SpecialCharacterLimitDirective } from './custom-directive/special-character-limit.directive';
import { NumberOnlyLimitDirective } from './custom-directive/number-only-limit.directive';
import { CopyPreventDirective } from './custom-directive/copy-disable/copy-prevent.directive';
import { SharedService } from './shared-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PhoneNumberFormatterDirective } from './phone-number-formatter.directive';
import { TruncatePipe } from 'app/truncate.pipe';
import { DecimalValidatorDirective } from './decimal-value.directive';
import { IntegerOnlyDirective } from './integer-only.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule,
        MatDatepickerModule,
        MatFormFieldModule,  
        MatDialogModule,
        MatSlideToggleModule,
        MatRadioModule,
        DateRangePickerModule,
        MatNativeDateModule,
        MatListModule,
        MatMomentDateModule,
        NgxMaterialTimepickerModule,
        MatCheckboxModule,
        MatDialogModule,
        MatToolbarModule,
        MatTooltipModule,
        SpecialCharacterLimitDirective,
        NumberOnlyLimitDirective,
        IntegerOnlyDirective,
        CopyPreventDirective,
        PhoneNumberFormatterDirective,
        DecimalValidatorDirective,
        TruncatePipe
    ],
    declarations: [
      ConfirmationModalComponent,
      SpecialCharacterLimitDirective,
      NumberOnlyLimitDirective,
      IntegerOnlyDirective,
      CopyPreventDirective,
      PhoneNumberFormatterDirective,
      DecimalValidatorDirective,
      TruncatePipe
    ],

    entryComponents: [
        ConfirmationModalComponent
      ],
      providers:[
        SharedService
      ]
})
export class SharedModule
{
}
