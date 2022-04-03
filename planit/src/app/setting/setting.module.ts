import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { AccordionModule } from 'primeng/accordion';
import { RadioButtonModule } from 'primeng/radiobutton';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
// import { SharedModule } from 'primeng/components/common/shared';
import { UiModule } from '../ui/ui.module';
import { SettingService } from './service';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { GanttChartComponent } from './gantt-chart/gantt-chart.component';
import {
    SettingComponent,
    SettingsHeaderComponent,
    CmaComponent,
    RatesOfReturnComponent,
    IncomeDistributionComponent,
    PreferredSolutionsComponent,
    PreferredSolutionsDetailsComponent
} from '.';
import { StackBarChartComponent } from './stack-bar-chart/stack-bar-chart.component';
import { SolutionFamilyComponent } from './solution-family/solution-family.component';
import { TranslationsComponent } from './translations/translations.component';
import { ProfessionaljudgementMatrixComponent } from './professional-judgement-matrix/professional-judgement-matrix.component';
import { TimeHorizonSidePanelComponent } from './time-horizon-side-panel/time-horizon-side-panel.component';
import {NgxTreeSelectModule} from 'ngx-tree-select';
import { SettingSummaryComponent } from './setting-summary/setting-summary.component';
import { InvestmentPoliciesComponent } from './investment-policies/investment-policies.component';
import { AnalyticsComponent } from './analytics/analytics.component';

@NgModule({
    imports: [
        NgbModule.forRoot(),
        FormsModule,
        CommonModule,
        RouterModule,
        TranslateModule,
        CalendarModule,
        CheckboxModule,
        DropdownModule,
        InputMaskModule,
        AccordionModule,
        RadioButtonModule,
        IonRangeSliderModule,
        UiModule,
        CoreModule,
        SharedModule,
        NgxTreeSelectModule.forRoot({
            allowFilter: false,
            maxVisibleItemCount: 5,
            allowParentSelection: true,
            expandMode: 'All'
          })
    ],
    declarations: [
        GanttChartComponent,
        SettingComponent,
        SettingsHeaderComponent,
        CmaComponent,
        RatesOfReturnComponent,
        IncomeDistributionComponent,
        PreferredSolutionsComponent,
        PreferredSolutionsDetailsComponent,
        StackBarChartComponent,
        SolutionFamilyComponent,
        TranslationsComponent,
        ProfessionaljudgementMatrixComponent,
        TimeHorizonSidePanelComponent,
        SettingSummaryComponent,
        InvestmentPoliciesComponent,
        AnalyticsComponent
    ],
    exports: [
        SettingsHeaderComponent,
        CmaComponent,
        RatesOfReturnComponent,
        IncomeDistributionComponent
    ],
    providers: [
        SettingService
    ]
})
export class SettingModule { }
