import { Routes } from '@angular/router';
import { LoginComponent, LicenceComponent, ChangePasswordComponent } from './auth';
import { HeaderComponent, AuthHeaderComponent } from './layout/';
import { ClientComponent, CLIENT_ROUTES, ComingSoonComponent } from './client';
import { AuthenticationGuard } from './shared/authentication.guard';
import { AdvisorComponent } from './advisor/advisor/advisor.component';
import { ADVISOR_ROUTES } from './advisor/advisor.route';
import { TASK_NOTIFICATION_ROUTES } from './task-notification/task-notification.route';
import { MY_PROFILE_ROUTES, MyProfileComponent } from './my-profile';
import { SETTING_ROUTES } from './setting/setting.route';
import { SettingComponent } from './setting/setting.component';
import { NgxPermissionsGuard } from '../../node_modules/ngx-permissions';
import { LicenceAcceptComponent } from './auth/licence-accept/licence-accept.component';
import { PrivacyComponent } from './auth/privacy/privacy.component';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: '', children: [
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'error-code/:errorCode',
                component: LoginComponent,
            },
            {
                path: 'reset-password/:resetToken',
                component: ChangePasswordComponent,
                pathMatch: 'full'
            },
            {
                path: 'licence-agreement',
                component: LicenceComponent,
                // pathMatch: 'full'
            },
            {
                path: 'privacy',
                component: PrivacyComponent,
                // pathMatch: 'full'
            },
            {
                path: 'accept-licence-agreement',
                component: LicenceAcceptComponent
            },
            {
                path: '',
                component: AuthHeaderComponent,
                outlet: 'header'
            }
        ]
    },
    {
        path: '', children: [
            {
                path: 'client/:clientId',
                component: ClientComponent,
                children: CLIENT_ROUTES,
                canActivate: [AuthenticationGuard],
                canActivateChild: [NgxPermissionsGuard]
            },
            {
                path: 'advisor',
                component: AdvisorComponent,
                children: ADVISOR_ROUTES,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'coming-soon',
                component: ComingSoonComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'my-profile',
                component: MyProfileComponent,
                children: MY_PROFILE_ROUTES,
                canActivate: [AuthenticationGuard],
                canActivateChild: [NgxPermissionsGuard]
            },
            {
                path: 'settings',
                component: SettingComponent,
                children: SETTING_ROUTES,
                canActivate: [AuthenticationGuard]
            },
            {
                path: '',
                component: HeaderComponent,
                outlet: 'header'
            },
        ]
    },
    {
        path: '',
        children: TASK_NOTIFICATION_ROUTES,
        canActivate: [AuthenticationGuard]
    },
    { path: '**', redirectTo: '/login' }
];
