import { Routes } from '@angular/router';
import { ChangePasswordComponent, LicenceComponent } from '../auth';
import { AboutMeComponent } from './about-me/about-me.component';
import { BrandingComponent } from './branding/branding.component';
import { SelectionListComponent } from './selection-list/selection-list.component';
import { GraphColourThemeComponent } from './graph-colour-theme/graph-colour-theme.component';
import { WorkgroupSidePanelComponent } from './about-me/workgroup-side-panel/workgroup-side-panel.component';
import { PrivacyComponent } from '../auth/privacy/privacy.component';
import { TranslationsComponent } from '../setting/translations/translations.component';
import { LangSpecificImageComponent } from './branding/lang-specific-image/lang-specific-image.component';
import {SubscriptionsComponent} from './subscriptions/subscriptions.component';


export const MY_PROFILE_ROUTES: Routes = [
    {
        path: 'about-me',
        component: AboutMeComponent,
        children: [
            {
                path: 'add-workgroup',
                component: WorkgroupSidePanelComponent
            },
            {
                path: 'edit-workgroup/:workgroupId',
                component: WorkgroupSidePanelComponent
            }
        ]
    },
    {
        path: 'change-password',
        component: ChangePasswordComponent
    },
    {
        path: 'subscriptions',
        component: SubscriptionsComponent
    },
    {
        path: 'branding',
        component: BrandingComponent,
        children: [
            {
                path: 'document-cover-page-selection',
                component: SelectionListComponent,
            },
            {
                path: 'document-disclaimer-selection',
                component: SelectionListComponent,
            },
            {
                path: 'report-disclaimer-selection',
                component: SelectionListComponent,
            },
            {
                path: 'graph-colour-theme',
                component: GraphColourThemeComponent
            },
            {
                path: 'translation',
                component: TranslationsComponent
            },
            {
                path: 'lang-specific-image',
                component: LangSpecificImageComponent
            }
        ]
    },
    {
        path: 'licence-agreement',
        component: LicenceComponent
    },
    {
        path: 'privacy',
        component: PrivacyComponent
    }
];
