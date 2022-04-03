import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Store } from '@ngrx/store';
import { Angulartics2 } from 'angulartics2';
import { ClientProfileService } from '../../../service';
import { PageTitleService } from '../../../../shared/page-title';
import { AppState, getClientPayload, getAllCountryFormatePayload } from '../../../../shared/app.reducer';
import { AdvisorService } from '../../../../advisor/service/advisor.service';
import { SettingService } from '../../../../setting/service';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-service-level',
    templateUrl: './service-level.component.html',
    styleUrls: ['./service-level.component.css']
})
export class ServiceLevelComponent implements OnInit, OnDestroy {
    clientId;
    isEditable = false;
    engagementDetails: any;
    backupDetails: any;
    accessRights = {};
    dateFormat = 'yy/mm/dd';
    displayDateFormat = 'YYYY-MM-DD';
    saveDisable = false;
    workGroupList = [{ groupId: 'none', description: 'None', members: [] }];
    regionList = [];
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private profileService: ClientProfileService,
        private store: Store<AppState>,
        private translate: TranslateService,
        private advisorService: AdvisorService,
        private settingService: SettingService,
        private refreshData: RefreshDataService,
        private accessRightService: AccessRightService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.ENGAGEMENT_SERVICE_LEVEL');
        this.angulartics2.eventTrack.next({ action: 'engagementserviceLevel' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.refreshData.editServiceLevel.pipe(takeUntil(this.unsubscribe$)).subscribe(edit => {
            this.isEditable = edit;
        });
        this.router.events.pipe(takeUntil(this.unsubscribe$)).subscribe((val) => this.refreshData.changeEdit(false));
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData && clientData.hasOwnProperty('planningCountry')) {
                this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    if (data) {
                        const formatsByCountry = data;
                        const country = clientData['planningCountry'];
                        const format = formatsByCountry[country]['dateFormate'];
                        this.displayDateFormat = format;
                        if (format.includes('yyyy') || format.includes('YYYY')) {
                            this.dateFormat = format.replace('yyyy' || 'YYYY', 'yy');
                        } else {
                            this.dateFormat = format.replace('yy' || 'YY', 'y');
                        }
                    }
                });
            }
        });
        this.getServiceLevelDetails();

        this.accessRightService.getAccess(['ENG01', 'CLTYP','SERVICELVL']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.accessRights = res;
            }
        });
    }

    async getServiceLevelDetails() {
        const res = await this.advisorService.getWorkgroupDetails('Owned').toPromise();
        this.workGroupList = await this.workGroupList.concat(res);
        this.regionList = await this.settingService.getRegionList().toPromise();
        this.profileService.getEngagementAdvisorClientInfo(this.clientId).toPromise().then(response => {
            this.engagementDetails = response;
            this.engagementDetails.advisorInfo['workGroup'] = this.workGroupList.find(wg => wg.groupId === this.engagementDetails.advisorInfo['workGroup']);
            this.engagementDetails.advisorInfo['region'] = this.regionList.find(region => region.regionId === this.engagementDetails.advisorInfo['region']);
            this.backupDetails = JSON.parse(JSON.stringify(this.engagementDetails));
        }).catch(err => { });
    }

    changeEditable() {
        this.refreshData.changeEdit(false);
        this.engagementDetails = JSON.parse(JSON.stringify(this.backupDetails));
    }

    checkDate(minDate: Date, maxDate: Date) {
        if (minDate.getFullYear() < maxDate.getFullYear() ||
            (minDate.getFullYear() === maxDate.getFullYear() && minDate.getMonth() < maxDate.getMonth()) ||
            minDate.getFullYear() === maxDate.getFullYear() && minDate.getMonth() === maxDate.getMonth() && minDate.getDate() <= maxDate.getDate()) {
            return true;
        } else {
            return false;
        }
    }

    submitData() {
        this.saveDisable = true;
        const today = new Date();
        let formValid = true;
        this.translate.get([
            'ENGAGEMENT.SERVICE_LEVEL_ADVISOR_INFO.WORKGROUP_ERROR',
            'ENGAGEMENT.SERVICE_LEVEL_ADVISOR_INFO.REGION_ERROR',
            'ENGAGEMENT.SERVICE_LEVEL_ADVISOR_INFO.WORKGROUP_AND_REGION_ERROR',
            'ENGAGEMENT.SERVICE_LEVEL_CLIENT_INFO.FUTURE_DATE_ERROR',
            'ENGAGEMENT.SERVICE_LEVEL_CLIENT_INFO.PLAN_LAST_REVIEWED_DATE_ERROR',
            'ENGAGEMENT.SERVICE_LEVEL_CLIENT_INFO.PORTFOLIO_LAST_REVIEWED_DATE_ERROR',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            if (!this.engagementDetails.advisorInfo.workGroup['groupId'] && this.engagementDetails.advisorInfo.region['regionId']) {
                Swal('', text['ENGAGEMENT.SERVICE_LEVEL_ADVISOR_INFO.WORKGROUP_ERROR'], 'error');
                formValid = true;
            }
            if (!this.engagementDetails.advisorInfo.region['regionId'] && this.engagementDetails.advisorInfo.workGroup['groupId']) {
                Swal('', text['ENGAGEMENT.SERVICE_LEVEL_ADVISOR_INFO.REGION_ERROR'], 'error');
                formValid = false;
            }
            if (!this.engagementDetails.advisorInfo.workGroup['groupId'] && !this.engagementDetails.advisorInfo.region['regionId']) {
                Swal('', text['ENGAGEMENT.SERVICE_LEVEL_ADVISOR_INFO.WORKGROUP_AND_REGION_ERROR'], 'error');
                formValid = false;
            }
            if (!this.checkDate(this.engagementDetails.clientInfo.becameClientDate, today)) {
                Swal('', text['ENGAGEMENT.SERVICE_LEVEL_CLIENT_INFO.FUTURE_DATE_ERROR'], 'error');
                formValid = false;
            }
            if (this.engagementDetails.clientInfo.becameClientDate && this.engagementDetails.clientInfo.planLastReviewedDate &&
                !this.checkDate(this.engagementDetails.clientInfo.becameClientDate, this.engagementDetails.clientInfo.planLastReviewedDate)) {
                Swal('', text['ENGAGEMENT.SERVICE_LEVEL_CLIENT_INFO.PLAN_LAST_REVIEWED_DATE_ERROR'], 'error');
                formValid = false;
            }
            if (this.engagementDetails.clientInfo.becameClientDate && this.engagementDetails.clientInfo.portfolioLastReviewedDate &&
                !this.checkDate(this.engagementDetails.clientInfo.becameClientDate, this.engagementDetails.clientInfo.portfolioLastReviewedDate)) {
                Swal('', text['ENGAGEMENT.SERVICE_LEVEL_CLIENT_INFO.PORTFOLIO_LAST_REVIEWED_DATE_ERROR'], 'error');
                formValid = false;
            }
        });

        if (formValid === true) {
            this.engagementDetails.advisorInfo['secondaryAdvisors'].forEach((element, index) => {
                if (element.advisor && element.advisorName !== '') {
                    if (!element.neverExpire && element.expiryDate && this.checkDate(element.expiryDate, today)) {
                        element.expiryOption = 1;
                    } else if (!element.neverExpire && element.expiryDate) {
                        element.expiryDate = moment(element.expiryDate).format('YYYY-MM-DD');
                        element.expiryOption = 0;
                    } else if (element.neverExpire === true) {
                        element.expiryOption = -1;
                    }
                    delete element.neverExpire;
                } else {
                    this.engagementDetails.advisorInfo['secondaryAdvisors'].splice(index, 1);
                }
            });

            const payload = {
                advisorInfo: {
                    primaryAdvisor: this.engagementDetails.advisorInfo.primaryAdvisor,
                    secondaryAdvisors: this.engagementDetails.advisorInfo.secondaryAdvisors,
                    privateClient: this.engagementDetails.advisorInfo.privateClient,
                    workGroup: this.engagementDetails.advisorInfo.workGroup['groupId'],
                    region: this.engagementDetails.advisorInfo.region['regionId']
                },
                clientInfo: {
                    clientId: this.engagementDetails.clientInfo.clientId,
                    becameClientDate: this.engagementDetails.clientInfo.becameClientDate ?
                        moment(this.engagementDetails.clientInfo.becameClientDate).format('YYYY-MM-DD') : null,
                    clientType: this.engagementDetails.clientInfo.clientType['value'],
                    planLastReviewedDate: this.engagementDetails.clientInfo.planLastReviewedDate ?
                        moment(this.engagementDetails.clientInfo.planLastReviewedDate).format('YYYY-MM-DD') : null,
                    planLastReviewedFrequency: this.engagementDetails.clientInfo.planLastReviewedFrequency['id'],
                    portfolioLastReviewedDate: this.engagementDetails.clientInfo.portfolioLastReviewedDate ?
                        moment(this.engagementDetails.clientInfo.portfolioLastReviewedDate).format('YYYY-MM-DD') : null,
                    portfolioLastReviewedFrequency: this.engagementDetails.clientInfo.portfolioLastReviewedFrequency['id'],
                }
            };
            this.translate.get([
                'ALERT_MESSAGE.OOPS_TEXT',
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ENGAGEMENT.SERVICE_LEVEL_UPDATED'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                this.profileService.updateEngagementServiceLevel(this.clientId, payload).toPromise().then(res => {
                    Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['ENGAGEMENT.SERVICE_LEVEL_UPDATED'], 'success');
                    this.getServiceLevelDetails();
                    this.refreshData.changeEdit(false);
                    this.saveDisable = false;
                }).catch(err => {
                    Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    this.saveDisable = false;
                });
            });
        } else {
            this.saveDisable = false;
            return;
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
