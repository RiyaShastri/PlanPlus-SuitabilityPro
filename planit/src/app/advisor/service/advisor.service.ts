import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    SetAdvisorTaskNotification,
    SetAdvisorSuitability,
    SetAdvisorDocument,
    SetAdvisorDetail,
    SetAccessRights,
    SetAllCountryFormate,
    SetBrandingDetails,
    SetGraphColours,
    SetAdvisorInvestment,
    SetAdvisorNetWorth,
    SetAdvisorCollaboration
} from '../../shared/app.actions';

import {
    AppState, getIsAccessRightsLoaded
} from '../../shared/app.reducer';
import { TranslateService } from '@ngx-translate/core';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { AccessRightService } from '../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable()
export class AdvisorService {

    clientAdded = new EventEmitter();
    headerLoaded = new EventEmitter();
    constructor(
        private http: HttpClient,
        private store: Store<AppState>,
        private ngxRolesService: NgxRolesService,
        private accessRightService: AccessRightService,
        private permissionsService: NgxPermissionsService,
        private translate: TranslateService
    ) { }

    loadAdvisorStoreData() {
        const unsubscribe$ = new Subject<void>();
        const promise = new Promise(async (resolve, reject) => {
            try {
                this.store.select(getIsAccessRightsLoaded).pipe(takeUntil(unsubscribe$)).subscribe(isAccessRightsLoaded => {
                    if (isAccessRightsLoaded) {
                        this.accessRightService.getAccess(['SCH01', 'DOCTILE', 'COLLAB', 'REGION_BRANDING_ADMN'])
                            .pipe(takeUntil(unsubscribe$)).subscribe(async accessRights => {
                                await this.getAdvisorPayload();
                                await this.getAllBrandingData();
                                
                                if (accessRights.hasOwnProperty('SCH01') && accessRights['SCH01']['accessLevel'] > 0) {
                                    await this.loadAdvisorTaskNotification();
                                }

                                if (accessRights.hasOwnProperty('DOCTILE') && accessRights['DOCTILE']['accessLevel'] > 0) {
                                    await this.getAdvisorDocumentPayload();
                                }
                                await this.getAllValidationFormate();
                                if (accessRights.hasOwnProperty('COLLAB') && accessRights['COLLAB']['accessLevel'] > 0) {
                                    await this.getAdvisorCollaborationData();
                                }
                                unsubscribe$.next();
                                unsubscribe$.complete();
                                resolve('done');
                            });
                    } else {
                        this.getAccessRightsPayload();
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
        return promise;
    }

    getAdvisorDetail() {
        return this.http.get('/v30/users/me');
    }

    getAdvisorPayload() {
        return this.getAdvisorDetail().toPromise().then(advisorDetail => {
            window.localStorage.setItem('plannerName', advisorDetail['firstName'] + ' ' + advisorDetail['surname']);
            let licenses = advisorDetail['licenses'];
            licenses = licenses.toUpperCase();
            // this.advisorService.loadAdvisorStoreData();
            this.permissionsService.flushPermissions();
            if (licenses.indexOf('<B>PRO</B>PLANNER') > -1 && licenses.indexOf('<B>PRO</B>FILER') > -1) {
                this.permissionsService.loadPermissions(['ADVISOR', 'PROFILER']);
                this.ngxRolesService.addRole('COMBINED', ['ADVISOR', 'PROFILER']);
                window.localStorage.setItem('role', '["ADVISOR","PROFILER"]');
            } else if (licenses.indexOf('<B>PRO</B>PLANNER') > -1) {
                this.permissionsService.loadPermissions(['ADVISOR']);
                this.ngxRolesService.addRole('ADVISOR', ['ADVISOR']);
                window.localStorage.setItem('role', '["ADVISOR"]');
            } else if (licenses.indexOf('<B>PRO</B>FILER') > -1) {
                this.permissionsService.loadPermissions(['PROFILER']);
                this.ngxRolesService.addRole('PROFILER', ['PROFILER']);
                window.localStorage.setItem('role', '["PROFILER"]');
            }
            this.store.dispatch(new SetAdvisorDetail(advisorDetail));

        }).catch(errorResponse => {
            this.store.dispatch(new SetAdvisorDetail({}));
        });
    }

    getCountryFormate(countryCode?: string): any {
        return this.http.get('/v30/common/countryFormats');
    }

    getAllValidationFormate() {
        const allFormates = {};
        this.getCountryFormate().toPromise().then(response => {
            if (response) {
                response.forEach(validation => {
                    allFormates[validation.countryCode.trim()] = validation;
                });
                this.store.dispatch(new SetAllCountryFormate(allFormates));
            }
        }).catch(errorResponse => {
            this.store.dispatch(new SetAllCountryFormate({}));
        });
    }

    updateAdvisorDetails(advisorDetailObj) {
        return this.http.put('/v30/users/me', advisorDetailObj);
    }

    cancelWarning() {
        return this.http.post('/v30/users/cancelWarning', '');
    }

    getClientList(searchParameters, searchSpouse = false, clientId?): any {
        if (searchSpouse) {
            return this.http.post('/v30/client/' + clientId + '/spouse/_search', searchParameters);
        } else {
            return this.http.post('/v30/client/list', searchParameters);
        }
    }

    addSpouse(reqObj): any {
        return this.http.put('/v30/client/' + reqObj.clientId + '/spouse/manage-client-as-spouse', reqObj);
    }

    getSpouse(clientId): any {
        return this.http.get('/v30/client/shared-ownership?familyId=' + clientId);
    }

    removeSpouse(reqObj): any {
        return this.http.put('/v30/client/' + reqObj.familyKey + '/spouse/manage-spouse-as-client', reqObj);
    }

    getUserLicences(): any {
        return this.http.get('/v30/users/licenses');
    }

    getDesignations(): any {
        return this.http.get('/v30/users/designations');
    }

  migrateHoldcos(): any {
    return this.http.post('/v30/users/migrateHoldcos', {});
  }

  migratePortfolios(): any {
    return this.http.post('/v30/users/migratePortfolios', {});
  }

  archiveOldReports(): any {
    return this.http.post('/v30/risk/legacyArchive', {});
  }

  migrateAdvisor(): any {
    this.http.post('/v30/users/migrate', {}).toPromise().then(() => {});
  }

    deleteClient(familyId) {
        return this.http.delete('/v30/client/' + familyId);
    }

    getBehaviouralRiskTolerance(ristGroup: string, period: number): Observable<any> {
        return this.http.get('/v30/risk/summary?riskType=' + ristGroup + '&period=' + period)
            .map(response => <any>response);
    }

    getAdvisorTaskNotification(filterObj: any = {}): any {
        return this.http.post('/v30/message/', filterObj);
    }

    loadAdvisorTaskNotification() {
        const filterObj = {
            'from': '',
            'to': '',
            'groupBy': 'None',
            'sortBy': 'Due date',
            'view': 'Uncompleted',
            'limit': 20,
            'messageType': [
                'task',
                'notification',
            ],
            'pageNo': 0,
            'sortByTile': true
        };
        // tslint:disable-next-line:max-line-length
        this.http.post('/v30/message/', filterObj)
            .toPromise().then(response => {
                if (response) {
                    this.store.dispatch(new SetAdvisorTaskNotification(response));
                }
            }).catch(errRes => {
                this.store.dispatch(new SetAdvisorTaskNotification({}));
            });
    }

    getAdvisorInvestmet() {
        return this.http.get('/v30/accounts/investment');
    }

    getInvestmentPayload() {
        this.getAdvisorInvestmet().toPromise().then(data => {
            this.store.dispatch(new SetAdvisorInvestment(data));
        }).catch(err => {
            // this.store.dispatch(new SetAdvisorInvestment({}));
        });
    }

    getAdvisorNetWorth() {
        return this.http.get('/v30/accounts/nethworth');
    }

    getAdvisorNetWorthPayload() {
        this.getAdvisorNetWorth().toPromise().then(result => {
            this.store.dispatch(new SetAdvisorNetWorth(result));
        }).catch(error => {
            // this.store.dispatch(new SetAdvisorNetWorth({}));
        });
    }

    getAdvisorCollaborationDetails(pageNum, pageSize, viewBy): any {
        return this.http.get('/v30/users/collaboration?pageNum=' + pageNum + '&pageSize=' + pageSize + '&viewBy=' + viewBy);
    }

    getAdvisorCollaborationData(pageNum = 1, pageSize = 10, viewBy = 'MOST RECENT') {
        this.getAdvisorCollaborationDetails(pageNum, pageSize, viewBy).toPromise().then(result => {
            this.store.dispatch(new SetAdvisorCollaboration(result));
        }).catch(error => {
            this.store.dispatch(new SetAdvisorCollaboration([]));
        });
    }

    getAdvisorSuitabilitySummaryPayload(currency: string): Observable<any> {
        return this.http
            .get('/v30/suitability/summary?currencyCode=' + currency)
            .map(response => {
                this.store.dispatch(new SetAdvisorSuitability(response));
                return <any>response;
            });
    }

    // Advisor networth investment reducer

    private totalInvestment(investment): number {
        return investment.accountTypeRollup.reduce((sum, item) => sum + item.amount, 0);
    }

    private assetCategoryTotal(data): any {
        const categoryRollup = [];
        let assetCategorySum = 0;
        for (const key in data.assetCategoryRollup) {
            if (data.assetCategoryRollup.hasOwnProperty(key)) {
                assetCategorySum += data.assetCategoryRollup[key];
                categoryRollup.push(
                    {
                        item: key,
                        value: data.assetCategoryRollup[key],
                        colour: this.getColorByColumnKey(key),
                        itemLabel: this.getItemLabelByColumnKey(key)
                    }
                );
            }
        }
        return { categoryRollup: categoryRollup, assetCategorySum: assetCategorySum };
    }

    getColorByColumnKey(key) {
        switch (key) {
            case 'CASH':
                return 'mauve';
            case 'FIXED_INCOME':
                return 'green';
            case 'EQUITY':
                return 'cyan';
        }
    }

    getItemLabelByColumnKey(key) {
        switch (key) {
            case 'CASH':
                return 'Cash';
            case 'FIXED_INCOME':
                return 'Fixed income';
            case 'EQUITY':
                return 'Equity';
        }
    }

    getAdvisorDocument(viewBy = 'mostrecent', pageNum = 1, pageSize = 5): Observable<any> {
        return this.http.get('/v30/documents?viewBy=' + viewBy + '&pageSize=' + pageSize + '&pageNum=' + pageNum)
            .map(response => <any>response);
    }
    getAdvisorDocumentPayload() {
        this.getAdvisorDocument().toPromise().then(result => {
            this.store.dispatch(new SetAdvisorDocument(result));
        }).catch(errorResult => {
            this.store.dispatch(new SetAdvisorDocument([]));
        });
    }

    agreeLicence() {
        return this.http.put('/v30/users/licenseAgreed', {});
    }

    getAccessRights() {
        return this.http.get('/v30/access-control');
    }

    getAccessRightsPayload() {
        this.getAccessRights().toPromise().then(result => {
            this.store.dispatch(new SetAccessRights(result));
        }).catch(errorResult => {
            this.store.dispatch(new SetAccessRights({}));
        });
    }

    getBrandingInfo(): any {
        return this.http.get('/v30/branding');
    }

    getBrandingInfoByLang(lang): any {
        return this.http.get('/v30/branding?lang=' + lang);
    }

    getAllBrandingData() {
        let lang = window.localStorage.getItem('language');
        if(lang) {
            this.getAllBrandingDataByLang(lang);
        } else {
            this.getBrandingInfo().toPromise().then(response => {
                if (response) {
                    this.getGraphColours(response);
                    this.store.dispatch(new SetBrandingDetails(response));
                }
            }).catch(errorResponse => {});
        }
    }

    getAllBrandingDataByLang(lang) {
        this.getBrandingInfoByLang(lang).toPromise().then(response => {
            if (response) {
                this.getGraphColours(response);
                this.store.dispatch(new SetBrandingDetails(response));
            }
        }).catch(errorResponse => { });
    }

    updateBranding(payload): any {
        return this.http.post('/v30/branding', payload, {
            headers: new HttpHeaders({
                'Content-Type': 'multipart/form-data'
            })
        });
    }

    getDocumentsListForBranding(): any {
        return this.http.get('/v30/branding/doc-coverpage-disclaimers');
    }

    updateSelectionForDocuments(payload): any {
        return this.http.put('/v30/branding/doc-coverpage-disclaimers', payload);
    }

    getGraphColours(data) {
        let colours: object;
        if (data) {
            const brandingData = JSON.parse(JSON.stringify(data));
            // tslint:disable-next-line:max-line-length
            if (brandingData['graphColorPalette'].selection === 1 && brandingData['graphColorPalette'].customGraphColorPalette) {
                colours = brandingData['graphColorPalette'].customGraphColorPalette;
            } else {
                colours = brandingData['graphColorPalette'].defaultGraphColorPalette;
            }
            this.processGraphColours(colours);
        } else {
            this.getAllBrandingData();
        }
    }

    processGraphColours(colours) {
        const graphColours = { allGraphColours: [] };
        for (const key in colours) {
            if (colours.hasOwnProperty(key)) {
                const colour = colours[key];
                if (colour.length > 0) {
                    const str = this.rgbToHex(colour[0], colour[1], colour[2]);
                    graphColours['allGraphColours'].push(str);
                }
            }
        }
        this.store.dispatch(new SetGraphColours(graphColours));
    }

    rgbToHex(r: number, g: number, b: number) {
        // tslint:disable-next-line:no-bitwise
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    getGraphColourThemes(): any {
        return this.http.get('/v30/branding/graph-color-themes');
    }

    getWorkgroupsOfPlanner(findFor = 'Owned'): any {
        return this.http.get('/v30/users/plannerMemberGroups?findFor=' + findFor);
    }

    getWorkgroupDetails(findFor): any {
        return this.http.get('/v30/users/groupsDetails?findFor=' + findFor);
    }

    getWorkgroupDetailsByID(workgroupID): any {
        return this.http.get('/v30/users/groupMemberData?workgroupId=' + workgroupID);
    }

    joinOrLeaveWorkgroup(payload): any {
        return this.http.post('/v30/users/joinOrLeave', payload);
    }

    inviteMemberForWorkgroup(plannerId, workgroupId, payload): any {
        return this.http.post('/v30/users/invitMember?planner=' + plannerId + '&workgroupId=' + workgroupId, payload);
    }

    addNewWorkgroup(payload): any {
        return this.http.post('/v30/users/workgroup', payload);
    }

    updateWorkgroup(payload): any {
        return this.http.put('/v30/users/workgroups', payload);
    }

    deleteWorkgroup(workgroupID): any {
        return this.http.delete('/v30/users/' + workgroupID);
    }

    deleteMemberFromWorkgroup(payload): any {
        return this.http.post('/v30/users/member', payload);
    }

    searchUserForWorkgroup(searchString): any {
        return this.http.get('/v30/users/searchUser?member=' + searchString);
    }

    getUsersListForWorkgroup(workgroupId = ''): any {
        return this.http.get('/v30/users/regionUsers?workgroupId' + workgroupId);
    }

    getClientsValues(): any {
        return this.http.get('/v30/users/values');
    }

    getTaskBellDigits() {
        return this.http.get('/v30/message/dueTasks');
    }

    getNewTaskBellDigits() {
        return this.http.get('/v30/message/new-message-count');
    }

    getDemographicsDetails(): any {
        return this.http.get('/v30/client/demographics');
    }

    getWorkflowDetails(period): any {
        return this.http.get('/v30/goal/summary?period=' + period);
    }

    setAccountLabels(networth, advisoreData, isInvestment) {
        const networthData = [];
        networth['assetsByTypes'].forEach(account => {
            this.translate.get(['SSID_LABELS.' + account.id]).subscribe((i18Text: string) => {
                if (!isInvestment) {
                    networthData.push({
                        ...account,
                        'type': i18Text['SSID_LABELS.' + account.id]
                    });
                } else if (isInvestment && account['id'] !== 'ACCTYP_BUSINESS' && account['id'] !== 'ACCTYP_PERSONAL') {
                    networthData.push({
                        ...account,
                        'type': i18Text['SSID_LABELS.' + account.id]
                    });
                }
            });
        }, this);
        return networthData;
    }


}
