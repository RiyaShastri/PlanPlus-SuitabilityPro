import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EntitiesService {
    shareClassResponse = new Subject<any>();
    constructor(
        private http: HttpClient
    ) { }

    redirectToOwnershipTab(param) {
        this.shareClassResponse.next(param);
    }

    getShareClassResponse(): Observable<any> {
        return this.shareClassResponse.asObservable();
    }

    getTaxAssumptionData(clientId, entityId): any {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/assumptions');
    }

    updateTaxAssumption(clientId, entityId, taxAssumptionPayload) {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId + '/assumptions', taxAssumptionPayload);
    }

    getSharesList(clientId, entityId): any {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/shares');
    }

    addOtherShareClass(clientId, entityId, sharePayload): any {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId + '/shares', sharePayload);
    }

    addOtherOwner(clientId, entityId, ownerPayload) {
        return this.http.post('/v30/client/' + clientId + '/entities/' + entityId + '/other-owner', ownerPayload);
    }

    deleteOwner(clientId, entityId, ownerId) {
        return this.http.delete('/v30/client/' + clientId + '/entities/' + entityId + '/owners/' + ownerId);
    }

    updateShare(clientId, entityId, sharePayload) {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId + '/shares', sharePayload);
    }

    getShareByShareId(clientId, entityId, shareId) {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/shares/' + shareId);
    }

    getEntitiesList(clientId): any {
        return this.http.get('/v30/client/' + clientId + '/entities/planning');
    }

    getInvestmentReturnRiskData(clientId, entityId, scenario, investmentStrategy = '', isCustom?): any {
        let queryParam = '';
        if (investmentStrategy !== '') {
            queryParam = '?investmentStrategy=' + investmentStrategy;
        }
        if (isCustom === false) {
            queryParam += (queryParam === '') ? '?' : '&';
            queryParam += 'isCustom=' + isCustom;
        }
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + scenario + '/planning/inv-return-and-risk' + queryParam);
    }

    getInvestmentStrategies(clientId): any {
        return this.http.get('/v30/client/' + clientId + '/entities/planning/inv-strategies');
    }

    updateInvestmentRiskReturn(clientId, entityId, scenario, payload): any {
        return this.http.post('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + scenario + '/planning/inv-return-and-risk', payload);
    }

    addDistribution(clientId, entityId, sceanrio, payload) {
        return this.http.post('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + sceanrio + '/planning/lt-distribution', payload);
    }

    editDistribution(clientId, entityId, scenario, payload) {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + scenario + '/planning/lt-distribution', payload);
    }

    editIncome(clientId, entityId, scenario, payload) {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + scenario + '/planning/lt-income', payload);
    }

    addIncome(clientId, entityId, sceanrio, payload) {
      return this.http.post('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + sceanrio + '/planning/lt-income', payload);
    }

    getSourcesList(clientId): any {
        return this.http.get('/v30/client/' + clientId + '/entities/source-types');
    }

    getShareClassData(clientId, entityId, shareClassId): any {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/shareclass/' + shareClassId + '/shareholders');
    }

    getDistributionByDistributionId(clientId, entityId, distributionId): any {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/planning/distribution/' + distributionId);
    }

    getLongTermIncomeDistributionData(clientId, entityId, scenario): any {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + scenario + '/planning/lt-income-withdrawal');
    }

    deleteDistrbution(clientId, entityId, distributionId) {
        return this.http.delete('/v30/client/' + clientId + '/entities/' + entityId + '/planning/distribution/' + distributionId);
    }

    getEntityCurrentData(clientId, entityId, scenario): any {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + scenario + '/planning/cur-year-income');
    }

    updateEntityCurrentData(clientId, entityId, scenario, payload) {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId + '/scanrio/' + scenario + '/planning/cur-year-income', payload);
    }

    calulateCurrentData(clientId, entityId, scenario, payload): any {
        return this.http.post('/v30/client/' + clientId + '/entities/' + entityId + '/scenario/' + scenario + '/planning/_calculate-inc-dist', payload);
    }

    viewAnalysisProgressBar(clientId, entityId) {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId + '/progeress-bar', {});
    }
}
