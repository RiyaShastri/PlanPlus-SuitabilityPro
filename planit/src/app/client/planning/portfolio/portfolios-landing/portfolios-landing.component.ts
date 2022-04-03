import * as $ from 'jquery';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from '../../../service';
import { riskScoreBadge } from '../../../client-models';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppState, getPortfolioPayload, getClientPayload, getGraphColours } from '../../../../shared/app.reducer';
import { PageTitleService } from '../../../../shared/page-title';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { Angulartics2 } from 'angulartics2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PORTFOLIO_ALLOCATION_TYPE, PORTFOLIO_ALLOCATION_VIEW_BY } from '../../../../shared/constants';

@Component({
    selector: 'app-portfolios-landing',
    templateUrl: './portfolios-landing.component.html',
    styleUrls: ['./portfolios-landing.component.css'],
    providers: [NgbTooltipConfig]
})

export class PortfoliosLandingComponent implements OnInit, OnDestroy {
    error;
    clientId;
    isTile = false;
    isCollapsed = true;
    portfoliosData = [];
    allocationsData = [];
    investmentSummary = [];
    noAllocationData = false;
    warningsExist = false;
    portfoliosDropDownArr = [];
    showCurrent = false; showTarget = false; showImplemented = false;
    summary = { 'current': {}, 'target': {}, 'implemented': {} };
    classesOptions = [];
    selectedClass = {};
    moreDetailsArr = ['rateOfReturn', 'risk', 'sharpeRatio', 'fees'];
    viewBy = [];
    selectedViewBy = { id: 0, name: '', value: '', list: [] };
    groupPortfolios = [
        { id: 'AllPortfolios', name: 'All Portfolios', totalInvested: 0, isSpecifiedPortfolio: false },
        // { id: 'AllPersonalPortfolios', name: 'All Personal Portfolios', totalInvested: 0, isSpecifiedPortfolio: false },
        // { id: 'AllCorporatePortfolios', name: 'All Corporate Portfolios', totalInvested: 0, isSpecifiedPortfolio: false },
        // { id: 'OtherPortfolios', name: 'Other Portfolios', totalInvested: 0, isSpecifiedPortfolio: false }
    ];
    selectedPortfolio = this.groupPortfolios[0];
    graphColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];
    accessRights = {};
    clientData = {};
    private unsubscribe$ = new Subject<void>();
    portfolioAllocationTypes = PORTFOLIO_ALLOCATION_TYPE;
    i18Text = {};
    defaultViewBy = [];
    filteredViewBy = [];
    allocationViewBy = PORTFOLIO_ALLOCATION_VIEW_BY;
    constructor(
        config: NgbTooltipConfig,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private portfolioService: PortfolioService,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private router: Router
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioLanding' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PORTFOLIO_LIST_TITLE');
    }

    async ngOnInit() {
        this.translate.stream([
            'PORTFOLIO_ALLOCATION.VIEW_BY.CURRENT',
            'PORTFOLIO_ALLOCATION.VIEW_BY.CURRENT_POLICY_RANGE',
            'PORTFOLIO_ALLOCATION.VIEW_BY.TARGET_POLICY_RANGE',
            'PORTFOLIO_ALLOCATION.VIEW_BY.IMPLEMENTED_POLICY_RANGE',
            'PORTFOLIO_ALLOCATION.VIEW_BY.CURRENT_VS_TARGET',
            'PORTFOLIO_ALLOCATION.VIEW_BY.CURRENT_VS_IMPLEMENTED',
            'PORTFOLIO_ALLOCATION.VIEW_BY.TARGET_VS_IMPLEMENTED',
            'PORTFOLIO_ALLOCATION.WARNING.NO_ALLOCATION_DATA'
        ]).subscribe(text => {
            this.i18Text = text;
            this.defaultViewBy = [
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.CURRENT'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT.value, list: [PORTFOLIO_ALLOCATION_TYPE.CURRENT]
                },
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_POLICY_RANGE.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.CURRENT_POLICY_RANGE'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_POLICY_RANGE.value, list: [PORTFOLIO_ALLOCATION_TYPE.CURRENT]
                },
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_POLICY_RANGE.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.TARGET_POLICY_RANGE'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_POLICY_RANGE.value, list: [PORTFOLIO_ALLOCATION_TYPE.TARGET]
                },
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.IMPLEMENTED_POLICY_RANGE.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.IMPLEMENTED_POLICY_RANGE'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.IMPLEMENTED_POLICY_RANGE.value, list: [PORTFOLIO_ALLOCATION_TYPE.IMPLEMENTED]
                },
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_VS_TARGET.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.CURRENT_VS_TARGET'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_VS_TARGET.value, list: [PORTFOLIO_ALLOCATION_TYPE.CURRENT, PORTFOLIO_ALLOCATION_TYPE.TARGET]
                },
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_VS_IMPLEMENTED.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.CURRENT_VS_IMPLEMENTED'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_VS_IMPLEMENTED.value, list: [PORTFOLIO_ALLOCATION_TYPE.CURRENT, PORTFOLIO_ALLOCATION_TYPE.IMPLEMENTED]
                },
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_VS_IMPLEMENTED.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.TARGET_VS_IMPLEMENTED'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_VS_IMPLEMENTED.value, list: [PORTFOLIO_ALLOCATION_TYPE.TARGET, PORTFOLIO_ALLOCATION_TYPE.IMPLEMENTED]
                }
            ];

            this.filteredViewBy = [
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_POLICY_RANGE.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.TARGET_POLICY_RANGE'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_POLICY_RANGE.value, list: [PORTFOLIO_ALLOCATION_TYPE.TARGET]
                },
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.IMPLEMENTED_POLICY_RANGE.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.IMPLEMENTED_POLICY_RANGE'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.IMPLEMENTED_POLICY_RANGE.value, list: [PORTFOLIO_ALLOCATION_TYPE.IMPLEMENTED]
                },
                {
                    id: PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_VS_IMPLEMENTED.id, name: this.i18Text['PORTFOLIO_ALLOCATION.VIEW_BY.TARGET_VS_IMPLEMENTED'],
                    value: PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_VS_IMPLEMENTED.value, list: [PORTFOLIO_ALLOCATION_TYPE.TARGET, PORTFOLIO_ALLOCATION_TYPE.IMPLEMENTED]
                }
            ];

            this.viewBy = this.defaultViewBy;
        });
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.graphColors = res['allGraphColours'];
            }
        });
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            if (this.router.url.includes('/planning/portfolios')) {
                this.getAllocationData();
            }
        });
        this.accessRightService.getAccess(['POADD', 'CURRSCENARIO','CMAINCDIST', 'CMAINCDISTEDIT']).pipe(takeUntil(this.unsubscribe$)).subscribe(async res => {
            if (res) {
                this.accessRights = res;
                if (this.accessRights.hasOwnProperty('CURRSCENARIO')
                    && this.accessRights['CURRSCENARIO'].hasOwnProperty('accessLevel')
                    && this.accessRights['CURRSCENARIO'].hasOwnProperty('id')
                    && this.accessRights['CURRSCENARIO']['id'] !== '') {
                    await this.setViewByDropdown();
                } else {
                    if (this.accessRights === null
                        || this.accessRights.hasOwnProperty('CURRSCENARIO') === false
                        || this.accessRights['CURRSCENARIO'].hasOwnProperty('accessLevel') === false
                        || this.accessRights['CURRSCENARIO'].hasOwnProperty('id') === false
                        || this.accessRights['CURRSCENARIO']['id'] === '') {    // should not be empty
                        // async call a function to wait for accessRight ready
                        await this.startAsync();
                    }
                }
                this.getAllData();
            }
        });
    }

    getAllData() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData && clientData.hasOwnProperty('planningCountry')) {
                this.clientData = clientData;
                this.portfolioService.getRollupClassList(this.clientData['planningCountry']).toPromise().then(res => {
                    this.classesOptions = res;
                    this.selectedClass = this.classesOptions[0];
                    this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
                        if (result.hasOwnProperty('portfolios')) {
                            this.portfoliosData = result['portfolios'];
                            this.getPortfoliosDropdown();
                        }
                        if (this.portfoliosData.length > 0 && this.classesOptions.length > 0) {
                            if (this.router.url.indexOf('/planning/portfolios') > 0) {
                                this.getAllocationData();
                            }
                        }
                    });
                });
            }
        });
    }

    getPortfoliosDropdown() {
        this.portfoliosDropDownArr = [];
        this.portfoliosData.forEach(portfolio => {
            this.portfoliosDropDownArr.push({ id: portfolio.id, name: portfolio.description, totalInvested: portfolio.totalAssets, isSpecifiedPortfolio: true });
            this.groupPortfolios[0].totalInvested += portfolio.totalAssets;
        });
        this.portfoliosDropDownArr = this.portfoliosDropDownArr.concat(this.groupPortfolios);
        this.selectedPortfolio = this.portfoliosDropDownArr[0];
    }

    getAllocationData() {
        this.summary['current'] = {};
        this.summary['target'] = {};
        this.summary['implemented'] = {};
        this.allocationsData = [];
        this.showCurrent = false; this.showTarget = false; this.showImplemented = false;
        if (this.clientId != null && this.selectedPortfolio && this.selectedViewBy.hasOwnProperty('value')) {
            const payload = {
                isSpecifiedPortfolio: this.selectedPortfolio.isSpecifiedPortfolio,
                portfolioId: this.selectedPortfolio.id,
                view: this.selectedViewBy['value'],
                assetCategory: this.selectedClass['value']
            };
            this.portfolioService.getAllocationDetails(this.clientId, payload)
                .toPromise().then(result => {
                    this.noAllocationData = false;
                    this.allocationsData = result['allocations'];
                    if (result['warnings'] != null) {
                        this.warningsExist = true;
                    } else {
                        this.warningsExist = false;
                    }

                    if (this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT.id
                        || this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_POLICY_RANGE.id
                        || this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_VS_TARGET.id
                        || this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_VS_IMPLEMENTED.id) {
                        this.showCurrent = true;
                        this.summary['current'] = result['currentSummary'] ? result['currentSummary'] : null;

                    }
                    if (this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_POLICY_RANGE.id
                        || this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_VS_TARGET.id
                        || this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_VS_IMPLEMENTED.id) {
                        this.showTarget = true;
                        this.summary['target'] = result['targetSummary'] ? result['targetSummary'] : null;
                    }
                    if (this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.IMPLEMENTED_POLICY_RANGE.id
                        || this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.CURRENT_VS_IMPLEMENTED.id
                        || this.selectedViewBy['id'] === PORTFOLIO_ALLOCATION_VIEW_BY.TARGET_VS_IMPLEMENTED.id) {
                        this.showImplemented = true;
                        this.summary['implemented'] = result['implementedSummary'] ? result['implementedSummary'] : null;
                    }
                    this.allocationsData.forEach(asset => {
                        if (this.showCurrent === true) {
                            if (asset.currentMinPolicy > asset.currentPercent) {
                                asset.currentOutOfRange = ((this.selectedPortfolio.totalInvested * asset.currentMinPolicy) / 100) - asset.currentAmount;
                            } else if (asset.currentMaxPolicy < asset.currentPercent) {
                                asset.currentOutOfRange = ((this.selectedPortfolio.totalInvested * asset.currentMaxPolicy) / 100) - asset.currentAmount;
                            } else {
                                asset.currentOutOfRange = 0;
                            }
                        }
                        if (this.showTarget === true) {
                            if (asset.targetMinPolicy > asset.targetPercent) {
                                asset.targetOutOfRange = ((this.selectedPortfolio.totalInvested * asset.targetMinPolicy) / 100) - asset.targetAmount;
                            } else if (asset.targetMaxPolicy < asset.targetPercent) {
                                asset.targetOutOfRange = ((this.selectedPortfolio.totalInvested * asset.targetMaxPolicy) / 100) - asset.targetAmount;
                            } else {
                                asset.targetOutOfRange = 0;
                            }
                        }
                        if (this.showImplemented === true) {
                            if (asset.implementedMinPolicy > asset.implementedPercent) {
                                asset.implementedOutOfRange = ((this.selectedPortfolio.totalInvested * asset.implementedMinPolicy) / 100) - asset.implementedAmount;
                            } else if (asset.implementedMaxPolicy < asset.implementedPercent) {
                                asset.implementedOutOfRange = ((this.selectedPortfolio.totalInvested * asset.implementedMaxPolicy) / 100) - asset.implementedAmount;
                            } else {
                                asset.implementedOutOfRange = 0;
                            }
                        }
                    });
                    this.getIncomeDistrbution();
                }).catch(errorResponse => {
                    if (errorResponse.error.message) {
                        this.error = errorResponse.error.message;
                    } else {
                        this.error = this.i18Text['PORTFOLIO_ALLOCATION.WARNING.NO_ALLOCATION_DATA'];
                    }
                    this.noAllocationData = true;
                });
        }

    }

    makePositive(number) {
        return Math.abs(number);
    }

    getIncomeDistrbution() {
        this.investmentSummary = [];
        let id = '';
        let len = 0;
        let typeExist = '';
        this.selectedViewBy['list'].forEach(type => {
            if (this.summary[type]) {
                len = this.summary[type]['incomeDistribution'].length;
                typeExist = type;
            }
        });
        for (let i = 0; i < len; i++) {
            const data = {};
            id = this.summary[typeExist]['incomeDistribution'][i]['id'];
            data['id'] = id;
            this.selectedViewBy['list'].forEach(type => {
                data[type + 'Percent'] = this.summary[type] ? this.summary[type]['incomeDistribution'][i]['percent'] : 0;
            });
            this.investmentSummary.push(data);
        }
    }

    getRiskBadge(score) {
        return riskScoreBadge(score).label;
    }

    changeView(value) {
        this.selectedViewBy = value;
        this.getAllocationData();
    }

    changeAssets(value) {
        this.selectedClass = value;
        this.getAllocationData();
    }

    async startAsync() {
        await this.delay(500);
        this.reroute(this);
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reroute(obj: PortfoliosLandingComponent): boolean {
        this.setViewByDropdown();
        if (this.accessRights['CURRSCENARIO']['accessLevel'] < 1
            && this.accessRights['CURRSCENARIO']['id'] !== '') {
            return true;
        } else {
            return false;
        }
    }

    setViewByDropdown() {
        if (this.accessRights['CURRSCENARIO']['accessLevel'] < 1) {
            this.viewBy = this.filteredViewBy;
        } else {
            this.viewBy = this.defaultViewBy;
        }
        this.selectedViewBy = this.viewBy[0];
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
