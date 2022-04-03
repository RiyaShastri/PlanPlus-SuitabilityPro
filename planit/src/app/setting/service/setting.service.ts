import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { TokenStorage } from '../../shared/token.storage';
import { RefreshDataService } from '../../shared/refresh-data';
import { catchError } from 'rxjs/operators';
import { ClientProfileService } from '../../client/service';

@Injectable()
export class SettingService {
    languageToShow = 'en';
    advisorRegion = '0001';
    currentTranslation = {};
    newCustomProductsData = new EventEmitter<any>();
    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService,
        private profileService: ClientProfileService
    ) {
        this.refreshDataService.currentTranslation.subscribe(currentTranslation => {
            this.currentTranslation = JSON.parse(currentTranslation);
        });
    }

    getAllSolutions(): Observable<any> {
        return this.http.get('/v30/solutions');
    }

    getAllocationClassDetails(solutionFamilyId): Observable<any> {
        return this.http.get('/v30/solutions/' + solutionFamilyId + '/assetclass');
    }

    saveSolutionFamily(requestObj): Observable<any> {
        return this.http.post('/v30/solutions/solution-family', requestObj);
    }

    updateSolutionFamily(solutionFamilyId, requestObj): Observable<any> {
        return this.http.put('/v30/solutions/solution-family/' + solutionFamilyId, requestObj);
    }

    getSolutionFamily(): Observable<any> {
        return this.http.get('/v30/solutions/solution-family');
    }

    saveSolution(reqObj, solutionId): Observable<any> {
        if (solutionId === '' || solutionId === null || solutionId === undefined) {
            return this.http.post('/v30/solutions/custom-solution', reqObj);
        } else {
            return this.http.put('/v30/solutions/update-solution/', reqObj);
        }
    }

    getSolutionFamilydetails(solutionFamilyId): Observable<any> {
        return this.http.get('/v30/solutions/solution-family/' + solutionFamilyId);
    }

    deleteSolutionFamily(solutionFamilyId): Observable<any> {
        return this.http.delete('/v30/solutions/solution-family/' + solutionFamilyId);
    }

    deleteSolution(solutionId): Observable<any> {
        return this.http.delete('/v30/solutions/delete-solution/' + solutionId);
    }

    getSolutionDetails(solutionId): Observable<any> {
        return this.http.get('/v30/solutions/solution-info/' + solutionId);
    }

    getRegion() {
        return this.http.get('/v30/common/regions?countryCode=CAN');
    }

    getChildRegions() {
        return this.http.get('/v30/common/childregions');
    }

    getPJMDetails() {
        return this.http.get('/v30/pjm');
    }

    checkJurisdictions(): any {
        return this.http.get('/v30/common/jurisdictions');
    }

    solutionFamilySuppressionOption(solutionFamilyId, isSuppress: true) {
        if (isSuppress) {
            return this.http.put('/v30/solutions/un-suppress-family/' + solutionFamilyId, {});
        } else {
            return this.http.put('/v30/solutions/suppress-family/' + solutionFamilyId, {});
        }
    }

    getProductType(): any {
        return this.http.get('/v30/accounts/producttype');
    }

    addCustomProduct(customPayload) {
        return this.http.post('/v30/products', customPayload);
    }

    solutionSuppressionOption(solutionId, isSuppress: true) {
        if (isSuppress) {
            return this.http.put('/v30/solutions/un-suppress-solution/' + solutionId, {});
        } else {
            return this.http.put('/v30/solutions/suppress-solution/' + solutionId, {});
        }
    }

    cloneSolution(solutionFamilyId, solutionId) {
        return this.http.post('/v30/solutions/clone-solution/' + solutionId + '?solutionFamilyId=' + solutionFamilyId, {});
    }

    getAccesibleLanguage(): any {
        return this.http.get('/v30/common/accessible-languages');
    }

    saveTranslation(reqObj) {
        return this.http.post('/v30/translations/add', reqObj);
    }

    updatePJM(reqObj) {
        return this.http.post('/v30/pjm', reqObj);
    }

    getInvestmentPolicies(clientId = ''): any {
        return this.http.get('/v30/investment-policies/default?clientId=' + clientId);
    }

    getIncomeDistribution(): any {
        return this.http.get('/v30/cma/income-distribution?view=default');
    }
    getIncomeDistributionEtc(): any {
        return this.http.get('/v30/cma/income-distribution');
    }

    getRatesOfReturnDetails(): any {
        return this.http.get('/v30/cma/ratesOfReturn');
        // return this.http.post('/v30/cma/ratesOfReturn',
        //     {
        //         'country': null,
        //         'customInflationRate': null,
        //         'distributionToApply': null,
        //         'inflationRate': null,
        //         'inflationType': null,
        //         'methodologyType': null,
        //         'ratesToApplyType': null,
        //         'region': null
        //     }
        //     );
    }

    getRegionList(): any {
        return this.http.get('/v30/common/regions/planner');
    }

    getCountryList(): any {
        return this.http.get('/v30/common/jurisdictions');
    }

    updateRatesOfReturn(obj): any {
        return this.http.put('/v30/cma/ratesOfReturn', obj);
    }

    getClassData(obj): any {
        // return this.http.get('/v30/cma/' + country + '/' + region);
        return this.http.post('/v30/cma/ratesOfReturn', obj);
    }

    updateIncomeDistribution(obj): any {
        return this.http.put('/v30/cma/income-distribution', obj);
    }

    riskRanges(calGrowth) {
        return this.http.get('/v30/solutions/risk-ranges?growth=' + calGrowth);
    }

    updateRiskGraph(reqObj) {
        return this.http.put('/v30/solutions/caculate-ror-risk', reqObj);
    }

    getTimeZone(): any {
        return this.http.get('/v30/common/timeZones');
    }

    uploadAvatar(avatar, personId): any {
        const httpOptionObj = Object.assign({});
        httpOptionObj['isFile'] = 'true';
        return this.http.post('/v30/common/uploadFile/' + personId, avatar, httpOptionObj);
    }

    getTranslation(country, region) {
        if (this.translate.store.currentLang) {
            this.languageToShow = this.translate.store.currentLang;
        }
        // used getTranslation to check if language is available or not
        this.translate.getTranslation(this.languageToShow).toPromise().then(res => {
            this.getFinalLabels(res, country, region);
        }).catch(errorResponse => {
            this.languageToShow = 'en';
            this.translate.getTranslation('en').toPromise().then(res => {
                this.getFinalLabels(res, country, region);
            });
        });
    }

    async getFinalLabels(globalLabels, country, region) {
        const prefix = './assets/labels/' + this.languageToShow + '/' + this.languageToShow + '-';
        if (region === undefined || region === '') {
            region = '0001';
        }
        if (country === undefined || country === '') {
            country = 'can';
        }
        await this.getRegionsForLabels().toPromise().then( async regions => {
          const regs: String[] = regions;
          const countryLables = await this.getOtherLabels(prefix + country.toLowerCase() + '.json?v=' + environment.version);
          let tempLables = countryLables;
          await regs.forEach(async reg => {
            const regionLables = await this.getOtherLabels(prefix + reg.toLowerCase() + '.json?v=' + environment.version);
            const countryAndRegionLables = await this.getOtherLabels(prefix + country.toLowerCase() + '-' + reg.toLowerCase() + '.json?v=' + environment.version);
            tempLables = this.mergeDeep(tempLables, regionLables, countryAndRegionLables);
          });
           const finalLables = this.mergeDeep(globalLabels, tempLables);
          this.translate.setTranslation(this.languageToShow, finalLables);
          this.translate.use(this.languageToShow);
        });
    }

    getOtherLabels(filename) {
        const promise = new Promise(async (resolve, reject) => {
            if (this.currentTranslation.hasOwnProperty(filename)) {
                resolve(this.currentTranslation[filename]);
            } else {
                this.http.get(filename).toPromise().then(labels => {
                    this.currentTranslation[filename] = labels;
                    this.refreshDataService.changeTranslation(JSON.stringify(this.currentTranslation));
                    resolve(labels);
                }).catch(errorResponse => {
                    this.currentTranslation[filename] = {};
                    this.refreshDataService.changeTranslation(JSON.stringify(this.currentTranslation));
                    resolve({});
                });
            }
        });
        return promise;
    }

    mergeDeep(...objects) {
        const isObject = obj => obj && typeof obj === 'object';

        return objects.reduce((prev, obj) => {
            Object.keys(obj).forEach(key => {
                const pVal = prev[key];
                const oVal = obj[key];

                if (Array.isArray(pVal) && Array.isArray(oVal)) {
                    prev[key] = pVal.concat(...oVal);
                } else if (isObject(pVal) && isObject(oVal)) {
                    prev[key] = this.mergeDeep(pVal, oVal);
                } else {
                    prev[key] = oVal;
                }
            });

            return prev;
        }, {});
    }

    getDefaultInvestmentData() {
        return this.http.get('/v30/investment-policies-admin-master/');
    }

    updateDefaultInvestmentPolicy(investmentPayload) {
        return this.http.post('/v30/investment-policies-admin-master', investmentPayload);
    }

    getInvestmentPolicyById(policyId: string): any {
        return this.http.get('/v30/investment-policies-admin-master/investmentPolicy?portid=' + policyId);
    }

    updateIndividualPolicy(policyPaylod) {
        return this.http.post('/v30/investment-policies-admin-master/editpolicy', policyPaylod);
    }

    getAssetsListByCountryCode(): any {
        return this.http.get('/v30/common/asset-classes');
    }

    getRegionsForLabels(): any {
      return this.http.get('/v30/common/labelRegions');
    }

    getSolutionsProductInfo(productId): any {
        const httpOptionObj = Object.assign({});
        httpOptionObj['responseType'] = 'Blob' as 'json';
        httpOptionObj['observe'] = 'response';
        return this.http.get('/v30/products/' + productId + '/report', httpOptionObj).pipe(catchError(this.profileService.parseErrorBlob));
    }

    getAllocationsBasedOnProducts(productDetails, country): any {
        return this.http.post('/v30/products/asset-allocation?countryCode=' + country, productDetails);
    }

    shareCustomProducts(param) {
        this.newCustomProductsData.emit(param);
    }

    getBackTest(solutionData){
        return Observable.forkJoin(
            this.http.post('/v30/solutions/updown' ,solutionData),    
            this.http.post('/v30/solutions/backTest' ,solutionData));
    }

    getEfficientFrontierGraphData(solutionData){
        return this.http.post('/v30/solutions/effecientFrontier' ,solutionData);
    }

}
