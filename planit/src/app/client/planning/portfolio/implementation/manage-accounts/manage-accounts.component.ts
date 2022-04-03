import { Component, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { GoalService, PortfolioService, ClientProfileService } from '../../../../service';
import { Store } from '@ngrx/store';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import {
    AppState,
    getClientPayload,
    getAllCountryFormatePayload
} from '../../../../../shared/app.reducer';
import { IMPLEMENTATION_ACCOUNTS_ACTIONS, SOLUTION_TYPES, ACCOUNT_NAME_STRING } from '../../../../../shared/constants';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { AccessRightService } from '../../../../../shared/access-rights.service';

@Component({
    selector: 'app-manage-accounts',
    templateUrl: './manage-accounts.component.html',
    styleUrls: ['./manage-accounts.component.css']
})
export class ManageAccountsComponent implements OnInit, OnChanges, OnDestroy {
    @Input() clientId;
    @Input() portfolioId;
    @Input() selectedAccounts = [];
    currencies;
    selectedCurrency: any = null;
    portfolioAccounts;
    totalCurrent;
    totalRecommended;
    clientData = {};
    allCountryData: any;
    accountExpanded = [];
    actionPerformed = IMPLEMENTATION_ACCOUNTS_ACTIONS;
    makeDisable = false;
    private unsubscribe$ = new Subject<void>();
    i18Text = {};
    customAccountId;
    isCustom = false;
    accessRights = {};
    constructor(
        private store: Store<AppState>,
        private portfolioService: PortfolioService,
        private goalService: GoalService,
        private profileService: ClientProfileService,
        private dataSharing: RefreshDataService,
        private accessRightService: AccessRightService,
        private router: Router,
        private translate: TranslateService
    ) {
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(respons => {
            if (respons.includes('Custom_Solution_For_Manage_Account')) {
                this.isCustom = true;
                this.customAccountId = JSON.parse(respons.replace('Custom_Solution_For_Manage_Account|', ''));
                this.setDataForCustomSolution(this.customAccountId);
            }
            if (respons.includes('Assets_acount_added')) {
                const data = JSON.parse(respons.replace('Assets_acount_added|', ''));
                if (data['portfolioKey'] === this.portfolioId) {
                    this.getCurrencies(data['currencyCode']);
                }
            }
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['BTN01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('solution_applied_on_account|')) {
                const defaultCurrency = message.replace('solution_applied_on_account|', '');
                this.selectedCurrency = this.currencies.find(currency => currency.currencyCode === defaultCurrency);
                this.getAccountDetails(this.selectedCurrency);
                this.dataSharing.changeMessage('default message');
            } else if (message.includes('change_account_solution') || message.includes('refresh_implementation_accounts')) {
                this.getAccountDetails(this.selectedCurrency);
                this.dataSharing.changeMessage('default message');
            } else if (message.includes('empty_seletcted_accounts_array')) {
                this.selectedAccounts = [];
                this.dataSharing.changeMessage('default message');
            }
        });
    }

    onInitialization() {
        this.translate.stream([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'PORTFOLIO.IMPLEMENTATION.POPUP.KEEP_CURRENT_HOLDINGS_SUCCESS_MESSAGE',
            'PORTFOLIO.IMPLEMENTATION.POPUP.ACCOUNT_SOLUTION_SUCCESSFULLY_RESET',
            'PORTFOLIO.IMPLEMENTATION.POPUP.ACCOUNT_SUCCESSFULLY_REBALANCED',
            'PORTFOLIO.IMPLEMENTATION.CUSTOM'
        ], { accountName: ACCOUNT_NAME_STRING }).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            this.allCountryData = data;
            if (this.allCountryData) {
                this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
                    this.clientData = clientData;
                    if (this.clientData && this.clientData['planningCountry']) {
                        const defaultCurrency = this.allCountryData[this.clientData['planningCountry']]['currencyCode'];
                        this.getCurrencies(defaultCurrency);
                    }
                });
            }
        });
    }

    getCurrencies(defaultCurrency = '') {
        this.goalService.getAllCurrencyDetail().toPromise().then(result => {
            this.currencies = result;
            if (defaultCurrency && this.currencies.length > 0) {
                this.selectedCurrency = this.currencies.find(currency => currency.currencyCode === defaultCurrency);
                if (this.selectedCurrency) {
                    this.getAccountDetails(this.selectedCurrency);
                }
            }
        }).catch(err => {
            this.currencies = [];
            this.selectedCurrency = {};
            this.getAccountDetails();
        });
    }

    getAccountDetails(currency = {}) {
        this.makeDisable = false;
        this.accountExpanded = [];
        let makeOthersDisabled = false;
        this.portfolioService.getImplementationAccountsToCustomize(this.clientId, this.portfolioId, currency['currencyCode']).toPromise().then(implementationAccounts => {
            const fundAccountIndex = implementationAccounts.findIndex(account => (account.actionPerformed === this.actionPerformed['NO_ACTION']) &&
                account.solution && account.solution.solutionType === SOLUTION_TYPES.FUND_OF_FUNDS_SOLUTION);
            if (fundAccountIndex >= 0 &&
                (implementationAccounts[fundAccountIndex]['checked'] || this.selectedAccounts.indexOf(implementationAccounts[fundAccountIndex].plannum) > -1)) {
                makeOthersDisabled = true;
            }
            implementationAccounts.forEach((account, accountIndex) => {
                if (this.selectedAccounts.indexOf(account.plannum) > -1) {
                    account.checked = true;
                }
                this.accountExpanded.push(false);
                account.ownership.forEach(owner => {
                    const relation_status = this.profileService.checkStatus(owner.personDetails.relation);
                    owner['btnColor'] = relation_status['btnColor'];
                    owner['btnInitials'] = owner.personDetails.firstName[0] + (owner.personDetails.lastName ? owner.personDetails.lastName[0] : owner.personDetails.firstName[1]);
                });
                if (makeOthersDisabled === true) {
                    if (!account.solution || (account.actionPerformed === this.actionPerformed['NO_ACTION'] &&
                        account.solution && account.solution.solutionType !== SOLUTION_TYPES.FUND_OF_FUNDS_SOLUTION)) {
                        account['disabled'] = true;
                        account.checked = false;
                    }
                } else {
                    account['disabled'] = false;
                    if (!account.solution || (account.solution && account.solution.solutionType !== SOLUTION_TYPES.FUND_OF_FUNDS_SOLUTION)) {
                        if (account.checked === true) {
                            this.makeDisable = true;
                        }
                    }
                }
                if (accountIndex === (implementationAccounts.length - 1)) {
                    this.dataSharing.setSelectedAccounts('[]');
                }
            });
            if (fundAccountIndex >= 0 && this.makeDisable === true) {
                implementationAccounts[fundAccountIndex]['disabled'] = true;
                implementationAccounts[fundAccountIndex]['checked'] = false;
            }
            this.portfolioAccounts = implementationAccounts;
            this.portfolioService.shareSelectedAccounts({ accounts: implementationAccounts, currency: this.selectedCurrency.currencyCode });
        }).catch(err => {
            this.portfolioAccounts = [];
        });
    }

    setDataForCustomSolution(accId) {
        this.portfolioAccounts.forEach(account => {
            if (account['plannum'] === accId) {
                if (account['solution']) {
                    account['solution']['description'] = this.i18Text['PORTFOLIO.IMPLEMENTATION.CUSTOM'];
                } else {
                    account['solution'] = { 'description': this.i18Text['PORTFOLIO.IMPLEMENTATION.CUSTOM'] };
                }
                account.customSolutionApplied = true;
            }
        });
        this.portfolioService.shareSelectedAccounts({ accounts: this.portfolioAccounts, currency: this.selectedCurrency.currencyCode });
    }

    ngOnChanges(changes) {
        if (changes && ((changes.hasOwnProperty('clientId') && changes['clientId'] && changes['clientId']['currentValue']) || changes.hasOwnProperty('portfolioId'))) {
            this.onInitialization();
        }
    }

    getSelectedCurrency(currency) {
        this.selectedCurrency = currency;
        this.getAccountDetails(currency);
    }

    accountSelectionChange() {
        this.makeDisable = false;
        let makeOthersDisabled = false;
        this.selectedAccounts = [];
        const fundAccountIndex = this.portfolioAccounts.findIndex(account => (account.actionPerformed === this.actionPerformed['NO_ACTION']) &&
            account.solution && account.solution.solutionType === SOLUTION_TYPES.FUND_OF_FUNDS_SOLUTION);
        if (fundAccountIndex >= 0 && this.portfolioAccounts[fundAccountIndex]['checked']) {
            makeOthersDisabled = true;
        }
        this.portfolioAccounts.forEach(account => {
            if (makeOthersDisabled === true) {
                if (!account.solution || (account.actionPerformed === this.actionPerformed['NO_ACTION'] &&
                    account.solution && account.solution.solutionType !== SOLUTION_TYPES.FUND_OF_FUNDS_SOLUTION)) {
                    account['disabled'] = true;
                    account.checked = false;
                }
            } else {
                account['disabled'] = false;
                if (!account.solution || (account.solution && account.solution.solutionType !== SOLUTION_TYPES.FUND_OF_FUNDS_SOLUTION)) {
                    if (account.checked === true) {
                        this.makeDisable = true;
                    }
                }
            }
        });
        if (this.makeDisable && fundAccountIndex >= 0) {
            this.portfolioAccounts[fundAccountIndex]['disabled'] = true;
            this.portfolioAccounts[fundAccountIndex]['checked'] = false;
        }
        this.portfolioService.shareSelectedAccounts({ accounts: this.portfolioAccounts, currency: this.selectedCurrency.currencyCode });
        this.portfolioAccounts.forEach(account => {
            if (account.checked === true) {
                this.selectedAccounts.push(account.plannum);
            }
        });
    }

    changeAccountAction(index: number) {
        if ($('#dropdownAccountAction' + index).is(':visible')) {
            $('.dropdown-account-action').hide();
        } else {
            $('.dropdown-account-action').hide();
            $('#dropdownAccountAction' + index).toggle();
        }
    }

    changeOwnershipAction(index: number) {
        if ($('#dropdownOwnershipAction' + index).is(':visible')) {
            $('.dropdown-portfolio-owned-action').hide();
        } else {
            $('.dropdown-portfolio-owned-action').hide();
            $('#dropdownOwnershipAction' + index).toggle();
        }
    }

    modifyAppliedSolution(accountId, accountName, action) {
        if (action === IMPLEMENTATION_ACCOUNTS_ACTIONS.KEEP_CURRENT_HOLDINGS) {
            this.portfolioService.keepCurrentHoldings(this.clientId, this.portfolioId, accountId).toPromise().then(res => {
                this.dataSharing.changeMessage('change_account_solution');
                swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.KEEP_CURRENT_HOLDINGS_SUCCESS_MESSAGE'], 'success');
            }).catch(err => {
                swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        } else if (action === IMPLEMENTATION_ACCOUNTS_ACTIONS.RESET) {
            this.portfolioService.resetProduct(this.clientId, this.portfolioId, accountId).toPromise().then(res => {
                this.dataSharing.changeMessage('change_account_solution');
                const message = this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.ACCOUNT_SOLUTION_SUCCESSFULLY_RESET'].replace(ACCOUNT_NAME_STRING, accountName);
                swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], message, 'success');
            }).catch(err => {
                swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        }
    }

    rebalance(accountId, accountName) {
        this.portfolioService.rebalanceProducts(this.clientId, this.portfolioId, accountId, this.selectedCurrency['currencyCode']).toPromise().then(res => {
            this.dataSharing.changeMessage('change_account_solution');
            const message = this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.ACCOUNT_SUCCESSFULLY_REBALANCED'].replace(ACCOUNT_NAME_STRING, accountName);
            swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], message, 'success');
        }).catch(err => {
            swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
        });
    }

    applySolution(plannum) {
        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'implementation', plannum, 'apply-solution'],
            { queryParams: { currency: this.selectedCurrency.currencyCode } });
    }

    addProduct(plannum) {
        this.dataSharing.setSelectedAccounts(JSON.stringify(this.selectedAccounts));
        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'implementation', plannum, 'add-product']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
