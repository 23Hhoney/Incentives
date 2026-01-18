import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramRulesComponent } from './program-rules.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import {MatExpansionModule} from '@angular/material/expansion';
import { FuseNavigationModule } from '@fuse/components/navigation';

export const routes: Route[] = [
  {
      path     : '',
      component: ProgramRulesComponent
  }
];

@NgModule({
  declarations: [
    ProgramRulesComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    MatExpansionModule,
    FuseNavigationModule,
  ]
})
export class ProgramRulesModule { }
