import { DecimalPipe } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { getClientPayload, AppState } from '../../../../shared/app.reducer';
import { NgxPermissionsService } from 'ngx-permissions';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-portfolio-allocation',
    templateUrl: './portfolio-allocation.component.html',
    styleUrls: ['./portfolio-allocation.component.css']
})

export class PortfolioAllocationComponent implements OnInit, OnDestroy {

    @Input() selectedViewBy;
    @Input() totalInvested;
    @Input() clientId;
    @Input() portfolioId;
    @Input() summaryData;
    @Input() allocationsData;
    @Input() type;
    @Input() graphColors = [];
    @Input() warningsExist;
    summaryExist = false;

    totalPercent = 0;
    totalAmount = 0;
    analyticsRoute;
    graphData = [];
    accessRights = {};
    chart: AmChart;
    clientData = {};
    isProFiler = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private dp: DecimalPipe,
        private accessRightService: AccessRightService,
        private AmCharts: AmChartsService,
        private store: Store<AppState>,
        private ngxPermissionsService: NgxPermissionsService,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        const permissions = this.ngxPermissionsService.getPermissions();
        if (permissions.hasOwnProperty('PROFILER')) {
            this.isProFiler = true;
        }
        this.accessRightService.getAccess(['POB01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res } });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.analyticsRoute = ['/client/' + this.clientId + '/planning/portfolios/' + this.portfolioId + '/analytics/' + this.type];
        this.getAllocationsData();
    }

    getAllocationsData() {
        this.summaryExist = false;
        this.graphData = [];
        let i = 0;
        this.allocationsData.forEach(asset => {
            this.totalPercent += asset[this.type + 'Percent'];
            this.totalAmount += asset[this.type + 'Amount'];
            if (asset[this.type + 'Percent']) {
                this.summaryExist = true;
            }
            this.translate.get(['SSID_LABELS.' + asset.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                this.graphData.push({
                    category: res['SSID_LABELS.' + asset.ssid],
                    percent: this.dp.transform(asset[this.type + 'Percent'], '1.1-2'),
                    color: this.graphColors[i]
                });
            });
            i++;
        });
        this.makeChart();
    }

    makeChart() {
        if (this.summaryData !== null) {
            setTimeout(() => {
                this.chart = this.AmCharts.makeChart('chart_' + this.type,
                    this.makeOptions(this.graphData, this.dp.transform(this.summaryData['rateOfReturn'], '1.1-2'), this.dp.transform(this.summaryData['risk'], '1.1-2')));
            }, 1000);
        }
    }

    makeOptions(dataProvider: any[], rateOfReturn: string, risk: string) {
        const newVar = {
            'type': 'pie',
            'innerRadius': '70%',
            'precision': 2,
            'balloonText': '[[category]] [[percent]]%',
            'labelText': '',
            'startRadius': '0%',
            'colorField': 'color',
            'gradientRatio': [],
            'hoverAlpha': 0.64,
            'labelTickAlpha': 0,
            'outlineAlpha': 0,
            'startDuration': 0.8,
            'autoMargins': false,
            'marginLeft': 10,
            'marginRight': 10,
            'pullOutRadius': 0,
            'startEffect': 'easeOutSine',
            'titleField': 'category',
            'valueField': 'percent',
            'accessibleTitle': '',
            'theme': 'light',
            'listeners': [
                {
                    'event': 'rendered',
                    'method': this.handleRendered
                }
            ],
            'allLabels': [
                {
                    'text': 'Return ' + rateOfReturn + '%',
                    'align': 'center',
                    'bold': false,
                    'size': 14,
                    'color': '#345',
                    'y': 80,
                    'id': 'text1'
                },
                {
                    'text': 'Risk ' + risk + '%',
                    'align': 'center',
                    'bold': false,
                    'y': 100,
                    'color': '#345',
                    'size': 14,
                    'id': 'text2'
                }
            ],
            'balloon': {
                'offsetX': 0,
                'offsetY': 0
            },
            'titles': [],
            'dataProvider': dataProvider
        };

        return newVar;
    }

    ngOnDestroy() {
        if (this.chart) {
            this.AmCharts.destroyChart(this.chart);
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    handleRendered() {
        $('[font-family]').removeAttr('font-family');
    }

}
