import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { currentCertaintyChart, strategyCertaintyChart, planTracCoO } from '../../../../client-models/';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { ClientProfileService } from '../../../../service';
import { PortfolioService } from '../../../../service';
import { NgxPermissionsService } from 'ngx-permissions';
import { AccessRightService } from '../../../../../shared/access-rights.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-certainty-outcome-tile',
    templateUrl: './certainty-outcome-tile.component.html',
    styleUrls: ['./certainty-outcome-tile.component.css']
})
export class CertaintyOutcomeTileComponent implements OnInit, OnDestroy {
    @Input() isPlanTrac?= false;
    @Input() planTracGraph?= [];
    @Input() clientId;
    @Input() graphColours = [];
    @Input() currentCertaintyData: any;
    @Input() strategyCertaintyData: any;
    currencyPrefix = '$';
    currencyMask = createNumberMask({
        prefix: this.currencyPrefix
    });
    portfolioId = '';
    goalId = '';
    noCurrentData = false;
    noStrategyData = false;
    certaintyData;
    expectedResult: any = {};
    strategyExpectedResult: any = {};
    dataProvider = [];
    strategyDataProviderArr = [];
    graphProvider = [];
    sortBy = [
        { id: 0, name: 'Length of goal', value: 0 },
        { id: 1, name: '5 years', value: 5 },
        { id: 2, name: '10 years', value: 10 }
    ];
    selectedSortBy = this.sortBy[0];
    currentChartDat = [];
    strategyChartDat = [];
    clientData = {};
    solutionData = {};
    hasSolution = false;
    isProFiler = false;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private amcharts: AmChartsService,
        private store: Store<AppState>,
        private profileService: ClientProfileService,
        private portfolioService: PortfolioService,
        private accessRightService: AccessRightService,
        private ngxPermissionsService: NgxPermissionsService,
    ) {
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.goalId = param['goalId'];
            this.portfolioId = param['portfolioId'];
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData) {
                this.clientData = clientData;
                this.currencyPrefix = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
                this.currencyMask = createNumberMask({
                    prefix: this.currencyPrefix,
                });
            } else {
                this.profileService.storeClientPayload(this.clientId);
            }
            this.checkForSolution();
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['CURRSCENARIO', 'LHS','PORTANALYSIS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        const permissions = this.ngxPermissionsService.getPermissions();
        if (permissions.hasOwnProperty('PROFILER')) {
            this.isProFiler = true;
        }
        if (this.isPlanTrac) {
            this.dataProvider = [];
            this.certaintyData = this.planTracGraph;
            this.noCurrentData = false;
            this.certaintyData.forEach(element => {
                if (element.name === 'mid') {
                    const payLoad = element['cooPercentPayloads'][0];
                    this.expectedResult[element.year] = payLoad;
                }
            });
            setTimeout(() => {
                this.makeDataProvider(true);
            }, 1500);
        } else {
            this.dataProvider = [];
            this.strategyDataProviderArr = [];
            this.noCurrentData = false;
            this.noStrategyData = false;
            if (this.currentCertaintyData.hasOwnProperty('certaintyOfOutcomePayloads') && this.currentCertaintyData['certaintyOfOutcomePayloads']
                && this.currentCertaintyData['certaintyOfOutcomePayloads'].length > 0) {
                this.certaintyData = this.currentCertaintyData['certaintyOfOutcomePayloads'];
                this.certaintyData.forEach(element => {
                    if (element.name === 'mid') {
                        const payLoad = element['cooPercentPayloads'][0];
                        this.expectedResult[element.year] = payLoad;
                    }
                });
                this.makeDataProvider(true);
            } else {
                this.noCurrentData = true;
            }
            if (this.strategyCertaintyData.hasOwnProperty('certaintyOfOutcomePayloads') && this.strategyCertaintyData['certaintyOfOutcomePayloads']
                && this.strategyCertaintyData['certaintyOfOutcomePayloads'].length > 0) {
                this.strategyCertaintyData['certaintyOfOutcomePayloads'].forEach(element => {
                    if (element.name === 'mid') {
                        const payLoad = element['cooPercentPayloads'][0];
                        this.strategyExpectedResult[element.year] = payLoad;
                    }
                });
                this.strategyDataProvider(true);
            } else {
                this.noStrategyData = true;
            }

        }
    }

    checkForSolution() {
        if (this.portfolioId !== undefined && this.portfolioId !== null && this.portfolioId !== '') {
            this.portfolioService.getRecommendedSolution(this.portfolioId).toPromise().then(data => {
                const implementedSolutions = <any>data;
                if (implementedSolutions.length > 0) {
                    this.hasSolution = true;
                }
            }).catch(errorResponse => { });
        }
    }

    makeDataProvider(reversePayload) {
        const graphs = [];
        let legend;
        let chartColours = [];
        this.dataProvider = [];
        if (this.isPlanTrac) {
            chartColours = ['#93a9d0', '#aadc55', '#ffcc44', '#ff6644', '#F3F3F3'];
        } else {
            chartColours = ['#77AAFF', '#AADD55', '#FFCC44', '#FF6644', '#F3F3F3'];
        }
        this.certaintyData.forEach((element, index) => {
            const payLoad = element['cooPercentPayloads'];
            if (element.name === 'res') {
                const data = {};
                // keys.sort();
                if (reversePayload === true) {
                    payLoad.reverse();
                }
                payLoad.forEach((item, i) => {
                    const probability_value = (item['amount']);
                    const probability_percentage = (item['percentage']);
                    data['probabilityValue' + i] = probability_value;
                    data['probabilityPercentage' + i] = probability_percentage;
                });

                data['year'] = element.year;
                const object = this.expectedResult[element.year];
                data['expectedPercentage'] = (object['percentage']);
                data['expectedValue'] = (object['amount']);
                if (this.selectedSortBy.value === 0) {
                    setTimeout(() => {
                        this.dataProvider.push(data);
                    }, 500);
                } else if (this.selectedSortBy.value === 5) {
                    if (index < 5) {
                        setTimeout(() => {
                            this.dataProvider.push(data);
                        }, 500);
                    }
                } else if (this.selectedSortBy.value === 10) {
                    if (index < 10) {
                        setTimeout(() => {
                            this.dataProvider.push(data);
                        }, 500);
                    }
                }

                const prefix = this.currencyPrefix;
                if (graphs.length === 0) {
                    payLoad.forEach((item, i) => {
                        const valueKey = 'probabilityValue' + i;
                        const percentKey = 'probabilityPercentage' + i;
                        graphs.push(
                            {
                                balloonText: prefix + '[[' + valueKey + ']] \n' + '[[' + percentKey + ']]% Probability',
                                fillAlphas: 1,
                                lineAlpha: 0,
                                title: (item['percentage']) + '% Probability',
                                valueField: valueKey,
                                lineColor: chartColours[i],
                                negativeLineColor: chartColours[i],
                            }
                        );
                    });
                    graphs.push(
                        {
                            balloonText: 'Expected result(50/50)',
                            fillAlphas: 0,
                            lineAlpha: 1,
                            // type: 'smoothedLine',
                            type: 'line',
                            title: data['expectedPercentage'] + '% Probability',
                            valueField: 'expectedValue',
                            lineColor: '#000000',
                            negativeLineColor: '#000000',
                        }
                    );
                }
            }
        });
        legend = {
            valueText: '',
        };
        currentCertaintyChart.dataProvider = this.dataProvider;
        if (this.isProFiler) {
            currentCertaintyChart.dataProvider.pop();
        }
        currentCertaintyChart.graphs = graphs;
        if (this.isPlanTrac) {
            planTracCoO.dataProvider = this.dataProvider;
            planTracCoO.graphs = graphs;
            this.amcharts.makeChart('currentCoODiv', planTracCoO);
            // this.tempFunction();
        } else {
            setTimeout(() => {
                this.amcharts.makeChart('currentCoODiv', currentCertaintyChart);
            }, 500);
        }

    }

    strategyDataProvider(reversePayload) {
        const graphs = [];
        this.strategyDataProviderArr = [];

        const chartColours = ['#77AAFF', '#AADD55', '#FFCC44', '#FF6644', '#F3F3F3'];
        this.strategyCertaintyData['certaintyOfOutcomePayloads'].forEach((element, index) => {
            const payLoad = element['cooPercentPayloads'];
            if (element.name === 'res') {
                const data = {};
                // keys.sort();
                if (reversePayload === true) {
                    payLoad.reverse();
                }
                payLoad.forEach((item, i) => {
                    const probability_value = (item['amount']);
                    const probability_percentage = (item['percentage']);
                    data['probabilityValue' + i] = probability_value;
                    data['probabilityPercentage' + i] = probability_percentage;
                });
                data['year'] = element.year;
                const object = this.strategyExpectedResult[element.year];
                data['expectedPercentage'] = (object['percentage']);
                data['expectedValue'] = (object['amount']);
                if (this.selectedSortBy.value === 0) {
                    setTimeout(() => {
                        this.strategyDataProviderArr.push(data);
                    }, 500);
                } else if (this.selectedSortBy.value === 5) {
                    if (index < 5) {
                        setTimeout(() => {
                            this.strategyDataProviderArr.push(data);
                        }, 500);
                    }
                } else if (this.selectedSortBy.value === 10) {
                    if (index < 10) {
                        setTimeout(() => {
                            this.strategyDataProviderArr.push(data);
                        }, 500);
                    }
                }

                if (graphs.length === 0) {
                    const prefix = this.currencyPrefix;
                    payLoad.forEach((item, i) => {
                        const valueKey = 'probabilityValue' + i;
                        const percentKey = 'probabilityPercentage' + i;
                        graphs.push(
                            {
                                balloonText: prefix + '[[' + valueKey + ']] \n' + '[[' + percentKey + ']]% Probability',
                                fillAlphas: 1,
                                lineAlpha: 0,
                                title: (item['percentage']) + '% Probability',
                                valueField: valueKey,
                                lineColor: chartColours[i],
                                negativeLineColor: chartColours[i],
                            }
                        );
                    });
                    graphs.push(
                        {
                            balloonText: 'Expected result(50/50)',
                            fillAlphas: 0,
                            lineAlpha: 1,
                            // type: 'smoothedLine',
                            type: 'line',
                            title: data['expectedPercentage'] + '% Probability',
                            valueField: 'expectedValue',
                            lineColor: '#000000',
                            negativeLineColor: '#000000',
                        }
                    );
                }
            }
        });
        strategyCertaintyChart.dataProvider = this.strategyDataProviderArr;
        if (this.isProFiler) {
            strategyCertaintyChart.dataProvider.pop();
        }
        strategyCertaintyChart.graphs = graphs;
        setTimeout(() => {
            this.amcharts.makeChart('strategyCoODiv', strategyCertaintyChart);
        }, 500);

    }

    tempFunction() {
        const obj = {
            'type': 'serial',
            'theme': 'dark',
            'legend': {
                'equalWidths': false,
                'useGraphSettings': true,
                'valueAlign': 'left',
                'valueWidth': 120
            },
            'dataProvider': this.dataProvider,
            'valueAxes': [],
            'graphs': [{
                'bullet': 'square',
                'bulletBorderAlpha': 1,
                'bulletBorderThickness': 1,
                'dashLengthField': 'dashLength',
                'legendValueText': '[[value]]',
                'title': 'expectedValue',
                'fillAlphas': 0,
                'valueField': 'expectedValue',
            }],
            'chartCursor': {
                'categoryBalloonDateFormat': 'DD',
                'cursorAlpha': 0.1,
                'cursorColor': '#000000',
                'fullWidth': true,
                'valueBalloonsEnabled': false,
                'zoomable': false
            },
            'dataDateFormat': 'YYYY-MM-DD',
            'categoryField': 'year',
            'categoryAxis': {
                'startOnAxis': true,
                'axisColor': '#DADADA',
                'gridThickness': 0,
                'gridAlpha': 0
            },
            'export': {
                'enabled': true
            }
        };
        this.amcharts.makeChart('currentCoODiv', obj);
    }

    drawChart() {
        this.amcharts.makeChart('currentCoODiv', currentCertaintyChart);
        this.amcharts.makeChart('strategyCoODiv', strategyCertaintyChart);
    }

    displayBy(event) {
        this.selectedSortBy = event;
        this.makeDataProvider(false);
        this.strategyDataProvider(false);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
