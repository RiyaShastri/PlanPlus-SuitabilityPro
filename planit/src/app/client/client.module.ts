import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core.module';
import { LayoutModule } from '../layout/layout.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProfileModule } from './profile/profile.module';
import { PlanningModule } from './planning/planning.module';
import { CalendarModule } from 'primeng/calendar';
import { ClientProfileService, PortfolioService, NotesService, EstateService, EntitiesService } from './service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { OverviewComponent, GenerateReportComponent } from '.';
import { MessageModule } from 'primeng/message';
import { UiModule } from '../ui/ui.module';
import { CheckboxModule } from 'primeng/checkbox';
import { DocumentsModule } from './documents/documents.module';

import {
    ClientComponent,
    ComingSoonComponent
} from '.';

import {
    ColaborationTileComponent,
    InvestmentsTileComponent,
    AllocationTileComponent,
    PortfolioTileComponent,
    NetWorthTileComponent,
    DocumentTileComponent,
    FamilyTileComponent,
    RiskTileComponent,
    TaskTileComponent,
    GoalTileComponent,
    ValuesTileComponent,
    PrioritiesTileComponent
} from './overview';
import { CalculatorsModule } from './calculators/calculators.module';
import { AccordionModule } from 'primeng/accordion';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { NotesModule } from './notes/notes.module';

@NgModule({
    imports: [
        UiModule,
        CheckboxModule,
        NgbModule,
        CoreModule,
        FormsModule,
        CommonModule,
        RouterModule,
        LayoutModule,
        ProfileModule,
        PlanningModule,
        CalendarModule,
        TranslateModule,
        DocumentsModule,
        SharedModule,
        MessageModule,
        CalculatorsModule,
        NotesModule,
        AccordionModule,
        RadioButtonModule,
        DropdownModule
    ],
    declarations: [
        ClientComponent,
        OverviewComponent,
        ComingSoonComponent,
        ColaborationTileComponent,
        InvestmentsTileComponent,
        AllocationTileComponent,
        PortfolioTileComponent,
        NetWorthTileComponent,
        DocumentTileComponent,
        FamilyTileComponent,
        RiskTileComponent,
        TaskTileComponent,
        GoalTileComponent,
        ValuesTileComponent,
        PrioritiesTileComponent,
        GenerateReportComponent
    ],
    exports: [
        ClientComponent,
        OverviewComponent,
        ComingSoonComponent,
        ColaborationTileComponent,
        InvestmentsTileComponent,
        AllocationTileComponent,
        PortfolioTileComponent,
        NetWorthTileComponent,
        DocumentTileComponent,
        FamilyTileComponent,
        RiskTileComponent,
        TaskTileComponent,
        GoalTileComponent,
        GenerateReportComponent
    ],
    providers: [
        ClientProfileService,
        PortfolioService,
        NotesService,
        EstateService,
        EntitiesService
    ]
})
export class ClientModule { }
