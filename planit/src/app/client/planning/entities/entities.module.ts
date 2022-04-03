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

import {
    EntitiesListComponent,
    EntitiesHeaderComponent,
    EntitiesTableComponent,
    InvestmentReturnRiskComponent,
    CurrentYearIncomeDistributionsComponent,
    LongTermIncomeDistributionsComponent,
    DistributionSidePanelComponent,
    EditLongTermIncomeComponent,
    ViewAnalysisComponent
} from '.';

@NgModule({
    imports: [
        UiModule,
        CoreModule,
        FormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        NgbModule.forRoot(),
        DropdownModule,
        CheckboxModule
    ],
    declarations: [
        EntitiesListComponent,
        EntitiesTableComponent,
        InvestmentReturnRiskComponent,
        CurrentYearIncomeDistributionsComponent,
        LongTermIncomeDistributionsComponent,
        EntitiesHeaderComponent,
        DistributionSidePanelComponent,
        EditLongTermIncomeComponent,
        ViewAnalysisComponent
    ]
})
export class EntitiesModule { }
