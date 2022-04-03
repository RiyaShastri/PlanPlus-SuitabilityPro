import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { CalculatorService } from '../../../../service';
import { valueAtRiskGraph } from '../../../../client-models/goal-analysis-charts';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { LOAN_AMORTIZATION_ACCORDION, LOAN_AMORTIZATION_RETAIN_TYPE, AMORTIZATION_PERIOD } from '../../../../../shared/constants';
import { PageTitleService } from '../../../../../shared/page-title';

@Component({
    selector: 'app-loan-amortization-calculator',
    templateUrl: './loan-amortization-calculator.component.html',
    styleUrls: ['./loan-amortization-calculator.component.css'],
})
export class LoanAmortizationCalculatorComponent implements OnInit, OnDestroy {
    postData = {};
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
        suffix: '%'
    });
    percentMask1 = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    percentMask2 = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 3
    });
    numberMask = createNumberMask({
        prefix: '',
        suffix: '',
        allowDecimal: true
    });
    clientId;
    amortizationData = {};
    maxDate = new Date();
    clientData = {};
    amortizationPeriodOpt = [];
    selectAmortizationPeriod;
    totalIrregularPayment = [];
    loanListData = [];
    compoundingList = [];
    selectCompound;
    paymentFrequency = [];
    selectPaymentFrequency;
    paymentTypes = [];
    selectedPaymentType;
    loanFlag = false;
    previousUrl = [];
    ACCORDION_VALUE = LOAN_AMORTIZATION_ACCORDION;
    RETAIN_TYPE = LOAN_AMORTIZATION_RETAIN_TYPE;
    graphObj = {};
    private unsubscribe$ = new Subject<void>();
    isCalculatorReportSidePanelOpen = false;
    reportObject = {};
    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private calculatorService: CalculatorService,
        private amcharts: AmChartsService,
        private refreshDataService: RefreshDataService,
        private router: Router,
        private translate: TranslateService,
        private pageTitleService: PageTitleService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.LOAN_AMORTIZATION_CALCULATOR');
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.clientId = param['clientId'];
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
    }

    async ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currency,
            });
            this.currencyMask1 = createNumberMask({
                prefix: this.currency,
                allowDecimal: true
            });
        });
        this.translate.stream(['CALCULATOR.LOAN_AMORTIZATION.MONTHS', 'CALCULATOR.LOAN_AMORTIZATION.YEARS']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            this.amortizationPeriodOpt = [
                { id: AMORTIZATION_PERIOD.MONTHS, description: text['CALCULATOR.LOAN_AMORTIZATION.MONTHS'] },
                { id: AMORTIZATION_PERIOD.YEARS, description: text['CALCULATOR.LOAN_AMORTIZATION.YEARS'] },
            ];
        });
        await this.calculatorService.getFrequencyList('calccompounding').toPromise().then(frequency => {
            this.compoundingList = frequency;
        }).catch(error => { });
        await this.calculatorService.getFrequencyList('calcpayment').toPromise().then(paymentFrequency => {
            this.paymentFrequency = paymentFrequency;
        }).catch(error => { });
        await this.calculatorService.getPatymentTypes().toPromise().then(payment => {
            this.paymentTypes = payment;
        }).catch(error => { });
        await this.calculatorService.getLoanList(this.clientId).toPromise().then(loanList => {
            this.loanListData = loanList;
        }).catch(error => { });
        await this.setData();
    }

    async setData() {
        await this.calculatorService.getLoanAmortizationCalculatorData(this.loanFlag, this.postData).toPromise().then(loanData => {
            this.amortizationData = loanData;
            this.selectCompound = this.compoundingList.find(x => x.frequencyId === this.amortizationData['ncompound']);
            this.selectAmortizationPeriod = this.amortizationPeriodOpt.find(x => x.id === this.amortizationData['monthsOrYears']);
            this.selectedPaymentType = this.paymentTypes.find(x => x.paymentTypeId === this.amortizationData['npaymentType']);
            this.selectPaymentFrequency = this.paymentFrequency.find(x => x.frequencyId === this.amortizationData['nfrequency']);
            this.setIrregularPaymentData();
            this.drawGraph();
        }).catch(error => { });
    }

    drawGraph() {
        const currency = this.currency;
        let dataProvider = [], graphs = [], valueAxes = [], obj = {};
        this.translate.get([
            'CALCULATOR.LOAN_AMORTIZATION.GRAPH_LABELS.TOTAL_PAYMENTS',
            'CALCULATOR.LOAN_AMORTIZATION.GRAPH_LABELS.TOTAL_PRINCIPAL_PAID',
            'CALCULATOR.LOAN_AMORTIZATION.GRAPH_LABELS.TOTAL_INTEREST_PAID'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            dataProvider = [
                {
                    country: text['CALCULATOR.LOAN_AMORTIZATION.GRAPH_LABELS.TOTAL_PAYMENTS'],
                    visits: parseFloat(this.amortizationData['ntotalPayments']).toFixed(0),
                    color: '#77a9ff'
                },
                {
                    country: text['CALCULATOR.LOAN_AMORTIZATION.GRAPH_LABELS.TOTAL_PRINCIPAL_PAID'],
                    visits: parseFloat(this.amortizationData['ntotalPrincipal']).toFixed(0),
                    color: '#a9dc54'
                },
                {
                    country: text['CALCULATOR.LOAN_AMORTIZATION.GRAPH_LABELS.TOTAL_INTEREST_PAID'],
                    visits: parseFloat(this.amortizationData['ntotalInterest']).toFixed(0),
                    color: '#ee6545'
                },
            ];
        });
        graphs = [
            {
                balloonText: '[[category]] : ' + currency + '[[value]]',
                fillAlphas: 5,
                type: 'column',
                valueField: 'visits',
                fillColorsField: 'color',
                lineAlpha: 0.2,
            }
        ];
        valueAxes = [{
            gridAlpha: 0.2,
            fillAlpha: 1,
            stackType: 'regular',
            labelFunction: function (number, label) {
                if (number === 0) {
                    label = currency + '-';
                } else {
                    label = currency + Math.abs(number).toLocaleString('en');
                }
                return label;
            }
        }];
        obj = {
            ...valueAtRiskGraph,
            graphs: graphs,
            dataProvider: dataProvider,
            valueAxes: valueAxes,
            categoryAxis: {
                ...valueAtRiskGraph['categoryAxis'],
                autoWrap: true
            }
        };
        this.graphObj = obj;
        setTimeout(() => {
            this.amcharts.makeChart('paymentGraph', obj);
        }, 1000);

    }

    @HostListener('window:resize') onResize() {
        setTimeout(() => {
        this.amcharts.makeChart('paymentGraph', this.graphObj);
        }, 1000);
    }

    updateGraph() {
        this.drawGraph();
    }

    calculateData(data, isExtra: boolean = false) {
        const dates = [], amount = [], name = [];
        if (isExtra) {
            this.amortizationData['nextraType'] = data;
            this.amortizationData['ncalcType'] = 0;
        } else {
            this.amortizationData['ncalcType'] = data;
            this.amortizationData['nextraType'] = 0;
        }
        if (this.totalIrregularPayment.length > 0) {
            this.totalIrregularPayment.forEach(payment => {
                dates.push(payment.date ? moment(payment.date).format('YYYY-MM-DD') : '');
                amount.push(payment.amount);
                name.push(payment.id);
            });
        }
        const obj = {
            ...this.amortizationData,
            'ncompound': this.selectCompound.frequencyId,
            'monthsOrYears': this.selectAmortizationPeriod.id,
            'npaymentType': this.selectedPaymentType.paymentTypeId,
            'nfrequency': this.selectPaymentFrequency.frequencyId,
            'irregularDates': dates,
            'irregularDatesNames': name,
            'irregularAmounts': amount,
            'errors': {}
        };
        this.postData = obj;
        this.loanFlag = true;
        this.setData();
    }

    setIrregularPaymentData() {
        const today = new Date();
        this.totalIrregularPayment = [];
        if (this.amortizationData['nirregular'] > 0 && this.amortizationData['irregularAmountsNames'].length > 0 &&
            this.amortizationData['irregularDates'].length > 0 && this.amortizationData['irregularAmounts'].length > 0) {
            for (let i = 0; i < this.amortizationData['irregularAmounts'].length; i++) {
                this.totalIrregularPayment.push({
                    id: 'Date' + (i + 1),
                    date: (this.amortizationData['irregularDates'][i] !== '') ? moment(this.amortizationData['irregularDates'][i]).format('YYYY-MM-DD') : moment(today).format('YYYY-MM-DD'),
                    amount: this.amortizationData['irregularAmounts'][i],
                });
            }
        }
    }

    setTheInterestRate() {
        this.amortizationData['nidinterest'] = this.amortizationData['ninterest'];
    }

    irragularPaymentSet(length) {
        const todayDate = new Date();
        const previousData = this.totalIrregularPayment;
        if (length > 0) {
            this.totalIrregularPayment = [];
            for (let i = 0; i < length; i++) {
                this.totalIrregularPayment.push({
                    id: 'Date' + (i + 1),
                    date: (previousData[i] && previousData[i]['date']) ? previousData[i]['date'] : moment(todayDate).format('YYYY-MM-DD'),
                    amount: (previousData[i] && previousData[i]['amount']) ? previousData[i]['amount'] : 0,
                });
            }
        } else {
            this.totalIrregularPayment = [];
        }
    }

    back() {
        if (this.previousUrl.length > 0) {
            this.router.navigate(this.previousUrl);
        } else {
            this.router.navigate(['client/' + this.clientId + '/overview']);
        }
    }

    generateReport() {
        const dates = [], amount = [], name = [];
        if (this.totalIrregularPayment.length > 0) {
            this.totalIrregularPayment.forEach(payment => {
                dates.push(payment.date ? moment(payment.date).format('YYYY-MM-DD') : '');
                amount.push(payment.amount);
                name.push(payment.id);
            });
        }
        this.reportObject = {
            ...this.amortizationData,
            'ncompound': this.selectCompound.frequencyId,
            'monthsOrYears': this.selectAmortizationPeriod.id,
            'npaymentType': this.selectedPaymentType.paymentTypeId,
            'nfrequency': this.selectPaymentFrequency.frequencyId,
            'irregularDates': dates,
            'irregularDatesNames': name,
            'irregularAmounts': amount,
        };
        this.openReportSidePanel();
    }

    onOpen(event, type) {
        if (type === this.ACCORDION_VALUE.INTEREST_RATE) {
            this.amortizationData['nidinterest'] = 0;
            this.amortizationData['nidcurrent'] = 0;
        }
        if (type === this.ACCORDION_VALUE.LEVERAGE_BREAK) {
            this.amortizationData['nnritax'] = 0;
            this.amortizationData['nnrifees'] = 0;
            this.amortizationData['nnriincome'] = 0;
            this.amortizationData['nnribreakEven'] = 0;
        }
        if (type === this.ACCORDION_VALUE.MAXIMUM_LOAN) {
            this.amortizationData['nhbincome'] = 0;
            this.amortizationData['nhbpayments'] = 0;
            this.amortizationData['nhbdebt'] = 0;
            this.amortizationData['nhbborrow'] = 0;
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    openReportSidePanel() {
        this.isCalculatorReportSidePanelOpen = true;
    }

    closePanel() {
        this.isCalculatorReportSidePanelOpen = false;
    }

}
