import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UiModule } from '../../../ui/ui.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';

import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';

import {
    DistributionsComponent,
    EstateHeaderComponent,
    EstateAnalysisComponent,
    AddDistributionComponent,
    ResidualDistributionComponent,
    InformationComponent
} from '.';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { AddNamedBeneficiaryComponent } from './add-named-beneficiary/add-named-beneficiary.component';
import { NamedBeneficiaryComponent } from './named-beneficiary/named-beneficiary.component';
import { EditNamedBeneficiaryComponent } from './edit-named-beneficiary/edit-named-beneficiary.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TranslateModule,
        NgbModule.forRoot(),
        UiModule,
        CoreModule,
        SharedModule,
        DropdownModule,
        RadioButtonModule,
        FormsModule,
        SharedModule,
        CheckboxModule,
        AccordionModule,
        CalendarModule
    ],
    declarations: [
        DistributionsComponent,
        EstateHeaderComponent,
        EstateAnalysisComponent,
        AddDistributionComponent,
        ResidualDistributionComponent,
        InformationComponent,
        AddNamedBeneficiaryComponent,
        NamedBeneficiaryComponent,
        EditNamedBeneficiaryComponent
    ],
    exports: [
        DistributionsComponent,
        EstateHeaderComponent,
        EstateAnalysisComponent
    ],
})
export class EstateModule { }
