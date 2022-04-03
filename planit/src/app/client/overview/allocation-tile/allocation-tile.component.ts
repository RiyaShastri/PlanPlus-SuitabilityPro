import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { NgxPermissionsService } from 'ngx-permissions';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PortfolioService, PlanningService } from '../../service';
import { AccessRightService } from '../../../shared/access-rights.service';
import { chartColors } from '../../../client/client-models';
import { AppState, getClientPayload, getGraphColours } from '../../../shared/app.reducer';
import { PORTFOLIO_ALLOCATION_VIEW_BY, ASSETS_CLASS_OPTIONS } from '../../../shared/constants';

@Component({
    selector: 'app-allocation-tile',
    templateUrl: './allocation-tile.component.html',
    styleUrls: ['./allocation-tile.component.css']
})
export class AllocationTileComponent implements OnInit, OnDestroy {
    @Input() clientId;
    data: any;
    private currentChart: AmChart;
    private targetChart: AmChart;
    currentTotal = 0;
    targetTotal = 0;
    currentMarker = 'K';
    targetMarker = 'K';
    graphData = {
        'currentData': [],
        'targetData': []
    };
    clientData = {};
    noAllocationData = false;
    allocationsData = []; currentSummary = []; targetSummary = []; implementedSummary = [];
    accessRights = {};
    graphColors = chartColors.slice();
    private unsubscribe$ = new Subject<void>();

    constructor(
        private AmCharts: AmChartsService,
        private portfolioService: PortfolioService,
        private dp: DecimalPipe,
        private store: Store<AppState>,
        private ngxPermissionsService: NgxPermissionsService,
        private accessRightService: AccessRightService,
        private translate: TranslateService,
        private planningService: PlanningService,
        private router: Router
    ) { }

    ngOnInit() {
        this.accessRightService.getAccess(this.accessRights = ['CURRSCENARIO']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.accessRights = res);
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });

        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.graphColors = res['allGraphColours'];
            }
        });

        const payload = {
            isSpecifiedPortfolio: false,
            portfolioId: 'AllPortfolios',
            view:  PORTFOLIO_ALLOCATION_VIEW_BY['CURRENT_VS_TARGET']['value'],
            assetCategory: ASSETS_CLASS_OPTIONS['3_CLASSES']
        };

        this.portfolioService.getAllocationDetails(this.clientId, payload).toPromise().then(result => {
            this.noAllocationData = false;
            this.allocationsData = result['allocations'];
            this.currentSummary = result['currentSummary'] ? result['currentSummary'] : null;
            this.targetSummary = result['targetSummary'] ? result['targetSummary'] : null;
            this.makeChart();
        }).catch(errorResponse => {
            this.noAllocationData = true;
        });

        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            if ((this.router.url.indexOf('/overview') > 0)) {
                this.makeChart();
            }
        });
    }

    getAssetAllocationData() {

    }

    makeDataProvider() {
        this.graphData.currentData = [];
        this.graphData.targetData = [];
        this.allocationsData.forEach(element => {
            this.currentTotal += element.currentAmount;
            this.targetTotal += element.targetAmount;
            this.translate.get(['CUSTOM.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                this.graphData.currentData.push({
                    category: res['CUSTOM.' + element.ssid],
                    percent: this.dp.transform(element.currentPercent, '1.1-2'),
                    amount: element.currentAmount,
                });
                this.graphData.targetData.push({
                    category: res['CUSTOM.' + element.ssid],
                    percent: this.dp.transform(element.targetPercent, '1.1-2'),
                    amount: element.targetAmount,
                });
            });
        });
    }

    makeChart() {
        this.makeDataProvider();
        if (this.currentSummary !== null) {
            setTimeout(() => {
                this.currentChart = this.AmCharts.makeChart('chartdiv1',
                    this.makeOptions(this.graphData.currentData, this.currentTotal));
            }, 100);
        }
        if (this.targetSummary !== null) {
            setTimeout(() => {
                this.targetChart = this.AmCharts.makeChart('chartdiv2',
                    this.makeOptions(this.graphData.targetData, this.targetTotal));
            }, 100);
        }
    }

    makeOptions(dataProvider, total) {
        return {
            'type': 'pie',
            'innerRadius': '87%',
            'precision': 2,
            'balloonText': '[[category]] [[percent]]%',
            'labelText': '',
            'startRadius': '50%',
            'colors': this.graphColors,
            'gradientRatio': [],
            'hoverAlpha': 0.64,
            'labelTickAlpha': 0,
            'outlineAlpha': 0,
            'startDuration': 0.8,
            'autoMargins': false,
            'marginTop': 2,
            'marginBottom': 40,
            'marginLeft': 0,
            'marginRight': 0,
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
            allLabels: [
                {
                    text: this.planningService.transformCurrency(this.clientData['currencyCode'], total, 2),
                    // text: new CurrencyPipe(this.locale).transform(
                    //     total,
                    //     this.clientData['currencyCode'],
                    //     'symbol-narrow',
                    //     '0.0-2'
                    // ) + this.currentMarker,
                    align: 'center',
                    bold: false,
                    size: 22,
                    y: 50,
                    id: 'text1'
                },
                {
                    text: 'Total',
                    align: 'center',
                    bold: false,
                    y: 30,
                    color: '#aabbcc',
                    size: 14,
                    id: 'text2'
                }
            ],
            'balloon': {
                'offsetX': 0,
                'offsetY': 0
            },
            'titles': [],
            'dataProvider': dataProvider
        };
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        if (this.currentChart) {
            this.AmCharts.destroyChart(this.currentChart);
        }
        if (this.targetChart) {
            this.AmCharts.destroyChart(this.targetChart);
        }
    }

    handleRendered() {
        $('[font-family]').removeAttr('font-family');
    }

}
