import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, getPortfolioPayload, getGraphColours } from '../../../../shared/app.reducer';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { PortfolioService, PlanningService } from '../../../service';
import { PageTitleService } from '../../../../shared/page-title';
import { SettingService } from '../../../../setting/service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Angulartics2 } from 'angulartics2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PORTFOLIO_ALLOCATION_VIEW_BY, ASSETS_CLASS_OPTIONS } from '../../../../shared/constants';

@Component({
    selector: 'app-portfolio-details',
    templateUrl: './portfolio-details.component.html',
    styleUrls: ['./portfolio-details.component.css']
})

export class PortfolioDetailsComponent implements OnInit, OnDestroy {
    clientId;
    goalId;
    portfolioId;
    isEditableRoute;
    currentCashPercent = 0;
    isEditAllocationAllowed = false;
    allocationResponse;
    portfolioDetailResponse;
    portfoliosLoaded = false;
    allocationsLoaded = false;
    currentPage = 'details';
    public timeHorizons = [];
    public selectedTimeHorizon = {};
    public portfolioDetail = {
        suitabilityScore: null,
        suitabilityBand: '',
        constraints: 'No constraints identified for this portfolio.',
        timeHorizon: null,
        decisionMaker: null
    };
    totalInvestment;
    investmentPolicies = [];
    suitabilityBands = [];
    chartColour = ['#79a8ff', '#69cbe9', '#dddddd', '#dede46', '#56deac', '#ff44a7', '#c779fe'];
    recommendedScore = 0;
    PjmLimitingFactors = {};
    permissions;
    linkedGoal = [];
    linkedAccount = [];
    profiler = false;
    accessRights = {};
    advisor = false;
    timeHorizoneDetail = '';
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private _location: Location,
        private route: ActivatedRoute,
        private portfolioService: PortfolioService,
        private planningService: PlanningService,
        private dataSharing: RefreshDataService,
        private pageTitleService: PageTitleService,
        private settingService: SettingService,
        private store: Store<AppState>,
        private accessRightService: AccessRightService,
        private ngxPermissionsService: NgxPermissionsService,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'portFolioDetails' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PORTFOLIO_DETAILS_TITLE');
        this.isEditableRoute = this.router.url.includes('/details/edit') ? true : false;
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
        });
        this.timeHorizons.push({ id: 0, description: 'Less than 1 year' });
        for (let i = 1; i < 21; i++) {
            this.timeHorizons.push(
                { id: i, description: i + ' Years' }
            );
        }
        this.timeHorizons.push(
            { id: 999, description: 'More than 20 years' }
        );
    }

    ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.chartColour = res['allGraphColours'];
                this.getInvestmentPolicies();
            }
        });
        this.accessRightService.getAccess(['CURRSCENARIO', 'RISKTOLERCLIENT', 'CLI02', 'CLI05']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.permissions = this.ngxPermissionsService.getPermissions();
        if (this.permissions.hasOwnProperty('PROFILER')) {
            this.profiler = true;
        } else if (this.permissions.hasOwnProperty('ADVISOR')) {
            this.advisor = true;
        }
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            const str = '/' + this.portfolioId + '/details';
            if (this.router.url.indexOf(str) > 0) {
                this.getAllocationChartDetails();
            }
        });
    }

    getPortfolioDetails() {
        this.getPortfolioById();
        this.getAllocationChartDetails();
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message === 'portfolio_detail') {
                this.getAllocationChartDetails();
                this.getPortfolioById();
                this.dataSharing.changeMessage('default message');
            }
        });
    }

    getInvestmentPolicies() {
        this.settingService.getInvestmentPolicies(this.clientId).toPromise().then(response => {
            this.suitabilityBands = response;
            this.investmentPolicies = [];
            response.forEach((investment, index) => {
                let percent = investment.suitabiliyHigh - investment.suitabilityLow;
                if (index !== 0) {
                    percent++;
                }
                this.investmentPolicies.push({
                    ...investment,
                    name: investment.description,
                    colour: this.chartColour[index],
                    percent: percent
                });
            });
            this.getPortfolioDetails();
        }).catch(() => {
            this.investmentPolicies = [
                {
                    name: 'All income',
                    colour: this.chartColour[0],
                    percent: 22
                },
                {
                    name: 'Income',
                    colour: this.chartColour[1],
                    percent: 10
                },
                {
                    name: 'Income and growth',
                    colour: this.chartColour[2],
                    percent: 10
                },
                {
                    name: 'Balanced',
                    colour: this.chartColour[3],
                    percent: 13
                },
                {
                    name: 'Growth and Income',
                    colour: this.chartColour[4],
                    percent: 13
                },
                {
                    name: 'Growth',
                    colour: this.chartColour[5],
                    percent: 10
                },
                {
                    name: 'All Equity',
                    colour: this.chartColour[6],
                    percent: 22
                }
            ];
            this.getPortfolioDetails();
        });
    }

    switchPortfolio(emitedObject) {
        this.portfolioId = emitedObject['portfolioId'];
        this.getPortfolioById();
        this.getAllocationChartDetails();
        if (this.isEditableRoute) {
            this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details', 'edit']);
        } else {
            this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details']);
        }
    }

    getAllocationChartDetails() {
        this.currentPage = '';
        const payload = {
            isSpecifiedPortfolio: true,
            portfolioId: this.portfolioId,
            view: PORTFOLIO_ALLOCATION_VIEW_BY['CURRENT_VS_TARGET']['value'],
            assetCategory: ASSETS_CLASS_OPTIONS['DETAIL']
        };
        this.portfolioService.getAllocationDetails(this.clientId, payload).toPromise().then(response => {
            this.currentPage = 'details';
            this.allocationResponse = response;
            this.allocationsLoaded = true;
            this.getCashPercent(response);
            this.checkPortfolioAccountsHoldingsForAllCash();
        }).catch(errorResponse => {
            this.allocationsLoaded = false;
        });
    }

    getCashPercent(allocationResponse) {
        // tslint:disable-next-line:triple-equals
        const cashIndex = allocationResponse.allocations.findIndex(a => a.allocType == 1);
        this.currentCashPercent = allocationResponse.allocations[cashIndex].currentPercent;
    }

    getPortfolioById() {
        // this.portfolioService.getSuitabilityBandPjm(this.portfolioId).toPromise().then(res => {
        //     this.recommendedScore = res.score;
        //     this.PjmLimitingFactors = res.limitingFactors;
        // });

        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result.hasOwnProperty('portfolios') && result['portfolios'].length > 0 && (result.hasOwnProperty('clientId') && result['clientId'] === this.clientId)) {
                const portfolioData = result['portfolios'];
                const portfolioIndex = result['idMapping'][this.portfolioId];
                this.portfolioDetailResponse = portfolioData[portfolioIndex];
                if (portfolioIndex === -1 || portfolioIndex === undefined) {
                    return;
                }
                this.recommendedScore = this.portfolioDetailResponse['pjmResponse']['pjmRecommendedScore'];
                this.PjmLimitingFactors = this.portfolioDetailResponse['pjmResponse']['pjmLimitingFactors'];
                this.linkedAccount = this.portfolioDetailResponse['accountPayloads'];
                this.linkedGoal = this.portfolioDetailResponse['goalPortfolioAllocations'];
                this.goalId = this.linkedGoal.length > 0 ? this.linkedGoal[0]['id'] : '';
                if (this.permissions.hasOwnProperty('PROFILER')) {
                    const timeHorizonValue = this.portfolioDetailResponse.timeHorizonYears;
                    this.selectedTimeHorizon = {};

                    let timeHorizonValueString = '';

                    this.translate.get(['PORTFOLIOS.TIME_HORIZON.LESS_THAN_A_YEAR', 'PORTFOLIOS.TIME_HORIZON.MORE_THAN_TWENTY_YEARS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        if (timeHorizonValue === 0) {
                            timeHorizonValueString = i18text['PORTFOLIOS.TIME_HORIZON.LESS_THAN_A_YEAR'];
                        } else if (timeHorizonValue === 99 || timeHorizonValue > 20) {
                            timeHorizonValueString = i18text['PORTFOLIOS.TIME_HORIZON.MORE_THAN_TWENTY_YEARS'];
                        } else {
                            for (let i = 1; i < 21; i++) {
                                if (timeHorizonValue === i) {
                                    timeHorizonValueString = i + ' Years';
                                }
                            }
                        }
                    });

                    if (timeHorizonValueString) {
                        this.selectedTimeHorizon = this.timeHorizons.filter(timeHorizon => timeHorizon.description.trim().toUpperCase() === timeHorizonValueString.trim().toUpperCase())[0];
                        if (!this.selectedTimeHorizon) {
                            this.selectedTimeHorizon = this.timeHorizons[0];
                        }
                    }
                }
                if (this.permissions.hasOwnProperty('ADVISOR')) {
                    this.timeHorizoneDetail = this.portfolioDetailResponse.timeHorizon;
                }
                if (this.profiler) {
                    this.portfolioDetailResponse.suitabilityBandDetails = this.getSuitabilityBands(this.portfolioDetailResponse.suitabilityScore, 'profiler');
                } else if (this.advisor) {
                    this.getSuitabilityBands(this.portfolioDetailResponse.suitabilityBand, 'advisor');
                }
                this.portfoliosLoaded = true;
                this.portfolioDetail.constraints = this.portfolioDetailResponse.constraints && this.portfolioDetailResponse.constraints !== '' ?
                    this.portfolioDetailResponse.constraints : 'No constraints identified for this portfolio.';
                //     VA->
                //    this.portfolioDetail.suitabilityBand = this.portfolioDetailResponse.suitabilityBand;
            }
        });
    }

    // check every asset in every account linked to the portfolio and if they are all 100% cash
    // then the "Edit Current" button under the allocation chart should be visible.
    checkPortfolioAccountsHoldingsForAllCash() {
        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            this.isEditAllocationAllowed = true;
            this.checkAccountAssetsForCash(result);
        });
    }

    checkAccountAssetsForCash(result) {
        if (result.hasOwnProperty('portfolios') && result['portfolios'].length > 0 && (result.hasOwnProperty('clientId') && result['clientId'] === this.clientId)) {
            const portfolioData = result['portfolios'];
            const portfolioIndex = result['idMapping'][this.portfolioId];
            if (portfolioIndex === -1 || portfolioIndex === undefined) {
                return;
            }
            const curPort = portfolioData[portfolioIndex];
            if (curPort === undefined) {
                return;
            }
            if (curPort.accountPayloads === undefined || curPort.accountPayloads.length === 0) {
                return;
            }

            curPort.accountPayloads.forEach(acct => {
                this.planningService.getHoldingsAsset(acct.id, '').toPromise().then(response => {
                    response.assetList.forEach(asset => {
                        if (asset !== undefined && asset.assetsBreakdown !== undefined && asset.assetsBreakdown.length >= 0 && asset.fmv > 0) {
                            asset.assetsBreakdown.forEach(ab => {
                                // if any asset has an asset class of cash that is NOT 100%
                                // then just exit after setting the bool to show the edit button to false
                                if (ab.allocationBreakdownId.endsWith('1') && !ab.allocationBreakdownId.endsWith('11') && ab.allocationPercent !== 100) {
                                    this.isEditAllocationAllowed = false;
                                    return;
                                }
                            });
                        }
                    });
                });
            });
        }
    }

    changeTimeHorizon(event) {
        this.portfolioDetail.timeHorizon = event;
    }

    changeSuitabilityScore(event) {
        this.portfolioDetail.suitabilityScore = event;
    }

    changeSuitabilityBand(event) {
        this.portfolioDetail['suitabilityBandDetails'] = event;
    }

    ChangeDecisionMaker(event) {
        this.portfolioDetail.decisionMaker = event;
    }

    getSuitabilityBands(score, user) {
        if (user === 'profiler') {
            let total = 0;
            for (let i = 0; i < this.investmentPolicies.length; i++) {
                const investment = this.investmentPolicies[i];
                total = total + investment.percent;
                if (score <= total) {
                    return investment;
                }
            }
        } else {
            this.investmentPolicies.forEach(policy => {
                if (policy.description === score) {
                    this.portfolioDetailResponse.suitabilityBandDetails = policy;
                }
            });
        }
        // return suitabilityBands(score);
    }

    changeTotalInvestment(data) {
        this.totalInvestment = data;
    }

    updatePortfolioDetail(isValid) {
        let investorDataPayload = {};
        if (isValid) {
            this.portfolioDetailResponse.ownership.forEach(owner => {
                if (owner.personalDetails.id === this.portfolioDetail.decisionMaker) {
                    owner.decisionMaker = true;
                    investorDataPayload = {
                        invested: this.totalInvestment,
                        decisionMaker: owner.decisionMaker,
                        ownerId: owner.personalDetails.id
                    };
                }
            });
            const portfolioDetail = {
                clientNum: this.clientId,
                id: this.portfolioId,
                suitabilityScore: this.portfolioDetail.suitabilityScore ? this.portfolioDetail.suitabilityScore : this.portfolioDetailResponse.suitabilityScore,
                suitabilityBand: this.portfolioDetail['suitabilityBandDetails']['investmentPolicyId'],
                constraints: this.portfolioDetail.constraints,
                considerations: this.portfolioDetail['considerations'],
                timeHorizon: this.portfolioDetail.timeHorizon ? this.portfolioDetail.timeHorizon.id : this.selectedTimeHorizon['id']
            };
            // this.portfolioDetail.suitabilityBand = this.portfolioDetail.suitabilityBand['investmentPolicyId'];
            this.portfolioService.updateInvestment(this.clientId, this.portfolioId, investorDataPayload).toPromise().then(res => {
                this.portfolioService.updatePortfolioByID(this.clientId, portfolioDetail).toPromise().then(response => {
                    this.portfolioService.getClientPortfolioPayload(this.clientId);
                    this.translate.get(['PORTFOLIOS.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        Swal('Updated', i18text['PORTFOLIOS.POPUP.SUCCESS'], 'success');
                    });
                    this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details']);
                }).catch(errorResponse => {
                    Swal('Oops...', errorResponse.error.errorMessage, 'error');
                });
            }).catch(err => {
                Swal('Oops...', err.error.errorMessage, 'error');
            });
        } else {
            this.translate.get(['PORTFOLIOS.POPUP.ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Oops...', i18text['PORTFOLIOS.POPUP.ALERT'], 'error');
            });
        }
    }

    cancelChanges() {
        this.translate.get([
            'PORTFOLIOS.POPUP.DELETE_TITLE',
            'PORTFOLIOS.POPUP.DELETE_TEXT',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['PORTFOLIOS.POPUP.DELETE_TITLE'],
                text: i18text['PORTFOLIOS.POPUP.DELETE_TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes'
            }).then(result => {
                if (result.value) {
                    this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details']);
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
