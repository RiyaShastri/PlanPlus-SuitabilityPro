import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddClientComponent } from './dashboard';
import { ClientSearchComponent } from './dashboard';
import { AddFamilymemberComponent, SendReminderComponent } from '../client/profile';

export const ADVISOR_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
            {
                path: 'add-client',
                component: AddClientComponent
            },
            {
                path: 'client-search/advanced',
                component: ClientSearchComponent
            },
            {
                path: 'client-search',
                component: ClientSearchComponent
            },
            {
                path: ':clientId/add-family-member',
                component: AddFamilymemberComponent
            },
            {
                path: ':clientId/:personalId/send-reminder',
                component: SendReminderComponent
            }
        ]
    },
];
