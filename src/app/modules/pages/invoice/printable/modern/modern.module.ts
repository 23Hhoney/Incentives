import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModernComponent } from 'app/modules/pages/invoice/printable/modern/modern.component';
import { modernRoutes } from 'app/modules/pages/invoice/printable/modern/modern.routing';

@NgModule({
    declarations: [
        ModernComponent
    ],
    imports     : [
        RouterModule.forChild(modernRoutes)
    ]
})
export class ModernModule
{
}
