import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UiModule } from '../../../ui/ui.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';

import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GoalsModule } from '../goals/goals.module';

import {
    PortfoliosLandingComponent,
    PortfolioDetailsComponent,
    PortfolioHeaderComponent,
    ObjectivesComponent,
    EditPolicyComponent,
    AllocationComponent,
    ProfessionalJudgementComponent,
    PortfolioSuitabilityComponent,
    ExplanationDocumentationComponent,
    InvestorComponent,
    TimeHorizonComponent,
    LinkedGoalsComponent,
    LinkedAccountsComponent,
    AnalyticsComponent,
    EditCurrentComponent,
    AddPortfolioComponent,
    AddInvestorComponent,
    ManageAccountsComponent,
    ImplementationComponent,
    ManageProductsComponent,
    SolutionsInfoComponent,
    ApplyModelComponent,
    AddFromFavouritesComponent,
    LinkToGoalsComponent,
    ImplementationQuestionsComponent,
    RiskCapacityComponent,
    PortfolioAllocationComponent
} from '.';

import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { ApplySolutionComponent } from './implementation/apply-solution/apply-solution.component';
import { TransfersComponent } from './implementation/transfers/transfers.component';
import { SolutionGraphComponent } from './implementation/apply-solution/solution-graph/solution-graph.component';
import { AllocationTableComponent } from './portfolio-details/allocation-table/allocation-table.component';



@NgModule({
    imports: [
        UiModule,
        CoreModule,
        FormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        DropdownModule,
        CheckboxModule,
        AmChartsModule,
        AccordionModule,
        RadioButtonModule,
        GoalsModule,
        NgbModule.forRoot()
    ],
    declarations: [
        ObjectivesComponent,
        PortfolioDetailsComponent,
        PortfoliosLandingComponent,
        PortfolioHeaderComponent,
        EditPolicyComponent,
        AllocationComponent,
        ProfessionalJudgementComponent,
        PortfolioSuitabilityComponent,
        ExplanationDocumentationComponent,
        InvestorComponent,
        TimeHorizonComponent,
        LinkedGoalsComponent,
        LinkedAccountsComponent,
        AnalyticsComponent,
        EditCurrentComponent,
        AddInvestorComponent,
        AddPortfolioComponent,
        ImplementationComponent,
        ManageAccountsComponent,
        ManageProductsComponent,
        SolutionsInfoComponent,
        ApplyModelComponent,
        AddFromFavouritesComponent,
        LinkToGoalsComponent,
        ImplementationQuestionsComponent,
        ApplySolutionComponent,
        RiskCapacityComponent,
        TransfersComponent,
        SolutionGraphComponent,
        PortfolioAllocationComponent,
        AllocationTableComponent
    ]
})
export class PortfolioModule { }
