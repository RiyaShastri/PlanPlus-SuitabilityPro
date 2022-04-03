import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiModule } from '../../../ui/ui.module';
import { CoreModule } from '../../../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';
import { AssetsLiabilitiesModule } from '../assets-liabilities/assets-liabilities.module';
import {
    AddGoalComponent,
    RevenuesComponent,
    GoalsHeaderComponent,
    GoalsSummaryComponent,
    AllSavingsComponent,
    SavingsIndividualComponent,
    GoalDetailsHeaderComponent,
    EditGoalComponent,
    MortalityGraphComponent,
    AddRevenueComponent,
    AnalysisComponent,
    AssumptionsComponent,
    HighLevelTileComponent,
    EditRevenueComponent,
    PlanningAlternativeTileComponent,
    CashFlowTileComponent,
    InvestmentCapitalTileComponent,
    CertaintyOutcomeTileComponent,
    FevourableUnfavourableTileComponent,
    ValueRiskTileComponent,
    ValueAdviceTileComponent,
    PlantracComponent,
    EducationInstitutionComponent,
    RetirementAssumptionComponent
} from './index';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { SliderModule } from 'primeng/slider';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { PlantracDetailsSidePanelComponent } from './plantrac-details-side-panel/plantrac-details-side-panel.component';
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        UiModule,
        CoreModule,
        TranslateModule,
        SharedModule,
        AssetsLiabilitiesModule,
        SharedModule,
        RadioButtonModule,
        CheckboxModule,
        DropdownModule,
        AccordionModule,
        SliderModule,
        NgbModule.forRoot(),
        IonRangeSliderModule
    ],
    declarations: [
        AddGoalComponent,
        RevenuesComponent,
        GoalsHeaderComponent,
        GoalsSummaryComponent,
        AllSavingsComponent,
        SavingsIndividualComponent,
        MortalityGraphComponent,
        GoalDetailsHeaderComponent,
        EditGoalComponent,
        AddRevenueComponent,
        AnalysisComponent,
        AssumptionsComponent,
        HighLevelTileComponent,
        EditRevenueComponent,
        PlanningAlternativeTileComponent,
        CashFlowTileComponent,
        InvestmentCapitalTileComponent,
        CertaintyOutcomeTileComponent,
        FevourableUnfavourableTileComponent,
        ValueRiskTileComponent,
        ValueAdviceTileComponent,
        PlantracComponent,
        PlantracDetailsSidePanelComponent,
        EducationInstitutionComponent,
        RetirementAssumptionComponent
    ],
    exports: [
        AnalysisComponent
    ]
})
export class GoalsModule { }
