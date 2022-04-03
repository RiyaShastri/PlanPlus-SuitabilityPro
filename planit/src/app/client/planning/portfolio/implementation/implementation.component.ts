import * as $ from 'jquery';
import { Location, DecimalPipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { PlanningService } from '../../../service/planning.service';
import { getPortfolioPayload, AppState, getAllCountryFormatePayload, getClientPayload } from '../../../../shared/app.reducer';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { PortfolioService } from '../../../service';
import { PageTitleService } from '../../../../shared/page-title';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { SettingService } from '../../../../setting/service';
import { PORTFOLIO_ALLOCATION_VIEW_BY, ASSETS_CLASS_OPTIONS, RANGE_RADIOBUTTON_OPTIONS } from '../../../../shared/constants';
import * as moment from 'moment';

@Component({
    selector: 'app-implementation',
    templateUrl: './implementation.component.html',
    styleUrls: ['./implementation.component.css']
})
export class ImplementationComponent implements OnInit, OnDestroy {
    clientId;
    goalId;
    portfolioId;
    allocationResponse;
    portfoliosLoaded = false;
    portfolioDetailResponse = {};
    currentPage = 'implementation';
    recommendedSolution = [{ 'description': '', 'low': '', 'high': '' }];
    portfolioImp = {};
    public implSolution = [
        {
            description: 'Custom',
            range: '49 - 58'
        }
    ];
    accessRights = {};
    accountsList = [];
    private unsubscribe$ = new Subject<void>();
    i18Text = {};
    saveDisable = false;
    cancelDisable = false;
    currency = 'CAD';
    isCustomSolution = false;
    suitabilityBands = [];
    growth = 0;
    currentCashPercent = 0;
    isReviewedCount = 0;
    CUSTOM = RANGE_RADIOBUTTON_OPTIONS.CUSTOM;
    selectedAccounts = [];
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private planningService: PlanningService,
        private portfolioService: PortfolioService,
        private store: Store<AppState>,
        private dataSharing: RefreshDataService,
        private pageTitleService: PageTitleService,
        private _location: Location,
        private angulartics2: Angulartics2,
        private accessRightService: AccessRightService,
        private translateService: TranslateService,
        private settingService: SettingService,
        private dp: DecimalPipe
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioImplementation' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.IMPLEMENTATION_TITLE');
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
        });
    }

    ngOnInit() {
        this.onInitialization();
    }

    onInitialization() {
        this.portfolioDetailResponse = {};
        this.translateService.stream([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'PORTFOLIO.IMPLEMENTATION.POPUP.IMPLEMENTATED_PRODUCTS_UPDATED',
            'PORTFOLIO.IMPLEMENTATION.CONSIDERATION_TEXT',
            'ALERT_MESSAGE.OOPS_TEXT',
            'PORTFOLIOS.POPUP.DELETE_TITLE',
            'PORTFOLIOS.POPUP.DELETE_TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'PORTFOLIO.IMPLEMENTATION.CUSTOM'
        ]).subscribe(text => {
            this.i18Text = text;
            this.portfolioImp['considerations'] = this.i18Text['PORTFOLIO.IMPLEMENTATION.CONSIDERATION_TEXT'];
            if (this.portfolioDetailResponse['considerations'] && this.portfolioDetailResponse['considerations'] !== '') {
                this.portfolioImp['considerations'] = this.portfolioDetailResponse['considerations'];
            }
        });
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            const allCountryData = data;
            if (allCountryData) {
                this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                    const clientData = res;
                    if (clientData && clientData['planningCountry']) {
                        this.currency = allCountryData[clientData['planningCountry']]['currencyCode'];
                    }
                });
            }
        });
        this.planningService.getRedirectToImplementation().pipe(takeUntil(this.unsubscribe$)).subscribe(response => {
            let id = '#account';
            if (response && response['custom']) {
                id = '#custom';
                this.isCustomSolution = true;
                if (this.accountsList) {
                    this.accountsList.forEach(account => {
                        account.customSolutionApplied = true;
                    });
                }
                this.recommendedSolution[0]['description'] = this.i18Text['PORTFOLIO.IMPLEMENTATION.CUSTOM'];
            }
            setTimeout(() => {
                $(window).scrollTop($(id).offset().top);
            }, 200);
        });
        this.getPortfolioById();
        this.getAllocationChartDetails();
        this.getRecommendedSolution();
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message === 'change_implemented_solution') {
                this.getRecommendedSolution();
                this.getAllocationChartDetails();
                this.dataSharing.changeMessage('default message');
            }
            if (message === 'added_custom_product') {
                this.isCustomSolution = true;
                this.dataSharing.selectedAccounts.pipe(takeUntil(this.unsubscribe$)).subscribe(selectedAccounts => {
                    this.selectedAccounts = JSON.parse(selectedAccounts);
                });
            }
        });

        this.accessRightService.getAccess(['IMPL_QUESTION', 'CLI07', 'FFS01', 'SRI01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.accessRights = res;
            }
        });

        this.portfolioService.updatedProductsData.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.saveDisable = false;
                this.accountsList = data['accountsData'];
                const totalImplementation = parseFloat(this.dp.transform(data['totalImplementation'], '1.0-2'));
                const totalCurrent = parseFloat(this.dp.transform(data['totalCurrent'], '1.0-2'));
                this.currency = data['selectedCurrency'];
                this.getAllocationChartDetails(this.accountsList, true);
                const unallocated = parseFloat(this.dp.transform(totalCurrent - totalImplementation, '1.0-2'));
                if (unallocated !== parseFloat(this.dp.transform(0, '1.0-2'))) {
                    this.saveDisable = true;
                }
            }
        });
    }

    getRecommendedSolution() {
        this.portfolioService.getRecommendedSolution(this.portfolioId).toPromise().then(data => {
            const implementedSolutions = <any>data;
            if (implementedSolutions.length > 0) {
                this.recommendedSolution = implementedSolutions;
                const index = this.recommendedSolution.findIndex(x => (x['solutionId']).toLowerCase() === (this.CUSTOM).toLowerCase());
                if (index > -1) {
                    this.isCustomSolution = true;
                }
            }
        }).catch(errorResponse => { });
    }

    displaySolutionRangeWarning() {
        return ((this.recommendedSolution[0]['low'] !== '' && this.recommendedSolution[0]['high'] !== '')
            && (this.portfolioDetailResponse['suitabilityScore'] < this.recommendedSolution[0]['low'] || this.portfolioDetailResponse['suitabilityScore'] > this.recommendedSolution[0]['high']));
    }

    getPortfolioById() {
        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(async result => {
            if (result.hasOwnProperty('portfolios') && result['portfolios'].length > 0 && (result.hasOwnProperty('clientId') && result['clientId'] === this.clientId)) {
                await this.settingService.getInvestmentPolicies(this.clientId).toPromise().then(response => {
                    this.suitabilityBands = response;
                }).catch(err => { });
                const portfolioData = result['portfolios'];
                const portfolioIndex = result['idMapping'][this.portfolioId];
                this.portfolioDetailResponse = portfolioData[portfolioIndex];
                if (this.portfolioDetailResponse['considerations'] !== '') {
                    this.portfolioImp['considerations'] = this.portfolioDetailResponse['considerations'];
                }
                if (portfolioIndex === -1 || portfolioIndex === undefined) {
                    return;
                }
                if (this.suitabilityBands.length > 0 && this.portfolioDetailResponse['suitabilityBand']) {
                    // tslint:disable-next-line:max-line-length
                    this.portfolioDetailResponse['suitabilityBandDetails'] = this.suitabilityBands.find(x => (x.description).toLowerCase() === (this.portfolioDetailResponse['suitabilityBand']).toLowerCase());
                }
                const linkedGoal = this.portfolioDetailResponse['goalPortfolioAllocations'];
                this.goalId = (linkedGoal && linkedGoal.length > 0) ? linkedGoal[0]['id'] : '';
                this.portfoliosLoaded = true;
                const today = moment(new Date()).format('YYYY-MM-DD');
                const diff = moment(this.portfolioDetailResponse['questionReviewedDate']).diff(today, 'months');
                this.isReviewedCount = Math.abs(diff);
                if (this.portfolioDetailResponse.hasOwnProperty('questionReviewed') && !this.portfolioDetailResponse['questionReviewed']) {
                    if (this.accessRights['IMPL_QUESTION'] && this.accessRights['IMPL_QUESTION']['accessLevel'] > 0) {
                        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'implementation', 'edit-questions']);
                    }
                }
            }
        });
    }

    getAllocationChartDetails(selectedAccounts = [], callRiskRangesAPI = false) {
        let newGrowth = 0;
        const payload = {
            isSpecifiedPortfolio: true,
            portfolioId: this.portfolioId,
            view: PORTFOLIO_ALLOCATION_VIEW_BY['CURRENT_VS_TARGET_VS_IMPLEMENTED']['value'],
            assetCategory: ASSETS_CLASS_OPTIONS['DETAIL'],
            currencyCode: this.currency,
            accountDetails: selectedAccounts
        };
        this.portfolioService.getAllocationDetails(this.clientId, payload).toPromise().then(response => {
            this.currentPage = 'implementation';
            this.allocationResponse = response;
            const cashIndex = this.allocationResponse.allocations.findIndex(a => a.allocType === 1);
            this.currentCashPercent = this.allocationResponse.allocations[cashIndex].currentPercent;
            this.allocationResponse.allocations[0]['implementedTotal'] = 0;
            this.allocationResponse.allocations.forEach((alloc) => {
                if (alloc['portfolioAssetAllocationProductDetails']) {
                    alloc['productTotal'] = alloc['portfolioAssetAllocationProductDetails'].reduce((sum, item) => sum + parseFloat(item.allocated), 0);
                }
                if (alloc['allocType'] === 2) {
                    newGrowth += alloc['implementedPercent'];
                }
                this.allocationResponse.allocations[0]['implementedTotal'] += parseFloat(this.dp.transform(alloc.implementedPercent, '1.0-1'));
            });
            if (callRiskRangesAPI && newGrowth !== this.growth) {
                this.growth = newGrowth;
                this.settingService.riskRanges(parseFloat(this.dp.transform(this.growth, '1.0-0'))).toPromise().then(res => {
                    if (res) {
                        this.recommendedSolution[0].low = res['okRangeLow'];
                        this.recommendedSolution[0].high = res['okRangeHi'];
                    }
                }).catch(err => { });
            }
        }).catch(errorResponse => { });
    }

    switchPortfolio(emitedObject) {
        this.portfolioId = emitedObject['portfolioId'];
        this.getPortfolioById();
        this.getAllocationChartDetails();
        this.getRecommendedSolution();
        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'implementation']);
    }

    updatePortfolioDetail(f: NgForm) {
        this.saveDisable = true;
        const portfolioDetail = {
            clientNum: this.clientId,
            id: this.portfolioId,
            constraints: this.portfolioDetailResponse['constraints'],
            considerations: this.portfolioImp['considerations'],
            suitabilityScore: this.portfolioDetailResponse['suitabilityScore'],
            suitabilityBand: this.portfolioDetailResponse['suitabilityBandDetails'] ? this.portfolioDetailResponse['suitabilityBandDetails']['investmentPolicyId'] : '',
            timeHorizon: this.portfolioDetailResponse['timeHorizonYears']
        };
        this.portfolioService.updatePortfolioByID(this.clientId, portfolioDetail).toPromise().then(result => {
            this.portfolioService.getClientPortfolioPayload(this.clientId);
            if (this.accessRights['CLI07']['accessLevel'] > 0 && this.accountsList.length > 0) {
                if (this.isCustomSolution) {
                    this.accountsList.forEach(account => {
                        account.customSolutionApplied = true;
                    });
                }
                this.portfolioService.saveImplementedProductsData(this.clientId, this.portfolioId, this.accountsList).toPromise().then(res => {
                    this.dataSharing.changeMessage('refresh_implementation_accounts');
                    Swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.IMPLEMENTATED_PRODUCTS_UPDATED'], 'success');
                    this.saveDisable = false;
                }).catch(err => {
                    Swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    this.saveDisable = false;
                });
            } else {
                Swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.IMPLEMENTATED_PRODUCTS_UPDATED'], 'success');
                this.saveDisable = false;
            }
        }).catch(errResponse => {
            Swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errResponse.error.errorMessage, 'error');
            this.saveDisable = false;
        });
    }

    changeSolutionAction(index) {
        if ($('#dropdownSolutionAction' + index).is(':visible')) {
            $('.dropdown-solution-action').hide();
        } else {
            $('.dropdown-solution-action').hide();
            $('#dropdownSolutionAction' + index).toggle();
        }
    }

    cancelChanges() {
        Swal({
            title: this.i18Text['PORTFOLIOS.POPUP.DELETE_TITLE'],
            text: this.i18Text['PORTFOLIOS.POPUP.DELETE_TEXT'],
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.i18Text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT']
        }).then(result => {
            if (result.value) {
                const clientId = this.clientId;
                this.clientId = '';
                setTimeout(() => {
                    this.clientId = clientId;
                    this.onInitialization();
                    this.dataSharing.changeMessage('empty_seletcted_accounts_array');
                }, 10);
            }
            this.cancelDisable = false;
        });
    }

    navigateToSolutionInfo(link) {
        let url = '';
        if (!/^http[s]?:\/\//.test(link)) {
            url += 'http://';
        }
        url += link;
        window.open(url, '_blank');
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
