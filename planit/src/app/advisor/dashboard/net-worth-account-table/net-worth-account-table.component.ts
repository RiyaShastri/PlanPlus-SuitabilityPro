import { Component, OnInit, Input, AfterContentInit, OnDestroy } from '@angular/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { StackedBarChartService } from '../../../shared/chart/stacked-bar-chart.service';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../shared/app.reducer';

@Component({
    selector: 'app-net-worth-account-table',
    templateUrl: './net-worth-account-table.component.html',
    styleUrls: ['./net-worth-account-table.component.css']
})
export class NetWorthAccountTableComponent implements OnInit, AfterContentInit, OnDestroy {
    @Input() networthData;
    @Input() chartColor;
    @Input() chartId: string;
    dataProvider = [{}];
    graphsData = [];
    clientData = {};
    unsubscribe$: any;

    constructor(
        private AmCharts: AmChartsService,
        private stackedBarChart: StackedBarChartService,
        private store: Store<AppState>
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getClientPayload).subscribe(clientData => {
            this.clientData = clientData;
        });
    }

    ngAfterContentInit() {
        this.networthProgressChart(this.networthData);
    }

    networthProgressChart(response) {
        this.dataProvider = [{}];
        this.graphsData = [];
        response.forEach((res, index) => {
            const key = res.type;
            this.dataProvider[0][key] = res.percent;
            this.graphsData.push({
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[index],
                lineColor: '#FFFFFF',
                title: res.type,
                type: 'column',
                color: '#000000',
                valueField: res.type,
                fixedColumnWidth: 11
            });
        });
        setTimeout(() => {
            this.AmCharts.makeChart(this.chartId, this.stackedBarChart.commonOption(this.dataProvider, this.graphsData));
        }, 1000);
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
