import { NgModule } from '@angular/core';
import { SelectComponent } from './select.component';
import { MatSelectModule, MatSelect, MatFormFieldModule } from '@angular/material';
import { FuseSharedModule } from '../../../../@fuse/shared.module';
import { MaterialModule } from '../../../main/angular-material-elements/material.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
    declarations: [SelectComponent],
     imports: [
        MatSelectModule,FuseSharedModule, TranslateModule
    ],
    exports: [SelectComponent] ,
    entryComponents: [SelectComponent]
  })
  export class SelectModule { }