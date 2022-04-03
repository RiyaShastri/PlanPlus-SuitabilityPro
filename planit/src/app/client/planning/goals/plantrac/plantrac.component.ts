import { Component, OnInit, OnDestroy } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { Angulartics2 } from 'angulartics2';
import { GoalService } from '../../../service';
import { PageTitleService } from '../../../../shared/page-title';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import { PLANTRAC_TIME_PERIODS, PLANTRAC_VIEW_BY_OPTIONS, PERSON_RELATION } from '../../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-plantrac',
    templateUrl: './plantrac.component.html',
    styleUrls: ['./plantrac.component.css']
})
export class PlantracComponent implements OnInit, OnDestroy {

    clientId: string;
    goalId: string;
    noData = true;
    viewByOptions = [];
    plantracViewByOptions = PLANTRAC_VIEW_BY_OPTIONS;
    selectedView: any = {};
    timePeriodOptions = [];
    clientData;
    defaultTimePeriod = {};
    selectedTimePeriod = {};
    plantractStatus = 2;
    opened = false;
    refreshedOn = Date.now();
    planTracDetails: any;
    savingsWithdrawals: any;
    filter = '';
    currency = '$';
    dataProvider = [];
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private amcharts: AmChartsService,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private goalService: GoalService,
        private store: Store<AppState>,
        private translate: TranslateService,
        private modalService: NgbModal,
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANTRAC');
        this.angulartics2.eventTrack.next({ action: 'goalPlanTrac' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.goalId = params['goalId'];
        });
    }

    ngOnInit() {
        this.getViewByOptions();
        this.getPlanTracData();
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
        });
        this.getTimePeriodOptions();
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.getViewByOptions();
            this.getSavingsWithdrawalsSummary();
        });
    }

    getViewByOptions() {
        this.translate.get(['PLANTRAC.VIEW_BY_OPTION.TOTALS', 'PLANTRAC.VIEW_BY_OPTION.TYPE', 'PLANTRAC.VIEW_BY_OPTION.ACCOUNT']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            this.viewByOptions = [
                { id: 1, name: text['PLANTRAC.VIEW_BY_OPTION.TOTALS'], value: PLANTRAC_VIEW_BY_OPTIONS.TOTALS },
                { id: 2, name: text['PLANTRAC.VIEW_BY_OPTION.TYPE'], value: PLANTRAC_VIEW_BY_OPTIONS.TYPE },
                { id: 3, name: text['PLANTRAC.VIEW_BY_OPTION.ACCOUNT'], value: PLANTRAC_VIEW_BY_OPTIONS.ACCOUNT }
            ];
            this.selectedView = this.viewByOptions[0];
        });
    }

    getTimePeriodOptions() {
        this.goalService.getPlanTracTimePeriodOptions(this.goalId).toPromise().then(res => {
            let dataOf12Months = false;
            let month12Opt = null;
            let inceptionOpt = null;
            res.forEach(option => {
                this.timePeriodOptions.push({ id: option.id, name: option.description });
                if (option['description'] === PLANTRAC_TIME_PERIODS['MONTHS_12']) {
                    dataOf12Months = true;
                    month12Opt = { id: option.id, name: option.description };
                }
                if (option['description'] === PLANTRAC_TIME_PERIODS['SINCE_INCEPTION']) {
                    inceptionOpt = { id: option.id, name: option.description };
                }
            });
            this.selectedTimePeriod = dataOf12Months ? month12Opt : inceptionOpt;
            this.defaultTimePeriod = this.selectedTimePeriod;
        }).catch(err => { });
    }

    getPlanTracData() {
        this.planTracDetails = null;
        this.goalService.getPlanTracDetails(this.goalId).toPromise().then(res => {
            this.planTracDetails = res;
            this.plantractStatus = this.planTracDetails['planTracDataSaved'] === false ? 0 : 1;
            this.getSavingsWithdrawalsSummary();
        }).catch(err => { });
    }

    getSavingsWithdrawalsSummary() {
        this.savingsWithdrawals = [];
        this.dataProvider = [];
        this.noData = true;
        this.translate.get([
            'PLANTRAC.SAVINGS_ANALYSIS',
            'PLANTRAC.WITHDRAWAL_ANALYSIS',
            'PLANTRAC.NET_SAVINGS',
            'PLANTRAC.PLANNED_SAVINGS',
            'PLANTRAC.ACTUAL_SAVINGS',
            'PLANTRAC.PLANNED_WITHDRAWALS',
            'PLANTRAC.ACTUAL_WITHDRAWALS',
            'PLANTRAC.PLANNED_NET_SAVINGS',
            'PLANTRAC.ACTUAL_NET_SAVINGS',
            'PLANTRAC.GRAPH.TOTAL_SAVINGS',
            'PLANTRAC.GRAPH.TOTAL_WITHDRAWALS',
            'PLANTRAC.GRAPH.TOTAL_NET_SAVINGS']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                this.goalService.getPlanTracSavingsWithdrawals(this.goalId, this.selectedTimePeriod['id'], this.selectedView.value).toPromise().then(res => {
                    for (const key in res) {
                        if (res.hasOwnProperty(key)) {
                            const element = res[key];
                            let headerText = '';
                            let objKey = '';
                            let plannedKey = '';
                            let actualKey = '';
                            let graphText = '';
                            if (key === 'savings') {
                                headerText = text['PLANTRAC.SAVINGS_ANALYSIS'];
                                plannedKey = text['PLANTRAC.PLANNED_SAVINGS'];
                                actualKey = text['PLANTRAC.ACTUAL_SAVINGS'];
                                graphText = text['PLANTRAC.GRAPH.TOTAL_SAVINGS'];
                                objKey = 'Savings';
                            } else if (key === 'withdrawals') {
                                headerText = text['PLANTRAC.WITHDRAWAL_ANALYSIS'];
                                plannedKey = text['PLANTRAC.PLANNED_WITHDRAWALS'];
                                actualKey = text['PLANTRAC.ACTUAL_WITHDRAWALS'];
                                graphText = text['PLANTRAC.GRAPH.TOTAL_WITHDRAWALS'];
                                objKey = 'Withdrawals';
                            } else {
                                headerText = text['PLANTRAC.NET_SAVINGS'];
                                plannedKey = text['PLANTRAC.PLANNED_NET_SAVINGS'];
                                actualKey = text['PLANTRAC.ACTUAL_NET_SAVINGS'];
                                graphText = text['PLANTRAC.GRAPH.TOTAL_NET_SAVINGS'];
                                objKey = 'NetSavings';
                            }
                            if (element.hasOwnProperty('planTrac' + objKey) && element.hasOwnProperty('total' + objKey)) {
                                this.savingsWithdrawals.push({
                                    accordHeader: headerText, plannedKey: plannedKey, actualKey: actualKey,
                                    planTrac: element['planTrac' + objKey], totalDetails: element['total' + objKey]
                                });
                                this.dataProvider.push({
                                    'category': graphText,
                                    'planned': element['total' + objKey]['plannedAmount'],
                                    'actual': element['total' + objKey]['actualAmount']
                                });
                            }
                        }
                    }
                    if (this.dataProvider.length > 0) {
                        this.noData = false;
                        setTimeout(() => {
                            this.amcharts.makeChart('analysisDiv', this.makeOptions());
                        }, 500);
                    }
                }).catch(err => { });
            });
    }


    changeGoal(goalId: string) {
        this.goalId = goalId;
        this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + goalId + '/plantrac']);
        this.getPlanTracData();
    }

    changeView(value) {
        this.selectedView = value;
        this.getSavingsWithdrawalsSummary();
    }

    changeTimePeriod(value) {
        this.selectedTimePeriod = value;
        this.getSavingsWithdrawalsSummary();
    }

    startPlanTrac() {
        this.goalService.startPlanTrac(this.goalId).toPromise().then(res => {
            this.planTracDetails = res;
            this.plantractStatus = this.planTracDetails['planTracDataSaved'] === false ? 0 : 1;
            this.getPlanTracData();
        }).catch(err => { });
    }

    refreshPlanTrac() {
        this.refreshedOn = Date.now();
        this.goalService.refreshPlanTrac(this.goalId).toPromise().then(res => {
            this.getPlanTracData();
        }).catch(err => { });
    }

    back() { }

    makeOptions() {
        let obj;
        this.translate.get([
            'PLANTRAC.GRAPH.PLANNED',
            'PLANTRAC.GRAPH.ACTUAL',
            'PLANTRAC.GRAPH.TOTAL_SAVINGS',
            'PLANTRAC.GRAPH.TOTAL_WITHDRAWALS',
            'PLANTRAC.GRAPH.TOTAL_NET_SAVINGS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            obj = {
                'type': 'serial',
                'theme': 'none',
                'categoryField': 'category',
                'rotate': false,
                'startDuration': 1,
                'columnSpacing': 0,
                'columnWidth': 0.5,
                // 'colors': ['#77a9fe', '#aadc55'],
                'categoryAxis': {
                    'gridPosition': 'start',
                    'position': 'left',
                    'gridAlpha': 0,
                },
                'trendLines': [],
                'graphs': [
                    {
                        'balloonText': i18text['PLANTRAC.GRAPH.PLANNED'] + ':[[value]]',
                        'fillAlphas': 1,
                        'id': 'AmGraph-1',
                        'lineAlpha': 0.2,
                        'title': i18text['PLANTRAC.GRAPH.PLANNED'],
                        'type': 'column',
                        'valueField': 'planned',
                        'lineColor': '#77a9fe'
                    },
                    {
                        'balloonText': i18text['PLANTRAC.GRAPH.ACTUAL'] + ':[[value]]',
                        'fillAlphas': 1,
                        'id': 'AmGraph-2',
                        'lineAlpha': 0.2,
                        'title': i18text['PLANTRAC.GRAPH.ACTUAL'],
                        'type': 'column',
                        'valueField': 'actual',
                        'lineColor': '#aadc55'
                    }
                ],
                'guides': [],
                'valueAxes': [
                    {
                        'id': 'ValueAxis-1',
                        'position': 'bottom',
                        'axisAlpha': 1,
                    }
                ],
                'allLabels': [],
                'balloon': {},
                'titles': [],
                'legend': {
                    'align': 'center',
                },
                'dataProvider': this.dataProvider,
                'export': {
                    'enabled': true
                }

            };
        });
        if (obj) {
            return obj;
        }
    }

    openPanel(accoundId, accountType) {
        this.opened = true;
        if (this.selectedView.value === PLANTRAC_VIEW_BY_OPTIONS.ACCOUNT) {
            this.filter = accoundId;
        } else {
            this.filter = accountType;
        }
    }

    closePanel() {
        this.opened = false;
    }

    openModal(content, index = 0) {
        this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
