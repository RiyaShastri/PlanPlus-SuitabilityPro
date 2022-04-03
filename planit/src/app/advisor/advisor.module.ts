import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdvisorComponent } from './advisor/advisor.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { DropdownModule } from 'primeng/dropdown';

import {
    WorkflowTileComponent,
    ClientsTileComponent,
    NetWorthTileComponent,
    RiskToleranceDistributionTileComponent,
    DemographicsTileComponent,
    DocumentsCenterTileComponent,
    InvestmentsTileComponent,
    SuitabilityBandsTileComponent,
    TaskNotificationTileComponent,
    AddClientComponent,
    ClientSearchComponent,
    ClientValueTileComponent
} from './dashboard';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { UiModule } from '../ui/ui.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdvisorService } from './service/advisor.service';
import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { NetWorthAccountTableComponent } from './dashboard/net-worth-account-table/net-worth-account-table.component';
import { TagCloudModule } from 'angular-tag-cloud-module';

@NgModule({
    imports: [
        UiModule,
        FormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        DropdownModule,
        CalendarModule,
        CheckboxModule,
        TranslateModule,
        RadioButtonModule,
        NgbModule.forRoot(),
        AmChartsModule,
        TagCloudModule
    ],
    exports: [
        AdvisorComponent,
        DashboardComponent,
        AddClientComponent,
    ],
    declarations: [AdvisorComponent,
        DashboardComponent,
        WorkflowTileComponent,
        ClientsTileComponent,
        NetWorthTileComponent,
        RiskToleranceDistributionTileComponent,
        DemographicsTileComponent,
        DocumentsCenterTileComponent,
        InvestmentsTileComponent,
        SuitabilityBandsTileComponent,
        TaskNotificationTileComponent,
        AddClientComponent,
        ClientSearchComponent,
        ClientValueTileComponent,
        NetWorthAccountTableComponent,
    ],
    providers: [AdvisorService, DatePipe]
})
export class AdvisorModule { }
