import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UiModule } from '../../ui/ui.module';
import { PlanningService, GoalService } from '../service';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { PortfolioModule } from './portfolio/portfolio.module';

import {
    PlanningSummaryComponent,
    PlanningSummaryRouterComponent,
    AssetsLiabilitiesModule,
    GoalsModule,
    ProductRecommendationComponent,
    InvestmentProductsComponent,
    RebalancingSummaryComponent,
    DetailedRecommendationComponent,
    CashFlowManagementComponent,
    AddCustomCashFlowComponent,
    EstateModule,
    EntitiesModule
} from '.';

@NgModule({
    imports: [
        UiModule,
        CoreModule,
        FormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        CheckboxModule,
        DropdownModule,
        PortfolioModule,
        NgbModule.forRoot(),
        AssetsLiabilitiesModule,
        GoalsModule,
        EstateModule,
        EntitiesModule
    ],
    declarations: [
        PlanningSummaryComponent,
        PlanningSummaryRouterComponent,
        ProductRecommendationComponent,
        InvestmentProductsComponent,
        RebalancingSummaryComponent,
        DetailedRecommendationComponent,
        CashFlowManagementComponent,
        AddCustomCashFlowComponent
    ],
    exports: [
        PlanningSummaryComponent,
        PlanningSummaryRouterComponent
    ],
    providers: [
        DecimalPipe,
        CurrencyPipe,
        PlanningService,
        GoalService
    ]
})
export class PlanningModule { }
