import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import {
    AppState,
    getClientPayload,
    getGraphColours,
    getAdvisorNetWorth,
    getAdvisorPayload
} from '../../../shared/app.reducer';
import { AdvisorService } from '../../service/advisor.service';
import { chartColors } from '../../../client/client-models';
import { StackedBarChartService } from '../../../shared/chart/stacked-bar-chart.service';

@Component({
    selector: 'app-net-worth-tile',
    templateUrl: './net-worth-tile.component.html',
    styleUrls: ['./net-worth-tile.component.css']
})
export class NetWorthTileComponent implements OnInit, OnDestroy {

    public netWorth = {};
    public dataProvider = [{}];
    public graphsData = [];
    clientData = {};
    advisoreData = {};
    networthData = [];
    noData = false;
    chartColor = chartColors.slice();
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private AmCharts: AmChartsService,
        private stackedBarChart: StackedBarChartService,
        private advisorService: AdvisorService
    ) { }

    ngOnInit() {
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisor => {
            if (advisor) {
                this.advisoreData = advisor;
                if (this.advisoreData['country']) {
                    this.setNetworthData();
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
    }

    setNetworthData() {
        this.store.select(getAdvisorNetWorth).pipe(takeUntil(this.unsubscribe$)).subscribe(async data => {
            this.networthData = [];
            if (data) {
                this.netWorth = data;
                if (this.netWorth['assetsByTypes'] && this.advisoreData && this.advisoreData['country']) {
                    this.noData = false;
                    this.networthData = await this.advisorService.setAccountLabels(this.netWorth, this.advisoreData, false);
                }
            } else {
                this.noData = true;
                this.advisorService.getAdvisorNetWorthPayload();
            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
