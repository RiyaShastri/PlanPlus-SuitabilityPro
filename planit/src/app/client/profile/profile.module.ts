import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';
import { UiModule } from '../../ui/ui.module';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectModule } from 'primeng/multiselect';
import {
    SummaryComponent,
    EditClientComponent,
    PersonalInfoComponent,
    RiskToleranceComponent,
    RiskToleranceResultsComponent,
    RiskToleranceKycComponent,
    AddFamilymemberComponent,
    SendInviteComponent,
    SendReminderComponent,
    EngagementComponent,
    ProfileSummaryComponent,
    EngagementSummaryComponent,
    ServiceLevelComponent,
    SelectValuesComponent,
    AddEntityComponent,
    EntityDetailsComponent,
    EntityOwnershipComponent,
    AddOtherOwnersComponent,
    EditShareStructureComponent
} from '.';

import { SharedModule } from '../../shared/shared.module';
import { AdvisorInfoComponent } from './engagement/service-level/advisor-info/advisor-info.component';
import { ClientInfoComponent } from './engagement/service-level/client-info/client-info.component';
import { ServiceLevelInfoComponent } from './engagement/service-level/service-level-info/service-level-info.component';
import { ExperienceComponent } from './risk-tolerance/experience/experience.component';


@NgModule({
    imports: [
        UiModule,
        CoreModule,
        FormsModule,
        RouterModule,
        CommonModule,
        CalendarModule,
        RadioButtonModule,
        NgbModule.forRoot(),
        CheckboxModule,
        DropdownModule,
        InputMaskModule,
        AccordionModule,
        SharedModule,
        MultiSelectModule
    ],
    declarations: [
        SummaryComponent,
        PersonalInfoComponent,
        RiskToleranceComponent,
        AddFamilymemberComponent,
        EditClientComponent,
        SendInviteComponent,
        SendReminderComponent,
        EngagementComponent,
        ProfileSummaryComponent,
        RiskToleranceResultsComponent,
        RiskToleranceKycComponent,
        EngagementSummaryComponent,
        ServiceLevelComponent,
        AdvisorInfoComponent,
        ClientInfoComponent,
        ServiceLevelInfoComponent,
        SelectValuesComponent,
        ExperienceComponent,
        AddEntityComponent,
        EntityDetailsComponent,
        EntityOwnershipComponent,
        AddOtherOwnersComponent,
        EditShareStructureComponent
    ],
    providers: [
        NgbActiveModal,
        DatePipe
    ],
    exports: [
        PersonalInfoComponent,
        RiskToleranceComponent,
        AddFamilymemberComponent,
        EditClientComponent,
        SendInviteComponent,
        SendReminderComponent,
        EngagementComponent,
        ProfileSummaryComponent,
        RiskToleranceResultsComponent,
        RiskToleranceKycComponent
    ]
})
export class ProfileModule { }
