import { Location, DecimalPipe, getCurrencySymbol } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';
import { slideInOutAnimation } from '../../../../shared/animations';
import { PortfolioService } from '../../../service';
import { pieChartArray } from '../../../client-models/portfolio-charts';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { PageTitleService } from '../../../../shared/page-title';
import { Store } from '@ngrx/store';
import {
    AppState,
    getClientPayload,
    getGraphColours
} from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PORTFOLIO_ALLOCATION_VIEW_BY, ASSETS_CLASS_OPTIONS } from '../../../../shared/constants';
import { AccessRightService } from '../../../../shared/access-rights.service';
@Component({
    selector: 'app-edit-current',
    templateUrl: './edit-current.component.html',
    styleUrls: ['./edit-current.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class EditCurrentComponent implements OnInit, OnDestroy {
    clientId;
    portfolioId;
    public graphColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];

    currencyMask = createNumberMask({
        prefix: '$'
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    percentDecimalMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 1
    });
    assetsBreakdown;
    isDetailExpand = false;
    isCost = false;
    totalSum = 0;
    totalAmount = 0;
    cashAllocation;
    defaultAllocation;
    filterdAssetsBreakdown;
    defaultAmount;
    filterAllocation;
    allocation;
    currentSummary;
    incomeDistribution;
    currentExist = false;
    isEditableRoute;
    clientData = {};
    accessRights = {};
    policyChart: AmChart;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private dp: DecimalPipe,
        private _location: Location,
        private route: ActivatedRoute,
        private AmCharts: AmChartsService,
        private portfolioService: PortfolioService,
        private pageTitleService: PageTitleService,
        private dataSharing: RefreshDataService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private accessRightService: AccessRightService,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'editCurrentSidePanel' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_CURRENT_TITLE');
        this.isEditableRoute = this.router.url.includes('/details/edit/') ? true : false;
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.portfolioId = this.route.snapshot.parent.params['portfolioId'];
    }

    ngOnInit() {
        this.accessRightService.getAccess(['CMAINCDIST', 'CMAINCDISTEDIT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.accessRights = res;
            }
        });

        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.graphColors = res['allGraphColours'];
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow'),
            });

        });
        const payload = {
            isSpecifiedPortfolio: true,
            portfolioId: this.portfolioId,
            view: PORTFOLIO_ALLOCATION_VIEW_BY['CURRENT']['value'],
            assetCategory: ASSETS_CLASS_OPTIONS['DETAIL']
        };
        this.portfolioService.getAllocationDetails(this.clientId, payload).toPromise().then(response => {
            this.allocation = response;
            this.allocation.currentSummary.incomeDistribution.forEach(incomDistri => {
                incomDistri['percent'] = parseFloat(incomDistri['percent'].toFixed(1));
            });
            this.allocation['access'] = true;
            this.totalAllocation();
            this.cashAllocation = this.allocation.allocations[0].currentPercent;
            this.defaultAllocation = this.allocation.allocations[0].currentPercent;
            this.defaultAmount = this.allocation.totalCurrentAmount;
            const dataProvider = [];
            this.currentExist = false;
            this.allocation.allocations.forEach(element => {
                if (element.currentPercent > 0) {
                    this.currentExist = true;
                }
                this.translate.get(['SSID_LABELS.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    dataProvider.push({ category: res['SSID_LABELS.' + element.ssid], percent: this.dp.transform(element.currentPercent, '1.1-2') });
                });
            });
            setTimeout(() => {
                this.drawGraph(dataProvider);
            }, 200);
        }).catch(errorResponse => { });
    }

    drawGraph(dataProvider) {
        const chartArray = {
            ...pieChartArray,
            allLabels: [{
                text: 'Return ' + this.allocation.currentSummary.rateOfReturn + '%',
                align: 'center',
                bold: false,
                size: 14,
                color: '#345',
                y: 80,
                id: 'text1'
            },
            {
                text: 'Risk ' + this.allocation.currentSummary.risk + '%',
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
        this.policyChart = this.AmCharts.makeChart('chartdiv', chartArray);
    }

    updateGraph(event) {
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 || event.keyCode === 46) {
            let sum = 0;
            this.filterdAssetsBreakdown = this.allocation.allocations.filter(result => result.displayOrder !== 1);
            this.filterdAssetsBreakdown.forEach(element => {
                sum = (sum + element.currentPercent);
            });
            if (event > 0 && sum < 100) {
                this.allocation.allocations[0].currentPercent = (this.allocation.allocations[0].currentPercent - event);
                this.allocation.allocations[0].currentPercent = 100 - sum;
            } else if (sum <= 100) {
                this.allocation.allocations[0].currentPercent = 100 - sum;
            } else {
                this.allocation.allocations[0].currentAmount = 0;
            }
            this.amountCalculate();
            this.cashAllocation = this.allocation.allocations[0].currentPercent;
            const dataProvider = [];
            this.currentExist = false;
            this.allocation.allocations.forEach(element => {
                if (element.currentPercent > 0) {
                    this.currentExist = true;
                }
                this.translate.get(['SSID_LABELS.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    dataProvider.push({ category: res['SSID_LABELS.' + element.ssid], percent: this.dp.transform(element.currentPercent, '1.1-2') });
                });
            });
            setTimeout(() => {
                this.drawGraph(dataProvider);
            }, 100);
        }
    }

    amountCalculate() {
        let amt;
        let temp;
        this.allocation.allocations.forEach(element => {
            amt = element.currentPercent / 100;
            temp = parseFloat(((this.defaultAmount) * amt).toFixed(2));
            element.currentAmount = temp;
        });
        this.totalAllocation();
    }

    totalAllocation() {
        this.totalSum = 0;
        this.totalAmount = 0;
        this.allocation.allocations.forEach(element => {
            this.totalSum = parseFloat((this.totalSum + element.currentPercent).toFixed(1));
            this.totalAmount += element.currentAmount;
        });
    }

    saveCurrent(f) {
        if (this.totalSum === 100) {
            this.portfolioService.updatePortfolioCurrentAllocation(this.clientId, this.portfolioId, this.allocation).toPromise().then(result => {
                if (result) {
                    this.translate.get(['PORTFOLIO_ALLOCATION.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        Swal('Success', i18text['PORTFOLIO_ALLOCATION.POPUP.SUCCESS'], 'success');
                    });
                    this.dataSharing.changeMessage('portfolio_detail');
                    if (this.isEditableRoute) {
                        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details', 'edit']);
                    } else {
                        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details']);
                    }
                }
            }).catch(errorResponse => {
                Swal('Error', errorResponse.error.errorMessage, 'error');
            });
        } else {
            this.translate.get(['PORTFOLIO_ALLOCATION.POPUP.ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Error', i18text['PORTFOLIO_ALLOCATION.POPUP.ALERT'], 'error');
            });
        }
    }

    toggle() {
        $('#moreDetai').toggle();
    }

    back() {
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
