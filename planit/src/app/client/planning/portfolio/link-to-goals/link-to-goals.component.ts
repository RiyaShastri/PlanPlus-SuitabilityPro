import { Location, getCurrencySymbol } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { slideInOutAnimation } from '../../../../shared/animations';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { PortfolioService, GoalService } from '../../../service';
import {
    AppState,
    getClientPayload,
    getGoalPayload,
} from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-link-to-goals',
    templateUrl: './link-to-goals.component.html',
    styleUrls: ['./link-to-goals.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class LinkToGoalsComponent implements OnInit, OnDestroy {
    clientId;
    goalsList;
    portfolios;
    linkedGoals = {};
    linkedAmount = {};
    totalAllocation = 0;
    totalUnAllocated = 0;
    enablePrev = false;
    enableNext = false;
    inner_table;
    addAccountValueHolder = {};
    clientData = {};
    currency = '$';
    pattern = '';
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private store: Store<AppState>,
        private router: Router,
        private _location: Location,
        private route: ActivatedRoute,
        private refreshDataService: RefreshDataService,
        private portfolioService: PortfolioService,
        private goalsService: GoalService,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.LINK_TO_GOALS');
        this.angulartics2.eventTrack.next({ action: 'portfolioLinkTogoalSidePanel' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });

        if (!this.clientId) {
            this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
            });
        }

        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('add_protFolio_screen|')) {
                this.addAccountValueHolder = JSON.parse(message.replace('add_protFolio_screen|', ''));
            } else {
                this.addAccountValueHolder = {};
            }
        });
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            if (this.currency === '$') {
                this.pattern = '^(\\' + this.currency + '?(\\d+(\\.\\d{1,2})?)%?$)';
            } else {
                this.pattern = '^(' + this.currency + '?(\\d+(\\.\\d{1,2})?)%?$)';
            }
        });
        this.totalAllocation = 0;
        this.totalUnAllocated = 0;
        this.portfolios = [];
        this.store.select(getGoalPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.goalsList = data;
                this.goalsList.forEach(goal => {
                    this.linkedGoals[goal.key] = 0;
                    this.linkedAmount[goal.key] = 0;
                });
                this.getLinkedGoalsDetails();
            } else {
                this.goalsService.getClientGoalPayload(this.clientId);
            }
            this.manageScrollBtn();
        });
        if (navigator.userAgent.indexOf('Mac') > 0) {
            document.getElementsByTagName('body')[0].className += 'mac-os';
        }
    }

    getLinkedGoalsDetails() {
        this.portfolioService.getLinkedGoalsOfPortfolios(this.clientId).toPromise().then(res => {
            this.portfolios = res;
            let allocation = 0;
            this.portfolios.forEach(portfolio => {
                this.totalAllocation += portfolio.total;
                const obj = {};
                this.goalsList.forEach(goal => {
                    obj[goal.key] = { value: this.currency + '0', type: '' };
                });
                if (portfolio.linkedGoalToPortfolioPayloadList) {
                    portfolio.linkedGoalToPortfolioPayloadList.forEach(goal => {
                        if (obj.hasOwnProperty(goal.keyobjnum)) {
                            let max = 0;
                            if (goal.type === 'percentage') {
                                this.linkedGoals[goal.keyobjnum] += (portfolio.total * goal.value) / 100;
                                if (max < (portfolio.total * goal.value) / 100) {
                                    max = (portfolio.total * goal.value) / 100;
                                    portfolio['largestFundedGoal'] = goal.keyobjnum;
                                }
                            } else {
                                this.linkedGoals[goal.keyobjnum] += goal.value;
                                if (max < goal.value) {
                                    max = goal.value;
                                    portfolio['largestFundedGoal'] = goal.keyobjnum;
                                }
                            }
                            obj[goal.keyobjnum]['value'] = goal.type === 'percentage' ? goal.value.toString() + '%' : this.currency + goal.value.toString();
                            obj[goal.keyobjnum]['type'] = goal.type;
                        }
                    });
                }
                portfolio['linkedGoals'] = obj;
                portfolio['roundingDiff'] = (portfolio.total * 0.5) / 100;
                portfolio['overAllocatedAmount'] = portfolio.totalUnallocated < 0 ? Math.abs(portfolio.totalUnallocated) : 0;
            });
            for (const key in this.linkedGoals) {
                if (this.linkedGoals.hasOwnProperty(key)) {
                    const amount = this.linkedGoals[key];
                    allocation += amount;
                }
            }
            this.totalUnAllocated = this.totalAllocation - allocation;
        }).catch(err => { });
    }

    changeLinkedGoal(value, portfolioIndex, goalId) {
        if (value && value !== NaN) {
            if (parseFloat(value) > 0 && parseFloat(value) <= 100 && !value.includes(this.currency)) {
                this.portfolios[portfolioIndex]['linkedGoals'][goalId]['type'] = 'percentage';
            } else if (value.includes(this.currency) || parseFloat(value) >= 100 || parseFloat(value) === 0) {
                this.portfolios[portfolioIndex]['linkedGoals'][goalId]['type'] = 'currency';
            }
        } else {
            this.portfolios[portfolioIndex]['linkedGoals'][goalId]['value'] = '0';
            this.portfolios[portfolioIndex]['linkedGoals'][goalId]['type'] = 'currency';
        }
        this.goalsList.forEach(goal => {
            this.linkedAmount[goal.key] = 0;
        });
        this.portfolios.forEach(portfolio => {
            let linkedAmount = 0;
            let max = 0;
            this.goalsList.forEach(goal => {
                if (portfolio['linkedGoals'][goal.key]['type'] === 'percentage') {
                    let percentValue = portfolio['linkedGoals'][goal.key]['value'];
                    if (percentValue.includes('%')) {
                        percentValue = percentValue.endsWith('%') ? percentValue.slice(0, -1) : percentValue.slice(1);
                    }
                    this.linkedAmount[goal.key] += ((portfolio.total * parseFloat(percentValue)) / 100);
                    linkedAmount += ((portfolio.total * parseFloat(percentValue)) / 100);
                    if (max < ((portfolio.total * parseFloat(percentValue)) / 100)) {
                        max = ((portfolio.total * parseFloat(percentValue)) / 100);
                        portfolio['largestFundedGoal'] = goal.key;
                    }
                } else {
                    let currencyValue = portfolio['linkedGoals'][goal.key]['value'];
                    if (currencyValue.includes(this.currency)) {
                        currencyValue = currencyValue.startsWith(this.currency) ? currencyValue.slice(1) : currencyValue.slice(0, -1);
                    }
                    this.linkedAmount[goal.key] += parseFloat(currencyValue);
                    linkedAmount += parseFloat(currencyValue);
                    if (max < parseFloat(currencyValue)) {
                        max = parseFloat(currencyValue);
                        portfolio['largestFundedGoal'] = goal.key;
                    }
                }
            });
            portfolio.totalUnallocated = portfolio.total - linkedAmount;
            portfolio['overAllocatedAmount'] = portfolio.totalUnallocated < 0 ? Math.abs(portfolio.totalUnallocated) : 0;
            portfolio['overAllocated'] = portfolio.totalUnallocated < 0 ? true : false;
        });

        if (this.portfolios[portfolioIndex]['roundingDiff'] === Math.abs(this.portfolios[portfolioIndex].totalUnallocated)) {
            if (this.portfolios[portfolioIndex].total > 0) {
                const goalKey = this.portfolios[portfolioIndex]['largestFundedGoal'];
                let amount = this.portfolios[portfolioIndex]['linkedGoals'][goalKey]['value'];
                if (amount.includes('%') || this.portfolios[portfolioIndex]['linkedGoals'][goalId]['type'] === 'percentage') {
                    amount = amount.endsWith('%') ? amount.slice(0, -1) : amount.slice(1);
                    amount = ((this.portfolios[portfolioIndex].total * parseFloat(amount)) / 100);
                } else if (amount.includes(this.currency) || this.portfolios[portfolioIndex]['linkedGoals'][goalId]['type'] === 'currency') {
                    amount = amount.startsWith(this.currency) ? amount.slice(1) : amount.slice(0, -1);
                    amount = parseFloat(amount);
                }
                amount = parseFloat(amount) + parseFloat(this.portfolios[portfolioIndex].totalUnallocated);
                this.linkedAmount[goalKey] = this.linkedAmount[goalKey] + parseFloat(this.portfolios[portfolioIndex].totalUnallocated);
                this.portfolios[portfolioIndex]['linkedGoals'][goalKey]['value'] = this.currency + amount.toString();
                this.portfolios[portfolioIndex]['linkedGoals'][goalId]['type'] = 'currency';
                this.portfolios[portfolioIndex].totalUnallocated = 0;
                this.portfolios[portfolioIndex]['overAllocatedAmount'] = 0;
                this.portfolios[portfolioIndex]['overAllocated'] = false;
            }
        }

        let allocation = 0;
        this.linkedGoals = JSON.parse(JSON.stringify(this.linkedAmount));
        for (const key in this.linkedGoals) {
            if (this.linkedGoals.hasOwnProperty(key)) {
                const amount = this.linkedGoals[key];
                allocation += amount;
            }
        }
        this.totalUnAllocated = this.totalAllocation - allocation;
    }

    changeValue(portfolioIndex, goalId) {
        if (!this.portfolios[portfolioIndex]['linkedGoals'][goalId]['value'].includes('%') && !this.portfolios[portfolioIndex]['linkedGoals'][goalId]['value'].includes(this.currency)) {
            this.portfolios[portfolioIndex]['linkedGoals'][goalId]['value'] = this.portfolios[portfolioIndex]['linkedGoals'][goalId]['type'] === 'percentage'
                && this.portfolios[portfolioIndex]['linkedGoals'][goalId]['value'] > 0 ? this.portfolios[portfolioIndex]['linkedGoals'][goalId]['value'].toString() + '%'
                : this.currency + this.portfolios[portfolioIndex]['linkedGoals'][goalId]['value'].toString();
        }
    }

    linkGoals() {
        const payload = [];
        let isAllValid = true;
        this.portfolios.forEach(portfolio => {
            portfolio.linkedGoalToPortfolioPayloadList = [];
            let isThisValid = true;
            this.goalsList.forEach(goal => {
                const str = this.currency + '0';
                let amount = portfolio.linkedGoals[goal.key].value;
                if (portfolio.linkedGoals[goal.key].value.includes('%')) {
                    amount = amount.endsWith('%') ? amount.slice(0, -1) : amount.slice(1);
                } else if (portfolio.linkedGoals[goal.key].value.includes(this.currency)) {
                    amount = amount.startsWith(this.currency) ? amount.slice(1) : amount.slice(0, -1);
                }
                amount = parseFloat(amount);
                if (this.checkTotal(amount)) {
                    const obj = {
                        description: goal.description,
                        keyobjnum: goal.key,
                        type: portfolio.linkedGoals[goal.key].type,
                        value: amount
                    };
                    portfolio.linkedGoalToPortfolioPayloadList.push(obj);
                } else {
                    isThisValid = false;
                    isAllValid = false;
                }
            });
            if (isThisValid) {
                const portfolioObj = {
                    portfolioId: portfolio.portfolioId,
                    description: portfolio.description,
                    total: portfolio.total,
                    totalUnallocated: portfolio.totalUnallocated,
                    linkedGoalToPortfolioPayloadList: portfolio.linkedGoalToPortfolioPayloadList,
                    overAllocated: portfolio.overAllocated
                };
                payload.push(portfolioObj);
            }
        });
        if (isAllValid) {
            this.portfolioService.linkPortfoliosToGoals(this.clientId, payload).toPromise().then(async res => {
                await this.portfolioService.getClientPortfolioPayload(this.clientId);
                await this.goalsService.getClientGoalPayload(this.clientId);
                Swal('Success!', 'Goals linked to Portfolio has been updated.', 'success');
                this.back();
            }).catch(errResponse => {
                Swal('Oops!', errResponse.error.errorMessage, 'error');
            });
        } else {
            Swal('Error!', 'The total of the portfolio must be greater than zero.', 'error');
        }
    }

    back() {
        if (JSON.stringify(this.addAccountValueHolder) === '{}') {
            this._location.back();
        } else {
            this.router.navigate(['/client', this.clientId, 'planning', 'assets-liabilities', 'add-account']);
        }
    }




    ltr() {
        const elmnt = document.getElementsByClassName('table-responsive');
        for (let i = 0; i < elmnt.length; i++) {
            elmnt[i].scrollLeft = elmnt[i].scrollLeft + 100;
        }
        this.manageScrollBtn();
    }

    rtl() {
        const elmnt = document.getElementsByClassName('table-responsive');
        for (let i = 0; i < elmnt.length; i++) {
            elmnt[i].scrollLeft = elmnt[i].scrollLeft - 100;
        }
        this.manageScrollBtn();
    }

    manageScrollBtn() {
        const elmnt = document.getElementsByClassName('table-responsive');
        for (let i = 0; i < elmnt.length; i++) {
            const currentLeft = elmnt[i].scrollLeft;
            const currentLeftMax = elmnt[i].scrollWidth - elmnt[i].clientWidth;
            if (currentLeft !== 0 && currentLeft > 0 && currentLeft <= currentLeftMax) {
                this.enablePrev = true;
            } else {
                this.enablePrev = false;
            }
            if (currentLeft !== currentLeftMax && currentLeft < currentLeftMax) {
                this.enableNext = true;
            } else {
                this.enableNext = false;
            }
            break;
        }
    }

    checkTotal(total) {
        if (total < 0) {
            return false;
        } else {
            return true;
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

