import { ActivatedRoute } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { GoalService } from '../../../../service';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { planningCashFlowChart, planningInvestmentCapitalChart } from '../../../../client-models/goal-analysis-charts';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { PLANNING_ALTERNATIVES_PARAMETERS } from '../../../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-planning-alternative-tile',
    templateUrl: './planning-alternative-tile.component.html',
    styleUrls: ['./planning-alternative-tile.component.css']
})
export class PlanningAlternativeTileComponent implements OnInit, OnDestroy {

    @Input() goalId = '';
    @Input() graphColours = [];
    @Input() planningData: any;
    @Input() savingsList = [];
    @Input() selectedPlannum = '';

    clientId;
    clientData;
    model: any = {};
    custom_values = {};
    investmentCapitalData = [];
    planningDetails = {};
    parameter = '';
    cashFlowData = [];
    selectedIndex = 0;
    currency = '$';
    parameters = [];
    initialAccount = {};
    initialSavings = [];
    selectedSaving: any;
    goalDuration = 0;
    rateOfReturnLabel = [];
    currencyMask = createNumberMask({
        prefix: this.currency
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    rateOfReturnIndex = 0;
    isCollapsed = true;
    saveDisable = false;
    PARAMETERS = PLANNING_ALTERNATIVES_PARAMETERS;
    selectedSliderValues = [];
    copySelectedSliderValues = [];
    showLoader = false;
    noCashFlowGraph = true;
    noInvestmentGraph = true;
    apiCalled = null;
    private unsubscribe$ = new Subject<void>();

    constructor(private amcharts: AmChartsService,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private goalsService: GoalService,
        public translate: TranslateService,
        private sharedService: RefreshDataService) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData) {
                this.clientData = clientData;
                this.currency = getCurrencySymbol(clientData['currencyCode'], 'narrow');
                this.currencyMask = createNumberMask({
                    prefix: this.currency,
                });
            }
        });

        if (this.savingsList && this.savingsList.length > 0) {
            this.selectedSaving = this.savingsList.find(saving => saving.plannum === this.selectedPlannum);
        }

        planningCashFlowChart.colors = this.graphColours;
        planningInvestmentCapitalChart.colors = this.graphColours;

        this.processData();
        this.goalsService.observerSync().pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
          this.planningData = [];
        });
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
            this.getParameters();
        });
    }

    processData() {
        this.selectedSliderValues = [];
        if (this.planningData.hasOwnProperty('increments') && this.planningData['increments'].length > 0) {
            this.planningData['increments'].forEach(element => {
                this.planningDetails[element.displayName] = element;
                const obj = {
                    incrementDetails: {},
                    simulationValue: element['initialSliderValue'],
                    selectedOptionName: element['displayName']
                };
                if (element['increments'] && element['increments'].length > 0) {
                    obj.incrementDetails = element['increments'][element.initialSliderValue];
                } else {
                    obj.incrementDetails['display'] = '';
                    obj.incrementDetails['value'] = 0;
                }
                this.selectedSliderValues.push(obj);
                this.copySelectedSliderValues.push(obj);
            });
            this.getParameters();
        }
        if (this.planningData.hasOwnProperty('graphResult')) {
            if (this.planningData['graphResult'].hasOwnProperty('incomeGraph') && this.planningData['graphResult']['incomeGraph'].length > 0) {
                this.noCashFlowGraph = false;
                this.makeCashFlowDataProvider(this.planningData['graphResult']['incomeGraph'][0]);
            }
            if (this.planningData['graphResult'].hasOwnProperty('capitalGraph') && this.planningData['graphResult']['capitalGraph'].length > 0) {
                this.noInvestmentGraph = false;
                this.makeInvestmentDataProvider(this.planningData['graphResult']['capitalGraph'][0]);
            }
        }

    }

    getGraphData(getDefault = false) {
        if (getDefault === true) {
            this.selectedSliderValues = [];
        }
        this.planningData = null;
        this.apiCalled = this.goalsService.getPlanningAlternativeGraphs(this.clientId, this.goalId, this.selectedPlannum, this.selectedSliderValues, 'strategy scenario').toPromise().then(response => {
            this.planningData = response;
            this.processData();
            this.showLoader = false;
        }).catch(errorResponse => {
            this.showLoader = false;
        });
    }

    getParameters() {
        this.translate.get([
            'GOAL.ANALYSIS.LABEL.INCOME_GOAL',
            'GOAL.ANALYSIS.LABEL.RATE_OF_RETURN',
            'GOAL.ANALYSIS.LABEL.START_GOAL',
            'GOAL.ANALYSIS.LABEL.END_GOAL',
            'GOAL.ANALYSIS.LABEL.ANNUAL_SAVINGS',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            this.parameters = [
                { id: '2', name: PLANNING_ALTERNATIVES_PARAMETERS.INCOME_GOAL, displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.INCOME_GOAL'] },
                { id: '1', name: PLANNING_ALTERNATIVES_PARAMETERS.RATE_OF_RETURN, displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.RATE_OF_RETURN'] },
                { id: '4', name: PLANNING_ALTERNATIVES_PARAMETERS.START_GOAL, displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.START_GOAL'] },
                { id: '5', name: PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL, displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.END_GOAL'] },
                { id: '3', name: PLANNING_ALTERNATIVES_PARAMETERS.ANNUAL_SAVINGS, displayName: i18MenuTexts['GOAL.ANALYSIS.LABEL.ANNUAL_SAVINGS'] },
            ];
            this.getSliderValues();
        });
    }

    getSliderValues() {
        this.parameters.forEach(key => {
            this.custom_values[key.name] = {
                values: [],
                values_p: [],
                fromPoint: 0
            };
            this.model[key.name] = 0;
            if (this.planningDetails.hasOwnProperty(key.name)) {
                this.planningDetails[key.name]['increments'].forEach(opt => {
                    this.custom_values[key.name]['values'].push(opt['value']);
                    // if (key.name === PLANNING_ALTERNATIVES_PARAMETERS.INCOME_GOAL || key.name === PLANNING_ALTERNATIVES_PARAMETERS.ANNUAL_SAVINGS) {
                    //     const display = this.currency + opt['display'];
                    //     this.custom_values[key.name]['values_p'].push(display);
                    // }
                    if (key.name === PLANNING_ALTERNATIVES_PARAMETERS.RATE_OF_RETURN) {
                        const in1 = opt['display'].indexOf('(');
                        const in2 = opt['display'].indexOf(')');
                        const display = opt['display'].substring(in1 + 1, in2) + '%';
                        this.custom_values[key.name]['values_p'].push(display);
                        const label = opt['display'].slice(0, (in1 - 1));
                        this.rateOfReturnLabel.push(label);
                    } else {
                        this.custom_values[key.name]['values_p'].push(opt['display']);
                    }
                });
                this.custom_values[key.name]['fromPoint'] = this.planningDetails[key.name]['initialSliderValue'];
                const index = this.planningDetails[key.name]['initialSliderValue'];
                if (this.custom_values[key.name]['values'].length > 0) {
                    this.model[key.name] = this.custom_values[key.name]['values'][index];
                }
                if (key.name === PLANNING_ALTERNATIVES_PARAMETERS.RATE_OF_RETURN) {
                    this.rateOfReturnIndex = index;
                }
            }
        });
        this.goalDuration = (this.model[PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL] - this.model[PLANNING_ALTERNATIVES_PARAMETERS.START_GOAL]);
        this.parameter = PLANNING_ALTERNATIVES_PARAMETERS.INCOME_GOAL;
        this.selectedIndex = this.planningDetails[this.parameter]['initialSliderValue'];
    }

    makeCashFlowDataProvider(cashFlow) {
        this.cashFlowData = [];
        const graphs = [];
        cashFlow.forEach((element, index) => {
            const obj = {};
            let graph;
            obj['year'] = element['year'];

            obj['goal'] = element.fundedAmt;
            obj['shortfall'] = element.shortfall;
            graph = {
                balloonText: element.goalName + ': ' + this.currency + '[[goal]]',
                fillAlphas: 1,
                lineAlpha: 0,
                gridAlpha: 0,
                gridThickness: 0,
                title: element.goalName,
                valueField: 'goal'
            };
            if (index === 0) {
                graphs.push(graph);
            }
            this.cashFlowData.push(obj);
        });
        this.translate.get([
            'GOAL.ANALYSIS.LABEL.SHORTFALL_TO_ACHIEVE_OBJECTIVES',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            graphs.push({
                balloonText: text['GOAL.ANALYSIS.LABEL.SHORTFALL_TO_ACHIEVE_OBJECTIVES'] + ': ' + this.currency + '[[shortfall]]',
                fillAlphas: 1,
                lineAlpha: 0,
                title: text['GOAL.ANALYSIS.LABEL.SHORTFALL_TO_ACHIEVE_OBJECTIVES'],
                valueField: 'shortfall'
            });
        });
        planningCashFlowChart.dataProvider = this.cashFlowData;
        planningCashFlowChart.graphs = graphs;
        setTimeout(() => {
            this.amcharts.makeChart('planningCashFlowDiv', planningCashFlowChart);
        }, 1000);
    }

    makeInvestmentDataProvider(capitalGraph) {
        this.investmentCapitalData = [];
        const graphs = [];
        capitalGraph.forEach((element, index) => {
            const obj = {};
            let graph;
            obj['year'] = element['year'];
            element.accounts.forEach(account => {
                obj[account.description] = account.capital;
                graph = {
                    balloonText: account.description + ': ' + this.currency + '[[' + account.description + ']]',
                    fillAlphas: 1,
                    lineAlpha: 0,
                    gridAlpha: 0,
                    gridThickness: 0,
                    title: account.description,
                    valueField: account.description
                };
                if (index === 0) {
                    graphs.push(graph);
                }
            });
            this.investmentCapitalData.push(obj);
        });

        planningInvestmentCapitalChart.dataProvider = this.investmentCapitalData;
        planningInvestmentCapitalChart.graphs = graphs;
        setTimeout(() => {
            this.amcharts.makeChart('investmentCapitalDiv', planningInvestmentCapitalChart);
        }, 1000);
    }

    onChangeOfSlider(selectedValue, key) {
        this.parameter = key.name;
        this.selectedIndex = selectedValue['from'];
        if (key.name === PLANNING_ALTERNATIVES_PARAMETERS.RATE_OF_RETURN) {
            this.rateOfReturnIndex = selectedValue['from'];
        }
        if (key.name === PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL) {
            const endGoal = this.custom_values[PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL]['values'][this.selectedIndex];
            if (endGoal < this.model[PLANNING_ALTERNATIVES_PARAMETERS.START_GOAL]) {
                this.translate.get([
                    'GOAL.ANALYSIS.POPUP.CHANGE_END_AGE.TITLE',
                    'GOAL.ANALYSIS.POPUP.CHANGE_END_AGE.TEXT',
                    'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
                    'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    swal({
                        title: i18text['GOAL.ANALYSIS.POPUP.CHANGE_END_AGE.TITLE'],
                        text: i18text['GOAL.ANALYSIS.POPUP.CHANGE_END_AGE.TEXT'],
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: i18text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                        cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
                    }).then(result => {
                        if (result.value) {
                            this.model[PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL] = endGoal;
                            const startIndex = this.custom_values[PLANNING_ALTERNATIVES_PARAMETERS.START_GOAL]['values'].indexOf(this.model[PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL]);
                            this.custom_values[PLANNING_ALTERNATIVES_PARAMETERS.START_GOAL]['fromPoint'] = startIndex;
                            this.model[PLANNING_ALTERNATIVES_PARAMETERS.START_GOAL] = this.model[PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL];
                        } else {
                            const oldEndIndex = this.custom_values[PLANNING_ALTERNATIVES_PARAMETERS.START_GOAL]['values'].indexOf(this.model[PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL]);
                            this.selectedIndex = oldEndIndex;
                            this.custom_values[PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL]['fromPoint'] = oldEndIndex;
                        }
                    });
                });
            } else {
                this.model[key.name] = this.custom_values[key.name]['values'][this.selectedIndex];
            }
            this.goalDuration = (this.model[PLANNING_ALTERNATIVES_PARAMETERS.END_GOAL] - this.model[PLANNING_ALTERNATIVES_PARAMETERS.START_GOAL]) + 1;
        } else {
            this.model[key.name] = this.custom_values[key.name]['values'][this.selectedIndex];
        }

        this.selectedSliderValues.forEach(element => {
            if (element.selectedOptionName === key.name) {
                element.incrementDetails = this.planningDetails[key.name]['increments'][selectedValue['from']];
                element.simulationValue = selectedValue['from'];
            }
        });
        this.showLoader = true;
        this.getGraphData();
    }

    onChangeOfValue(name) {
        this.custom_values[name]['fromPoint'] = this.custom_values[name]['values'].indexOf(this.model[name]);
        this.selectedSliderValues.forEach(element => {
            if (element.selectedOptionName === name) {
                element.incrementDetails['display'] = '';
                element.incrementDetails['value'] = parseInt(this.model[name], 10);
                element.simulationValue = this.custom_values[name]['fromPoint'];
            }
        });
        this.showLoader = true;
        this.getGraphData();
    }

    onChangeOfPlannum() {
        this.showLoader = true;
        this.selectedPlannum = this.selectedSaving['plannum'];
        this.getGraphData();
    }

    back() {
        this.parameters.forEach(key => {
            if (this.planningDetails.hasOwnProperty(key.name)) {
                this.custom_values['fromPoint'] = this.planningDetails[key.name]['initialSliderValue'];
                const index = this.planningDetails[key.name]['initialSliderValue'];
                this.model[key.name] = this.custom_values[key.name]['values'][index];
            }
        });
        this.parameter = PLANNING_ALTERNATIVES_PARAMETERS.INCOME_GOAL;
        this.selectedIndex = this.planningDetails[this.parameter]['initialSliderValue'];
        this.showLoader = true;
        this.getGraphData(true);
    }

    updateDetails() {
        this.saveDisable = true;
        const payload = {};
        this.parameters.forEach(key => {
            if (this.model.hasOwnProperty(key.name)) {
                payload[key.id] = this.model[key.name].toString();
            }
        });
        this.goalsService.updatePlanningAlternatives(payload, this.goalId, this.selectedSaving.plannum, 'Strategy Scenario').toPromise().then(res => {
            this.sharedService.changeMessage('planning alternatives updated');
            this.goalsService.startSync({});
            this.translate.get([
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'GOAL.ANALYSIS.POPUP.PLANNING_ALTERNATIVES_SUCCESS'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['GOAL.ANALYSIS.POPUP.PLANNING_ALTERNATIVES_SUCCESS'], 'success');
            });
            this.saveDisable = false;
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
            this.saveDisable = false;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
