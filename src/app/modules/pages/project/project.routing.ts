import { Route } from '@angular/router';
import { ProjectComponent } from 'app/modules/pages/project/project.component';
import { ProjectResolver } from 'app/modules/pages/project/project.resolvers';

export const projectRoutes: Route[] = [
    {
        path     : '',
        component: ProjectComponent,
        resolve  : {
            data: ProjectResolver
        }
    }
];
