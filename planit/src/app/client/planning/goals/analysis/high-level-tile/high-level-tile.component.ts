import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import {
    AppState,
    getClientPayload
} from '../../../../../shared/app.reducer';
import { GoalService } from '../../../../service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { highLevelCurrentChart } from '../../../../client-models/goal-analysis-charts';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { Router } from '@angular/router';
import { AccessRightService } from '../../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-high-level-tile',
    templateUrl: './high-level-tile.component.html',
    styleUrls: ['./high-level-tile.component.css']
})

export class HighLevelTileComponent implements OnInit, OnChanges, OnDestroy {

    @Input() graphColours = [];
    @Input() goalId = '';
    @Input() clientId = '';
    @Input() changer = 0;
    clientData = {};
    currentScenarioData: any;
    alternateScenarioData: any;
    highLevelAnalysis = [];
    currency = '';
    currentAssumptions: any = {};
    strategyAssumptions: any = {};

    assumptionsData;
    accessRights = {};
    retirementGoal = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private amcharts: AmChartsService,
        private store: Store<AppState>,
        private goalsService: GoalService,
        public translate: TranslateService,
        private accessRightService: AccessRightService,
        private sharedService: RefreshDataService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.accessRightService.getAccess(['GOALASSUMPT', 'CURRSCENARIO']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.accessRights = res;
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
        });

        this.getHighLevelAnalysisData();
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
            this.getHighLevelAnalysisData();
        });
        this.sharedService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('assumptions updated') || message.includes('planning alternatives updated')) {
                this.getAssumptionsDetails();
                this.getHighLevelAnalysisData();
            }
        });
        this.goalsService.observerSync().pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            this.getAssumptionsDetails();
            this.getHighLevelAnalysisData();
        });

    }

    ngOnChanges(changes) {
        if (changes && changes.changer) {
            this.getHighLevelAnalysisData();
        }
        if (changes && changes.goalId) {
            if (changes.goalId['previousValue']) {
                this.getHighLevelAnalysisData();
            }
        }
    }

    getAssumptionsDetails() {
        this.assumptionsData = null;
        this.sharedService.changeMessage('default message');
        this.goalsService.getAssumptionsData(this.goalId, 'Strategy Scenario').toPromise().then(res => {
            this.assumptionsData = res;
            this.currentAssumptions = res['scenarios'][0];
            this.strategyAssumptions = res['scenarios'][1];
            this.currentAssumptions['portfolio'] = this.currentAssumptions['investmentStrategyDTO']['description'];
            this.strategyAssumptions['portfolio'] = this.strategyAssumptions['investmentStrategyDTO']['description'];
            this.currentAssumptions['fullTax'] = this.currentAssumptions['fullTaxCalc'] ? 'RADIOBUTTON.LABELS.YES' : 'RADIOBUTTON.LABELS.NO';
            this.strategyAssumptions['fullTax'] = this.strategyAssumptions['fullTaxCalc'] ? 'RADIOBUTTON.LABELS.YES' : 'RADIOBUTTON.LABELS.NO';
        }).catch(err => {
        });
    }

    getHighLevelAnalysisData() {
        this.goalsService.getGoalByGoalId(this.goalId).toPromise().then(response => {
            if (response) {
                this.retirementGoal = response['goalType'] === '2';
            }
        });
        this.goalsService.getGoalHighLevelAnalysis(this.goalId, 'current scenario').toPromise().then(res => {
            this.currentScenarioData = res;
            // this.makeData();
            this.goalsService.getGoalHighLevelAnalysis(this.goalId, 'strategy scenario').toPromise().then(response => {
                this.alternateScenarioData = response;
                this.makeData();
            }).catch(err => {
                this.alternateScenarioData = {};
                this.makeData();
            });
            this.getAssumptionsDetails();
        }).catch(err => {
            this.currentScenarioData = {};
            this.getAssumptionsDetails();
        });
    }

    makeData() {
        this.currentScenarioData['goalAchieved'] = [{
            title: 'Achieved',
            value: this.currentScenarioData['incomeAlternative']['percent']
        }, {
            title: 'Remaining',
            value: 100 - this.currentScenarioData['incomeAlternative']['percent']
        }];
        if (this.alternateScenarioData && this.alternateScenarioData.hasOwnProperty('incomeAlternative')) {
            this.alternateScenarioData['goalAchieved'] = [{
                title: 'Achieved',
                value: this.alternateScenarioData['incomeAlternative']['percent']
            }, {
                title: 'Remaining',
                value: 100 - this.alternateScenarioData['incomeAlternative']['percent']
            }];
        }
        this.translate.get([
            'GOAL.ANALYSIS.LABEL.PENSIONS_AND_OTHER_REVENUES',
            'GOAL.ANALYSIS.LABEL.NET_INVESTMENT_WITHDRAWALS',
            'GOAL.ANALYSIS.LABEL.TOTAL_INCOME_PRETAX',
            'GOAL.ANALYSIS.LABEL.TAXES',
            'GOAL.ANALYSIS.LABEL.NET_AFTER_TAX_INCOME',
            'GOAL.ANALYSIS.LABEL.GOAL_AFTER_TAX',
            'GOAL.ANALYSIS.LABEL.SURPLUS_SHORTFALL',
            'GOAL.ANALYSIS.LABEL.HIGH_LEVEL_GRAPH_TEXT',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            this.highLevelAnalysis = [
                {
                    title: i18MenuTexts['GOAL.ANALYSIS.LABEL.PENSIONS_AND_OTHER_REVENUES'],
                    sign: '',
                    current: this.currentScenarioData['totalOtherRevenues'],
                    alternate: this.alternateScenarioData && this.alternateScenarioData.hasOwnProperty('totalOtherRevenues') ? this.alternateScenarioData['totalOtherRevenues'] : '-'
                },
                {
                    title: i18MenuTexts['GOAL.ANALYSIS.LABEL.NET_INVESTMENT_WITHDRAWALS'],
                    sign: '+',
                    current: this.currentScenarioData['totalInvestmentWithdrawals'],
                    alternate: this.alternateScenarioData && this.alternateScenarioData.hasOwnProperty('totalInvestmentWithdrawals') ? this.alternateScenarioData['totalInvestmentWithdrawals'] : '-'
                },
                {
                    title: i18MenuTexts['GOAL.ANALYSIS.LABEL.TOTAL_INCOME_PRETAX'],
                    sign: '=',
                    current: this.currentScenarioData['totalIncomePreTax'],
                    alternate: this.alternateScenarioData && this.alternateScenarioData.hasOwnProperty('totalIncomePreTax') ? this.alternateScenarioData['totalIncomePreTax'] : '-'
                },
                {
                    title: i18MenuTexts['GOAL.ANALYSIS.LABEL.TAXES'],
                    sign: '-',
                    current: this.currentScenarioData['totalTaxes'],
                    alternate: this.alternateScenarioData && this.alternateScenarioData.hasOwnProperty('totalTaxes') ? this.alternateScenarioData['totalTaxes'] : '-'
                },
                {
                    title: i18MenuTexts['GOAL.ANALYSIS.LABEL.NET_AFTER_TAX_INCOME'],
                    sign: '=',
                    current: this.currentScenarioData['totalCapital'],
                    alternate: this.alternateScenarioData && this.alternateScenarioData.hasOwnProperty('totalCapital') ? this.alternateScenarioData['totalCapital'] : '-',
                },
                {
                    title: i18MenuTexts['GOAL.ANALYSIS.LABEL.GOAL_AFTER_TAX'],
                    sign: '-',
                    current: this.currentScenarioData['totalRequirement'],
                    alternate: this.alternateScenarioData && this.alternateScenarioData.hasOwnProperty('totalRequirement') ? this.alternateScenarioData['totalRequirement'] : '-'
                },
                {
                    title: i18MenuTexts['GOAL.ANALYSIS.LABEL.SURPLUS_SHORTFALL'],
                    sign: '=',
                    current: this.currentScenarioData['presentValueShortage'],
                    positive: Number(this.currentScenarioData['shortSurplusTotal']) > 0 ? 'true' : 'false',
                    alternate: this.alternateScenarioData && this.alternateScenarioData.hasOwnProperty('presentValueShortage') ? this.alternateScenarioData['presentValueShortage'] : '-',
                    alternatepositive: Number(this.alternateScenarioData['shortSurplusTotal']) > 0 ? 'true' : 'false'
                }
            ];
            setTimeout(() => {
                this.drawChart(i18MenuTexts['GOAL.ANALYSIS.LABEL.HIGH_LEVEL_GRAPH_TEXT']);
            }, 500);
        });
    }

    drawChart(text) {
        const chartArray = {
            ...highLevelCurrentChart,
            balloonText: '[[title]] [[value]]%',
            dataProvider: this.currentScenarioData['goalAchieved'],
            titleField: 'title',
            valueField: 'value',
            colors: ['#979afc', '#ff6644'],
            allLabels: [
                {
                    text: text + '\n' + this.currentScenarioData['incomeAlternative']['percent'] + '%',
                    align: 'center',
                    bold: true,
                    color: '#345',
                    y: 110,
                    id: 'text1'
                },
            ]
        };
        this.amcharts.makeChart('currentChartDiv', chartArray);
        if (this.alternateScenarioData) {
            const alternateChartArray = {
                ...highLevelCurrentChart,
                balloonText: '[[title]] [[value]]%',
                dataProvider: this.alternateScenarioData['goalAchieved'],
                titleField: 'title',
                valueField: 'value',
                colors: ['#aadd55', '#77aaff'],
                allLabels: [
                    {
                        text: text + '\n' + this.alternateScenarioData['incomeAlternative']['percent'] + '%',
                        align: 'center',
                        bold: true,
                        color: '#345',
                        y: 110,
                        id: 'text1'
                    },
                ]
            };
            this.amcharts.makeChart('alternateChartDiv', alternateChartArray);
        }
    }

    openAssumptions(type: any) {
        this.sharedService.changeMessage('pass_assumptions_data|' + JSON.stringify(this.assumptionsData));
        this.router.navigate(['/client', this.clientId, 'planning', 'goals', this.goalId, 'analysis', 'assumptions', type]);
    }

    onSync() {
        this.goalsService.syncGoalStrategies(this.clientId, this.goalId).toPromise().then(res => {
            Swal('Success', 'Synced', 'success').then(() => {
                this.changer++;
                this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + this.goalId + '/analysis']);
                this.goalsService.startSync({});
            });
        }).catch((error: HttpErrorResponse) => {
            Swal('OOPs', error.error['errorMessage'], 'warning');
        });

    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
