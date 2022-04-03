import { NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import { slideInOutAnimation } from '../../../../shared/animations';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { PortfolioService } from '../../../service';
import { pieChartArray } from '../../../client-models/portfolio-charts';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Store } from '@ngrx/store';
import { AppState, getGraphColours, getAdvisorPayload } from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { SettingService } from '../../../../setting/service';
import { PageTitleService } from '../../../../shared/page-title';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PORTFOLIO_ALLOCATION_VIEW_BY, ASSETS_CLASS_OPTIONS } from '../../../../shared/constants';

@Component({
    selector: 'app-edit-policy',
    templateUrl: './edit-policy.component.html',
    styleUrls: ['./edit-policy.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class EditPolicyComponent implements OnInit, OnDestroy {
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
    clientId;
    portfolioId;
    private policyChart: AmChart = {};
    totalBreakDown = 0;
    chartColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];
    public targetExist = false;
    isEditableRoute;
    accessRights = {};
    isInvestmentPolicies;
    investmentId;
    investmentPolicyObj = {};
    allInvestmentPolicyData;
    isAddPolicy = false;
    assetsBreakdown;
    isDetailExpand;
    isfeesCosts = false;
    IsAccessRight = true;
    isTargetPercentValid = false;
    allowAdvisor = false;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private dp: DecimalPipe,
        private _location: Location,
        private route: ActivatedRoute,
        private AmCharts: AmChartsService,
        public translate: TranslateService,
        private dataSharing: RefreshDataService,
        private accessRightService: AccessRightService,
        private portfolioService: PortfolioService,
        private ngxPermissionsService: NgxPermissionsService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private settingService: SettingService,
        private pageTitleService: PageTitleService,
    ) {
        this.angulartics2.eventTrack.next({ action: 'editPolicySidepanel' });
        this.isEditableRoute = this.router.url.includes('/details/edit/') ? true : false;
        this.isInvestmentPolicies = this.router.url.includes('/settings/investment-policies/') ? true : false;
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.investmentId = params['investmentId'];
        });
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('edit_indiviual_investment_policy')) {
                const data = JSON.parse(message.replace('edit_indiviual_investment_policy|', ''));
                if (data) {
                    this.allInvestmentPolicyData = JSON.parse(JSON.stringify(data));
                    this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_POLICY');
                    setTimeout(() => {
                        this.setInvestmentPolicyData(JSON.parse(JSON.stringify(data)));
                    }, 100);
                }
            }
            if (message.includes('Add_New_Investment_Policy')) {
                const addData = JSON.parse(message.replace('Add_New_Investment_Policy|', ''));
                if (addData) {
                    this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_POLICY_SIDE_PANEL');
                    this.isAddPolicy = true;
                    this.allInvestmentPolicyData = JSON.parse(JSON.stringify(addData));
                    this.addPolicyData();
                }
            }
        });
    }
    ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.chartColors = res['allGraphColours'];
            }
        });
        this.accessRightService.getAccess(['EHILO','CMAINCDIST', 'CMAINCDISTEDIT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        if (!this.isInvestmentPolicies) {
            this.setPortfolioData();
        }
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    addPolicyData() {
        this.settingService.getAssetsListByCountryCode().toPromise().then(allAssets => {
            this.setAssetsListArray(JSON.parse(JSON.stringify(allAssets)));
        });
    }

    setAssetsListArray(assets) {
        const assetsArray = [];
        assets.forEach(asset => {
            assetsArray.push({
                assetClassDescription: asset.description,
                country: asset.country,
                assetClassId: asset.assetClass,
                displayOrder: asset.displayOrder,
                ssid: asset.ssid,
                targetPercent: asset.percentage,
                targetMin: 0,
                targetMax: 100
            });
        }, this);
        this.setAddPolicyPayload(JSON.parse(JSON.stringify(assetsArray)));
    }

    setAddPolicyPayload(addPayload) {
        const addPolicyObj = {
            'investmentPolicyId': 'add' + (this.allInvestmentPolicyData.investmentTargetPolicyDTO.length),
            'description': '',
            'portnum': 0,
            'defaultInvestmentPayloads': JSON.parse(JSON.stringify(addPayload)),
            'riskReturn': 0,
            'risk': 0,
            'sharpe': 0,
            'total': 0,
            'lowRange': 0,
            'highRange': 0,
            'yourLowRange': 0,
            'yourHighRange': 0,
            'incomeDistributions': [
                {
                    'id': 'Interest',
                    'percent': 0,
                    'displayOrder': 0
                },
                {
                    'id': 'Dividend',
                    'percent': 0,
                    'displayOrder': 1
                },
                {
                    'id': 'Deferred capital gains',
                    'percent': 0,
                    'displayOrder': 2
                },
                {
                    'id': 'Realized capital gains',
                    'percent': 0,
                    'displayOrder': 3
                },
                {
                    'id': 'Non-taxable',
                    'percent': 0,
                    'displayOrder': 4
                }
            ]
        };
        this.setInvestmentPolicyData(JSON.parse(JSON.stringify(addPolicyObj)));
    }

    async setInvestmentPolicyData(response) {
        let policyData;
        if (this.isAddPolicy && !this.investmentId) {
            policyData = response;
        } else if (this.investmentId) {
            policyData = response.investmentTargetPolicyDTO.find(x => x.investmentPolicyId === this.investmentId);
        }
        this.investmentPolicyObj = JSON.parse(JSON.stringify(policyData));
        await this.setInvestmentPayload(JSON.stringify(policyData));
    }

    setInvestmentPayload(policy) {
        const dataProvider = [];
        const policyData = JSON.parse(policy);
        // this.allInvestmentPolicyData = JSON.parse(JSON.stringify(policyData));
        this.assetsBreakdown = {
            'description': policyData.description,
            'allocations': policyData.defaultInvestmentPayloads,
            'targetSummary': {
                rateOfReturn: policyData.riskReturn,
                risk: policyData.risk,
                sharpeRatio: policyData.sharpe,
                incomeDistribution: policyData.incomeDistributions
            }
        };
        this.assetsBreakdown.allocations.forEach(alloc => {
            alloc.id = alloc.assetClassId;
        }, this);
        this.assetsBreakdown.allocations.forEach(element => {
            if (element.targetPercent > 0) {
                this.targetExist = true;
            }
            this.translate.get(['SSID_LABELS.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                dataProvider.push({ category: res['SSID_LABELS.' + element.ssid], targetPercent: this.dp.transform(element.targetPercent, '1.1-2') });
            });
        }, this);
        this.totalAllocation();
        setTimeout(() => {
            this.drawGraph(dataProvider);
        }, 200);
        for (const allocation of this.assetsBreakdown.allocations) {
            if (allocation.targetMaxPolicy < allocation.targetPercent || allocation.targetPercent < allocation.targetMinPolicy) {
                this.isTargetPercentValid = false;
                break;
            } else {
                this.isTargetPercentValid = true;
            }
        }
    }

    setPortfolioData() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_POLICY');
        const permissions = this.ngxPermissionsService.getPermissions();
        if (permissions.hasOwnProperty('PROFILER')) {
            this.allowAdvisor = true;
        }
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
        });
        this.getEditPolicyDetail();
    }

    getEditPolicyDetail() {
        const payload = {
            isSpecifiedPortfolio: true,
            portfolioId: this.portfolioId,
            view: PORTFOLIO_ALLOCATION_VIEW_BY['TARGET_POLICY_RANGE']['value'],
            assetCategory: ASSETS_CLASS_OPTIONS['DETAIL']
        };
        this.portfolioService.getAllocationDetails(this.clientId, payload).toPromise().then(result => {
            if (result) {
                this.assetsBreakdown = result;
                this.assetsBreakdown.targetSummary.incomeDistribution.forEach(incomDistri => {
                    incomDistri['percent'] = parseFloat(incomDistri['percent'].toFixed(1));
                });
                this.assetsBreakdown['access'] = true;
                const dataProvider = [];
                this.totalAllocation();
                this.targetExist = false;
                this.assetsBreakdown.allocations.forEach(element => {
                    if (element.targetPercent > 0) {
                        this.targetExist = true;
                    }
                    this.translate.get(['SSID_LABELS.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                        dataProvider.push({ category: res['SSID_LABELS.' + element.ssid], targetPercent: this.dp.transform(element.targetPercent, '1.1-2') });
                    });
                });
                setTimeout(() => {
                    this.drawGraph(dataProvider);
                }, 200);
                for (const allocation of this.assetsBreakdown.allocations) {
                    if (allocation.targetMaxPolicy < allocation.targetPercent || allocation.targetPercent < allocation.targetMinPolicy) {
                        this.isTargetPercentValid = false;
                        break;
                    } else {
                        this.isTargetPercentValid = true;
                    }
                }
            }
        }).catch(errorResponse => { });
    }
    drawGraph(dataProvider) {
        const chartArray = {
            ...pieChartArray,
            balloonText: '[[category]] [[targetPercent]]%',
            dataProvider: dataProvider,
            titleField: 'category',
            valueField: 'targetPercent',
            colors: this.chartColors,
            allLabels: [
                {
                    text: 'Return ' + this.assetsBreakdown.targetSummary.rateOfReturn + '%',
                    align: 'center',
                    bold: true,
                    size: 12,
                    color: '#345',
                    y: 80,
                    id: 'text1'
                },
                {
                    text: 'Risk ' + this.assetsBreakdown.targetSummary.risk + '%',
                    align: 'center',
                    bold: true,
                    y: 100,
                    color: '#345',
                    size: 12,
                    id: 'text2'
                }]
        };
        this.policyChart = this.AmCharts.makeChart('chartdiv', chartArray);
    }

    back() {
        this._location.back();
    }

    savePolicy(form: NgForm) {
        if (this.isInvestmentPolicies) {
            this.investmentPolicyObj = {
                ...this.investmentPolicyObj,
                description: this.assetsBreakdown['description'],
                defaultInvestmentPayloads: this.assetsBreakdown['allocations'],
                riskReturn: this.assetsBreakdown['targetSummary'].rateOfReturn,
                risk: this.assetsBreakdown['targetSummary'].risk,
                sharpe: this.assetsBreakdown['targetSummary'].sharpeRatio,
                total: this.totalBreakDown,
            };
            let obj;
            if (this.isAddPolicy) {
                this.allInvestmentPolicyData['investmentTargetPolicyDTO'].push(this.investmentPolicyObj);
                obj = JSON.parse(JSON.stringify(this.allInvestmentPolicyData));
            } else {
                const index = this.allInvestmentPolicyData['investmentTargetPolicyDTO'].findIndex(x => x.investmentPolicyId === this.investmentId);
                this.allInvestmentPolicyData['investmentTargetPolicyDTO'].splice(index, 1, this.investmentPolicyObj);
                obj = JSON.parse(JSON.stringify(this.allInvestmentPolicyData));
            }
            this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'PORTFOLIO.EDIT_POLICY.SAVE_MESSAGE'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    this.dataSharing.changeMessage('individual_policy_added|' + JSON.stringify(obj));
                    this.back();
                    Swal(res['ALERT_MESSAGE.SUCCESS_TITLE'], res['PORTFOLIO.EDIT_POLICY.SAVE_MESSAGE'], 'success');
                });
        } else {
            this.portfolioService.saveEditPolicy(this.clientId, this.portfolioId, this.assetsBreakdown)
                .toPromise().then(result => {
                    if (result) {
                        this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'PORTFOLIO.EDIT_POLICY.SAVE_MESSAGE'])
                            .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                                this.dataSharing.changeMessage('portfolio_detail');
                                if (this.isEditableRoute) {
                                    this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details', 'edit']);
                                } else {
                                    this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details']);
                                }
                                Swal(res['ALERT_MESSAGE.SUCCESS_TITLE'], res['PORTFOLIO.EDIT_POLICY.SAVE_MESSAGE'], 'success');
                            });
                    }
                }).catch(errorResponse => {
                    Swal('Error', errorResponse.error.errorMessgae, 'error');
                });
        }
    }


    updateGraph(event: any) {
        // for calculating amount
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 || event.keyCode === 46) {
            let sum = 0;
            const filterdAssetsBreakdown = this.assetsBreakdown.allocations.filter(result => result.displayOrder !== 1);
            filterdAssetsBreakdown.forEach(element => {
                sum = (sum + element.targetPercent);
            });
            if (event > 0 && sum < 100) {
                this.assetsBreakdown.allocations[0].targetPercent = (this.assetsBreakdown.allocations[0].targetPercent - event);
                this.assetsBreakdown.allocations[0].targetPercent = 100 - sum;
            } else if (sum <= 100) {
                this.assetsBreakdown.allocations[0].targetPercent = 100 - sum;
            }
            this.totalAllocation();
            const dataProvider = [];
            this.targetExist = false;
            this.assetsBreakdown.allocations.forEach(element => {
                if (element.targetPercent > 0) {
                    this.targetExist = true;
                }
                this.translate.get(['SSID_LABELS.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    dataProvider.push({ category: res['SSID_LABELS.' + element.ssid], targetPercent: this.dp.transform(element.targetPercent, '1.1-2') });
                });
            });
            setTimeout(() => {
                this.drawGraph(dataProvider);
            }, 100);
        }
    }

    totalAllocation() {
        this.totalBreakDown = 0;
        this.assetsBreakdown.allocations.forEach(item => {
            this.totalBreakDown = parseFloat((this.totalBreakDown + item.targetPercent).toFixed(1));
        });
    }

    checkConditionForMinMax(event, data) {
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 || event.keyCode === 46) {
            if (data.targetMaxPolicy < data.targetPercent || data.targetPercent < data.targetMinPolicy) {
                return this.isTargetPercentValid = false;
            } else if (data.targetMaxPolicy >= data.targetPercent || data.targetPercent >= data.targetMinPolicy) {
                return this.isTargetPercentValid = true;
            }
        }
    }

    toggle() {
        $('#moreDetai').toggle();
    }

}
