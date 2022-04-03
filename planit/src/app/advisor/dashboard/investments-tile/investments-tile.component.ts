import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import {
    AppState,
    getClientPayload,
    getBrandingDetails,
    getGraphColours,
    getAdvisoreInvestment,
    getAdvisorPayload,
    getAdvisorNetWorth
} from '../../../shared/app.reducer';
import { AdvisorService } from '../../service/advisor.service';
import { AccessRightService } from '../../../shared/access-rights.service';
import { chartColors } from '../../../client/client-models';
import { StackedBarChartService } from '../../../shared/chart/stacked-bar-chart.service';

@Component({
    selector: 'app-investments-tile',
    templateUrl: './investments-tile.component.html',
    styleUrls: ['./investments-tile.component.css']
})
export class InvestmentsTileComponent implements OnInit, OnDestroy {
    public investment: any;
    public allocationDataProvider = [];
    public allocationGraphsData = [];
    public manageDataProvider = [];
    public manageGraphsData = [];
    public plannedDataProvider = [];
    public plannedGraphsData = [];
    chartColor = chartColors.slice();
    clientData = {};
    investoreData = {};
    accessRights = {};
    advisoreData = {};
    networthData = [];
    netWorth = {};
    noData = false;
    dataLoaded = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private AmCharts: AmChartsService,
        private stackedBarChart: StackedBarChartService,
        private accessRightService: AccessRightService
    ) { }

    ngOnInit() {
        this.accessRightService.getAccess(['NETWORTHTILE']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisor => {
            if (advisor) {
                this.advisoreData = advisor;
                if (this.advisoreData['country']) {
                    if (this.accessRights['NETWORTHTILE']['accessLevel'] === 0) {
                        this.setNetworthData();
                    }
                }
            }
        });
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.chartColor = res['allGraphColours'];
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.store.select(getAdvisoreInvestment).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result) {
                this.investoreData = result;
                if (this.investoreData['assetAllocation'] && this.investoreData['investmentsByManaged'] && this.investoreData['investmentsByPlanned']) {
                    this.noData = false;
                    this.dataLoaded = true;
                    this.allocationProgressChart(this.investoreData['assetAllocation']);
                    this.manageProgressChart(this.investoreData['investmentsByManaged']);
                    this.plannedProgressChart(this.investoreData['investmentsByPlanned']);
                }
            } else {
                this.noData = true;
                this.advisorService.getInvestmentPayload();
            }
        });
    }

    setNetworthData() {
        this.store.select(getAdvisorNetWorth).pipe(takeUntil(this.unsubscribe$)).subscribe(async data => {
            this.networthData = [];
            this.netWorth = {};
            if (data) {
                this.netWorth = data;
                if (this.netWorth['assetsByTypes'] && this.advisoreData && this.advisoreData['country']) {
                    this.networthData = await this.advisorService.setAccountLabels(this.netWorth, this.advisoreData, true);
                }
            }
        });
    }

    private allocationProgressChart(repsonse) {
        this.allocationDataProvider = [{
            accounttype: 1,
            cash: repsonse[0].percent,
            fixed_income: repsonse[1].percent,
            equity: repsonse[2].percent
        }];
        this.allocationGraphsData = [
            {
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[0],
                lineColor: '#FFFFFF',
                title: 'Cash',
                type: 'column',
                color: '#000000',
                valueField: 'cash',
                fixedColumnWidth: 11
            },
            {
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[1],
                lineColor: '#FFFFFF',
                title: 'Fixed Income',
                type: 'column',
                color: '#000000',
                valueField: 'fixed_income',
                fixedColumnWidth: 11
            },
            {
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[2],
                lineColor: '#FFFFFF',
                title: 'Equity',
                type: 'column',
                color: '#000000',
                valueField: 'equity',
                fixedColumnWidth: 11
            }
        ];
        setTimeout(() => {
            this.AmCharts.makeChart('allocation_chart_div',
                this.stackedBarChart.commonOption(this.allocationDataProvider, this.allocationGraphsData)
            );
        }, 100);
    }

    private manageProgressChart(repsonse) {
        this.manageDataProvider = [{
            accounttype: 1,
            managed: repsonse[0].percent,
            unmanaged: repsonse[1].percent
        }];
        this.manageGraphsData = [
            {
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[0],
                lineColor: '#FFFFFF',
                title: 'Managed',
                type: 'column',
                color: '#000000',
                valueField: 'managed',
                fixedColumnWidth: 11
            },
            {
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[1],
                lineColor: '#FFFFFF',
                title: 'Unmanaged',
                type: 'column',
                color: '#000000',
                valueField: 'unmanaged',
                fixedColumnWidth: 11
            }
        ];
        setTimeout(() => {
            this.AmCharts.makeChart('manage_chart_div',
                this.stackedBarChart.commonOption(this.manageDataProvider, this.manageGraphsData)
            );
        }, 100);
    }
    private plannedProgressChart(repsonse) {
        this.plannedDataProvider = [{
            accounttype: 1,
            planned: repsonse[0].percent,
            unplanned: repsonse[1].percent
        }];
        this.plannedGraphsData = [
            {
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[0],
                lineColor: '#FFFFFF',
                title: 'Planned',
                type: 'column',
                color: '#000000',
                valueField: 'planned',
                fixedColumnWidth: 11
            },
            {
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[1],
                lineColor: '#FFFFFF',
                title: 'Unplanned',
                type: 'column',
                color: '#000000',
                valueField: 'unplanned',
                fixedColumnWidth: 11
            }
        ];
        setTimeout(() => {
            this.AmCharts.makeChart('planned_chart_div',
                this.stackedBarChart.commonOption(this.plannedDataProvider, this.plannedGraphsData)
            );
        }, 100);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
