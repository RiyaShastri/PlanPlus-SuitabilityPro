import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { CalculatorService } from '../../../../service/calculator.service';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { valueAtRiskGraph } from '../../../../client-models/goal-analysis-charts';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { PageTitleService } from '../../../../../shared/page-title';

@Component({
    selector: 'app-critical-illness',
    templateUrl: './critical-illness.component.html',
    styleUrls: ['./critical-illness.component.css']
})
export class CriticalIllnessComponent implements OnInit, OnDestroy {
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
    clientData = {};
    loanListData = [];
    criticalIllness = {};
    scenarioLists = [];
    selectedScenario;
    previousUrl = [];
    criticalIllnessPayload = {};
    $calculate: Subject<void> = new Subject<void>();
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
        this.pageTitleService.setPageTitle('pageTitle|TAB.CRITICAL_ILLNESS_CALCULATOR');
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
        this.$calculate.debounceTime(1000).switchMap(() => this.calculatorService.calculateCriticalIllness(this.criticalIllnessPayload)).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.criticalIllness = res;
            this.isError = (this.criticalIllness.hasOwnProperty('errors') && Object.keys(this.criticalIllness['errors']).length > 0) ? true : false;
            this.drawGraph();
        });
    }

    async ngOnInit() {
        await this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currency
            });
        });
        await this.calculatorService.getScenarioDropListForCriticalIllness(this.clientId, 3).toPromise().then(dropList => {
            this.scenarioLists = dropList;
        }).catch(error => { });
        await this.calculatorService.getCriticalIllnessData(3).toPromise().then(data => {
            this.criticalIllness = data;
            this.drawGraph();
        }).catch(error => { });
    }

    setData() {
        if (this.selectedScenario && this.selectedScenario['key']) {
            this.calculatorService.getCriticalIllnessData(3, this.clientId, this.selectedScenario['key']).toPromise().then(result => {
                this.criticalIllness = result;
               this.drawGraph();
            }).catch(error => { });
        } else {
            this.translate.stream(['CALCULATOR.WARNING_TITLE', 'CALCULATOR.WARNING_SELECT_SCENARIO'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['CALCULATOR.WARNING_TITLE'], i18Text['CALCULATOR.WARNING_SELECT_SCENARIO'], 'warning');
                });
        }
    }

    calculateAmount() {
        this.criticalIllness['ciAnalysisResponse']['totalCapitalRequired'] = this.criticalIllness['ciAnalysisResponse']['fundsToReplaceIncome'] +
            this.criticalIllness['ciCurrentBenefitsResponse']['lumpSumCosts'];
        this.criticalIllness['ciAnalysisResponse']['totalCapitalAvailable'] = this.criticalIllness['ciCurrentBenefitsResponse']['currentInsuranceCoverage'] +
            this.criticalIllness['ciCurrentBenefitsResponse']['lumpSumBenefits'];
        this.criticalIllness['ciAnalysisResponse']['shortFall'] = this.criticalIllness['ciAnalysisResponse']['totalCapitalRequired'] +
            this.criticalIllness['ciAnalysisResponse']['totalCapitalAvailable'];
        this.drawGraph();
    }

    drawGraph() {
        const currency = this.currency;
        let dataProvider = [], graphs = [], valueAxes = [];
        this.graphObj = {};
        this.translate.stream([
            'CALCULATOR.CRITICAL_ILLNESS.TOTAL_FUNDS_REQUIRED',
            'CALCULATOR.CRITICAL_ILLNESS.TOTAL_FUNDS_AVAILABLE',
            'CALCULATOR.CRITICAL_ILLNESS.SHORTFALL',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            dataProvider = [
                {
                    country: i18Text['CALCULATOR.CRITICAL_ILLNESS.TOTAL_FUNDS_REQUIRED'],
                    visits: parseFloat(this.criticalIllness['ciAnalysisResponse']['totalCapitalRequired']).toFixed(0),
                    color: '#77a9ff'
                },
                {
                    country: i18Text['CALCULATOR.CRITICAL_ILLNESS.TOTAL_FUNDS_AVAILABLE'],
                    visits: parseFloat(this.criticalIllness['ciAnalysisResponse']['totalCapitalAvailable']).toFixed(0),
                    color: '#a9dc54'
                },
                {
                    country: i18Text['CALCULATOR.CRITICAL_ILLNESS.SHORTFALL'],
                    visits: parseFloat(this.criticalIllness['ciAnalysisResponse']['shortFall']).toFixed(0),
                    color: '#ee6545'
                }
            ];
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
        this.graphObj = {
            ...valueAtRiskGraph,
            graphs: graphs,
            dataProvider: dataProvider,
            valueAxes: valueAxes,
            categoryAxis: {
                ...valueAtRiskGraph['categoryAxis'],
                autoWrap: true
            }
        };
        setTimeout(() => {
            this.amcharts.makeChart('shortFallGraph', this.graphObj);
        }, 1000);
    }

    @HostListener('window:resize') onResize() {
        setTimeout(() => {
            this.amcharts.makeChart('shortFallGraph', this.graphObj);
        }, 1000);
    }

    back() {
        if (this.previousUrl.length > 0) {
            this.router.navigate(this.previousUrl);
        } else {
            this.router.navigate(['client/' + this.clientId + '/overview']);
        }
    }

    saveData(f: NgForm) {
        if (f.valid) {
            const obj = {
                ...this.criticalIllness,
                screenId: this.selectedScenario['key'],
            };
            this.calculatorService.saveCriticalIllnessData(this.clientId, obj).toPromise().then(result => {
                this.back();
                this.translate.get(['ALERT.TITLE.SUCCESS', 'CALCULATOR.CRITICAL_ILLNESS.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['ALERT.TITLE.SUCCESS'], i18Text['CALCULATOR.CRITICAL_ILLNESS.SUCCESS'], 'success');
                });
            }).catch(errorResponse => {
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                });
            });
        }
    }

    generateReport() {
        if (this.selectedScenario && this.selectedScenario['key']) {
            this.reportObject = {
                ...this.criticalIllness,
                screenId: this.selectedScenario['key'],
            };
            this.openReportSidePanel();
        } else {
            this.translate.stream(['CALCULATOR.WARNING_TITLE', 'CALCULATOR.WARNING_SELECT_SCENARIO'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                swal(i18Text['CALCULATOR.WARNING_TITLE'], i18Text['CALCULATOR.WARNING_SELECT_SCENARIO'], 'warning');
            });
        }
    }

    onChangeCalculation() {
        const obj = {
            ...this.criticalIllness,
            errors: {},
            screenId: (this.selectedScenario && this.selectedScenario['key']) ? this.selectedScenario['key'] : null,
        };
      this.criticalIllnessPayload = obj;
        this.$calculate.next();
    }

    openReportSidePanel() {
        this.isCalculatorReportSidePanelOpen = true;
    }

    closePanel() {
        this.isCalculatorReportSidePanelOpen = false;
    }

    changeScenario() {
        this.setData();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
