import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'app/shared/shared.module';
import { NavMenuModule } from 'app/layout/common/nav-menu/nav-menu.module';
import { NotificationsModule } from 'app/layout/common/notifications/notifications.module';
import { UserModule } from 'app/layout/common/user/user.module';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgChartsModule } from 'ng2-charts';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DemoHomepageComponent } from './demo-homepage.component';
import { SafeEmbedUrlPipesY } from './safe-embed.pipe';

const routes: Routes = [
    {
        path    : '',
        component: DemoHomepageComponent
    }
];

@NgModule({
    declarations: [
        DemoHomepageComponent,
        SafeEmbedUrlPipesY
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        DragDropModule,
        SharedModule,
        MatIconModule,
        NotificationsModule,
        NavMenuModule,
        UserModule,
        NgxChartsModule,
        NgChartsModule,
        CKEditorModule,
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
        SharedModule,
        DataGridModule,
        ModalModule.forRoot(),
    ]
})
export class DemoHomepageModule
{
}
