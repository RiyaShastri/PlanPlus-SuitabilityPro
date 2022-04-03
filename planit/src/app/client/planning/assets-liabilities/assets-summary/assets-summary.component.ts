import * as $ from 'jquery';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, PortfolioService, ClientProfileService, DocumentService } from '../../../service';
import { fadeInAnimation } from '../../../../shared/animations';
import { CurrencyPipe, getCurrencySymbol } from '@angular/common';
import Swal from 'sweetalert2';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { Store } from '@ngrx/store';
import {AppState, getClientPayload, getPortfolioPayload} from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { AdvisorService } from '../../../../advisor/service/advisor.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PERSON_RELATION } from '../../../../shared/constants';

@Component({
    selector: 'app-assets-summary',
    templateUrl: './assets-summary.component.html',
    styleUrls: ['./assets-summary.component.css'],
    animations: [fadeInAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@fadeInAnimation]': '' },
    providers: [CurrencyPipe]
})
export class AssetsSummaryComponent implements OnInit, OnDestroy {
    public clientId;

    currencyMask = createNumberMask({
        prefix: '$',
        thousands: ',',
        decimal: '.'
    });
    sortBy = [
        { id: 1, name: 'Account type (Default)', sortByText: 'ACCOUNTTYPE', sortByType: 'managed' },
        { id: 2, name: 'Portfolio', sortByText: 'PORTFOLIO', sortByType: 'portfolio' },
        { id: 3, name: 'Owner', sortByText: 'OWNER', sortByType: 'managed' }
    ];
    selectedSortBy = this.sortBy[0];
    assetsData;
    isExpanded = false;
    isExpand = false;
    accountTypes = [];
    accountList = {};

    totalAssetsSum = 0;
    totalLiabilitySum = 0;
    totalSavings = 0;
    totalOtherOwnerAssets = 0;
    netTotal;
    portfolios = [];
    formattedAmount: string;
    value: any;
    allAssetsDeleted = false;
    clientData = {};
    accessRights = {};
    totalAllAssets;
    totalAllLiability;
    totalAllSavings;
    totalInvestment = {};
    totalOther = {};
    PERSON_RELATION = PERSON_RELATION ;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private assetsServices: PlanningService,
        private portfolioService: PortfolioService,
        private currencyPipe: CurrencyPipe,
        private refreshDataService: RefreshDataService,
        private profileService: ClientProfileService,
        private router: Router,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        public translate: TranslateService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private advisorService: AdvisorService,
        private documentService: DocumentService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.ASSETS_AND_LIABILITIES');
        this.angulartics2.eventTrack.next({ action: 'assetsAndLiabilities' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['AL_LIABILITY', 'BTN01', 'BTN02', 'PMSE', 'FFS01', 'RELINK_HOLDING', 'CLI05', 'SAV01'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        this.portfolioService.getClientPortfolioPayload(this.clientId);
      this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe( portfolios => {
        if(portfolios  && portfolios['portfolios']) {
          portfolios['portfolios'].forEach(portfolio => {
            this.portfolios[portfolio.id] = {description: portfolio.description};
          });
        }
      });

        this.getAccountSummaryByAccount(this.selectedSortBy);
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('Assets_acount_added') || message === 'refresh_savings_list') {
                this.getAccountSummaryByAccount(this.selectedSortBy);
            }
        });
    }

    private getAccountSummaryByAccount(sortBy) {
        this.accountList = {};
        this.accountTypes = [];
        this.totalAssetsSum = 0;
        this.totalLiabilitySum = 0;
        this.totalSavings = 0;
        this.totalOtherOwnerAssets = 0;
        this.netTotal = 0;
        let newAccountType = [];
        this.assetsServices.getAccountSummaryByAccountType(this.clientId, sortBy.sortByText).toPromise().then(response => {
            this.assetsData = response;
            this.assetsData.accounts.forEach(account => {
                const sortType = account.id;
                if (!this.accountTypes.hasOwnProperty(sortType)) {
                    this.accountList[sortType] = {
                        accounts: [],
                        totalAssetsSum: 0,
                        totalLiabilitiesSum: 0,
                        totalSavingSum: 0
                    };
                    this.accountTypes.push(sortType);
                }
                if (account.investmentAccount) {
                    this.addAccount(account.investmentAccount, sortType);
                } else {
                    this.addAccount(account.nonInvestmentAccount, sortType);
                }
            });
            newAccountType = Array.from(new Set(this.accountTypes));
            if (newAccountType) {
                this.accountTypes = newAccountType;
            }
            this.calculateTotal();
        }).catch(error => {
            this.accountList = {};
        });
    }

    calculateTotal() {
        this.totalAllAssets = 0;
        this.totalAllLiability = 0;
        this.totalAllSavings = 0;
        this.totalInvestment['assets'] = 0;
        this.totalInvestment['liability'] = 0;
        this.totalInvestment['savings'] = 0;
        this.totalOther['assets'] = 0;
        this.totalOther['liability'] = 0;
        this.totalOther['savings'] = 0;
        this.accountTypes.forEach(type => {
            this.totalAllAssets = this.totalAllAssets + this.accountList[type].totalAssetsSum;
            this.totalAllLiability = this.totalAllLiability + this.accountList[type].totalLiabilitiesSum;
            this.totalAllSavings = this.totalAllSavings + this.accountList[type].totalSavingSum;
        });
        const otherIndex = this.accountTypes.findIndex(x => x === null);
        this.accountTypes.forEach((type, index) => {
            if (index !== otherIndex) {
                this.totalInvestment['assets'] = this.totalInvestment['assets'] + this.accountList[type].totalAssetsSum;
                this.totalInvestment['savings'] = this.totalInvestment['savings'] + this.accountList[type].totalSavingSum;
                this.totalInvestment['liability'] = this.totalInvestment['liability'] + this.accountList[type].totalLiabilitiesSum;
            } else {
                this.totalOther['assets'] = this.totalOther['assets'] + this.accountList[type].totalAssetsSum;
                this.totalOther['liability'] = this.totalOther['liability'] + this.accountList[type].totalLiabilitiesSum;
                this.totalOther['savings'] = this.totalOther['savings'] + this.accountList[type].totalSavingSum;
            }
        });
    }

    addAccount(account, sortType) {
        account.forEach(element => {
            this.accountList[sortType].accounts.push(element);
            this.accountList[sortType]['totalAssetsSum'] = this.accountList[sortType]['totalAssetsSum'] + element.totalAssets;
            this.accountList[sortType]['totalLiabilitiesSum'] = this.accountList[sortType]['totalLiabilitiesSum'] + element.liabilityAmount;
            // tslint:disable-next-line:radix
            this.accountList[sortType]['totalSavingSum'] = parseFloat(this.accountList[sortType]['totalSavingSum']) + element.currentYearSavings;
            this.totalAssetsSum = this.totalAssetsSum + element.totalAssets;
            this.totalLiabilitySum = this.totalLiabilitySum + element.liabilityAmount;
            this.totalSavings = this.totalSavings + element.currentYearSavings;
            if (element.readOnly) {
                this.totalOtherOwnerAssets = this.totalOtherOwnerAssets + element.totalAssets;
            }
        });
        this.netTotal = this.totalAssetsSum - this.totalLiabilitySum - this.totalOtherOwnerAssets;
        let i = 0;
        for (i = 0; i < this.accountList[sortType].accounts.length; i++) {
            this.transformAssetAmount(sortType, i, this.clientData['currencyCode']);
            this.transformLiabilityAmount(sortType, i, this.clientData['currencyCode']);
        }
    }

    updateAccount() {
        const saveData = [];
        this.accountTypes.forEach(accType => {
            this.accountList[accType].accounts.forEach(account => {
                if (account.assetList.length === 1) {
                    saveData.push({
                        accountId: account.id,
                        fmvAmount: this.trimCurrency(account.totalAssets),
                        liabilityAmount: this.trimCurrency(account.liabilityAmount),
                        savingAmount: account.assetList[0].fmv
                    });
                }
            });
        });
        this.translate.get([
            'ASSETS_SUMMARY.POPUP.ACCOUNT_UPDATE'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.assetsServices.updateSummaryAccountDetail(this.clientId, saveData).toPromise().then(response => {
                Swal('Success', i18text['ASSETS_SUMMARY.POPUP.ACCOUNT_UPDATE'], 'success');
                this.getAccountSummaryByAccount(this.selectedSortBy);
                this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                this.profileService.getInvestmentData(this.clientId);
                this.portfolioService.getClientPortfolioPayload(this.clientId);
                this.advisorService.getInvestmentPayload();
                this.advisorService.getAdvisorNetWorthPayload();
            }).catch(errorResponse => {
                Swal('Oops...', errorResponse['error']['errorMessage'], 'error');
            });
        });
    }

    public toggleActionMenu(id, index) {
        if ($('#' + id + '_' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#' + id + '_' + index).toggle();
        }

    }

    changeOwnershipAction(index: number, accIndex: number) {
        if ($('#dropdownOwnershipAction' + index + accIndex).is(':visible')) {
            $('.dropdown-portfolio-owned-action').hide();
        } else {
            $('.dropdown-portfolio-owned-action').hide();
            $('#dropdownOwnershipAction' + index + accIndex).toggle();
        }
    }

    toggleAssetsList(accountId) {
        $('#assetList_' + accountId).toggle('slow');
        if (this.isExpand === false) {
            $('.dropdown-portfolio-action').hide();
        }
    }

    toggleAllAssets(types) {
        this.assetsData.accounts.forEach(element => {
            const account = element.investmentAccount ? element.investmentAccount : element.nonInvestmentAccount;
            if (account) {
                account.forEach(investAccount => {
                    if (!this.isExpanded) {
                        investAccount.isExpand = true;
                        $('.asset-list').show();
                    } else {
                        investAccount.isExpand = false;
                        $('.asset-list').hide();
                        $('.dropdown-portfolio-action').hide();
                    }
                });
            }
        });
    }

    sorting(event) {
        this.selectedSortBy = event;
        this.getAccountSummaryByAccount(event);
    }

    deleteAccount(accountType, accountId) {
        this.translate.get([
            'DELETE.POPUP.ACCOUNT_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.ACCOUNT_DELETE',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.ACCOUNT_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.assetsServices.deleteAccountById(accountId).toPromise().then(data => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.ACCOUNT_DELETE'], 'success');
                        this.getAccountSummaryByAccount(this.selectedSortBy);
                        this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                        this.profileService.getInvestmentData(this.clientId);
                        this.advisorService.getInvestmentPayload();
                        this.advisorService.getAdvisorNetWorthPayload();
                    }).catch(errorResponse => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                    });
                }
            });
        });
    }

    deleteHolding(accountType, assetId, accountId, assetKey) {
        this.translate.get([
            'DELETE.POPUP.HOLDING_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.HOLDING_DELETE',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.HOLDING_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES']
            }).then(result => {
                if (result.value) {
                    this.assetsServices.deleteAccountHolding(assetKey)
                        .toPromise().then(data => {
                            // tslint:disable-next-line:max-line-length
                            this.accountList[accountType]['accounts'][accountId]['totalAssets'] = this.accountList[accountType]['accounts'][accountId]['totalAssets'] - this.accountList[accountType]['accounts'][accountId]['assetList'][assetId]['fmv'];
                            this.totalAssetsSum = this.totalAssetsSum - this.accountList[accountType]['accounts'][accountId]['assetList'][assetId]['fmv'];
                            // tslint:disable-next-line:max-line-length
                            this.accountList[accountType]['totalAssetsSum'] = this.accountList[accountType]['totalAssetsSum'] - this.accountList[accountType]['accounts'][accountId]['assetList'][assetId]['fmv'];
                            this.netTotal = this.totalAssetsSum - this.totalLiabilitySum;
                            this.accountList[accountType]['accounts'][accountId]['assetList'].splice(assetId, 1);
                            Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.HOLDING_DELETE'], 'success');
                            this.advisorService.getInvestmentPayload();
                            this.advisorService.getAdvisorNetWorthPayload();
                            if (this.accountList[accountType]['accounts'][accountId]['assetList'].length === 0) {
                                this.allAssetsDeleted = true;
                            }
                        });
                }
            });
        });
    }

    totalAccountsAssets(value: number, accountType, index,currencyCode) {
        this.totalOtherOwnerAssets = 0;
        const oldTotalAssetsSum = this.accountList[accountType]['totalAssetsSum'];
        const trimValue = this.trimCurrency(value);
        this.accountList[accountType]['accounts'][index]['totalAssets'] = trimValue;
        this.accountList[accountType]['totalAssetsSum'] = this.accountList[accountType]['accounts'].reduce((sum, account) => sum + parseFloat(this.removeCurrencyPipeFormat(account.totalAssets)), 0);
        this.totalAssetsSum = (this.totalAssetsSum - oldTotalAssetsSum) + this.accountList[accountType]['totalAssetsSum'];
        this.accountTypes.forEach(type => {
            this.totalOtherOwnerAssets = this.accountList[type]['accounts'].reduce((sum, acc) => acc.readOnly ? (sum + parseFloat(this.removeCurrencyPipeFormat(acc.totalAssets))) : 0, 0);
        });
        this.netTotal = this.totalAssetsSum - this.totalLiabilitySum - this.totalOtherOwnerAssets;
        this.calculateTotal();
        this.transformAssetAmount(accountType, index, currencyCode);
    }

    totalLiabilities(value: number, accountType, index, currencyCode) {
        this.totalOtherOwnerAssets = 0;
        const oldTotalLiabilitiesSum = this.accountList[accountType]['totalLiabilitiesSum'];
        const trimValue = this.trimCurrency(value);
        this.accountList[accountType]['accounts'][index]['liabilityAmount'] = trimValue;
        // tslint:disable-next-line: max-line-length
        this.accountList[accountType]['totalLiabilitiesSum'] = this.accountList[accountType]['accounts'].reduce((sum, account) => sum + parseFloat(this.removeCurrencyPipeFormat(account.liabilityAmount)), 0);
        this.accountTypes.forEach(type => {
            this.totalOtherOwnerAssets = this.accountList[type]['accounts'].reduce((sum, acc) => acc.readOnly ? (sum + parseFloat(this.removeCurrencyPipeFormat(acc.totalAssets))) : 0, 0);
        });
        this.totalLiabilitySum = (this.totalLiabilitySum - oldTotalLiabilitiesSum) + this.accountList[accountType]['totalLiabilitiesSum'];
        this.netTotal = this.totalAssetsSum - this.totalLiabilitySum - this.totalOtherOwnerAssets;
        this.calculateTotal();
        this.transformLiabilityAmount(accountType, index, currencyCode);
    }

    transformAssetAmount(accType, index, currencyCode) {
        let value: string;
        if (this.accountList[accType]['accounts'][index].assetList.length === 1 && typeof (this.accountList[accType]['accounts'][index]['totalAssets']) === 'number') {
            value = this.currencyPipe.transform(this.accountList[accType]['accounts'][index]['totalAssets'], currencyCode, 'symbol-narrow', '1.0-2');
            this.accountList[accType]['accounts'][index]['totalAssets'] = value;
        }
    }

    transformLiabilityAmount(accType, index, currencyCode) {
        let value: string;
        if (this.accountList[accType]['accounts'][index].assetList.length === 1 && typeof (this.accountList[accType]['accounts'][index]['liabilityAmount']) === 'number') {
            value = this.currencyPipe.transform(this.accountList[accType]['accounts'][index]['liabilityAmount'], currencyCode, 'symbol-narrow', '1.0-2');
            this.accountList[accType]['accounts'][index]['liabilityAmount'] = value;
        }
    }

    removeCurrencyPipeFormat(inputString: string): string {
        if (typeof (inputString) === 'number') {
            return inputString;
        } else if (typeof (inputString) === 'string' && inputString.indexOf('$') !== -1) {
            return inputString.replace(/[$,]/g, '');
        }
    }

    editHoldings(accId, holdingId) {
        this.refreshDataService.changeMessage('edit_holdings|' + holdingId);
        this.router.navigate(['/client', this.clientId, 'planning', 'assets-liabilities', accId, 'holding-account']);
    }

    currencyMaskKeypress(event) {
        const key = event.which || event.keyCode || 0;
        if (key === 45) {     // allow negative
            // allow negative numbers
        } else if (key !== 46 && key > 31 && (key < 48 || key > 57)) {
            event.preventDefault();
        }
    }

    trimCurrency(inputVal: number): number {
        let strvalue = inputVal.toString();
        strvalue = strvalue.replace(/[$,£]/g, '');
        return parseFloat(strvalue);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    goToAddCustom(id) {
        this.assetsServices.addCustomAsset({ id: 'CUSTOM', value: '' });
        this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities/' + id + '/holding-account'], { queryParams: { custom: true } });
    }

    getFactSheet(assetKey) {
        if (assetKey !== undefined) {
            return this.createFactSheetReport(assetKey, this.clientData['planningCountry']);
        }
    }

    createFactSheetReport(prod_code: string, planningCountry: string) {
        let filename = null;
        let file = null;
        this.assetsServices.generateFactSheetReport(prod_code, planningCountry)
            .toPromise().then(res => {
                file = res['body'];
                const headers = res.headers.get('content-disposition');
                filename = headers.split('=')[1];
                this.documentService.downloadFile(file, filename);
            }).catch(err => {
                this.translate.get([
                    'ALERT_MESSAGE.OOPS_TEXT',
                    'SSID_LABELS.ERROR_MESSAGE.' + JSON.parse(err).errorSsid
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                    if (JSON.parse(err).errorSsid) {
                        Swal(text['ALERT_MESSAGE.OOPS_TEXT'], text['SSID_LABELS.ERROR_MESSAGE.' + JSON.parse(err).errorSsid], 'error');
                    } else {
                        Swal(text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(err).errorMessage, 'error');
                    }
                });
            });
    }

}
