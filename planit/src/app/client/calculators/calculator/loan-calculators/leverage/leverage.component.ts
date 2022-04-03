import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { CalculatorService, ClientProfileService } from '../../../../service';
import { getProvincePayload, AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { PageTitleService } from '../../../../../shared/page-title';
import { LEVERAGE_REPORT_TYPE } from '../../../../../shared/constants';

@Component({
    selector: 'app-leverage',
    templateUrl: './leverage.component.html',
    styleUrls: ['./leverage.component.css']
})
export class LeverageComponent implements OnInit, OnDestroy {
    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency
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
    clientId;
    leverageDropdownlist = [];
    leverageDropdownvalue: any;
    getLeverageCalculation: any;
    leverageDetails = {};
    rateIllustrate = [];
    provinceArr = {};
    countries = [];
    portfoliodata = [];
    clientData: any = {};
    countryProvinceData = [];
    province = [];
    clientDefaultProvince = {};
    defaultIllutrate;
    chartObj = {};
    dataProvider = [];
    refreshObj = {};
    previousUrl = [];
    $calculate: Subject<void> = new Subject<void>();
    leverageDetailsPayload = {};
    beforeTaxReturnError = false;
    REPORT_TYPE = LEVERAGE_REPORT_TYPE;
    isError = false;
    isCalculatorReportSidePanelOpen = false;
    i18Text = {};
    reportObject = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private clientProfileService: ClientProfileService,
        private calculatorService: CalculatorService,
        private amcharts: AmChartsService,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService,
        private router: Router,
        private pageTitleService: PageTitleService

    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.LEVERAGE_CALCULATOR');
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
        this.$calculate.debounceTime(1000).switchMap(() => this.calculatorService.calculateLeverage(this.clientId, this.leverageDetailsPayload)).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.leverageDetails = res;
            this.leverageDropdownvalue = this.leverageDropdownlist.find(x => x.key === this.leverageDetails['loadedScenario']);
            this.isError = (this.leverageDetails.hasOwnProperty('errors') && Object.keys(this.leverageDetails['errors']).length > 0) ? true : false;
            this.getProvinceData();
            this.setData();
        }, error => { });
    }

    ngOnInit() {
        this.translate.stream([
            'CALCULATOR.WARNING_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'CALCULATOR.WARNING_SELECT_SCENARIO',
            'CALCULATOR.LEVERAGE.ILLUSTRATE_VALUE_ERROR',
            'CALCULATOR.LEVERAGE.LEVERAGE_SUCCESS',
            'CALCULATOR.HEADER.LEVERAGE',
            'CALCULATOR.LEVERAGE.SUMMARY',
            'CALCULATOR.LEVERAGE.SUMMARY_SIGNATURES',
            'CALCULATOR.LEVERAGE.DETAILED_SCHEDULE',
            'CALCULATOR.LEVERAGE.UNCERTAINTY_ANALYSIS',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'CALCULATOR.LEVERAGE.NO_LEVERAGE',
            'CALCULATOR.LEVERAGE.LEVERAGE',
            'CALCULATOR.LEVERAGE.NET_BEFORE_TAX_VALUES_AFTER',
            'CALCULATOR.YEARS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currency
            });
        });
        this.calculatorService.getLeverageScenarioDroplist(this.clientId).toPromise().then(res => {
            this.leverageDropdownlist = res;
            this.leverageDropdownvalue = this.leverageDropdownlist[0];
            this.getLeverageDetail();
        }).catch(err => { });
    }

    getLeverageDetail() {
        this.calculatorService.getLeverage(this.clientId, this.leverageDropdownvalue['key']).toPromise().then(res => {
            this.refreshObj = Object.assign({}, res);
            this.leverageDetails = res;
            this.isError = (this.leverageDetails.hasOwnProperty('errors') && Object.keys(this.leverageDetails['errors']).length > 0) ? true : false;
            this.getProvinceData();
            this.setData();
        }).catch(err => { });
    }

    setData() {
        this.rateIllustrate = [];
        this.portfoliodata = [];
        this.dataProvider = [];
        this.leverageDetails['portfolios'].unshift({
            primaryKey: null,
            country: null,
            portfolioNumber: 0,
            description: 'Custom',
            localizedID: 'CUSTOM',
            rateOfReturn: 0.0,
            standardDeviation: 0.0,
            discretionary: 0
        });
        this.leverageDetails['selectedPortfolio'] = this.leverageDetails['portfolios'].filter(p => p.portfolioNumber === this.leverageDetails['selectedPortfolio'])[0];

        this.leverageDetails['beforeTaxReturns'].forEach((illustrate, index) => {
            this.rateIllustrate.push({ id: index, value: illustrate });
        });

        this.leverageDetails['assetClasses'].forEach((assetClassSSID, index) => {
            this.portfoliodata.push({
                id: assetClassSSID,
                value: this.leverageDetails['targetPercents'][index]
            });
        });

        this.leverageDetails['annualValues'].forEach(element => {
            this.dataProvider.push({
                'returnValue': element.returnValue + '%',
                'noLeverage': element.noLeverage,
                'leverage': element.leverage
            });
        });
        if (this.dataProvider.length > 0) {
            this.chartData();
        }
    }

    back() {
        if (this.previousUrl.length > 0) {
            this.router.navigate(this.previousUrl);
        } else {
            this.router.navigate(['client/' + this.clientId + '/overview']);
        }
    }

    addRateIllustrate() {
        if (this.rateIllustrate.length && this.rateIllustrate[this.rateIllustrate.length - 1].value === 0) {
            this.translate.get(['CALCULATOR.LEVERAGE.ILLUSTRATE_VALUE_ERROR', 'CALCULATOR.WARNING_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18txt => {
                swal(i18txt['CALCULATOR.WARNING_TITLE'], i18txt['CALCULATOR.LEVERAGE.ILLUSTRATE_VALUE_ERROR'], 'warning');
            });
        } else {
            this.rateIllustrate.push({ id: this.rateIllustrate.length, value: 0 });
            this.onChangeCalculation();
        }
    }
    getProvinceData() {
        if (this.clientData['planningCountry'] !== undefined && this.leverageDetails && this.leverageDetails.hasOwnProperty('selectedProvince')) {
            this.store.select(getProvincePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data) {
                    this.provinceArr = data;
                    this.province = this.provinceArr[this.clientData['planningCountry']];
                    this.clientDefaultProvince = this.province.filter(p => p.provinceId === this.leverageDetails['selectedProvince'])[0];
                } else {
                    this.clientProfileService.getProvince();
                }
            });
        }
    }

    refreshData() {
        this.leverageDropdownvalue = {};
        this.rateIllustrate = [];
        this.portfoliodata = [];
        this.calculatorService.getLeverage(this.clientId).toPromise().then(response => {
            this.leverageDetails = response;
            this.leverageDetailsPayload = response;
            this.$calculate.next();
        });
    }

    save(f: NgForm) {
        if (f.valid) {
            const obj = this.prepareData();
            this.calculatorService.saveLeverageData(this.clientId, obj).toPromise().then(res => {
                swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18Text['CALCULATOR.LEVERAGE.LEVERAGE_SUCCESS'], 'success');
                this.back();
            }).catch(errorResponse => {
                swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
            });
        }
    }

    chartData() {
        const currency = this.currency;
        this.chartObj = {
            'type': 'serial',
            'titles': [
                {
                    'text': this.i18Text['CALCULATOR.LEVERAGE.NET_BEFORE_TAX_VALUES_AFTER'] + ' ' + this.leverageDetails['savingsPeriod'] + ' ' + this.i18Text['CALCULATOR.YEARS'],
                    'size': 14,
                    'color': '#788588'
                }
            ],
            'theme': 'none',
            'categoryField': 'returnValue',
            'rotate': false,
            'startDuration': 1,
            'columnSpacing': 0,
            'columnWidth': 0.5,
            'categoryAxis': {
                'gridPosition': 'start',
                'position': 'left',
                'gridAlpha': 0,
            },
            'trendLines': [],
            'graphs': [
                {
                    'balloonText': this.i18Text['CALCULATOR.LEVERAGE.NO_LEVERAGE'] + ' : ' + currency + '[[value]]',
                    'fillAlphas': 1,
                    'id': 'AmGraph-1',
                    'lineAlpha': 0.2,
                    'title': this.i18Text['CALCULATOR.LEVERAGE.NO_LEVERAGE'],
                    'type': 'column',
                    'valueField': 'noLeverage',
                    'lineColor': '#77a9fe'
                },
                {
                    'balloonText': this.i18Text['CALCULATOR.LEVERAGE.LEVERAGE'] + ' : ' + currency + '[[value]]',
                    'fillAlphas': 1,
                    'id': 'AmGraph-2',
                    'lineAlpha': 0.2,
                    'title': this.i18Text['CALCULATOR.LEVERAGE.LEVERAGE'],
                    'type': 'column',
                    'valueField': 'leverage',
                    'lineColor': '#aadc55'
                }
            ],
            'guides': [],
            'valueAxes': [
                {
                    'id': 'ValueAxis-1',
                    'position': 'bottom',
                    'axisAlpha': 1,
                    labelFunction: function (number, label) {
                        if (number === 0) {
                            label = currency + number.toLocaleString('en');
                        } else {
                            label = currency + Math.abs(number).toLocaleString('en');
                        }
                        return label;
                    }
                }
            ],
            'legend': {
                'align': 'center',
            },
            'dataProvider': this.dataProvider,
            'export': {
                'enabled': true
            }
        };
        setTimeout(() => {
            this.amcharts.makeChart('leverageGraph', this.chartObj);
        }, 1000);
    }

    generateReport() {
        if (this.leverageDropdownvalue && this.leverageDropdownvalue['key']) {
            this.reportObject = this.prepareData();
            this.openReportSidePanel();
        } else {
            swal(this.i18Text['CALCULATOR.WARNING_TITLE'], this.i18Text['CALCULATOR.WARNING_SELECT_SCENARIO'], 'warning');
        }
    }

    prepareData(): Object {
        const setIllustrateData = [];
        this.beforeTaxReturnError = false;
        this.rateIllustrate.forEach(illustrate => {
            setIllustrateData.push(illustrate.value);
            if (illustrate.value > 20) {
                this.beforeTaxReturnError = true;
            }
        });
        const payload = {
            ...this.leverageDetails,
            selectedProvince: this.clientDefaultProvince['provinceId'],
            selectedPortfolio: this.leverageDetails['selectedPortfolio']['portfolioNumber'],
            loadedScenario: this.leverageDropdownvalue.key,
            beforeTaxReturns: setIllustrateData,
            beforeTaxReturnsDoubleArray: setIllustrateData,
            expandBreakdown: true,
            errors: {}
        };
        return payload;
    }

    async onChangeCalculation(input = '') {
        this.leverageDetailsPayload = await this.prepareData();
        if (input && input === 'portfolio' && this.leverageDetailsPayload['selectedPortfolio'] === 0) {
            this.portfoliodata.forEach((element, index) => {
                element.value = 0;
                this.leverageDetailsPayload['targetPercents'][index] = 0;
            });
        }
        this.$calculate.next();
    }

    openReportSidePanel() {
        this.isCalculatorReportSidePanelOpen = true;
    }

    closePanel() {
        this.isCalculatorReportSidePanelOpen = false;
    }

    changeScenario() {
        this.getLeverageDetail();
    }
    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
