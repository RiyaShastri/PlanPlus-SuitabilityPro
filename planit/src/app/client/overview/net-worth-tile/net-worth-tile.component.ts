import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import {
    AppState,
    getNetworthInvestmentPayload,
    getClientPayload,
} from '../../../shared/app.reducer';
import { ClientProfileService } from '../../service';
import { AccessRightService } from '../../../shared/access-rights.service';
import {chartColors} from '../../client-models';
import { StackedBarChartService } from '../../../shared/chart/stacked-bar-chart.service';

@Component({
    selector: 'app-net-worth-tile',
    templateUrl: './net-worth-tile.component.html',
    styleUrls: ['./net-worth-tile.component.css']
})
export class NetWorthTileComponent implements OnInit, OnDestroy {

    @Input() clientId;
    @Input() graphColors = chartColors;
    assetsDataProvider = [{
        accounttype: 1
    }];
    assetsGraphsData = [];
    ownerDataProvider = [{
        accounttype: 1
    }];
    ownerGraphsData = [];
    data: any;
    clientData = {};
    accessRights = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private AmCharts: AmChartsService,
        private stackedBarChart: StackedBarChartService,
        private profileService: ClientProfileService,
        private accessRightService: AccessRightService
    ) { }

    ngOnInit() {
        this.accessRightService.getAccess(['AL_LIABILITY']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.store
            .select(getNetworthInvestmentPayload)
            .pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                this.data = data;
                if (data) {
                    this.assetsDataProvider = [{
                        accounttype: 1
                    }];
                    this.assetsGraphsData = [];

                    this.ownerDataProvider = [{
                        accounttype: 1
                    }];
                    this.ownerGraphsData = [];
                    this.accountTypeProgressChart(data);
                } else {
                    this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                }
            });
    }

    accountTypeProgressChart(response) {
        if (response.assetsByTypes) {
          response.assetsByTypes.forEach((res, index) => {
            this.assetsDataProvider[0][res.type] = Math.round(res.value / this.getAssetsTotaleByTypes() * 100);
            this.assetsGraphsData.push({
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
        }
      if (response.assetsByOwners) {
        response.assetsByOwners.forEach((res, index) => {
          this.ownerDataProvider[0][res.type] = Math.round(res.value / this.getAssetsTotaleByOwners() * 100);
          this.ownerGraphsData.push({
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
      }
        setTimeout(() => {
            this.AmCharts.makeChart('accountTypeChartDiv',
                this.stackedBarChart.commonOption(this.assetsDataProvider, JSON.parse(JSON.stringify(this.assetsGraphsData)))
            );
        }, 100);

        setTimeout(() => {
            this.AmCharts.makeChart('ownerTypeChartDiv',
                this.stackedBarChart.commonOption(this.ownerDataProvider, JSON.parse(JSON.stringify(this.ownerGraphsData)))
            );
        }, 100);
    }

    getAssetsTotaleByTypes(): number {
        return this.data.assetsByTypes.reduce((sum, item) => sum + item.value, 0);
    }

    getAssetsTotaleByOwners(): number {
        return this.data.assetsByOwners.reduce((sum, item) => sum + item.value, 0);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
