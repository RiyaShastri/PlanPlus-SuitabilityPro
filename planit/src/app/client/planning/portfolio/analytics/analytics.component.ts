import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Location, DecimalPipe, getCurrencySymbol, CurrencyPipe } from '@angular/common';
import { slideInOutAnimation } from '../../../../shared/animations';
import * as $ from 'jquery';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import {
    suitabilityChartArray,
    backTestChartArray,
    efficientFrontierCashArray,
    cashWedgeChartArray
} from '../../../client-models';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService, PlanningService } from '../../../service';
import { ActivatedRoute } from '@angular/router';
import { pieChartArray } from '../../../client-models/portfolio-charts';
import { solutionInfo } from '../../../client-models/chart-colors';
import { PageTitleService } from '../../../../shared/page-title';
import { Store } from '@ngrx/store';
import {
    AppState,
    getClientPayload,
    getGraphColours
} from '../../../../shared/app.reducer';
import { NgxPermissionsService } from 'ngx-permissions';
import { environment } from '../../../../../environments/environment';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { EFFICIENT_FRONTIER, PORTFOLIO_ALLOCATION_TYPE, ASSETS_CLASS_OPTIONS } from '../../../../shared/constants';

@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})

export class AnalyticsComponent implements OnInit, OnDestroy {
    // isexpand;
    @ViewChild('inprogress') public inprogress: NgbTooltip;
    isExpandSuitability;
    isExpandBack;
    isExpandAllocation;
    isExpandEfficient;
    isExpandCash;
    chart: AmChart;
    allocationDetails;
    totalBreakDown = 0;
    totalBreakDownAmt = 0;
    chartColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];
    cashGraphColors = ['#ff6644', '#bbdd66', '#ffcc44', '#77aaff'];
    cashWedge;
    clientId;
    portfolioId;
    chartType;
    cashWedgeMessage;
    suitabilityLoaded = false;
    isCurrent = false;
    lossDetails = [];
    Rising = 0;
    Recovering = 0;
    Falling = 0;
    error = '';
    noAllocationData = false;
    clientData = {};
    allowAdvisor = false;
    graphExist = false;
    environment = environment;
    isProfiler = false;
    currencyCode = 'USD';
    currency = '$';
    cashWedgeLoaded = false;
    closeButtonDisable = false;
    reccommendedSuitabilityExceeded = false;
    allCashCurrent = false;
    pjmScore = 0;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    upAndDownChart;
    allocationChart;
    cashWedgeChart;
    suitabilityChart;
    efficientFrontierData = {};
    frontierDataProvider = [];
    frontierGraphData = [];
    allocationKey = '';
    EFFICIENT_FRONTIER = EFFICIENT_FRONTIER;
    PORTFOLIO_ALLOCATION_TYPE = PORTFOLIO_ALLOCATION_TYPE;
    i18Text = {};
    efficientFrontierChart;
    efficientFrontierLoaded = false;
    constructor(
        private dp: DecimalPipe,
        private _location: Location,
        private route: ActivatedRoute,
        private amcharts: AmChartsService,
        private pageTitleService: PageTitleService,
        private portfolioService: PortfolioService,
        private accessRightService: AccessRightService,
        private store: Store<AppState>,
        private ngxPermissionsService: NgxPermissionsService,
        private angulartics2: Angulartics2,
        private cp: CurrencyPipe,
        private translate: TranslateService,
        private planningService: PlanningService
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioAnalytics' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.ANALYTICS_TITLE');
    }

    ngOnInit() {
        this.translate.stream([
            'PORTFOLIO.ANALYTICS.LABEL.ANALYZED_PORTFOLIO',
            'PORTFOLIO.ANALYTICS.LABEL.EFFICIENT_FRONTIER',
            'PORTFOLIO.ANALYTICS.LABEL.INEFFICIENT_FRONTIER',
            'PORTFOLIO.ANALYTICS.LABEL.RETURN',
            'PORTFOLIO.ANALYTICS.LABEL.RISK',
            'PORTFOLIO.ANALYTICS.LABEL.TARGET_PORTFOLIOS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        const permissions = this.ngxPermissionsService.getPermissions();
        if (permissions.hasOwnProperty('ADVISOR')) {
            this.allowAdvisor = true;
        }
        if (permissions.hasOwnProperty('PROFILER')) {
            this.isProfiler = true;
        }
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyCode = this.clientData['currencyCode'];
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
        });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
        });
        if (!this.portfolioId) {
            this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.portfolioId = params['portfolioId'];
            });
        }
        this.chartType = this.route.snapshot.params['chartType'];

        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.chartColors = res['allGraphColours'];
            }
        });
        this.accessRightService.getAccess(['CASHWDG']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.getCashwedge();
        this.getSuitability();
        this.getBackTest();
        this.getAllocationDetail();
        this.removeAccordionHref();
        this.efficientFrontier();
    }

    back() {
        this._location.back();
    }

    getBackTest() {
        this.portfolioService.getBackTest(this.clientId, this.portfolioId, this.chartType).toPromise().then(response => {
            const chartData = [];
            const upDownResponse = response[0];
            this.Rising = upDownResponse['totalUp'];
            this.Recovering = upDownResponse['totalRecover'];
            this.Falling = upDownResponse['totalDown'];
            this.lossDetails = response[1]['potentialLossPayLoads'].slice(0, 3);
            setTimeout(() => {
                this.drawChart(chartData);
            }, 200);
        });
    }

    toggleAssetsList(toggleid) {
        $('#' + toggleid).toggle();
    }

    removeAccordionHref() {
        setTimeout(() => {
            $('.ui-accordion').find('a').each(function () {
                $(this).removeAttr('href');
            });
        }, 1000);
    }

    efficientFrontier() {
        if (this.chartType === this.PORTFOLIO_ALLOCATION_TYPE.CURRENT) {
            this.allocationKey = this.EFFICIENT_FRONTIER.CURRENT_KEY;
        } else if (this.chartType === this.PORTFOLIO_ALLOCATION_TYPE.IMPLEMENTED) {
            this.allocationKey = this.EFFICIENT_FRONTIER.IMPLEMENTED_KEY;
        } else if (this.chartType === this.PORTFOLIO_ALLOCATION_TYPE.TARGET) {
            this.allocationKey = this.EFFICIENT_FRONTIER.IMPLEMENTED_KEY;
        }
        this.portfolioService.getEfficientFrontierGraphData(this.clientId, this.portfolioId, this.chartType).toPromise().then(result => {
            this.efficientFrontierData = JSON.parse(JSON.stringify(result));
            this.frontierGraphData = [];
            this.frontierDataProvider = [];
            this.frontierGraphData.push(
                {
                    balloonText: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RISK'] + ' [[date]]% \n' + this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RETURN'] + ' [[efficientFrontier]]% ',
                    valueAxis: 'v1',
                    lineColor: '#bd6',
                    hideBulletsCount: 30,
                  bullet: 'round',
                  bulletSize: 5,
                    title: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.EFFICIENT_FRONTIER'],
                    yField: 'efficientFrontier',
                    xField: 'date',
                    fillAlphas: 0,
                    lineThickness: 1,
                  lineAlpha: 0
                }, {
                    balloonText: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RISK'] + ' [[date]]% \n' + this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RETURN'] + ' [[inefficientFrontier]]% ',
                    valueAxis: 'v1',
                    lineColor: '#FC4',
                    hideBulletsCount: 30,
                bullet: 'round',
                bulletSize: 5,
                    title: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.INEFFICIENT_FRONTIER'],
                    yField: 'inefficientFrontier',
                    xField: 'date',
                    fillAlphas: 0,
                    lineThickness: 1,
                lineAlpha: 0
                }
            );
            this.setDataProvider(this.efficientFrontierData[this.allocationKey], this.allocationKey);
            this.efficientFrontierLoaded =  true;
        }).catch(err => {
            this.efficientFrontierLoaded =  true;
        });
    }

    setDataProvider(data, key) {
        const analyzeValue = parseFloat(this.efficientFrontierData[key]['items'][0]['x'].toFixed(0));
        data['items'].forEach((item, index) => {
                const obj = {};
                obj['date'] = parseFloat(item['x'].toFixed(2));
                    obj['analyzedPortfolio'] = parseFloat(item['y'].toFixed(2));
                this.frontierDataProvider.push(obj);
        });
      this.efficientFrontierData[this.EFFICIENT_FRONTIER.TARGET_KEY]['items'].forEach((item, index) => {
        const obj = {};
        obj['date'] = parseFloat(item['x'].toFixed(2));
        obj['targetPortfolios'] = parseFloat(item['y'].toFixed(2));
        this.frontierDataProvider.push(obj);
      });
      this.efficientFrontierData['inefficentSeries']['items'].forEach((item, index) => {
        const obj = {};
        obj['date'] = parseFloat(item['x'].toFixed(2));
        obj['inefficientFrontier'] = parseFloat(item['y'].toFixed(2));
        this.frontierDataProvider.push(obj);
      });
      this.efficientFrontierData['efficentSeries']['items'].forEach((item, index) => {
        const obj = {};
        obj['date'] = parseFloat(item['x'].toFixed(2));
        obj['efficientFrontier'] = parseFloat(item['y'].toFixed(2));
        this.frontierDataProvider.push(obj);
      });
      if ( this.allocationKey !== this.EFFICIENT_FRONTIER.TARGET_KEY ) {
        const frontierGraphDataObj = {
          valueAxis: 'v1',
          balloonText: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RISK'] + ' [[date]]% \n' + this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RETURN'] + ' [[analyzedPortfolio]]% ',
          lineColor: '#123',
          bullet: 'round',
          bulletBorderThickness: 1,
          hideBulletsCount: 30,
          title: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.ANALYZED_PORTFOLIO'],
          yField: 'analyzedPortfolio',
          xField: 'date',
          fillAlphas: 0,
          lineThickness: 0,
          lineAlpha: 0
        };
        this.frontierGraphData.push(frontierGraphDataObj);
      }

      const frontierGraphDataObj2 = {
        valueAxis: 'v1',
        balloonText:  this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RISK'] + ' [[date]]% \n ' + this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RETURN'] + ' [[targetPortfolios]]% ',
        lineColor: '#66CCEE',
        bullet: 'round',
        bulletBorderThickness: 1,
        hideBulletsCount: 30,
        title: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.TARGET_PORTFOLIOS'],
        yField: 'targetPortfolios',
        xField: 'date',
        fillAlphas: 0,
        lineThickness: 0,
        lineAlpha: 0
      };



      this.frontierGraphData.push(frontierGraphDataObj2);
        const graphObj = {
            ...efficientFrontierCashArray,
            dataProvider: this.frontierDataProvider,
            graphs: this.frontierGraphData,
        };
        setTimeout(() => {
            this.efficientFrontierChart = this.amcharts.makeChart('efficientFrontierChartDiv', graphObj);
        }, 500);
    }

    drawChart(dataProvider?) {
        const backTestChart = {
            ...backTestChartArray,
            dataProvider: dataProvider
        };
        // this.amcharts.makeChart('backTestChartdiv', backTestChart);
        this.upAndDownChart = this.amcharts.makeChart('updowndiv', this.makeOptions(this.Rising, this.Falling, this.Recovering)); // sample value 49, 33, 18
    }

    makeOptions(rising, falling, recovering) {
        const initX = 4; // offset when the rising value is small such as 1, the point is so close to (0,0), otherwise it will not show on chart
        const initY = 3;
        return {
            'type': 'xy',
            'graphs': [
                {
                    'bullet': 'round',
                    'bulletColor': '#bbdd66',
                    'bulletSize': 14,
                    'lineAlpha': 1,
                    'lineThickness': 15,
                    'lineColor': '#bbdd66',
                    'xField': 'x1',
                    'yField': 'y1'
                },
                {
                    'bullet': 'round',
                    'bulletColor': '#ffcc44',
                    'bulletSize': 14,
                    'lineAlpha': 1,
                    'lineThickness': 15,
                    'lineColor': '#ffcc44',
                    'xField': 'x3',
                    'yField': 'y3'
                },
                {
                    'bullet': 'round',
                    'bulletColor': '#ffffff',
                    'bulletBorderAlpha': 1,
                    'bulletBorderThickness': 1,
                    'bulletBorderColor': '#000000',
                    'bulletSize': 15,
                    'lineAlpha': 1,
                    'lineThickness': 15,
                    'lineColor': '#ff6644',
                    'xField': 'x2',
                    'yField': 'y2'
                }
            ],
            'valueAxes': [{
                'id': 'v1',
                'position': 'left',
                'axisAlpha': 0.0,
                'minVerticalGap': 10,
                'maximum': rising + initY + 3,
                'gridAlpha': 0,
                'labelsEnabled': false
            }, {
                'id': 'v2',
                'position': 'bottom',
                'axisAlpha': 0.0,
                'autoGridCount': false,
                'gridCount': 10,
                'maximum': 100 + initX,
                'gridAlpha': 0,
                'labelsEnabled': false
            }],
            'dataProvider': [
                {
                    'x1': initX,
                    'y1': initY,
                },
                {
                    'x1': rising + initX,
                    'y1': rising + initY
                },
                {
                    'x2': rising + initX,
                    'y2': rising + initY
                },
                {
                    'x2': rising + falling + initX,
                    'y2': rising - falling + initY
                },
                {
                    'x3': rising + falling + initX,
                    'y3': rising - falling + initY
                },
                {
                    'x3': 100 + initX,
                    'y3': rising + initY
                }
            ]
        };
    }
    totalAllocation() {
        this.totalBreakDown = 0;
        this.totalBreakDownAmt = 0;
        this.allocationDetails.allocations.forEach(item => {
            // if (this.chartType === 'current') {
            //     this.totalBreakDown += item.currentPercent;
            //     this.totalBreakDownAmt += item.currentAmount;
            // } else if (this.chartType === 'target') {
            //     this.totalBreakDown += item.targetPercent;
            //     this.totalBreakDownAmt += item.targetAmount;
            // } else {
            //     this.totalBreakDown += item.implementedPercent;
            //     this.totalBreakDownAmt += item.implementedAmount;
            // }
            this.totalBreakDown += item[this.chartType + 'Percent'];
            this.totalBreakDownAmt += item[this.chartType + 'Amount'];
        });
    }

    getAllocationDetail() {
        let allocationType = '';
        if (this.chartType === 'current' || this.chartType === 'target') {
            allocationType = 'CurrentvsTarget';
        } else if (this.chartType === 'implemented') {
            allocationType = 'CurrentvsImplemented';
        }
        const payload = {
            isSpecifiedPortfolio: true,
            portfolioId: this.portfolioId,
            view: allocationType,
            assetCategory: ASSETS_CLASS_OPTIONS['DETAIL']
        };
        this.portfolioService.getAllocationDetails(this.clientId, payload).toPromise().then(allocation => {
            if (allocation) {
                this.allocationDetails = allocation;
                const dataProvider = [];
                let i = 0;
                this.allocationDetails.allocations.forEach(element => {
                    if (element['displayOrder'] === 1 && element['currentPercent'] === 100) {
                        this.allCashCurrent = true;
                    }
                    if (element[this.chartType + 'Percent'] > 0) {
                        this.graphExist = true;
                    }
                    this.translate.get(['SSID_LABELS.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                        dataProvider.push({
                            category: res['SSID_LABELS.' + element.ssid],
                            percent: this.dp.transform(element[this.chartType + 'Percent'], '1.1-2'),
                            color: this.chartColors[i]
                        });
                    });
                    i++;
                });
                this.drawAllocationGraph(dataProvider);
                this.totalAllocation();
            }
        }).catch(errorResponse => {
            if (errorResponse.error.message) {
                this.error = errorResponse.error.message;
            } else {
                this.error = 'No allocation data available for this portfolio';
            }
            this.noAllocationData = true;
        });
    }

    drawAllocationGraph(dataProvider) {
        const balloonText = '[[category]] [[percent]]%';
        const valueField = 'percent';
        let textReturn = 0;
        let textRisk = 0;
        if (this.allocationDetails[this.chartType + 'Summary'] && this.allocationDetails[this.chartType + 'Summary'] != null) {
            textReturn = this.allocationDetails[this.chartType + 'Summary'].rateOfReturn;
            textRisk = this.allocationDetails[this.chartType + 'Summary'].risk;
        }
        const chartArray = {
            ...pieChartArray,
            balloonText: balloonText,
            dataProvider: dataProvider,
            titleField: 'category',
            valueField: valueField,
            colorField: 'color',
            allLabels: [
                {
                    text: 'Return ' + textReturn + '%',
                    align: 'center',
                    bold: true,
                    size: 12,
                    color: '#345',
                    y: 80,
                    id: 'text1'
                },
                {
                    text: 'Risk ' + textRisk + '%',
                    align: 'center',
                    bold: true,
                    y: 100,
                    color: '#345',
                    size: 12,
                    id: 'text2'
                }]
        };
        setTimeout(() => {
            this.allocationChart = this.amcharts.makeChart('allocationChartDiv', chartArray);
        }, 100);
    }

    getCashwedge() {
        let getType = '00';
        if ( this.chartType === 'target') {
            getType = '01';
        }
        this.portfolioService.getCashWedgeDetails(this.clientId, this.portfolioId, 'en', getType).toPromise().then(res => {
            if (res) {
                this.translate.get([
                    'PORTFOLIO.ANALYTICS.LABEL.CASH_WEDGE_MESSAGE'
                ], {
                        percentNeeded: this.dp.transform(res.mayNeedPercentInYears, '1.0-0'),
                        amountNeeded: this.cp.transform(res.portfolioCashWedgeValue, this.currencyCode, 'symbol-narrow', '1.0-0'),
                        years: res.cashWedgeYears,
                        amountAvailable: this.cp.transform(res.portfolioLiquidValue, this.currencyCode, 'symbol-narrow', '1.0-0')
                    }).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        this.cashWedgeMessage = i18text['PORTFOLIO.ANALYTICS.LABEL.CASH_WEDGE_MESSAGE'];
                    });
                // Minimum pie slice size cannot be less than 1% because AMCharts has trouble displaying those.
                // if so adjust values going into the pie chart as needed
                // while leaving the balloon text using the actual values.
                let slice1 = res.requiredCashWedgeLiquidValue;
                let slice2 = res.cashWedge;
                let slice3 = Math.abs(res.cashWedgeIlliquidValue);
                let slice4 = res.additionalCashWedgeLiquidValue;
                let sliceTotal = slice1 + slice2 + slice3 + slice4;
                if ( sliceTotal > 0) {
                    let diff = 0;
                    if (slice1 > 0 && slice1 / sliceTotal < 0.01) {
                        diff += (sliceTotal * 0.01) - slice1;
                        slice1 = sliceTotal * 0.01;
                    } 
                    if (slice2 > 0 && slice2 / sliceTotal < 0.01) {
                        diff += (sliceTotal * 0.01) - slice2;
                        slice2 = sliceTotal * 0.01;
                    } 
                    if (slice3 > 0 && slice3 / sliceTotal < 0.01) {
                        diff += (sliceTotal * 0.01) - slice3;
                        slice3 = sliceTotal * 0.01;
                    } 
                    if (slice4 > 0 && slice4 / sliceTotal < 0.01) {
                        diff += (sliceTotal * 0.01) - slice4;
                        slice4 = sliceTotal * 0.01;
                    } 
                    // if diff is > 0 it means we have had to adjust one or more slice sections to make them
                    // equal 1% of the overall total.  Now the difference needed to make those sections 1% needs to
                    // be removed from one of the other slices.  To do this we just look for the slice with the
                    // largest amount and remove the diff from that so the overall slice total is the same.
                    if ( diff > 0.0) {
                        if ( slice1 > slice2 && slice1 > slice3 && slice1 > slice4) {
                            slice1 -= diff;
                        } else if ( slice2 > slice1 && slice2 > slice3 && slice2 > slice4) {
                            slice2 -= diff;
                        } else if ( slice3 > slice1 && slice3 > slice2 && slice3 > slice4) {
                            slice3 -= diff;
                        } else if ( slice4 > slice1 && slice4 > slice2 && slice4 > slice3) {
                            slice4 -= diff;
                        }
                    }
                }
                this.cashWedge = [
                    {
                        allocationBreakdownId: 1,
                        allocationBreakdown: 'Additional liquidity needed',
                        allocationPercent: slice1,
                        displayValue: this.cp.transform(res.requiredCashWedgeLiquidValue, this.currencyCode, 'symbol-narrow', '1.0-0'),
                        displayOrder: 0,
                    },
                    {
                        allocationBreakdownId: 2,
                        allocationBreakdown: 'Cash wedge',
                        allocationPercent: slice2,
                        displayValue: this.cp.transform(res.cashWedge, this.currencyCode, 'symbol-narrow', '1.0-0'),
                        displayOrder: 1,
                    },
                    {
                        allocationBreakdownId: 3,
                        allocationBreakdown: 'Illiquid ',
                        allocationPercent: slice3,
                        displayValue: ((res.cashWedgeIlliquidValue < 0.0) ? "(" : "") +  this.cp.transform(res.cashWedgeIlliquidValue, this.currencyCode, 'symbol-narrow', '1.0-0') + ((res.cashWedgeIlliquidValue < 0.0) ? ")" : ""),
                        displayOrder: 2,
                    },
                    {
                        allocationBreakdownId: 4,
                        allocationBreakdown: 'Excess liquidity',
                        allocationPercent: slice4,
                        displayValue: this.cp.transform(res.additionalCashWedgeLiquidValue, this.currencyCode, 'symbol-narrow', '1.0-0'),
                        displayOrder: 3,
                    }];
                const cashWedgeArray = {
                    ...cashWedgeChartArray,
                    dataProvider: this.cashWedge,
                    balloonText: '[[allocationBreakdown]] [[displayValue]]',
                    colors: this.cashGraphColors,
                    allLabels: [
                        {
                            text: 'Required \n' + this.planningService.transformCurrency(this.currencyCode, res.portfolioCashWedgeValue, 2),
                            align: 'center',
                            bold: true,
                            size: 14,
                            color: '#345',
                            y: 70,
                            id: 'text1'
                        },
                        {
                            text: 'Available \n' + this.planningService.transformCurrency(this.currencyCode, res.portfolioLiquidValue, 2),
                            align: 'center',
                            bold: true,
                            y: 110,
                            color: '#345',
                            size: 14,
                            id: 'text2'
                        }
                    ]
                };
                setTimeout(() => {
                    this.cashWedgeChart = this.amcharts.makeChart('cashWedgeChartDiv', cashWedgeArray);
                }, 200);
            }
            this.cashWedgeLoaded = true;
        });
    }

    getSuitability() {
        this.portfolioService.getSuitabilityRange(this.clientId, this.portfolioId, this.chartType).toPromise().then(res => {
            const suitabilityData = res;
            this.suitabilityLoaded = true;
            if (this.portfolioId != "AllPortfolios") {
                this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
                    if (clientData['currencyCode']) {
                        this.portfolioService.getPortfoliosDetailsById(this.portfolioId, clientData['currencyCode']).toPromise().then(res2 => {
                            this.pjmScore = res2.pjmResponse.pjmRecommendedScore;
                            this.reccommendedSuitabilityExceeded = res2.pjmResponse.pjmRecommendedScore < suitabilityData['suitabilityScore'];
                        });
                    }
                });
            }
            const riskRanges = [];
            suitabilityData['solutionRiskRanges'].forEach((range, index) => {
                const chartData = solutionInfo[range['riskType']];
                let startValue = range.low;
                if (index > 0 && range.low !== suitabilityData['solutionRiskRanges'][index - 1]['high']) {
                    startValue = suitabilityData['solutionRiskRanges'][index - 1]['high'];
                }
                riskRanges.push({
                    color: chartData['color'],
                    startValue: startValue,
                    endValue: range.high,
                    balloonText: range.low + ' - ' + range.high + ' ' + chartData['task'],
                    innerRadius: '150%',
                    radius: '100%',
                });
            }, this);
            const axisText = {
                ...suitabilityChartArray.axes[0],
                topText: suitabilityData['suitabilityScore'],
                bands: riskRanges
            };
            const suitabilityArray = {
                ...suitabilityChartArray,
                axes: [axisText],
                arrows: [{
                    alpha: 1,
                    innerRadius: '130%',
                    nailRadius: 0,
                    radius: '100%',
                    value: suitabilityData['suitabilityScore'],
                    startWidth: 2,
                    endWidth: 2,
                }]
            };
            setTimeout(() => {
                this.suitabilityChart = this.amcharts.makeChart('suitabilityChartdiv', suitabilityArray);
            }, 200);
        });
    }

    ngOnDestroy() {
        if (this.upAndDownChart) {
            this.amcharts.destroyChart(this.upAndDownChart);
        }
        if (this.allocationChart) {
            this.amcharts.destroyChart(this.allocationChart);
        }
        if (this.cashWedgeChart) {
            this.amcharts.destroyChart(this.cashWedgeChart);
        }
        if (this.suitabilityChart) {
            this.amcharts.destroyChart(this.suitabilityChart);
        }
        if (this.efficientFrontierChart) {
            this.amcharts.destroyChart(this.efficientFrontierChart);
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
