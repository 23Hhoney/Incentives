import { NgModule } from '@angular/core';
import { FuseSharedModule } from '../../../../@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../main/angular-material-elements/material.module';
import { InputComponent } from './input.component';
@NgModule({
    declarations: [InputComponent],
     imports: [
        MaterialModule, FuseSharedModule, TranslateModule
    ],
    exports: [InputComponent] ,
    entryComponents: [InputComponent]
  })
  export class InputrModule { }