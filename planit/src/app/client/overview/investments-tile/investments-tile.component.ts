import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import {
    AppState,
    getClientPayload,
    getInvestmentData,
} from '../../../shared/app.reducer';
import { ClientProfileService } from '../../service';
import {chartColors} from '../../client-models';
import { StackedBarChartService } from '../../../shared/chart/stacked-bar-chart.service';

@Component({
    selector: 'app-investments-tile',
    templateUrl: './investments-tile.component.html',
    styleUrls: ['./investments-tile.component.css']
})
export class InvestmentsTileComponent implements OnInit, OnDestroy {

    @Input() clientId;
    @Input() graphColors = chartColors;
    data: any;
    managedDataProvider = [{
        accounttype: 1
    }];
    managedGraphsData = [];
    plannedDataProvider = [{
        accounttype: 1
    }];
    plannedGraphsData = [];
    clientData = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private AmCharts: AmChartsService,
        private stackedBarChart: StackedBarChartService,
        private profileService: ClientProfileService
    ) { }

    ngOnInit(): void {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.store.select(getInvestmentData).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            this.data = data;
            if (data) {
                this.managedDataProvider = [{
                    accounttype: 1
                }];
                this.managedGraphsData = [];
                this.plannedDataProvider = [{
                    accounttype: 1
                }];
                this.plannedGraphsData = [];
                this.InvestmentProgressChart(data);
            } else {
                this.profileService.getInvestmentData(this.clientId);
            }
        });
    }

    InvestmentProgressChart(response) {
        response.investmentsByManaged.forEach((res, index) => {
            this.managedDataProvider[0][res.type] = Math.round(res.value / this.getInvestmentsByManaged() * 100);
            this.managedGraphsData.push({
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.graphColors[index],
                lineColor: '#FFFFFF',
                title: res.type,
                type: 'column',
                color: '#000000',
                valueField: res.type,
                fixedColumnWidth: 11
            });
        });

        response.investmentsByPlanned.forEach((res, index) => {
            this.plannedDataProvider[0][res.type] = Math.round(res.value / this.getInvestmentsByPlanned() * 100);
            this.plannedGraphsData.push({
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.graphColors[index],
                lineColor: '#FFFFFF',
                title: res.type,
                type: 'column',
                color: '#000000',
                valueField: res.type,
                fixedColumnWidth: 11
            });
        });
        setTimeout(() => {
            this.AmCharts.makeChart('managedTypeChartDiv',
                this.stackedBarChart.commonOption(this.managedDataProvider, JSON.parse(JSON.stringify(this.managedGraphsData)))
            );
        }, 100);
        setTimeout(() => {
            this.AmCharts.makeChart('plannedTypeChartDiv',
                this.stackedBarChart.commonOption(this.plannedDataProvider, JSON.parse(JSON.stringify(this.plannedGraphsData)))
            );
        }, 100);
    }

    getInvestmentsByManaged(): number {
        return this.data.investmentsByManaged.reduce((sum, item) => sum + item.value, 0);
    }

    getInvestmentsByPlanned(): number {
        return this.data.investmentsByPlanned.reduce((sum, item) => sum + item.value, 0);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
