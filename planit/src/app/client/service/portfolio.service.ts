import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AppState } from '../../shared/app.reducer';
import { ClientProfileService } from './profile.service';
import { riskScoreBadge } from '../client-models';
import {
    SetPortfolio,
    SetAlloc
} from '../../shared/app.actions';
import { Router } from '@angular/router';

@Injectable()
export class PortfolioService {

    selectedAccountsData = new EventEmitter<any>();
    updatedProductsData = new EventEmitter<any>();
    constructor(
        private http: HttpClient,
        private store: Store<AppState>,
        private profileService: ClientProfileService,
        private router: Router
    ) { }

    getAllPortfoliosData(clientId: string, expanded: boolean = true) {
        return this.http.get('/v30/portfolios/' + clientId + '?expanded=' + expanded);
    }

    async getClientPortfolioPayload(clientId: string, expanded: boolean = true, locationBack: boolean = false) {
        const portfolioObj = {
            'clientId': '',
            'idMapping': {},
            'portfolios': [],
            'totalAssets': 0
        };
        try {
            const portfoliosData = await this.getAllPortfoliosData(clientId, expanded).toPromise();
            if (portfoliosData.hasOwnProperty('portfolios')) {
                this.processPortfolios(clientId, portfoliosData['portfolios'], locationBack);
            } else {
                this.store.dispatch(new SetPortfolio(portfolioObj));
                if (locationBack) {
                    this.router.navigate(['/client', clientId, 'planning', 'portfolios']);
                }
            }
        } catch {
            this.store.dispatch(new SetPortfolio(portfolioObj));
            if (locationBack) {
                this.router.navigate(['/client', clientId, 'planning', 'portfolios']);
            }
        }
    }

    processPortfolios(clientId, portfoliosData, locationBack) {
        let totalAssets = 0;
        const idMapping = {};
        portfoliosData.forEach((portfolio, key) => {
            idMapping[portfolio.id] = key;
            portfolio['decisionMaker'] = {};
            portfolio.ownership = (portfolio.ownership !== null) ? portfolio.ownership : [];
            portfolio.ownership.forEach(ownerObj => {
              ownerObj['personalDetails'] = Object.assign({}, ownerObj['owner']);
              if (ownerObj['owner']) {
                const relation_staus = this.profileService.checkStatus(ownerObj['owner'].role);
                ownerObj['personalDetails']['btnColor'] = relation_staus['btnColor'];
                ownerObj['personalDetails']['relation_staus'] = relation_staus['relation'];

                if (ownerObj['personalDetails'].firstName !== undefined && ownerObj['personalDetails'].firstName !== null) {
                  ownerObj['personalDetails']['btnInitials'] = ownerObj['personalDetails'].firstName[0] +
                    (ownerObj['personalDetails'].lastName ? ownerObj['personalDetails'].lastName[0] : ownerObj['personalDetails'].firstName[1]);
                }
              }
              ownerObj['personalDetails']['avatar'] = ownerObj['personalDetails']['avatarUrl'];
              if (ownerObj.decisionMaker === true) {
                portfolio['decisionMaker'] = ownerObj;
              }
              if (portfolio['totalInvested'] === undefined) {
                portfolio['totalInvested'] = ownerObj.invested;
              } else {
                portfolio['totalInvested'] += ownerObj.invested;
              }
              portfolio.decisionMaker.riskBand = riskScoreBadge(portfolio.decisionMaker.riskScore).label;
            });
            totalAssets += portfolio.totalAssets;
        });
        const portfolioObj = {
            'clientId': clientId,
            'idMapping': idMapping,
            'portfolios': portfoliosData,
            'totalAssets': totalAssets
        };
        if (locationBack) {
            this.router.navigate(['/client', clientId, 'planning', 'portfolios']);
        }
        this.store.dispatch(new SetPortfolio(portfolioObj));
    }

    addPortfolio(portfolio) {
        return this.http.post('/v30/portfolios', portfolio);
    }

    updatePortfolioByID(clientId: string, portfolioDetail) {
        return this.http.put('/v30/portfolios/' + clientId, portfolioDetail);
    }

    renamePortfolio(clientId, portfolioId, portfolioDesc) {
        return this.http.put('/v30/portfolios/clients/' + clientId + '/portfolios/' + portfolioId + '/rename?description=' + portfolioDesc, {});
    }

    deletePortfolio(portfolioId): Observable<any> {
        return this.http.delete('/v30/portfolios/' + portfolioId).catch(error => Observable.throw(error));
    }

    getPortfoliosDetailsById(portfolioId: string, currency: string): any {
        return this.http.get('/v30/portfolios/details/' + portfolioId + '?currency=' + currency + '&expanded=true');
    }

    saveEditPolicy(clientId: string, portfolioId: string, allocationDetail: any) {
        return this.http.put('/v30/portfolios/' + clientId + '/' + portfolioId + '/editpolicy?portfolioId=' + portfolioId, allocationDetail)
            .catch(error => Observable.throw(error));
    }

    updatePortfolioCurrentAllocation(clientId: string, portfolioId: string, allocationDetail: any) {
        return this.http.put('/v30/portfolios/' + clientId + '/' + portfolioId + '/editAllocation', allocationDetail)
            .catch(error => Observable.throw(error));
    }

    getSuitabilityRange(clientId, portfolioId, state) {
        return this.http.get('/v30/portfolios/' + clientId + '/' + portfolioId + '/suitability?view=' + state);
    }

    getBackTest(clientId, portfolioId, state): any {
        return Observable.forkJoin(
            this.http.get('/v30/portfolios/' + clientId + '/' + portfolioId + '/updown?view=' + state),
            this.http.get('/v30/portfolios/' + clientId + '/' + portfolioId + '/losses?view=' + state)
        );
    }

    updateSuitability(portfolioId, suitabilityScore, suitabilityNote) {
        return this.http.put('/v30/portfolios/' + portfolioId + '/suitability?suitabilityScore=' + suitabilityScore, suitabilityNote).catch(error => Observable.throw(error));
    }

    getInvestorsList(clientId: string, portfolioId: string) {
        return this.http.get('/v30/portfolios/' + clientId + '/' + portfolioId + '/investors').catch(error => Observable.throw(error));
    }

    addInvestors(clientId, portfolioId, investor) {
        return this.http.post('/v30/portfolios/' + clientId + '/' + portfolioId + '/addInvestors', investor).catch(error => Observable.throw(error));
    }

    updateInvestment(clientId: string, portfolioId: string, ownership) {
        return this.http.put('/v30/portfolios/' + clientId + '/' + portfolioId + '/addDescisionMaker', ownership);
    }

    getAllocationDetails(clientId: string, payload = {}): any {
        return this.http.post('/v30/portfolios/' + clientId + '/allocation', payload);
    }

    getClientAllocationPayload(clientId) {
        this.getAllocationDetails(clientId).toPromise().then(data => {
            this.store.dispatch(new SetAlloc(data));
        }).catch(errorResponse => {
            this.store.dispatch(new SetAlloc({}));
        });
    }

    getRollupClassList(countryCode): any {
        return this.http.get('/v30/common/rollupClasses/' + countryCode);
    }

    getCashWedge(portfolioId: string, language = 'en', currency = 'CAD'): Observable<any> {
        return this.http.get('/v30/portfolios/' + portfolioId + '/cashwedge?language=' + language + '&curCode=' + currency).catch(error => Observable.throw(error));
    }

    getPortfolioSolution(portfolioId, solutionName): Observable<any> {
        return this.http.get('/v30/solutions/' + portfolioId + '?solutionFamilyName=' + solutionName)
            .catch(error => Observable.throw(error));
    }

    getRecommendedSolution(portfolioId): any {
        return this.http.get('/v30/solutions/implemented-solution/' + portfolioId);
    }

    saveImplementedSolution(portfolioId, solutionId, payload = {}) {
        return this.http.post('/v30/solutions/' + portfolioId + '/implement-solution/' + solutionId, payload);
    }

    getListOfPortfolios(clientId: string): any {
        return this.http.get('/v30/portfolios/' + clientId);
    }

    getSuitabilityBandPjm(portfolioId: string): any {
        return this.http.get('/v30/portfolios/' + portfolioId + '/suitability-band-pjm');
    }

    getLinkedGoalsOfPortfolios(clientId): any {
        return this.http.get('/v30/portfolios/' + clientId + '/linkedgoal');
    }

    linkPortfoliosToGoals(clientId, payload): any {
        return this.http.post('/v30/portfolios/' + clientId + '/linkedgoal', payload);
    }

    getCashWedgeDetails(clientId, portfolioId, language, type): any {
        return this.http.get('/v30/portfolios/' + clientId + '/' + portfolioId + '/cashwedge?language=' + language + '&type=' + type);
    }

    getImplementationAccountsToCustomize(clientId, portfolioId, currency?): any {
        return this.http.get('/v31/client/' + clientId + '/portfolios/' + portfolioId + '/accounts?selectedCurrency=' + currency);
    }

    keepCurrentHoldings(clientId, portfolioId, plannum): any {
        return this.http.put('/v31/client/' + clientId + '/portfolios/' + portfolioId + '/accounts/' + plannum + '/keep-current-holdings', {});
    }

    resetProduct(clientId, portfolioId, plannum): any {
        return this.http.put('/v31/client/' + clientId + '/portfolios/' + portfolioId + '/accounts/' + plannum + '/reset-holdings', {});
    }

    rebalanceProducts(clientId, portfolioId, accountId, currency): any {
        return this.http.put('/v31/client/' + clientId + '/portfolios/' + portfolioId + '/accounts/' + accountId + '/rebalance?selectedCurrency=' + currency, {});
    }

    shareSelectedAccounts(param: any) {
        this.selectedAccountsData.emit(param);
    }

    shareUpdatedProducts(param: any) {
        this.updatedProductsData.emit(param);
    }

    removeUnusedProducts(clientId, portfolioId, payload): any {
        return this.http.put('/v31/client/' + clientId + '/portfolios/' + portfolioId + '/accounts/remove-unused-products', payload);
    }

    saveImplementedProductsData(clientId, portfolioId, payload): any {
        return this.http.post('/v31/client/' + clientId + '/portfolios/' + portfolioId + '/accounts/products', payload);
    }

    getEfficientFrontierGraphData(clientId, portfolioId, allocationType): any {
        return this.http.get('/v30/client/' + clientId + '/portfolio/' + portfolioId + '/frontier?allocationType=' + allocationType);
    }

    getEditQuestion(clientId: string, portfolioId: string): any {
        return this.http.get('/v30/clients/' + clientId + '/portfolios/' + portfolioId + '/implementation-questions');
    }

    updateQuestions(clientId: string, portfolioId: string, questionPayload) {
        return this.http.put('/v30/clients/' + clientId + '/portfolios/' + portfolioId + '/implementation-questions', questionPayload);
    }

    getProductAllocations(productNumber): any {
        return this.http.get('/v30/products/asset-allocation?productNumber=' + productNumber);
    }
}
