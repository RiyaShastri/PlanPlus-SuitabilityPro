import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { AppState, getIsAccessRightsLoaded } from '../../shared/app.reducer';
import { catchError, takeUntil } from 'rxjs/operators';
import {
    SetPortfolio,
    SetClient,
    SetPlanningSummary,
    SetFamilyMembers,
    SetClientProgress,
    SetClientAddress,
    SetDocuments,
    SetFamilyMembersRisk,
    SetTaskAndNotification
} from '../../shared/app.actions';
import { TaskNotificationService } from '../../task-notification/task-notification.service';
import { ClientProfileService } from './profile.service';
import { DocumentService } from './document.service';
import { PortfolioService } from './portfolio.service';
import { GoalService } from './goal.service';
import { EstateService } from './estate.service';
import { RefreshDataService } from '../../shared/refresh-data';
import { AccessRightService } from '../../shared/access-rights.service';
import { PERSON_RELATION } from '../../shared/constants';

@Injectable()

export class PlanningService {
    customsolution = new Subject<any>();
    PERSON_RELATION = PERSON_RELATION;

    constructor(
        private http: HttpClient,
        private store: Store<AppState>,
        private router: Router,
        private profileService: ClientProfileService,
        private taskNotificationService: TaskNotificationService,
        private documentService: DocumentService,
        private portfolioService: PortfolioService,
        private goalService: GoalService,
        private estateService: EstateService,
        private dataSharing: RefreshDataService,
        private accessRightService: AccessRightService,
        @Inject(LOCALE_ID) private locale: string,
    ) { }

    addCustomAsset(param: any) {
        this.dataSharing.newCustomProduct(JSON.stringify(param));
        this.dataSharing.changeMessage('');
    }

    redirectToImplementation(param) {
        this.customsolution.next(param);
    }

    getRedirectToImplementation(): Observable<any> {
        return this.customsolution.asObservable();
    }

    getInvestmentProducts(clientId: string, portfolio: string, curcode: string): any {
        clientId = 'CLIENT'; // Mock Client
        portfolio = 'PORTFOLIOID1'; // Mock Client
        return this.http.get('/accounts/' + clientId + '/potfolio?portfolio=' + portfolio + '&curcode=' + curcode);
    }

    getPlanningSummary(clientId: string): Observable<any> {
        return this.http.get('/v30/client/' + clientId + '/planningsummary');
    }

    getClientPlanningSummary(clientId) {
        this.getPlanningSummary(clientId).toPromise().then(summaryData => {
            const planningSummary = {};
            planningSummary['Goals'] = 0;
            planningSummary['Revenue'] = 0;
            planningSummary['Cashflow'] = 0;
            planningSummary['Entities'] = 0;
            summaryData.forEach(summary => {
                planningSummary[summary.type] = summary.status;
            });
            this.store.dispatch(new SetPlanningSummary(planningSummary));
        }).catch(errorResponse => {
            this.store.dispatch(new SetPlanningSummary({}));
        });
    }

    getAccountSummaryByAccountType(clientId: string, sortBy?: string): any {
        const sortValue = (sortBy && sortBy !== '') ? '&sortBy=' + sortBy : '';
        return this.http.get('/v30/accounts/' + clientId + '/summary?isExpanded=TRUE' + sortValue);
    }

    getAccountType(planningCountry): any {
        return this.http.get('/v30/accounts/type?jurisdiction=' + planningCountry);
    }
    getAllAccountType() {
        return this.http.get('/v30/accounts/type');
    }

    updateSummaryAccountDetail(clientId: string, accountData) {
        return this.http.put('/v30/accounts/' + clientId + '/summaryaccountdetails', accountData);
    }

    updateAccountDetail(accountData) {
        return this.http.put('/v30/accounts', accountData);
    }

    addAccountOnAssetsAndLiability(clientId: string, addAccountData) {
        return this.http.post('/v30/accounts/' + clientId + '/add', addAccountData);
    }

    deleteAccountById(accountId) {
        return this.http.delete('/v30/accounts/' + accountId);
    }

    addSavings(accountId, savingsData, scenario) {
        return this.http.post('/v30/accounts/' + accountId + '/savings?scenario=' + scenario, savingsData);
    }

    getAllSavings(clientId: string, sortBy?: string, scenario = '00'): any {
        const sortValue = (sortBy && sortBy !== '') ? 'sortBy=' + sortBy : '';
        return this.http.get('/v30/accounts/savings/' + clientId + '?' + sortValue + '&scenario=' + scenario);

    }

    getSavingsByAccountId(accountId, sortBy?: string): any {
        const sortValue = (sortBy && sortBy !== '') ? 'sortBy=' + sortBy : '';
        return this.http.get('/v30/accounts/' + accountId + '/savings?' + sortValue);
    }

    getSavingsBySavingsId(savingsId): any {
        return this.http.get('/v30/accounts/saving/' + savingsId);
    }

    getSavingsByGoalId(goalId): any {
        return this.http.get('/v30/accounts/goal/' + goalId + '/savings');
    }

    async processSavingsData(clientId, savingsData) {
        const familyDataObj = await this.profileService.getFamilyMembers(clientId).toPromise();
        const familyMembers = await this.profileService.processFamilyMembers(clientId, familyDataObj, false);
        if (familyMembers.hasOwnProperty('familyMembers') && (familyMembers.hasOwnProperty('clientId') && familyMembers['clientId'] === clientId)) {
            const ownersListToDisplay = {};
            const ownerList = [];
            familyMembers['familyMembers'].forEach(member => {
                if (member.relation === PERSON_RELATION.CLIENT1 || member.relation === PERSON_RELATION.CLIENT2) {
                    const year = member.birthDate.split('-')[0];
                    ownersListToDisplay[member.id] = { id: member.id, btnInitials: member.btnInitials, birthYear: parseInt(year, 10), relation: member.relation, avatar: member.avatar };
                    ownerList.push({ id: member.id, btnInitials: member.btnInitials, birthYear: parseInt(year, 10), relation: member.relation, avatar: member.avatar });
                }
            });
            savingsData.forEach(element => {
                element['ownersListToDisplay'] = [];
                element['ownersList'] = ownerList;
                element['owners'].forEach(owner => {
                    element['ownersListToDisplay'].push(ownersListToDisplay[owner]);
                });

            });
            return savingsData;
        }
    }

    updateSavings(payload): any {
        return this.http.put('/v30/accounts/savings', payload);
    }

    deleteTier(savingId, tierNumber) {
        return this.http.put('/v30/accounts/' + savingId + '/removetier?tierNumber=' + tierNumber, {});
    }

    deleteSavings(savingsId): any {
        return this.http.delete('/v30/accounts/' + savingsId + '/savings');
    }

    getFrequencyListForSavings(): any {
        return this.http.get('/v30/common/frequency?type=savings');
    }

    getSavingsEndYearLinkOptions(): any {
        return this.http.get('/v30/common/savingsendoptions');
    }

    getHoldingsAsset(accountId: string, sortBy: string): Observable<any> {
        return this.http.get('/v30/accounts/' + accountId + '/holdings?sortBy=' + sortBy);
    }

    getUtilityAssetLiabilityDetails(): Observable<any> {
        return Observable.forkJoin(
            this.http.get('/v30/common/loantype?planningCountry=CAN').map(response => <any>(<any>response)),
            this.http.get('/v30/common/frequency?type=liability').map(response => <any>(<any>response)),
            this.http.get('/v30/common/paymenttype').map(response => <any>(<any>response)),
            this.http.get('/v30/common/currency').map(response => <any>(<any>response)),
            this.http.get('/v30/accounts/producttype').map(response => <any>(<any>response)),
            this.http.get('/v30/common/frequency?type=compounding').map(response => <any>(<any>response)),
            this.http.get('/v30/common/treatmentondeathtype').map(response => <any>(<any>response)),
        );
    }

    addHolding(holdingPayload, accountId: string) {
        return this.http.post('/v30/accounts/' + accountId + '/holding', holdingPayload);
    }

    saveAssetAndLiabilityDetail(holdingPayload, accountId: string) {
        if (holdingPayload['relink']) {
            return this.http.put('/v30/accounts/relink', holdingPayload);
        } else {
            return this.http.put('/v30/accounts/' + accountId + '/holding', holdingPayload);
        }
    }

    addCustomHolding(accountId, holdingDetails): Observable<any> {
        return this.http.post('/v30/accounts/' + accountId + '/holding', holdingDetails);
    }

    // Remove account api line with original
    deleteAccountHolding(holdingId): any {
        return this.http.delete('/v30/accounts/' + holdingId + '/holdings');
    }

    getProductSearchUtility(planningCountry): Observable<any> {
        return Observable.forkJoin(
            this.http.get('/v30/accounts/producttype').map(response => <any>(<any>response)),
            this.http.get('/v30/common/currency').map(response => <any>(<any>response)),
            this.http.get('/v30/common/universe-country').map(response => <any>(<any>response)),
            this.http.get('/v30/accounts/productAssetClass?country=' + planningCountry).map(response => <any>(<any>response))
        );
    }

    getProductSearch(searchString): Observable<any> {
        return this.http.post('/v30/accounts/products', searchString).map(response => <any>(<any>response));
    }

    getFavouriteList(): any {
        return this.http.get('/v30/accounts/favlist');
    }

    addProductFavourite(prodsub, favouriteId): any {
        return this.http.post('/v30/accounts/favouriteProducts/' + favouriteId, [prodsub]);
    }

    deleteProductFavourite(productId, favouriteId): any {
        return this.http.delete('/v30/accounts/' + productId + '/prodfavlist/' + favouriteId);
    }

    loadStoreData(clientId, loadFull = true) {
        const promise = new Promise((resolve, reject) => {
            const unsubscribe$ = new Subject<void>();
            this.store.select(getIsAccessRightsLoaded).pipe(takeUntil(unsubscribe$)).subscribe(isAccessRightsLoaded => {
                if (isAccessRightsLoaded && clientId) {
                    this.accessRightService.getAccess(['WEB07', 'POB01', 'SCH01', 'HMOGL', 'RISKTOLERCLIENT', 'CLIVALUES', 'CLI02', 'CLI01', 'NETWORTHTILE', 'INVESTTILE', 'ENTITY'])
                        .pipe(takeUntil(unsubscribe$)).subscribe(accessRights => {
                            this.resetStore().then(async () => {
                                this.profileService.getClientPayload(clientId).toPromise().then(res => {
                                    this.store.dispatch(new SetClient(res));
                                }).catch(err => {
                                    this.router.navigate(['./advisor', 'dashboard']);
                                });

                                let familyMemberPayload = {
                                    'clientId': '',
                                    'idMapping': {},
                                    'familyMembers': []
                                };
                                if (accessRights.hasOwnProperty('CLI01') && accessRights['CLI01']['accessLevel'] > 0) {
                                    familyMemberPayload = await this.profileService.getClientFamilyMembers(clientId);
                                }
                                if (loadFull) {
                                    this.getClientPlanningSummary(clientId);
                                    this.profileService.getClientProfileSummary(clientId);
                                    if (accessRights.hasOwnProperty('SCH01') && accessRights['SCH01']['accessLevel'] > 0) {
                                        this.taskNotificationService.getClientTaskNotificationPayload(clientId);
                                    }
                                }
                                this.estateService.getOtherBeneficiaryList(clientId);

                                if (accessRights.hasOwnProperty('POB01') && accessRights['POB01']['accessLevel'] > 0) {
                                    this.portfolioService.getClientPortfolioPayload(clientId);
                                }

                                if (accessRights.hasOwnProperty('CLIVALUES') && accessRights['CLIVALUES']['accessLevel'] > 0) {
                                    this.profileService.getClientEngagementValues(clientId);
                                }

                                if (accessRights.hasOwnProperty('HMOGL') && accessRights['HMOGL']['accessLevel'] > 0) {
                                    this.profileService.getClientEngagementPriorities(clientId);
                                }

                                this.profileService.getClientAddress(clientId);
                                if (accessRights.hasOwnProperty('WEB07') && accessRights['WEB07']['accessLevel'] > 0) {
                                    this.documentService.getClientDocumentPayloads(clientId);
                                }

                                if (accessRights.hasOwnProperty('RISKTOLERCLIENT') && accessRights['RISKTOLERCLIENT']['accessLevel'] > 0) {
                                    this.profileService.getClientFamilyMembersRisk(clientId, familyMemberPayload);
                                }
                                // this.portfolioService.getClientAllocationPayload(clientId);
                                if (accessRights.hasOwnProperty('NETWORTHTILE') && accessRights['NETWORTHTILE']['accessLevel'] > 0) {
                                    this.profileService.getClientNetworthInvestmentPayload(clientId);
                                }

                                if (accessRights.hasOwnProperty('INVESTTILE') && accessRights['INVESTTILE']['accessLevel'] > 0) {
                                    this.profileService.getInvestmentData(clientId);
                                }

                                if (accessRights.hasOwnProperty('SCH01') && accessRights['SCH01']['accessLevel'] > 0) {
                                    this.taskNotificationService.getClientOverviewTaskAndNotificationPayload(clientId);
                                }

                                if (accessRights.hasOwnProperty('CLI02') && accessRights['CLI02']['accessLevel'] > 0) {
                                    this.goalService.getClientGoalPayload(clientId);
                                }
                                if (accessRights.hasOwnProperty('ENTITY') && accessRights['ENTITY']['accessLevel'] > 0) {
                                    this.profileService.getEntities(clientId);
                                    this.profileService.getCorporation(clientId);
                                }
                                unsubscribe$.next();
                                unsubscribe$.complete();
                                resolve('done');
                            });
                        });
                }
            });
        });
        return promise;
    }

    resetStore() {
        const promise = new Promise((resolve, reject) => {
            const familyMemberPayload = {
                'clientId': '',
                'idMapping': {},
                'familyMembers': []
            };
            this.store.dispatch(new SetFamilyMembers(familyMemberPayload));
            this.store.dispatch(new SetClientProgress([]));
            this.store.dispatch(new SetPlanningSummary([]));
            const portfolioObj = {
                'clientId': '',
                'idMapping': {},
                'portfolios': [],
                'totalAssets': 0
            };
            this.store.dispatch(new SetPortfolio(portfolioObj));
            this.store.dispatch(new SetClientAddress([]));
            this.store.dispatch(new SetDocuments([]));
            this.store.dispatch(new SetFamilyMembersRisk([]));
            this.store.dispatch(new SetTaskAndNotification({}));
            resolve('done');
        });
        return promise;
    }

    getRevenuesByClientId(clientId: string, sortBy: string, viewBy: string, scenario='00'): any {
        return this.http.get('/v30/revenue/client/' + clientId + '?sortBy=' + sortBy + '&viewBy=' + viewBy + '&scenario=' + scenario);
    }

    getRevenueByGoalId(clientId: string, goalId: string, viewBy: string, scenario='00'): any {
        return this.http.get('/v30/revenue/' + clientId + '/revenues/' + goalId + '?viewBy=' + viewBy + '&scenario=' + scenario);
    }

    getRevenuesByRevnueId(revenueId, scenario='00') {
        return this.http.get('/v30/revenue/' + revenueId + '?scenario=' + scenario);

    }

    deleteRevenue(revenueId: string) {
        return this.http.delete('/v30/revenue/' + revenueId);
    }

    getAccountByID(accountId) {
        return this.http.get('/v30/accounts/' + accountId);
    }

    getSelectedProductInfo(productNumber, subProductNumber) {
        return this.http.get('/v30/accounts/productsInfo?productNumber=' + productNumber + '&productSubNumber=' + subProductNumber);
    }

    getAccountsByClientID(clientID): any {
        return this.http.get('/v30/accounts/' + clientID + '/accountlist');
    }

    getRegularityType(accountType: string, jurisdiction: string): any {
        return this.http.get('/v30/accounts/regulatoryType?accountType=' + accountType + '&jurisdiction=' + jurisdiction);
    }

    getAssetclass(clientId): any {
        return this.http.get('/v30/accounts/assetclass?assetClass=Detail&familyId=' + clientId + '&isCustomeAllocation=true');
    }

    transformCurrency(currCode = 'USD', input: any, args?: any): any {
        let exp;
        const suffixes = ['K', 'M', 'G', 'T', 'P', 'E'];

        if (Number.isNaN(input)) {
            return null;
        }

        if (input < 1000) {
            return new CurrencyPipe(this.locale).transform(
                (input).toFixed(args),
                currCode,
                'symbol-narrow',
                '0.0-2'
            );
        }

        exp = Math.floor(Math.log(input) / Math.log(1000));
        // return (input / Math.pow(1000, exp)).toFixed(args) + suffixes[exp - 1];
        return new CurrencyPipe(this.locale).transform(
            (input / Math.pow(1000, exp)).toFixed(args),
            currCode,
            'symbol-narrow',
            '0.0-2'
        ) + suffixes[exp - 1];
    }

    getLegalInformation(clientId: string) {
        return this.http.get('/v30/legal-information/' + clientId + '/');
    }

    saveLegalInformation(clientId: string, informationPayload) {
        return this.http.post('/v30/legal-information/' + clientId + '/', informationPayload);
    }

    getCashFlowDetails(clientId) {
        return this.http.get('/v30/cashflow/' + clientId);
    }

    addCashFlowItem(payload) {
        return this.http.post('/v30/cashflow/', payload);
    }

    updateCashFlow(payload) {
        return this.http.put('/v30/cashflow/', payload);
    }

    deleteCashFlowItem(cashFlowId) {
        return this.http.delete('/v30/cashflow/' + cashFlowId);
    }

    calculateCashflowTax(clientId, payload): any {
        return this.http.post('/v30/cashflow/' + clientId + '/_calculate', payload);
    }

    getDropdownData(url: string) {
        return this.http.get(url);
    }

    generateCashFlowReport(clientID, format): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.post('/v30/cashflow/report/' + clientID + '?format=' + format, {}, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateDispositionReport(clientID, format, reportData: {scenario:string, assetKey:string}): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.get('/v30/accounts/disposition/' + clientID + '?format=' + format + '&scenario=' + reportData.scenario + '&assetKey=' + reportData.assetKey, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateIncomeTaxReport(clientID, format): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.post('/v30/cashflow/report/' + clientID + '/income-tax-projection?format=' + format, {}, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }


    generateNetWorthReport(clientID, format): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.get('/v30/accounts/networth/' + clientID + '?format=' + format, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    getAccountList(clientID): Observable<any> {
        return this.http.get('/v30/accounts/dispostionAccounts/'+ clientID);
    }

    generateRollupReport(clientID, format): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.get('/v30/portfolios/report/rollup/' + clientID + '?format=' + format, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateDetailedInvestmentStrategyReort(clientID, format): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.get('/v30/portfolios/report/detailImplementationStrategy/' + clientID + '?format=' + format, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateFundRollupReort(planningCountry, payload, format): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';

        //The URL below should be replaced by fund rollup report URL.
        return this.http.post('/v30/products/report/fundrollup/planningcountry/' + planningCountry + '?format=' + format, payload, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateInvestmentHoldingsReport(clientID, format): Observable<any> {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.post('/v30/accounts/report/' + clientID + '/investment-holdings?format=' + format, {}, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    getAccountWithBeneficiary(clientId: string, accountId: string) {
        return this.http.get('/v31/client/' + clientId + '/accounts/' + accountId);
    }

    updateAccountWithBeneficiary(clientId: string, accountId: string, accountPayload) {
        return this.http.put('/v31/client/' + clientId + '/accounts/' + accountId, accountPayload);
    }

    saveNamedBeneficiaries(clientId: string, accountId: string, beneficiaryPayload) {
        return this.http.post('/v30/client/' + clientId + '/accounts/' + accountId + '/named-beneficiaries', beneficiaryPayload);
    }

    deleteNamedBeneficiaries(clientId: string, accountId: string, beneficiaryId: string, isPrimaryBeneficiary: boolean) {
        return this.http.delete('/v30/client/' + clientId + '/accounts/' + accountId + '/named-beneficiaries/' + beneficiaryId + '?isPrimaryBeneficiary=' + isPrimaryBeneficiary);
    }

    getFamilyAllAccountBeneficiary(clientId: string): any {
        return this.http.get('/v30/client/' + clientId + '/accounts/named-beneficiaries');
    }

    updateAccountProbateAndLiquidity(clientId: string, allAccountPayload): any {
        return this.http.put('/v31/client/' + clientId + '/accounts/', allAccountPayload);
    }

    generateFactSheetReport(prod_code: string, planningCountry: string): Observable<any> {
        const httpOptionObj = Object.assign({});
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.post('/v30/products/report/fundcode/' + prod_code + '/planningcountry/' + planningCountry, {}, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    getFavListByProdsub(prodsub: string) {
        return this.http.get('/v30/accounts/prodfavlist/' + prodsub);
    }

    createEntityReport(clientId, entityId, scenario, reportType) {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        // tslint:disable-next-line:max-line-length
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/entity-report?scenario=' + scenario + '&reportType=' + reportType, httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    getAccountOwners(clientId, accountId?) {
        const queryParam = accountId ? '?accountId=' + accountId  : '';
        return this.http.get('/v30/client/' + clientId + '/account-owners' + queryParam);
    }
}
