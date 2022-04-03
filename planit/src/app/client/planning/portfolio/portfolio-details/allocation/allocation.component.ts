import { DecimalPipe } from '@angular/common';
import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { pieChartArray } from '../../../../client-models/portfolio-charts';
import { AccessRightService } from '../../../../../shared/access-rights.service';
import { Store } from '@ngrx/store';
import { AppState, getGraphColours } from '../../../../../shared/app.reducer';
import { chartColors } from '../../../../client-models';
import { NgxPermissionsService } from 'ngx-permissions';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ASSET_CLASS_COLOURS } from '../../../../../shared/constants';

@Component({
    selector: 'app-allocation',
    templateUrl: './allocation.component.html',
    styleUrls: ['./allocation.component.css']
})
export class AllocationComponent implements OnInit, OnChanges, OnDestroy {
    @Input() clientId;
    @Input() portfolioId;
    @Input() allocationResponse;
    @Input() isEditableRoute?: boolean;
    @Input() currentCashPercent?: number;
    @Input() currentPage;
    @Input() investedAmount?: number;
    @Input() isEditAllocationAllowed?: boolean;
    @Input() implementedPercentTotal?: number;
    @Input() isCustomSolution?= false;

    graphColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];
    currentExist = false; implementedExist = false; targetExist = false;
    accessRights = {};
    currencyMask = {
        prefix: '$',
        thousands: ',',
        decimal: '.'
    };
    clientData = {};
    minMaxAllocation = [];
    targetAllocation = [];
    isOnlyProFiler = false;
    chartColors = chartColors;
    isCustom = false;
    private unsubscribe$ = new Subject<void>();
    assetClassColours = ASSET_CLASS_COLOURS;

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
        if (permissions.hasOwnProperty('PROFILER') && !permissions.hasOwnProperty('ADVISOR')) {
            this.isOnlyProFiler = true;
        }
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.graphColors = res['allGraphColours'];
            }
        });
        this.accessRightService.getAccess(['POB01', 'CURRSCENARIO', 'CUSTIMPL']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
    }

    ngOnChanges(changes) {
        this.isCustom = this.isCustomSolution;
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.graphColors = res['allGraphColours'];
            }
        });
        if (changes.allocationResponse || (changes.hasOwnProperty('currentPage') && changes.currentPage)) {
            this.changeAllocationDetail(changes.allocationResponse.currentValue, (changes.currentPage && changes.currentPage.currentValue) ? changes.currentPage.currentValue : this.currentPage);
        }
    }

    changeAllocationDetail(allocationResponse, currentPage) {
        const currentDataProvider = [];
        const tragetDataProvider = [];
        const implementationDataProvider = [];
        this.currentExist = false;
        this.targetExist = false;
        this.implementedExist = false;

        let i = 0;
        allocationResponse.allocations.forEach(alloca => {
            if (alloca.currentPercent > 0) {
                this.currentExist = true;
            }
            if (alloca.targetPercent > 0) {
                this.targetExist = true;
            }
            if (alloca.implementedPercent > 0) {
                this.implementedExist = true;
            }
            this.translate.get(['SSID_LABELS.' + alloca.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                currentDataProvider.push({ category: res['SSID_LABELS.' + alloca.ssid], percent: this.dp.transform(alloca.currentPercent), color: this.graphColors[ASSET_CLASS_COLOURS[alloca.ssid]] });
                tragetDataProvider.push({ category: res['SSID_LABELS.' + alloca.ssid], percent: this.dp.transform(alloca.targetPercent), color: this.graphColors[ASSET_CLASS_COLOURS[alloca.ssid]] });
                implementationDataProvider.push({
                    category: res['SSID_LABELS.' + alloca.ssid],
                    percent: this.dp.transform(alloca.implementedPercent), color: this.graphColors[ASSET_CLASS_COLOURS[alloca.ssid]]
                });
            });
            i++;
        });
        this.drawGraph('currentPieChart', currentDataProvider, this.dp.transform(allocationResponse.currentSummary.rateOfReturn, '1.1-2'),
            this.dp.transform(allocationResponse.currentSummary.risk, '1.1-2'));
        if (currentPage === 'details') {
            this.drawGraph('targetPieChart', tragetDataProvider, this.dp.transform(allocationResponse.targetSummary.rateOfReturn, '1.1-2'),
                this.dp.transform(allocationResponse.targetSummary.risk, '1.1-2'));
        } else {
            if (allocationResponse.implementedSummary) {
                this.drawGraph('implementationPieChart', implementationDataProvider, this.dp.transform(allocationResponse.implementedSummary.rateOfReturn, '1.1-2'),
                    this.dp.transform(allocationResponse.implementedSummary.risk, '1.1-2'));
            }
        }
    }

    drawGraph(chartId, dataProvider, rateOfReturn, risk) {
        const pieChart = {
            ...pieChartArray,
            allLabels: [
                {
                    text: 'Return ' + rateOfReturn + '%',
                    align: 'center',
                    bold: false,
                    size: 14,
                    color: '#345',
                    y: 80,
                    id: 'text1'
                },
                {
                    text: 'Risk ' + risk + '%',
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
            colorField: 'color',
            dataProvider: dataProvider,
        };
        setTimeout(() => {
            this.AmCharts.makeChart(chartId, pieChart);
        }, 300);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
