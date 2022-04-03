import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../shared/animations';
import { AppState, getGraphColours } from '../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { pieChartArray } from '../../client/client-models/portfolio-charts';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { SettingService } from '../service';
import { TranslateService } from '@ngx-translate/core';
import { suitabilityChartArray } from '../../client/client-models/analytics-charts';
import { RANGE_RADIOBUTTON_OPTIONS, RISK_RANGES } from '../../shared/constants';
import { solutionInfo } from '../../client/client-models/chart-colors';
import {
    backTestChartArray,
    efficientFrontierCashArray,
    cashWedgeChartArray
} from '../../client/client-models';
import { EFFICIENT_FRONTIER } from '../../shared/constants';

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
    @Input() solutionData;
    @Input() graphColors;
    @Output() closePanelEvent = new EventEmitter();
    unsubscribe$ = new Subject<void>();
    allocationChart;
    suitabilityChart;
    i18Text = {};
    Rising = 0;
    Recovering = 0;
    Falling = 0;
    lossDetails = [];
    efficientFrontierData = {};
    frontierGraphData = [];
    frontierDataProvider = [];
    efficientFrontierLoaded = false;
    allocationKey ='';
    upAndDownChart;
    efficientFrontierChart;
    EFFICIENT_FRONTIER = EFFICIENT_FRONTIER;
    constructor(
        private store: Store<AppState>,
        private AmCharts: AmChartsService,
        private settingService: SettingService,
        private amcharts: AmChartsService,
        private translate: TranslateService
    ) { }

    ngOnInit() {
       
        this.translate.stream([
            'PORTFOLIO.ANALYTICS.LABEL.RISK', 'PORTFOLIO.ANALYTICS.LABEL.RETURN',
            'PORTFOLIO.ANALYTICS.LABEL.ANALYZED_PORTFOLIO','PORTFOLIO.ANALYTICS.LABEL.EFFICIENT_FRONTIER',
            'PORTFOLIO.ANALYTICS.LABEL.INEFFICIENT_FRONTIER','PORTFOLIO.ANALYTICS.LABEL.TARGET_PORTFOLIOS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        this.solutionData['totalAllocation'] = 0;
        this.solutionData['assetAllocations'].forEach(asset => {
            this.solutionData['totalAllocation'] += asset.percentage;
        });
        this.drawGraph();
        if (this.solutionData['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS.DEFAULT) {
            this.suitabilityGraph(RANGE_RADIOBUTTON_OPTIONS.DEFAULT);
        } else {
            this.suitabilityGraph(RANGE_RADIOBUTTON_OPTIONS.INPUT);

        }
        this.getBackTest();
        this.efficientFrontier();
    }

    drawGraph() {
        const dataProvider = [];
        this.solutionData['assetAllocations'].forEach(element => {
            this.translate.get(['SSID_LABELS.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((response: string) => {
                dataProvider.push({ category: response['SSID_LABELS.' + element.ssid], percent: element.percentage });
            });
        });
        const chartArray = {
            ...pieChartArray,
            allLabels: [
                {
                    text: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RETURN'] + this.solutionData['rateOfReturn'] + '%',
                    align: 'center',
                    bold: false,
                    size: 14,
                    color: '#345',
                    y: 80,
                    id: 'text1'
                },
                {
                    text: this.i18Text['PORTFOLIO.ANALYTICS.LABEL.RISK'] + this.solutionData['risk'] + '%',
                    align: 'center',
                    bold: false,
                    y: 100,
                    color: '#345',
                    size: 14,
                    id: 'text2'
                }
            ],
            balloonText: '[[category]] [[percent]]%',
            titleField: 'category',
            valueField: 'percent',
            colors: this.graphColors,
            dataProvider: dataProvider,
        };
        setTimeout(() => {
            this.allocationChart = this.AmCharts.makeChart('allocationChartDiv', chartArray);
        }, 300);
    }

    suitabilityGraph(type) {
        const okayHighKey = type + 'OkRangeHigh';
        const okayLowKey = type + 'OkRangeLow';
        const marginalLowKey = type + 'MarginalRangeLow';
        const marginalHighKey = type + 'MarginalRangeHigh';
        const riskRanges = [];
        const riskRangeArray = [];
        if (this.solutionData[okayLowKey] !== 0) {
            if (this.solutionData[marginalLowKey] !== 0) {
                riskRangeArray.push({
                    'high': this.solutionData[marginalLowKey],
                    'low': 0,
                    'riskType': RISK_RANGES['TOO_MUCH']
                });
            }
            riskRangeArray.push({
                'high': this.solutionData[okayLowKey],
                'low': this.solutionData[marginalLowKey],
                'riskType': RISK_RANGES['MARGINAL_UPPER']
            });
        }
        riskRangeArray.push({
            'high': this.solutionData[okayHighKey],
            'low': this.solutionData[okayLowKey],
            'riskType': RISK_RANGES['OK']
        });
        riskRangeArray.push({
            'high': this.solutionData[marginalHighKey],
            'low': this.solutionData[okayHighKey],
            'riskType': RISK_RANGES['MARGINAL_LOWER']
        });
        riskRangeArray.push({
            'high': 100,
            'low': this.solutionData[marginalHighKey],
            'riskType': RISK_RANGES['TOO_LITTLE']
        });
        riskRangeArray.forEach((risk, index) => {
            riskRanges.push({
                color: solutionInfo[risk['riskType']]['color'],
                startValue: risk['low'],
                endValue: risk['high'],
                balloonText: risk['low'] + ' - ' + risk['high'] + ' ' + risk['riskType'],
                innerRadius: '150%',
                radius: '100%',
            });
        });
        const axisText = {
            ...suitabilityChartArray.axes[0],
            topText: '',
            bands: riskRanges
        };
        const suitabilityArray = {
            ...suitabilityChartArray,
            axes: [axisText]
        };
        setTimeout(() => {
            this.suitabilityChart = this.AmCharts.makeChart('suitabilityChartdiv', suitabilityArray);
        }, 200);
    }

    closePanel() {
        this.closePanelEvent.emit();
    }

    ngOnDestroy(): void {
        if (this.allocationChart) {
            this.AmCharts.destroyChart(this.allocationChart);
        }
        if (this.suitabilityChart) {
            this.AmCharts.destroyChart(this.suitabilityChart);
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    getBackTest(){
        this.settingService.getBackTest(this.solutionData).toPromise().then(response => {
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

    efficientFrontier() {
        this.settingService.getEfficientFrontierGraphData(this.solutionData).toPromise().then(result => {
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
            this.allocationKey = this.EFFICIENT_FRONTIER.CURRENT_KEY;
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
}
