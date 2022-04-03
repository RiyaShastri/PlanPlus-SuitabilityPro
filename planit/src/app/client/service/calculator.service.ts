import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { DocumentService } from '../service/document.service';
import swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { ClientProfileService } from './profile.service';
@Injectable()
export class CalculatorService {
    httpOptionObj = {};
    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private documentService: DocumentService,
        private profileService: ClientProfileService
    ) {
        // for generate report
        this.httpOptionObj['responseType'] = 'Blob' as 'json';
        this.httpOptionObj['observe'] = 'response';
    }

    getLoanList(clientId: string): any {
        return this.http.get('/v30/loan-amortization-calculator/loan-droplist?clientId=' + clientId);
    }

    getLoanAmortizationCalculatorData(isCalculation: boolean, loanPayload) {
        return this.http.post('/v30/loan-amortization-calculator/?isCalculation=' + isCalculation, loanPayload);
    }

    getFrequencyList(frequencyType: string): any {
        return this.http.get('/v30/common/frequency?type=' + frequencyType);
    }

    getPatymentTypes(): any {
        return this.http.get('/v30/common/paymenttype');
    }

    getScenarioDropListForCriticalIllness(clientId: string, type): any {
        return this.http.get('/v30/critical-illness-calculator/scenario-droplist?clientId=' + clientId + '&type=' + type);
    }

    getCriticalIllnessData(type, clientId?: string, scenarioId?: string) {
        const scenarioValue = clientId ? 'clientId=' + clientId + '&screenId=' + scenarioId + '&type=' + type : 'type=' + type;
        return this.http.get('/v30/critical-illness-calculator?' + scenarioValue);
    }

    saveCriticalIllnessData(clientId: string, savePayload) {
        return this.http.post('/v30/critical-illness-calculator?clientId=' + clientId, savePayload);
    }

    getScenarioDropListForLongTerm(clientId: string): any {
        return this.http.get('/v30/long-term-care-calculator/scenario-droplist?clientId=' + clientId);
    }

    getLongTermCareData(clientId?: string, scenarioId?: string) {
        const scenarioValue = clientId ? '?clientId=' + clientId + '&screenId=' + scenarioId : '';
        return this.http.get('/v30/long-term-care-calculator' + scenarioValue);
    }

    saveLongTermCareData(clientId: string, savePayload) {
        return this.http.post('/v30/long-term-care-calculator/' + clientId, savePayload);
    }

    getLoanTypes(clientId: string): any {
        return this.http.get('/v30/debt-consolidation-calculator/loan-types?clientId=' + clientId);
    }

    getLoans(clientId): any {
        return this.http.get('/v30/debt-consolidation-calculator/loans?clientId=' + clientId);
    }

    saveLoans(clientId, loanPayload): any {
        return this.http.put('/v30/debt-consolidation-calculator/loans?clientId=' + clientId, loanPayload);
    }

    getLeverageScenarioDroplist(clientId: string): any {
        return this.http.get('/v30/leverage-calculator/scenario-droplist?clientId=' + clientId);
    }

    getLeverageCalculation(clientId: string) {
        return this.http.post('/v30/leverage-calculator/calculate?clientId=' + clientId, {});
    }

    getLeverage(clientId: string, screenId?) {
        const value = screenId ? 'clientId=' + clientId + '&screenId=' + screenId : 'clientId=' + clientId;
        return this.http.get('/v30/leverage-calculator?' + value);
    }

    saveLeverageData(clientId: string, data) {
        return this.http.post('/v30/leverage-calculator?clientId=' + clientId, data);
    }

    getDebtConsolidationData(clientId?: string, getPayload = {}) {
        const scenarioValue = clientId ? '?clientId=' + clientId : '';
        return this.http.post('/v30/debt-consolidation-calculator' + scenarioValue, getPayload);
    }

    setPrimaryLoan(clientId: string, loanPayload) {
        return this.http.put('/v30/debt-consolidation-calculator/primary-loan?clientId=' + clientId, loanPayload);
    }

    generateReportForCriticalIllness(reportObj) {
        return this.http.post('/v30/critical-illness-calculator/report', reportObj, this.httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateReportForDebtConsolidation(clientId: string, savePayload) {
        return this.http.post('/v30/debt-consolidation-calculator/report?clientId=' + clientId, savePayload, this.httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateReportForLeverage(reportobject) {
        // tslint:disable-next-line:max-line-length
        return this.http.post('/v30/leverage-calculator/report', reportobject, this.httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateReportForLoanAmortization(clientId: string, savePayload) {
        return this.http.post('/v30/loan-amortization-calculator/report?clientId=' + clientId, savePayload, this.httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    generateReportForLongTermCare(reportObj) {
        return this.http.post('/v30/long-term-care-calculator/report', reportObj, this.httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    calculateDebtConsolidation(clientId: string, dataPayload) {
        return this.http.post('/v30/debt-consolidation-calculator/calculate?clientId=' + clientId, dataPayload);
    }

    calculateLeverage(clientId: string, dataPayload) {
        return this.http.post('/v30/leverage-calculator/calculate?clientId=' + clientId, dataPayload);
    }

    calculateLongTerm(dataPayload) {
        return this.http.post('/v30/long-term-care-calculator/_calculate', dataPayload);
    }

    calculateCriticalIllness(dataPayload) {
        return this.http.post('/v30/critical-illness-calculator/_calculate', dataPayload);
    }

    getPlanTypeDroplist(): any {
        return this.http.get('/v30/rrif-calculator/plan-types');
    }

    getDefaultRegistered(clientId: string): any {
        return this.http.get('/v30/rrif-calculator/?clientId=' + clientId);
    }
    
    scenarioDroplistForLifeInsuranceAndDisabilityInsurance(isDisability, clientId): any {
        const url = isDisability ? '/v30/life-insurance-calculator/scenarios?clientId=' : '/v30/life-insurance-calculator/scenarios?clientId=';
        return this.http.get(url + clientId);
    }

    getDataOfLifeInsuranceAndDisabilityInsurance(isDisability, clientId?, screenId?): any {
        const url = isDisability ? '/v30/disability-calculator' : '/v30/life-insurance-calculator';
        const scenarioValue = (clientId && screenId) ? '?clientId=' + clientId + '&screenId=' + screenId : '';
        return this.http.get(url + scenarioValue);
    }

    calculateLifeInsuranceAndDisabilityInsurance(isDisability, dataPayload) {
        const url = isDisability ? '/v30/disability-calculator/_calculate' : '/v30/life-insurance-calculator/_calculate';
        return this.http.post(url, dataPayload);
    }

    saveLifeInsuranceAndDisabilityInsurance(isDisability, clientId, savePayload) {
        const url = isDisability ? '/v30/disability-calculator?clientId=' : '/v30/life-insurance-calculator?clientId=';
        return this.http.post(url + clientId, savePayload);
    }

    downloadReport(data, reportName) {
        const headers = data['headers'].get('content-disposition');
        const filename = headers.split('=')[1];
        this.translate.get([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'GENERATE_REPORT.POPUP.REPORT_GENERATED_MESSAGE',
            'GENERATE_REPORT.POPUP.REPORT_DOWNLOAD_QUESTION',
            'GENERATE_REPORT.DOWNLOAD_MESSAGE',
            'CUSTOM.DOWNLOAD'
        ], { reportName: reportName }).subscribe((res: string) => {
            swal({
                title: res['GENERATE_REPORT.POPUP.REPORT_GENERATED_MESSAGE'],
                text: res['GENERATE_REPORT.POPUP.REPORT_DOWNLOAD_QUESTION'],
                type: 'success',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: res['CUSTOM.DOWNLOAD']
            }).then(result => {
                if (result.value) {
                    this.documentService.downloadFile(data['body'], filename);
                    swal(res['ALERT_MESSAGE.SUCCESS_TITLE'], res['DOCUMENT.GENERATE_DOCUMENT.DOWNLOAD_MESSAGE'], 'success');
                }
            });
        });
    }
}
