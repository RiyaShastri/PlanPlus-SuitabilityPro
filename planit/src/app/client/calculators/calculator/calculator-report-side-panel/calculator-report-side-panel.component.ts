import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { slideInOutAnimation } from '../../../../shared/animations';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { CALCULATOR_REPORTS, GENERATE_REPORT_FORMATE_DESCRIPTION, GENERATE_REPORT_FORMATE_ID } from '../../../../shared/constants';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CalculatorService } from '../../../service';
import swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';
import { LEVERAGE_REPORT_TYPE } from '../../../../shared/constants';

@Component({
    selector: 'app-calculator-report-side-panel',
    templateUrl: './calculator-report-side-panel.component.html',
    styleUrls: [
        '../../../../client/generate-report/generate-report.component.css',
        './calculator-report-side-panel.component.css'
    ],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class CalculatorReportSidePanelComponent implements OnInit {
    saveDisable = false;
    @Input() clientId;
    @Input() calculatorData;
    @Input() type;
    @Input() selectedScenario ?= '';
    @Output() closePanelEvent = new EventEmitter();
    unsubscribe$ = new Subject<void>();
    allExpanded = false;
    isLoanCalculator = false;
    isInsuranceCalculator = false;
    isInvestmentCalculator = false;
    isFinancialCalculator = false;
    accorIndex = [];
    loanCalculatorReport = CALCULATOR_REPORTS.LOAN_CALCULATORS;
    insuranceCalculator = CALCULATOR_REPORTS.INSURANCE_CALCULATORS;
    investmentCalculator = CALCULATOR_REPORTS.INVESTMENT_CALCULATORS;
    financialCalculator = CALCULATOR_REPORTS.FINANCIAL_CALCULATORS;
    saveToVault = false;
    formatesList = [];
    selectedFormat;
    i18Text;
    criterias = [];
    selectedReport;
    criteria;
    constructor(
        private router: Router,
        private calculatorService: CalculatorService,
        private translate: TranslateService
    ) {
        this.formatesList = [
            { id: GENERATE_REPORT_FORMATE_ID.PDF, description: GENERATE_REPORT_FORMATE_DESCRIPTION.PDF },
            { id: GENERATE_REPORT_FORMATE_ID.HTML, description: GENERATE_REPORT_FORMATE_DESCRIPTION.HTML },
        ];
    }

    ngOnInit() {
        this.translate.stream([
            'CALCULATOR.HEADER.LEVERAGE',
            'CALCULATOR.LEVERAGE.SUMMARY',
            'CALCULATOR.LEVERAGE.SUMMARY_SIGNATURES',
            'CALCULATOR.LEVERAGE.DETAILED_SCHEDULE',
            'CALCULATOR.LEVERAGE.UNCERTAINTY_ANALYSIS',
            'ALERT_MESSAGE.OOPS_TEXT',
            'CALCULATOR.WARNING_TITLE',
            'CALCULATOR.WARNING_SELECT_SCENARIO',
            'CALCULATOR.HEADER.LOAN_AMORTIZATION',
            'CALCULATOR.HEADER.DEBT_CONSOLIDATION',
            'CALCULATOR.HEADER.CRITICAL_ILLNESS',
            'CALCULATOR.HEADER.LONG_TERM_CARE'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        if (this.router.url.includes('loan-calculator')) {
            this.selectedReport = this.loanCalculatorReport.find(x => x.type === this.type);
            this.isLoanCalculator = true;
            this.accorIndex.push(0);
            this.setCraitaria();
        } else if (this.router.url.includes('insurance-calculator')) {
            this.selectedReport = this.insuranceCalculator.find(x => x.type === this.type);
            this.isInsuranceCalculator = true;
            this.accorIndex.push(1);
            this.setCraitaria();
        }
    }

    generateReport(f: NgForm) {
        const obj = {
            'clientId': this.clientId,
            'documentName': '',
            'format': (this.selectedFormat['description']).toLowerCase(),
            'reportType': this.criteria,
            'scenario': this.selectedScenario,
            'saveDocumet': this.saveToVault
        };
        if (f.valid) {
            if (this.selectedReport.type === this.loanCalculatorReport[0].type) {
                this.calculatorService.generateReportForLoanAmortization(this.clientId, this.calculatorData).toPromise().then(response => {
                    if (response) {
                        this.calculatorService.downloadReport(response, this.i18Text['CALCULATOR.HEADER.LOAN_AMORTIZATION']);
                    }
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(errorResponse).errorMessage, 'error');
                });
            } else if (this.selectedReport.type === this.loanCalculatorReport[1].type) {
                this.calculatorService.generateReportForDebtConsolidation(this.clientId, this.calculatorData).toPromise().then(response => {
                    if (response) {
                        this.calculatorService.downloadReport(response, this.i18Text['CALCULATOR.HEADER.DEBT_CONSOLIDATION']);
                    }
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(errorResponse).errorMessage, 'error');
                });
            } else if (this.selectedReport.type === this.loanCalculatorReport[2].type) {
                let label = '';
                if (this.criteria === LEVERAGE_REPORT_TYPE['SUMMARY']) {
                    label = this.i18Text['CALCULATOR.HEADER.LEVERAGE'] + ' (' + this.i18Text['CALCULATOR.LEVERAGE.SUMMARY'] + ')';
                } else if (this.criteria === LEVERAGE_REPORT_TYPE['SUMMARY_WITH_SIGNATURES']) {
                    label = this.i18Text['CALCULATOR.HEADER.LEVERAGE'] + ' (' + this.i18Text['CALCULATOR.LEVERAGE.SUMMARY_SIGNATURES'] + ')';
                } else if (this.criteria === LEVERAGE_REPORT_TYPE['DETAILED_SCHEDULE']) {
                    label = this.i18Text['CALCULATOR.HEADER.LEVERAGE'] + ' (' + this.i18Text['CALCULATOR.LEVERAGE.DETAILED_SCHEDULE'] + ')';
                } else if (this.criteria === LEVERAGE_REPORT_TYPE['UNCERTAINTY_ANALYSIS']) {
                    label = this.i18Text['CALCULATOR.HEADER.LEVERAGE'] + ' (' + this.i18Text['CALCULATOR.LEVERAGE.UNCERTAINTY_ANALYSIS'] + ')';
                }
                obj['reportType'] = this.criteria;
                this.calculatorService.generateReportForLeverage(obj).toPromise().then(response => {
                    if (response) {
                        this.calculatorService.downloadReport(response, label);
                    }
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(errorResponse).errorMessage, 'error');
                });
            } else if (this.selectedReport.type === this.insuranceCalculator[1].type) {
                obj['reportType'] = 0;
                this.calculatorService.generateReportForCriticalIllness(obj).toPromise().then(response => {
                    if (response) {
                        this.calculatorService.downloadReport(response, this.i18Text['CALCULATOR.HEADER.CRITICAL_ILLNESS']);
                    }
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(errorResponse).errorMessage, 'error');
                });
            } else if (this.selectedReport.type === this.insuranceCalculator[0].type) {
                obj['reportType'] = 1;
                this.calculatorService.generateReportForLongTermCare(obj).toPromise().then(response => {
                    if (response) {
                        this.calculatorService.downloadReport(response, this.i18Text['CALCULATOR.HEADER.LONG_TERM_CARE']);
                    }
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(errorResponse).errorMessage, 'error');
                });
            }
        }
    }

    setCraitaria() {
        this.criterias = this.selectedReport['criteria'];
    }

    closePanel() {
        this.closePanelEvent.emit();
    }

    expandALL() {
        this.allExpanded = !this.allExpanded;
        if (this.allExpanded === true) {
            this.isLoanCalculator = true;
            this.isInsuranceCalculator = true;
            this.isInvestmentCalculator = true;
            this.isFinancialCalculator = true;
            this.accorIndex = [0, 1, 2, 3];
        } else {
            this.isLoanCalculator = false;
            this.isInsuranceCalculator = false;
            this.isInvestmentCalculator = false;
            this.isFinancialCalculator = false;
            this.accorIndex = [];
        }
    }

    openTab(event) {
        if (event.index === 0) {
            this.isLoanCalculator = true;
        } else if (event.index === 1) {
            this.isInsuranceCalculator = true;
        } else if (event.index === 2) {
            this.isInvestmentCalculator = true;
        } else if (event.index === 3) {
            this.isFinancialCalculator = true;
        }
        this.accorIndex.push(event.index);
        if (this.accorIndex.length === 4) {
            this.allExpanded = true;
        }
    }

    onTabClose(event) {
        for (let i = 0; i < this.accorIndex.length; i++) {
            if (this.accorIndex[i] === event.index) {
                this.accorIndex.splice(i, 1);
                if (event.index === 0) {
                    this.isLoanCalculator = false;
                } else if (event.index === 1) {
                    this.isInsuranceCalculator = false;
                } else if (event.index === 2) {
                    this.isInvestmentCalculator = false;
                } else if (event.index === 3) {
                    this.isFinancialCalculator = false;
                }
            }
        }
        if (this.accorIndex.length === 0) {
            this.allExpanded = false;
        }
    }
}
