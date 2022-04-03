import { Routes } from '@angular/router';
import { PreferredSolutionsComponent, CmaComponent, RatesOfReturnComponent, IncomeDistributionComponent, InvestmentPoliciesComponent } from '.';
import { PreferredSolutionsDetailsComponent } from './preferred-solutions-details/preferred-solutions-details.component';
import { SolutionFamilyComponent } from './solution-family/solution-family.component';
import { TranslationsComponent } from './translations/translations.component';
import { ProfessionaljudgementMatrixComponent } from './professional-judgement-matrix/professional-judgement-matrix.component';
import { SettingSummaryComponent } from './setting-summary/setting-summary.component';
import { EditPolicyComponent, ProductSearchComponent, AddCustomProductComponent } from '../client/planning';


export const SETTING_ROUTES: Routes = [
    {
        path: '',
        component: SettingSummaryComponent,
        pathMatch: 'full'
    },
    {
        path: 'preferred-solutions',
        component: PreferredSolutionsComponent,
        children: [
            {
                path: 'solution-family',
                component: SolutionFamilyComponent
            },
            {
                path: ':solutionFamilyId/edit-solution-family',
                component: SolutionFamilyComponent
            },
            {
                path: 'translation',
                component: TranslationsComponent
            }
        ]
    },
    {
        path: 'preferred-solutions/:solutionFamilyId/add-solution',
        component: PreferredSolutionsDetailsComponent,
        children: [
            {
                path: 'translation',
                component: TranslationsComponent
            },
            {
                path: 'product-search',
                component: ProductSearchComponent,
            },
            {
                path: 'add-custom-product',
                component: AddCustomProductComponent
            }
        ]
    },
    {
        path: 'preferred-solutions/:solutionId/solution-info',
        component: PreferredSolutionsDetailsComponent,
        children: [
            {
                path: 'translation',
                component: TranslationsComponent
            },
            {
                path: 'product-search',
                component: ProductSearchComponent,
            },
            {
                path: 'add-custom-product',
                component: AddCustomProductComponent
            }
        ]
    },
    {
        path: 'cma',
        component: CmaComponent,
        children: [
            {
                path: 'rates_of_return',
                component: RatesOfReturnComponent
            },
            {
                path: 'income_distribution',
                component: IncomeDistributionComponent
            }
        ]
    },
    {
        path: 'professional-judgement-matrix',
        component: ProfessionaljudgementMatrixComponent,
        children: []
    },
    {
        path: 'investment-policies',
        component: InvestmentPoliciesComponent,
        children: [
            {
                path: 'add-policy',
                component: EditPolicyComponent
            },
            {
                path: ':investmentId/edit-policy',
                component: EditPolicyComponent
            }
        ]
    }
];
