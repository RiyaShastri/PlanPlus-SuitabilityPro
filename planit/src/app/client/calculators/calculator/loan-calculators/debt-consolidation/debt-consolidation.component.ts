import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import { CalculatorService } from '../../../../service';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { currentCertaintyChart } from '../../../../client-models/goal-analysis-charts';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { CALCULATOR_DEBT_INTEREST_TYPE_ID, CALCULATOR_DEBT_INTEREST_TYPE_DESCRIPTION, DEBT_CONSOLIDATION_LOAN_TYPE } from '../../../../../shared/constants';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import { PageTitleService } from '../../../../../shared/page-title';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-debt-consolidation',
    templateUrl: './debt-consolidation.component.html',
    styleUrls: ['./debt-consolidation.component.css']
})
export class DebtConsolidationComponent implements OnInit, OnDestroy {
    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency
    });
    currencyMask1 = createNumberMask({
        prefix: this.currency,
        allowDecimal: true
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    INTEREST_TYPES = CALCULATOR_DEBT_INTEREST_TYPE_ID;
    CALCULATOR_DEBT_INTEREST_TYPE_DESCRIPTION = CALCULATOR_DEBT_INTEREST_TYPE_DESCRIPTION;
    clientId;
    loanTypes = [];
    debtCalculatorData = {};
    interestType = [];
    selectedInterestType;
    paymentFrequency = [];
    selectedPaymentFrequency;
    clientData = {};
    analysisImprovement;
    analysisTotalPrime;
    loanList = [];
    dataProvider = [];
    graphData = [];
    backupOfLoanList = [];
    newAddLoanIds = [];
    deleteLoanIds = [];
    previousUrl = [];
    LOAN_TYPES = DEBT_CONSOLIDATION_LOAN_TYPE;
    loanType = DEBT_CONSOLIDATION_LOAN_TYPE.VARIABLE_RATE_LOAN;
    MORTAGE_TYPE = DEBT_CONSOLIDATION_LOAN_TYPE.MORTAGE_TYPE;
    saveData: Subject<void> = new Subject<void>();
    savePayload = {};
    private unsubscribe$ = new Subject<void>();
    loadLoanList = [];
    refModel;
    primaryLoadLoan;
    isCalculatorReportSidePanelOpen = false;
    reportObject;
    constructor(
        private route: ActivatedRoute,
        private calculatorService: CalculatorService,
        private store: Store<AppState>,
        private amcharts: AmChartsService,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService,
        private router: Router,
        private pageTitleService: PageTitleService,
        private modalService: NgbModal
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.DEBT_CONSOLIDATION_CALCULATOR');
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            this.previousUrl = [];
            if (message.includes('Go_To_Calculator')) {
                const url = JSON.parse(message.replace('Go_To_Calculator|', ''));
                const splitedUrl = url.split('/');
                splitedUrl.forEach((data, index) => {
                    if (data) {
                        if (index === 1) {
                            this.previousUrl.push('/' + data);
                        } else {
                            this.previousUrl.push(data);
                        }
                    }
                });
            }
        });
        this.saveData.debounceTime(1000).switchMap(() => this.calculatorService
        .calculateDebtConsolidation(this.clientId, this.savePayload)).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res.hasOwnProperty('errors')) {
                res['errorsPayload'] = Object.values(res['errors']);
            }
            this.debtCalculatorData = res;
            if (this.debtCalculatorData && Object.keys(this.debtCalculatorData['errors']).length === 0) {
                this.setLoanData();
                this.makeDataProvider();
            }
        }, err => { });
    }

    async ngOnInit() {
        this.interestType = [
            {
                id: CALCULATOR_DEBT_INTEREST_TYPE_ID.FIXED,
                description: this.CALCULATOR_DEBT_INTEREST_TYPE_DESCRIPTION.FIXED
            },
            {
                id: CALCULATOR_DEBT_INTEREST_TYPE_ID.VARIABLE,
                description: this.CALCULATOR_DEBT_INTEREST_TYPE_DESCRIPTION.VARIABLE
            },
            {
                id: CALCULATOR_DEBT_INTEREST_TYPE_ID.FIXED_INTEREST_AND_FIXED_PRINCIPAL_PAYMENT,
                description: this.CALCULATOR_DEBT_INTEREST_TYPE_DESCRIPTION.FIXED_INTEREST_AND_FIXED_PRINCIPAL_PAYMENT
            },
            {
                id: CALCULATOR_DEBT_INTEREST_TYPE_ID.VARIABLE_INTEREST_AND_FIXED_PRINCIPAL_PAYMENT,
                description: this.CALCULATOR_DEBT_INTEREST_TYPE_DESCRIPTION.VARIABLE_INTEREST_AND_FIXED_PRINCIPAL_PAYMENT
            }
        ];
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currency
            });
            this.currencyMask1 = createNumberMask({
                prefix: this.currency,
                allowDecimal: true
            });
        });
        await this.calculatorService.getLoanTypes(this.clientId).toPromise().then(loans => {
            this.loanTypes = loans;
        }).catch(error => { });
        await this.calculatorService.getFrequencyList('calcpayment').toPromise().then(paymentFrequency => {
            this.paymentFrequency = paymentFrequency;
        }).catch(error => { });
        this.getDefaultData();
    }

    async getDefaultData(isSetLoanData: boolean = true) {
        await this.calculatorService.getDebtConsolidationData(this.clientId).toPromise().then(data => {
            this.debtCalculatorData = data;
            this.analysisImprovement = parseFloat((this.debtCalculatorData['resultCurTotTimeNum'] - this.debtCalculatorData['resultPropTotTimeNum']).toFixed(2));
            this.debtCalculatorData['totalResultRate'] = parseFloat(this.debtCalculatorData['primeRateNum'] + this.debtCalculatorData['resultRateNum']).toFixed(2);
            this.debtCalculatorData['totalInterestRate'] = parseFloat(this.debtCalculatorData['primeRateNum'] + this.debtCalculatorData['mortgageRateNum']).toFixed(2);
            this.makeDataProvider();
        }).catch(error => { });
        this.setDropdownValue();
        if (isSetLoanData) {
            this.setLoanData();
        }
    }

    setDropdownValue() {
        this.selectedInterestType = this.interestType.find(x => x.id === this.debtCalculatorData['interestType']);
        this.selectedPaymentFrequency = this.paymentFrequency.find(x => x.frequencyId === this.debtCalculatorData['paymentFreq']);
    }

    setLoanData() {
        this.backupOfLoanList = [];
        this.loanList = [];
        if (this.debtCalculatorData['loanItem'].length > 0) {
            this.debtCalculatorData['loanItem'].forEach((element, index) => {
                this.loanList.push({
                    ...element,
                    id: 'loan' + (index + 1),
                    selctedLoanType: element['loanType'] !== 0 ? this.loanTypes.find(x => parseInt(x.type, 10) === element['loanType']) : '',
                    selectedPaymentFrequency: element['paymentFrequency'] ? this.paymentFrequency.find(x => x.frequencyId === element['paymentFrequency']) : '',
                    selectedInterestType: element['interestType'] ? this.interestType.find(x => x.id === element['interestType']) : ''
                });
            });
            this.backupOfLoanList = this.loanList;
        }
      this.analysisImprovement = parseFloat((this.debtCalculatorData['resultCurTotTimeNum'] - this.debtCalculatorData['resultPropTotTimeNum']).toFixed(2));

    }

    countTotalResultRate(changeInterestRate, changeLoanRate) {
        if (changeLoanRate) {
            this.debtCalculatorData['totalResultRate'] = parseFloat(this.debtCalculatorData['primeRateNum'] + this.debtCalculatorData['resultRateNum']).toFixed(2);
        }
        if (changeInterestRate) {
            this.debtCalculatorData['totalInterestRate'] = parseFloat(this.debtCalculatorData['primeRateNum'] + this.debtCalculatorData['mortgageRateNum']).toFixed(2);
        }
    }

    addLoan() {
        const length = this.loanList.length;
        this.loanList.push({
            id: 'loan' + (length + 1),
            selctedLoanType: '',
            selectedPaymentFrequency: this.paymentFrequency.find(x => x.frequencyId === 1),
            selectedInterestType: this.interestType[0],
            compoundingType: 0,
            interestRateNum: 0,
            interestType: 0,
            loanId: null,
            loanPaidOffIn: 0,
            loanType: 0,
            outstandingBalanceNum: 0,
            paymentAmountNum: 0,
            paymentFrequency: 0,
            primePlusNum: 0,
        });
        this.calculateData();
    }

    deleteLoan(data) {
        this.deleteLoanIds.push({ id: data.id, loanId: data.loanId });
        this.loanList.forEach((element, index) => {
            if (element.id === data.id) {
                this.loanList.splice(index, 1);
                this.translate.get([
                    'ALERT.TITLE.SUCCESS',
                    'CALCULATOR.DEBT_CONSOLIDATION.DELETE_SUCCESS'
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['ALERT.TITLE.SUCCESS'], i18Text['CALCULATOR.DEBT_CONSOLIDATION.DELETE_SUCCESS'], 'success');
                });
            }
        });
        this.backupOfLoanList = this.loanList;
    }

    setPrimaryLoan(loanData) {
        if (parseInt(loanData.selctedLoanType['type'], 10) === 5) {
            if (loanData['loanId']) {
                this.calculatorService.setPrimaryLoan(this.clientId, loanData).toPromise().then(async result => {
                    await this.getDefaultData(false);
                    this.loanList = [];
                    this.debtCalculatorData['loanItem'].forEach((element, index) => {
                        this.loanList.push({
                            ...element,
                            id: 'loan' + (index + 1),
                            selctedLoanType: element['loanType'] !== 0 ? this.loanTypes.find(x => parseInt(x.type, 10) === element['loanType']) : '',
                            selectedPaymentFrequency: element['paymentFrequency'] ? this.paymentFrequency.find(x => x.frequencyId === element['paymentFrequency']) : '',
                            selectedInterestType: element['interestType'] ? this.interestType.find(x => x.id === element['interestType']) : ''
                        });
                    });
                    if (this.newAddLoanIds.length > 0) {
                        this.newAddLoanIds.forEach(loan => {
                            const data = this.backupOfLoanList.find(x => x.id === loan);
                            this.loanList.push({
                                ...data,
                                id: 'loan' + (this.loanList.length),
                            });
                        });
                    }
                    if (this.deleteLoanIds.length > 0) {
                        this.deleteLoanIds.forEach(loan => {
                            const isIndex = this.loanList.findIndex(x => x.loanId === loan.loanId);
                            if (isIndex > -1) {
                                this.loanList.splice(isIndex, 1);
                            } else {
                                const index = this.loanList.findIndex(x => x.id === loan.id);
                                this.loanList.splice(index, 1);
                            }
                        });
                    }
                }).catch(errorResponse => { });
            } else {
                this.translate.get([
                    'CALCULATOR.WARNING_TITLE',
                    'CALCULATOR.DEBT_CONSOLIDATION.LOAN_ACCOUNT_WARNING'
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['CALCULATOR.WARNING_TITLE'], i18Text['CALCULATOR.DEBT_CONSOLIDATION.LOAN_ACCOUNT_WARNING'], 'warning');
                });
            }
        } else {
            this.translate.get([
                'CALCULATOR.WARNING_TITLE',
                'CALCULATOR.DEBT_CONSOLIDATION.LOAN_MORTGAGE_WARNING'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                swal(i18Text['CALCULATOR.WARNING_TITLE'], i18Text['CALCULATOR.DEBT_CONSOLIDATION.LOAN_MORTGAGE_WARNING'], 'warning');
            });
        }
    }

    changeAction(index: number) {
        if ($('#dropdownDebtConsolidation' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#dropdownDebtConsolidation' + index).toggle();
        }
    }

    makeDataProvider() {
        const resultCurrentSchedule = {};
        const resultProposedSchedule = {};
        const allYears = [];
        const dataProvider = [];
        let graphs = [];
        if (this.debtCalculatorData['resultCurrentSchedule']) {
            this.debtCalculatorData['resultCurrentSchedule'].forEach(element => {
                resultCurrentSchedule[element.key] = parseFloat(parseFloat(element.value).toFixed(2));
                allYears.push(parseFloat(parseFloat(element.key).toFixed(2)));
            });
        }
        if (this.debtCalculatorData['resultProposedSchedule']) {
            this.debtCalculatorData['resultProposedSchedule'].forEach(element => {
                resultProposedSchedule[element.key] = parseFloat(parseFloat(element.value).toFixed(2));
                if (!allYears.includes(element.key)) {
                    allYears.push(parseFloat(parseFloat(element.key).toFixed(2)));
                }
            });
        }
        allYears.sort((a, b) => a - b);
        const newArray = Array.from(new Set(allYears));

        newArray.forEach((year, i) => {
            dataProvider.push({
                year: year,
                current: resultCurrentSchedule.hasOwnProperty(year) ? resultCurrentSchedule[year] :
                    (dataProvider[i - 1] && dataProvider[i - 1].hasOwnProperty('current')) ? dataProvider[i - 1]['current'] : 0,
                proposed: resultProposedSchedule.hasOwnProperty(year) ? resultProposedSchedule[year] : 0
            });
        });
        const prefix = this.currency;
        this.translate.get([
            'CALCULATOR.DEBT_CONSOLIDATION.CURRENT',
            'CALCULATOR.DEBT_CONSOLIDATION.PROPOSED'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            graphs = [
                {
                    balloonText: '[[title]]:' + prefix + '[[current]]',
                    fillAlphas: 1,
                    lineAlpha: 0,
                    valueField: 'current',
                    lineColor: '#f78182',
                    title: i18Text['CALCULATOR.DEBT_CONSOLIDATION.CURRENT'],
                },
                {
                    balloonText: '[[title]]:' + prefix + '[[proposed]]',
                    fillAlphas: 1,
                    lineAlpha: 0,
                    valueField: 'proposed',
                    lineColor: '#b5e61d',
                    title: i18Text['CALCULATOR.DEBT_CONSOLIDATION.PROPOSED'],
                }
            ];
        });
        this.translate.get(['CALCULATOR.DEBT_CONSOLIDATION.LOAN_BALANCE', 'CALCULATOR.DEBT_CONSOLIDATION.TIME'])
        .pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            const valueAxes = [{
                title: i18Text['CALCULATOR.DEBT_CONSOLIDATION.LOAN_BALANCE'],
                stackType: 'none',
                gridAlpha: 0,
                position: 'left',
                labelFunction: function (number, label) {
                    if (number === 0) {
                        label = prefix + number.toLocaleString('en');
                    } else {
                        label = prefix + Math.abs(number).toLocaleString('en');
                    }
                    return label;
                }
            }];
            const obj = {
                ...currentCertaintyChart,
                dataProvider: dataProvider,
                graphs: graphs,
                valueAxes: valueAxes,
                categoryAxis: {
                    ...currentCertaintyChart['categoryAxis'],
                    title: i18Text['CALCULATOR.DEBT_CONSOLIDATION.TIME']
                }
            };
            setTimeout(() => {
                this.amcharts.makeChart('resultGraph', obj);
            }, 1000);
        });

    }

    async refreshData() {
        this.backupOfLoanList = [];
        this.newAddLoanIds = [];
        this.deleteLoanIds = [];
        this.loanList = [];
        await this.getDefaultData();
        await this.calculateData();
    }

    back() {
        if (this.previousUrl.length > 0) {
            this.router.navigate(this.previousUrl);
        } else {
            this.router.navigate(['client/' + this.clientId + '/overview']);
        }
    }

    generateReport() {
        this.reportObject = this.setPayload();
        this.openReportSidePanel();
    }

    setPayload() {
        const allLoanList = JSON.parse(JSON.stringify(this.loanList));
        allLoanList.forEach(loan => {
            loan['loanType'] = (loan['selctedLoanType'] && loan['selctedLoanType'].type) ? loan['selctedLoanType'].type : 0;
            delete loan['selctedLoanType'];
            loan['interestType'] = (loan['selectedInterestType'] && loan['selectedInterestType'].id) ? loan['selectedInterestType'].id : '';
            delete loan['selectedInterestType'];
            loan['paymentFrequency'] = (loan['selectedPaymentFrequency'] && loan['selectedPaymentFrequency'].frequencyId) ? loan['selectedPaymentFrequency'].frequencyId : 0;
            delete loan['selectedPaymentFrequency'];
            delete loan['id'];
        });
        const dataPayload = {
            ...this.debtCalculatorData,
            loanItem: allLoanList,
            interestType: this.selectedInterestType.id,
            paymentFreq: this.selectedPaymentFrequency.frequencyId,
            errors: {}
        };
        return dataPayload;
    }

    loadLoans(content) {
        this.calculatorService.getLoans(this.clientId).toPromise().then(result => {
            this.loadLoanList = result;
            const mortageIndex = this.loadLoanList.findIndex(x => x.selMort === true);
            if (mortageIndex > -1) {
                this.loadLoanList[mortageIndex]['checkDiabled'] = true;
                this.primaryLoadLoan = this.loadLoanList[mortageIndex]['loanId'];
            }
            this.refModel = this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
        }).catch(err => { });
    }

    saveLoadLoan() {
        this.calculatorService.saveLoans(this.clientId, this.loadLoanList).toPromise().then(result => {
            this.getDefaultData(true);
            this.refModel.close();
        }).catch(err => {

        });
    }

    changeLoadLoan(loanId) {
        this.loadLoanList.forEach(loan => {
            loan['checkDiabled'] = false;
            loan['selMort'] = false;
            if (loanId === loan['loanId']) {
                loan['checkDiabled'] = true;
                loan['debCon'] = true;
                loan['selMort'] = true;
            }
        });
    }

    async calculateData() {
        this.savePayload = await this.setPayload();
        this.saveData.next();
    }

    openReportSidePanel() {
        this.isCalculatorReportSidePanelOpen = true;
    }

    closePanel() {
        this.isCalculatorReportSidePanelOpen = false;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
