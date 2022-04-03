import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/debounceTime';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { CalculatorService } from '../../../../service';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { PageTitleService } from '../../../../../shared/page-title';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { valueAtRiskGraph } from '../../../../client-models/goal-analysis-charts';

@Component({
    selector: 'app-long-term-care',
    templateUrl: './long-term-care.component.html',
    styleUrls: ['./long-term-care.component.css'],
})
export class LongTermCareComponent implements OnInit, OnDestroy {
    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    clientId;
    loanListData = [];
    longtermData = {};
    scenarioLists = [];
    selectedScenario;
    clientData = {};
    insuranceData = {};
    lablesOfAnalysis = [];
    previousUrl = [];
    $save: Subject<void> = new Subject<void>();
    dataPayload = {};
    isError = false;
    private unsubscribe$ = new Subject<void>();
    graphObj = {};
    isCalculatorReportSidePanelOpen = false;
    reportObject = {};
    constructor(
        private route: ActivatedRoute,
        private calculatorService: CalculatorService,
        private store: Store<AppState>,
        private amcharts: AmChartsService,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService,
        private router: Router,
        private pageTitleService: PageTitleService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.LONG_TERM_CARE_CALCULATOR');
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

        this.$save.debounceTime(1000).switchMap(() => this.calculatorService.calculateLongTerm(this.dataPayload)).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.longtermData = res;
            this.isError = (this.longtermData.hasOwnProperty('errors') && Object.keys(this.longtermData['errors']).length > 0) ? true : false;
            this.drawGraph();
        });
    }

    async ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currency
            });
        });
        await this.calculatorService.getScenarioDropListForLongTerm(this.clientId).toPromise().then(result => {
            this.scenarioLists = result;
        }).catch(errorResponse => { });
        await this.calculatorService.getLongTermCareData().toPromise().then(data => {
            this.longtermData = data;
            this.drawGraph();
        }).catch(error => { });
    }

    setData() {
        if (this.selectedScenario && this.selectedScenario['key']) {
            this.calculatorService.getLongTermCareData(this.clientId, this.selectedScenario['key']).toPromise().then(result => {
                this.longtermData = result;
                this.drawGraph();
                this.calculateData();
            }).catch(error => { });
        } else {
            this.translate.stream(['CALCULATOR.WARNING_TITLE', 'CALCULATOR.WARNING_SELECT_SCENARIO'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['CALCULATOR.WARNING_TITLE'], i18Text['CALCULATOR.WARNING_SELECT_SCENARIO'], 'warning');
                });
        }
    }

    drawGraph() {
        const currency = this.currency;
        const dataProvider = [];
        let graphs = [], valueAxes = [], titles = [];
        this.graphObj = {};
        this.longtermData['insuredResultList'].forEach((element, index) => {
            this.translate.get([
                'SSID_LABELS.' + element.ppsdid,
                'CALCULATOR.LONG_TERM.50_PERCENT',
                'CALCULATOR.LONG_TERM.100_PERCENT',
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                if (index === 0) {
                    dataProvider.push({
                        country: i18Text['SSID_LABELS.' + element.ppsdid],
                        visits: parseFloat(element['presentValueOfCapital']).toFixed(0),
                        color: '#77a9ff'
                    });
                } else if (index === 1) {
                    dataProvider.push({
                        country: i18Text['CALCULATOR.LONG_TERM.50_PERCENT'] + i18Text['SSID_LABELS.' + element.ppsdid],
                        visits: parseFloat(element['presentValueOfCapital']).toFixed(0),
                        color: '#a9dc54'
                    });
                } else if (index === 2) {
                    dataProvider.push({
                        country: i18Text['CALCULATOR.LONG_TERM.100_PERCENT'] + i18Text['SSID_LABELS.' + element.ppsdid],
                        visits: parseFloat(element['presentValueOfCapital']).toFixed(0),
                        color: '#ee6545'
                    });
                }
            });
        });
        graphs = [
            {
                balloonText: '[[category]] : [[value]]',
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
        this.translate.get(['CALCULATOR.LEVERAGE.GRAPH_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            titles = [
                {
                    'text': i18text['CALCULATOR.LEVERAGE.GRAPH_TITLE'],
                    'size': 14,
                    'color': '#788588'
                }
            ];
        });
        this.graphObj = {
            ...valueAtRiskGraph,
            titles: titles,
            graphs: graphs,
            dataProvider: dataProvider,
            valueAxes: valueAxes,
            categoryAxis: {
                ...valueAtRiskGraph['categoryAxis'],
                autoWrap: true
            }
        };
        setTimeout(() => {
            this.amcharts.makeChart('logTermGraph', this.graphObj);
        }, 1000);
    }

    @HostListener('window:resize') onResize() {
        setTimeout(() => {
            this.amcharts.makeChart('logTermGraph', this.graphObj);
        }, 1000);
    }

    saveData(f: NgForm) {
        if (f.valid) {
            const obj = {
                ...this.longtermData,
                screenid: this.selectedScenario['key'],
            };
            this.calculatorService.saveLongTermCareData(this.clientId, obj).toPromise().then(result => {
                this.back();
                this.translate.get(['ALERT.TITLE.SUCCESS', 'CALCULATOR.LONG_TERM.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['ALERT.TITLE.SUCCESS'], i18Text['CALCULATOR.LONG_TERM.SUCCESS'], 'success');
                });
            }).catch(errorResponse => {
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                });
            });
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
        if (this.selectedScenario && this.selectedScenario['key']) {
            this.reportObject = {
                ...this.longtermData,
                screenid: this.selectedScenario['key'],
            };
            this.openReportSidePanel();
        } else {
            this.translate.stream(['CALCULATOR.WARNING_TITLE', 'CALCULATOR.WARNING_SELECT_SCENARIO'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['CALCULATOR.WARNING_TITLE'], i18Text['CALCULATOR.WARNING_SELECT_SCENARIO'], 'warning');
                });
        }
    }

    calculateData() {
        const dataPayload = {
            ...this.longtermData,
            screenid: this.selectedScenario && this.selectedScenario['key'] ? this.selectedScenario['key'] : null,
            errors: {}
        };
        this.dataPayload = dataPayload;
        this.$save.next();
    }

    changeScenario() {
        this.setData();
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
