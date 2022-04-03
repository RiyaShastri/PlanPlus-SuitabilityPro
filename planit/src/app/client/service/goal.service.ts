import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '../../shared/app.reducer';
import { SetGoal, SetGoalRetirementAssumption, SetPlanAssumpt, SetRevenueDates, SetClientDefaultData } from '../../shared/app.actions';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class GoalService {
    private synced = new Subject<any>();
    constructor(
        private http: HttpClient,
        private store: Store<AppState>
    ) { }

    startSync(param) {
        this.synced.next(param);
    }
    observerSync() {
        return this.synced.asObservable();
    }

    getGoalsByClientId(clientId, sortBy = 'goal_type', viewBy = 'age', scenario = '00'): any {
        return this.http.get('/v30/goal/' + clientId + '/list?viewBy=' + viewBy + '&sortBy=' + sortBy + '&scenario=' + scenario);
    }

    addGoal(clientId, payload, scenario = '00'): any {
        return this.http.post('/v30/goal/' + clientId + '?scenario=' + scenario, payload);

    }

    deleteGoal(goalId) {
        return this.http.delete('/v30/goal/' + goalId);
    }

    getGoalByGoalId(goalId: string) {
        return this.http.get('/v30/goal/' + goalId);
    }

    getGoalTypes(): any {
        return this.http.get('/v30/goal/goalTypes');
    }

    getAllCurrencyDetail(): any {
        return this.http.get('/v30/common/currency');
    }

    updateGoal(clientId: string, updatePayload) {
        return this.http.put('/v30/goal/' + clientId, updatePayload);
    }

    updateRetirementGoal(clientId: string, goalId: string, updatePayload) {
        const update = this.http.put('/v30/goal/retirement/' + clientId + '/' + goalId, updatePayload);
        update.toPromise().then(result => {
            this.store.dispatch(new SetGoalRetirementAssumption(updatePayload));
        }).catch(errorResp => {
            this.store.dispatch(new SetGoalRetirementAssumption([]));
        });
        return update;
    }


    getPlanAssumpt(clientId: string,scenario: string): any {
        return this.http.get('/v30/goal/planassumpt/' + clientId + '?scenario='+scenario);
    }

    updatePlanAssumpt(clientId: string, planAssumptPayload, scenario = '00') {
        let update = this.http.put('/v30/goal/planassumpt/' + clientId + '/client?scenario=' + scenario, planAssumptPayload);
        update.toPromise().then(result => {
            this.store.dispatch(new SetPlanAssumpt(planAssumptPayload));
        }).catch(errorResp => {
            this.store.dispatch(new SetPlanAssumpt([]));
        });
        return update;
    }

    getInstitutionList(countryCode: string): any {
        return this.http.get('/v30/common/' + countryCode + '/institution');
    }

    getInstitutionCost(institutionId: string, normalTution: boolean, roomBoard: boolean, clinum: string) {
        return this.http.get('/v30/common/institution/' + institutionId + '/cost/' + clinum + '?residentTuition=' + normalTution + '&roomAndBoard=' + roomBoard);
    }


    async getClientGoalPayload(clientId: string, scenario = '00') {
        await this.getGoalsByClientId(clientId,'goal_type','age',scenario).toPromise().then(result => {
            this.store.dispatch(new SetGoal(result));
        }).catch(errorResp => {
            this.store.dispatch(new SetGoal([]));
        });
    }

    async getRevenueDates(){
        await this.getOtherRevenueStartEndOption().toPromise().then(result => {
            this.store.dispatch(new SetRevenueDates(result));
        }).catch(error =>{
            this.store.dispatch(new SetRevenueDates([]));
        })
        
    }

    getOtherRevenueStartEndOption(): any {
        return Observable.forkJoin(
            this.http.get('/v30/revenue/revenuestartoptions'),
            this.http.get('/v30/revenue/revenueendoptions')
        );
    }

    getGovermentPensionOptions(countryCode: string): any {
        return this.http.get('/v30/revenue/governmenttypedropdown?country=' + countryCode);
    }

    getOtherRevenueTypeOption(): any {
        return this.http.get('/v30/revenue/revenuetypeoptions');
    }

    getClientSpouseAgeList(clientId: string, govermentBenifit: string): any {
        return this.http.get('/v30/revenue/ageDropdown?clientId=' + clientId + '&govtBenefit=' + govermentBenifit);
    }

    getResidentOptions(): any {
        return this.http.get('/v30/revenue/revenueresidentoptions');
    }

    addRevenue(revenuePayload, scenario) {
        return this.http.post('/v30/revenue/?scenario=' + scenario, revenuePayload);

    }

    contributionCalculation(calculationPaylod): any {
        return this.http.post('/v30/revenue/contributionPeriodCalculation', calculationPaylod);
    }

   async getClientData(clientId,scenario = '00'){
      await this.getClientDefaultData(clientId,scenario).toPromise().then(result => {
            this.store.dispatch(new SetClientDefaultData(result));
        }).catch(err => {
            this.store.dispatch(new SetClientDefaultData([]))
        });
    }

    getClientDefaultData(clientId,scenario = '00'): any {
        return this.http.get('/v30/revenue/clientdefaultdata?familyId=' + clientId + '&scenario=' + scenario);
    }

    getRevenueTexableOptions(): any {
        return this.http.get('/v30/revenue/revenuetaxableoptions');
    }

    updateRevenue(revenuePayload,scenario) {
        return this.http.put('/v30/revenue/?scenario=' + scenario, revenuePayload);

    }

    getRevenueGraphDataByClientId(clientId: string, graphname: string): any {
        return this.http.get('/v30/revenue/graphdata?familyId=' + clientId + '&graphName=' + graphname);
    }

    getGoalHighLevelAnalysis(goalId, type): any {
        return this.http.get('/v30/goal/' + goalId + '/highlevel?type=' + type);
    }

    getGoalValueOfAdvice(goalId): any {
        return this.http.get('/v30/goal/' + goalId + '/valueofadvice');
    }

    getPlanningAlternativeGraphs(clientId, goalId, plannum, payload = [], type = 'current scenario'): any {
        return this.http.post('/v30/client/' + clientId + '/goal/' + goalId + '/planning-alternative/_graphresult?plannum=' + plannum + '&type=' + type, payload);
    }

    updatePlanningAlternatives(payload, goalId, plannum, type = 'current scenario'): any {
        return this.http.put('/v30/goal/' + goalId + '/graphresult?plannum=' + plannum + '&type=' + type, payload);
    }

    getCertaintyOfOutcome(portfolioId, resultFor): any {
        return this.http.get('/v30/goal/' + portfolioId + '/certaintyofoutcome?type=' + resultFor);
    }

    getValueRisk(portfolioId: string, resultFor): any {
        return this.http.get('/v30/goal/' + portfolioId + '/var?type=' + resultFor);
    }

    getFavourableAnalysis(portfolioId: string, resultFor): any {
        return this.http.get('/v30/goal/' + portfolioId + '/favunfavmarkt?type=' + resultFor);
    }

    getMortalityGraphData(countryCode: string, gender1: string, gender2: string, age1 = 0, age2 = 0): any {
        return Observable.forkJoin(
            this.http.get('/v30/common/mortalityGraph?age=' + age1 + '&countryCode=' + countryCode + '&gender=' + gender1),
            this.http.get('/v30/common/mortalityGraph?age=' + age2 + '&countryCode=' + countryCode + '&gender=' + gender2)
        );
    }

    getPortfolioTypesForAssumptions(clientId): any {
        return this.http.get('/v30/goal/' + clientId + '/assumptionDropList');
    }

    getAssumptionsData(goalId, scenario = 'Current Scenario'): any {
        return this.http.get('/v30/goal/assumptionData?keyobjnum=' + goalId + '&scenario=' + scenario);
    }

    updateAssumptionsData(payload): any {
        return this.http.put('/v30/goal/assumptionData', payload);
    }

    getSavingsForPlanningAlternatives(goalId, type): any {
        return this.http.get('/v30/goal/' + goalId + '/planningalternative/savingsdetails?type=' + type);
    }

    getPlanTracDetails(goalId): any {
        return this.http.get('/v30/plantrac/' + goalId);
    }

    startPlanTrac(goalId): any {
        return this.http.post('/v30/plantrac/' + goalId + '/start', {});
    }

    refreshPlanTrac(goalId): any {
        return this.http.post('/v30/plantrac/' + goalId + '/refresh', {});
    }

    getPlanTracSavingsWithdrawals(goalId, timePeriod, viewBy): any {
        return this.http.get('/v30/plantrac/' + goalId + '/savings-withdrawals?timePeriod=' + timePeriod + '&viewBy=' + viewBy);
    }

    getPlanTracSavingsDetails(goalId, filter, timePeriod, viewBy): any {
        return this.http.get('/v30/plantrac/' + goalId + '/savings-withdrawals-details?filter=' + filter + '&timePeriod=' + timePeriod + '&viewBy=' + viewBy);
    }

    getPlanTracTimePeriodOptions(goalId): any {
        return this.http.get('/v30/plantrac/' + goalId + '/time-period');
    }

    getGoalMapGraphData(clientId: string, graphName: string): any {
        return this.http.get('/v30/goal/graphdata?familyId=' + clientId + '&graphName=' + graphName);
    }

    syncGoalStrategies(clientId, goalId) {
        return this.http.post('/v30/goal/' + clientId + '/' + goalId + '/sync', {});
    }

    savingMapGraphData(clientId: string, accountId: string, graphName: string): any {
        return this.http.get('/v30/client/' + clientId + '/savings/graph-data?accountId=' + accountId + '&graphName=' + graphName);
    }

    savingAllAccountGraph(clientId: string, graphName: string): any {
        return this.http.get('/v30/client/' + clientId + '/savings/graph-data?graphName=' + graphName);
    }

    saveReport(clientID, generateReport): any {
        const httpOptionObj = {};
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        // tslint:disable-next-line:max-line-length
        return this.http.get('/v30/goal/report/' + clientID + '/' + generateReport.goalID + '?reportType=' + generateReport.reportType + '&criteria=' + generateReport.criteria + '&format=' + generateReport.format, httpOptionObj);
    }

}
