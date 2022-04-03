import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { CalculatorHeaderComponent } from './calculator-header/calculator-header.component';
import { AccordionModule } from 'primeng/accordion';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { CalculatorService } from '../service';
import { CalculatorComponent } from './calculator/calculator.component';
import { LoanAmortizationCalculatorComponent,
    DebtConsolidationComponent,
    LeverageComponent,
    LoanCalculatorsComponent,
    LongTermCareComponent,
    CriticalIllnessComponent,
    CalculatorReportSidePanelComponent,
    EmptyCaculatorComponent,
    InsuranceCalculatorsComponent,
    FinancialCalculatorsComponent,
    RrifIllustrationComponent,
    LifeInsuranceComponent } from '.';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        DropdownModule,
        TranslateModule,
        AccordionModule,
        NgbModule,
        CalendarModule,
        CheckboxModule,
        RadioButtonModule,
        SharedModule
    ],
    declarations: [
        LoanAmortizationCalculatorComponent,
        CalculatorHeaderComponent,
        DebtConsolidationComponent,
        LeverageComponent,
        LongTermCareComponent,
        CriticalIllnessComponent,
        CalculatorComponent,
        LoanCalculatorsComponent,
        InsuranceCalculatorsComponent,
        EmptyCaculatorComponent,
        CalculatorReportSidePanelComponent,
        FinancialCalculatorsComponent,
        RrifIllustrationComponent,
        LifeInsuranceComponent
    ],
    exports: [
        LoanAmortizationCalculatorComponent,
        CalculatorHeaderComponent,
        DebtConsolidationComponent,
        LeverageComponent,
        LongTermCareComponent,
        CriticalIllnessComponent,
        LoanCalculatorsComponent,
        InsuranceCalculatorsComponent,
        CalculatorReportSidePanelComponent
    ],
    providers: [
        CalculatorService
    ]
})
export class CalculatorsModule { }
