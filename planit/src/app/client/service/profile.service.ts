import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../shared/app.reducer';
import { PERSON_RELATION } from '../../shared/constants';
import {
    SetFamilyMembers,
    SetFamilyMembersRisk,
    SetClientAddress,
    SetNetworthInvestment,
    SetCountry,
    SetProvince,
    SetLanguage,
    SetClientProgress,
    SetClient,
    SetInvestmentData,
    SetEngagementValues,
    SetEngagementPriorities,
    SetEntityList,
    SetCorporationList,
} from '../../shared/app.actions';

@Injectable()
export class ClientProfileService {
    PERSON_RELATION = PERSON_RELATION;
    constructor(
        private http: HttpClient,
        private store: Store<AppState>,
    ) { }

    getClientPayload(clientId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'getClient': 'true',
            }),
        };
        return this.http.get('/v30/client/' + clientId, httpOptions);
    }

    storeClientPayload(clientId: string) {
        this.getClientPayload(clientId).toPromise().then(res => {
            this.store.dispatch(new SetClient(res));
        }).catch(err => {

        });
    }

    addNewClient(clientDetail) {
        return this.http.post('/v30/client/', clientDetail);
    }

    getIndividualFamilyMember(clientId: string, personId: string) {
        return this.http.get('/v30/client/' + clientId + '/familymember/' + personId);
    }

    getFamilyMembers(clientId: string) {
        return this.http.get('/v30/client/' + clientId + '/familymembers');
    }

    async getClientFamilyMembers(clientId: string) {
        try {
            const familyMembers = await this.getFamilyMembers(clientId).toPromise();
            const familyMemberPayload = await this.processFamilyMembers(clientId, familyMembers);
            return familyMemberPayload;
        } catch (error) {
            const familyMemberPayload = {
                'clientId': '',
                'idMapping': {},
                'familyMembers': []
            };
            this.store.dispatch(new SetFamilyMembers(familyMemberPayload));
            return familyMemberPayload;
        }
    }

    async processFamilyMembers(clientId, familyMembers, loadToStore = true) {
        const familyMemberIdMapping = {};
        familyMembers.forEach((member, key) => {
            const relation_staus = this.checkStatus(member.relation);
            familyMembers[key]['btnColor'] = relation_staus['btnColor'];
            familyMembers[key]['relation_staus'] = relation_staus['relation'];
            familyMembers[key]['btnInitials'] = member.firstName[0] + (member.lastName ? member.lastName[0] : member.firstName[1]);
            familyMemberIdMapping[member.id] = key;
        });
        const familyMemberPayload = {
            'clientId': clientId,
            'idMapping': familyMemberIdMapping,
            'familyMembers': familyMembers,
        };
        if (loadToStore) {
            this.store.dispatch(new SetFamilyMembers(familyMemberPayload));
        }
        return familyMemberPayload;
    }

    checkStatus(status) {
        let btnColor;
        switch (status) {
            case PERSON_RELATION.CLIENT1:
                btnColor = { btnColor: 'client', relation: 'Client 1' };
                break;
            case PERSON_RELATION.CLIENT2:
                btnColor = { btnColor: 'spouse', relation: 'Client 2' };
                break;
            case PERSON_RELATION.OTHER:
                btnColor = { btnColor: 'other', relation: 'Other Dependant' };
                break;
            case PERSON_RELATION.SON:
                btnColor = { btnColor: 'childs', relation: 'Son' };
                break;
            case PERSON_RELATION.DAUGHTER:
                btnColor = { btnColor: 'childs', relation: 'Daughter' };
                break;
            case PERSON_RELATION.BROTHER:
                btnColor = { btnColor: 'siblings', relation: 'Brother' };
                break;
            case PERSON_RELATION.SISTER:
                btnColor = { btnColor: 'siblings', relation: 'Sister' };
                break;
            case PERSON_RELATION.MOTHER:
                btnColor = { btnColor: 'parents', relation: 'Mother' };
                break;
            case PERSON_RELATION.FATHER:
                btnColor = { btnColor: 'parents', relation: 'Father' };
                break;
            case PERSON_RELATION.GRANDSON:
                btnColor = { btnColor: 'grand-child', relation: 'Grandson' };
                break;
            case PERSON_RELATION.GRANDDAUGHTER:
                btnColor = { btnColor: 'grand-child', relation: 'Granddaughter' };
                break;
            default:
                btnColor = { btnColor: 'other', relation: 'Other Dependant' };
        }
        return btnColor;
    }

    addFamilyMember(familyMember: any, clientId: string) {
        return this.http.post('/v30/client/' + clientId + '/familymember', familyMember).catch(error => Observable.throw(error));
    }

    updateFamilyDetails(editFamilymember: any, clientId: string, personId: string) {
        if (editFamilymember.relation === 12) {
            return this.http.put('/v30/client/' + clientId + '/updateClient/', editFamilymember);
        } else {
            return this.http.put('/v30/client/' + clientId + '/familymember/' + personId, editFamilymember);
        }
    }

    getProfileSummary(clientId: string): any {
        return this.http.get('/v30/client/' + clientId + '/profilesummary');
    }

    getClientProfileSummary(clientId) {
        this.getProfileSummary(clientId).toPromise().then(summaryData => {
            const progressSummary = {};
            summaryData.forEach(summary => {
                progressSummary[summary.type] = summary.status;
            });
            this.store.dispatch(new SetClientProgress(progressSummary));
        }).catch(errorResponse => {
            this.store.dispatch(new SetClientProgress({}));
        });

    }

    createUpdateAddressDetails(updateAdd: any, clientId: string): Observable<any> {
        if (updateAdd.id && updateAdd.id !== '' && updateAdd.id !== undefined) {
            return this.http.put('/v30/client/' + clientId + '/address', updateAdd);
        } else {
            updateAdd.addressType = '01';
            return this.http.post('/v30/client/' + clientId + '/address', updateAdd);
        }
    }

    getFamilyAddress(clientId: string): any {
        return this.http.get('/v30/client/' + clientId + '/address');
    }

    getClientAddress(clientId: string) {
        this.getFamilyAddress(clientId).toPromise().then(response => {
            this.store.dispatch(new SetClientAddress(response));
        }).catch(error => {
            this.store.dispatch(new SetClientAddress([]));
        });
    }

    getPersonRiskData(familyId: string, personalId: string): Observable<any> {
        return this.http.get('/v30/client/' + familyId + '/risk/' + personalId);
    }

    getFamilyMembersWithRisk(clientId) {
        return Observable.forkJoin(
            this.http.get('/v30/client/' + clientId + '/familymembers'),
            this.http.get('/v30/client/' + clientId + '/risk')
        );
    }

    getFamilyRisk(clientId) {
        return this.http.get('/v30/client/' + clientId + '/risk');
    }

    async getClientFamilyMembersRisk(clientId, familyMemberPayload = {}) {
        try {
            let riskObj = [];
            if (familyMemberPayload.hasOwnProperty('familyMembers')) {
                riskObj = <any>await this.getFamilyRisk(clientId).toPromise();
            } else {
                const response = await this.getFamilyMembersWithRisk(clientId).toPromise();
                riskObj = <any>response[1];
                familyMemberPayload = await this.processFamilyMembers(clientId, response[0], false);
            }
            this.processFamilyMembersRiskData(familyMemberPayload, riskObj);
        } catch {
            this.store.dispatch(new SetFamilyMembersRisk([]));
        }
    }

    async processFamilyMembersRiskData(familyMembersObj, memberRisks) {
        const familyData = familyMembersObj['familyMembers'];
        const idMapping = familyMembersObj['idMapping'];

        memberRisks.forEach(data => {
            const splitData = data.self.split('/');
            const familyIndex = idMapping[splitData[splitData.length - 1]];
            if (!data.reviewDate) {
                const days = this.getDays(data.inviteSentDate);
                data['isPending'] = days > 14 ? true : false;
            }
            data['personalDetails'] = familyData[familyIndex];
        });
        this.store.dispatch(new SetFamilyMembersRisk(memberRisks));
        return memberRisks;
    }

    private getDays(inviteSentDate) {
        const invitedDate: Date = new Date(inviteSentDate);
        const currentDate: Date = new Date();
        const diff = Math.abs(invitedDate.getTime() - currentDate.getTime());
        const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        return diffDays;
    }

    getRiskToleranceQuestions(familyId, personalId, lang) {
        const locale = (lang === 'fr' ? 'FRE' : 'ENG');
        return this.http.get('/v30/client/' + familyId + '/risk/' + personalId + '/getQuestionAndOptions?lang=' + locale);
    }

    getKYCdetails(clientId, personalId, locale, tab) {
        return this.http.get('/v30/kyc/' + clientId + '/getQuestionsAndOptions/' + personalId + '?lang=' + locale + '&tab=' + tab);
    }

    getKeyDifferences(familyId: string, personalId: string): Observable<any> {
        return this.http.get('/v30/client/' + familyId + '/risk/key-differences/' + personalId);
    }

    updateAgreedRisk(changeScore: any, personId: string, clientId: string) {
        return this.http.put('/v30/client/' + clientId + '/risk/' + personId + '/updateAgreedScore', changeScore);
    }

    resetRiskTolerance(clientId: string) {
        return this.http.put('/v30/client/' + clientId + '/risk/resetRiskTolernce', {});
    }

    sendInvite(familyId, personId, invitePayload) {
        return this.http.post('/v30/client/' + familyId + '/risk/sendInvite/' + personId, invitePayload);
    }

    setupMIPClient(familyId, personId, questionnaireTypePayload) {
        return this.http.post('/v30/client/' + familyId + '/risk/complete-questionnaire-setup/' + personId, questionnaireTypePayload);
    }

    sendReminder(familyId, personId, remindObj) {
        return this.http.post('/v30/client/' + familyId + '/risk/' + personId + '/remind', remindObj);
    }

    resetAndUnlock(personId, reqObj): any {
        return this.http.post('/v30/risk/' + personId + '/reset', reqObj);
    }

    /* Common Service */
    getCountry() {
        this.http.get('/v30/common/country').toPromise().then(response => {
            this.store.dispatch(new SetCountry(response));
        }).catch(errorResponse => {
            this.store.dispatch(new SetCountry([]));
        });
    }

    getProvince() {
        this.http.get('/v30/common/province').map(response => <any>(<any>response)).toPromise().then(provinces => {
            const provinceByCountry = {};
            provinces.forEach(province => {
                if (!provinceByCountry.hasOwnProperty(province.countryCode)) {
                    provinceByCountry[province.countryCode] = [];
                }
                provinceByCountry[province.countryCode].push(province);
            });
            this.store.dispatch(new SetProvince(provinceByCountry));
        }).catch(errorResponse => {
            this.store.dispatch(new SetProvince({}));
        });
    }

    getLanguages() {
        this.http.get('/v30/common/language').toPromise().then(response => {
            this.store.dispatch(new SetLanguage(response));
        }).catch(errorResponse => {
            this.store.dispatch(new SetLanguage([]));
        });
    }
    /* Common Service */


    getClientNetworthInvestmentPayload(clientId) {
        this.http.get('/v30/accounts/' + clientId + '/networth').toPromise().then(data => {
            this.store.dispatch(new SetNetworthInvestment(data));
        }).catch(errorResponse => {
            this.store.dispatch(new SetNetworthInvestment([]));
        });
    }

    getInvestmentData(clientId) {
        this.http.get('/v30/accounts/' + clientId + '/investment').toPromise().then(invest => {
            this.store.dispatch(new SetInvestmentData(invest));
        }).catch(errorResponse => {
            this.store.dispatch(new SetInvestmentData([]));
        });
    }

    convertArrayToJson(array, filterKey) {
        const json = {};
        array.forEach(element => {
            const filter = element[filterKey];
            if (!json.hasOwnProperty(filter)) {
                json[filter] = [];
            }
            json[filter].push(element);
        });
        return json;
    }

    getRegion() {
        return this.http.get('/v30/common/regions?countryCode=CAN');
    }

    editRiskKYC(familyId, personId, payload) {
        // v30 / client / { familyId } / kyc / { personId }
        return this.http.post('/v30/client/' + familyId + '/kyc/' + personId, payload);
    }

    deleteFamilyMember(familyId: string, personId: string): any {
        return this.http.delete('/v30/client/' + familyId + '/deleteMember/' + personId);
    }

    getEngagementList(clientId): any {
        return this.http.get('/v30/' + clientId + '/values');
    }

    getAllPriorities(clientId): any {
        return this.http.get('/v30/' + clientId + '/default-priorities');
    }

    getClientPriorities(clientId): any {
        return this.http.get('/v30/' + clientId + '/selected-priorities');
    }

    saveDefaultPriority(clientId, priorityJson): any {
        return this.http.post('/v30/' + clientId + '/selected-priorities', priorityJson);
    }

    updateClientPriorities(clientId, priorityJson): any {
        return this.http.put('/v30/' + clientId + '/selected-priorities', priorityJson);
    }

    addUpdateClientPriority(clientId, priorityJson): any {
        return this.http.put('/v30/' + clientId + '/priorities', priorityJson);
    }

    deleteClientPriority(clientId, priorityId): any {
        return this.http.delete('/v30/' + clientId + '/priorities/' + priorityId);
    }

    getAllValues(personId): any {
        return this.http.get('/v30/values?personId=' + personId);
    }

    updatePersonValues(personId, valueJson): any {
        return this.http.post('/v30/' + personId + '/values', valueJson);
    }

    getClientEngagementValues(clientId) {
        this.getEngagementList(clientId).toPromise().then(engagementSummary => {
            this.store.dispatch(new SetEngagementValues(engagementSummary));
        }).catch(errorResponse => {
            this.store.dispatch(new SetEngagementValues([]));
        });
    }

    getClientEngagementPriorities(clientId) {
        this.getClientPriorities(clientId).toPromise().then(priorities => {
            this.store.dispatch(new SetEngagementPriorities(priorities));
        }).catch(errorResponse => {
            this.store.dispatch(new SetEngagementPriorities([]));
        });
    }

    getInviteOptions(familyId, personalId): any {
        return this.http.get('/v30/client/' + familyId + '/risk/' + personalId + '/getInviteOptions');
    }

    getCollaborationDetails(familyId): any {
        return this.http.get('/v30/client/collaboration?familyId=' + familyId);
    }

    removeCollaborationDetails(familyId, collabType): Observable<any> {
        return this.http.delete('/v30/client/collaboration?familyId=' + familyId + '&collabType=' + collabType);
    }

    getEngagementAdvisorClientInfo(clientId): any {
        return this.http.get('/v30/service-level/' + clientId);
    }

    searchSecondaryAdvisors(clientId, advisorId): any {
        return this.http.get('/v30/service-level/' + clientId + '/secondary-advisor-info/' + advisorId);
    }

    updateEngagementServiceLevel(clientId, payload): any {
        return this.http.put('/v30/service-level/' + clientId, payload);
    }

    getProgressIndicator(clientId): any {
        return this.http.put('/v30/client/' + clientId + '/risk/progress-indicator', {}).toPromise();
    }

    parseErrorBlob(err: HttpErrorResponse): Observable<any> {
        const reader: FileReader = new FileReader();
        const obs = Observable.create((observer: any) => {
            reader.onloadend = (e) => {
                observer.error(JSON.parse(JSON.stringify(reader.result)));
                observer.complete();
            };
        });
        reader.readAsText(err.error);
        return obs;
    }

    getListOfMatrimonialRegimes(): any {
        return this.http.get('/v30/common/matrimonial-regime');
    }

    addEntity(clientId: string, entityPayload): any {
        return this.http.post('/v30/client/' + clientId + '/entities/', entityPayload);
    }

    getEntityList(clientId: string): any {
        return this.http.get('/v30/client/' + clientId + '/entities/');
    }

    getEntities(clientId: string) {
        this.getEntityList(clientId).toPromise().then(result => {
            this.store.dispatch(new SetEntityList(result));
        }).catch(err => {
            this.store.dispatch(new SetEntityList([]));
        });
    }

    deleteEntity(clientId: string, entityId: string) {
        return this.http.delete('/v30/client/' + clientId + '/entities/' + entityId);
    }

    getEntityByEntityId(clientId: string, entityId: string) {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId);
    }

    updateEntityDetails(clientId: string, entityId: string, entityObj: any) {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId, entityObj);
    }

    uploadEntityImage(clientId: string, entityId: string, avatar) {
        const httpOptionObj = {};
        httpOptionObj['isFile'] = 'true';
        return this.http.post('/v30/client/' + clientId + '/entities/' + entityId + '/image', avatar, httpOptionObj);
    }

    getOwnersList(clientId: string, entityId): any {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/owners');
    }

    generateOwnershipTable(clientId: string, entityId: string, sharepayload: any): any {
        return this.http.post('/v30/client/' + clientId + '/entities/' + entityId + '/share-owners', sharepayload);
    }

    deleteShare(clientId: string, entityId: string, shareId: string) {
        return this.http.delete('/v30/client/' + clientId + '/entities/' + entityId + '/shares/' + shareId);
    }

    updateShares(clientId: string, entityId: string, sharepayload: any) {
        return this.http.put('/v30/client/' + clientId + '/entities/' + entityId + '/share-distribution', sharepayload);
    }

    getOwnershipTabel(clientId: string, entityId: string): any {
        return this.http.get('/v30/client/' + clientId + '/entities/' + entityId + '/share-distribution');
    }

    getCorporationList(clientId: string): any {
        return this.http.get('/v30/client/' + clientId + '/entities/rel-corps');
    }

    getCorporation(clientId) {
        this.getCorporationList(clientId).toPromise().then(result => {
            this.store.dispatch(new SetCorporationList(result));
        }).catch(err => {
            this.store.dispatch(new SetCorporationList([]));
        });
    }

    getClientScenarios(clientId: string, addDeathAndDisabilityScenarios = true){
        return this.http.get('/v30/client/' + clientId + '/listOfScenarios?addDeathAndDisabilityScenarios='+addDeathAndDisabilityScenarios);
    }
}
