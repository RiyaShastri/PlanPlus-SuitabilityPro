import { AdvisorService } from '../../service/advisor.service';
import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ClientProfileService } from '../../../client/service';
import { AppState, getAdvisorCollaborationPayload } from '../../../shared/app.reducer';
import { COLLABORATION_DESC_TYPES, COLLABORATION_FILTER_ID, COLLABORATION_FILTER_NAME, COLLABORATION_FILTER_ITEM } from '../../../shared/constants';
import { RefreshDataService } from '../../../shared/refresh-data';
import { AccessRightService } from '../../../shared/access-rights.service';
@Component({
    selector: 'app-collaboration-center-tile',
    templateUrl: './collaboration-center-tile.component.html',
    styleUrls: ['./collaboration-center-tile.component.css']
})
export class CollaborationCenterTileComponent implements OnInit, OnDestroy {
    @Input() clientId?= null;
    @ViewChild('pending') pending: NgbTooltip;
    @ViewChild('inconsistent') inconsistent: NgbTooltip;
    changePage: Subject<number> = new Subject();
    familyId = 'FAMILYID';
    collaborations: any;
    filterOptions = [
        { id: COLLABORATION_FILTER_ID.MOST_RECENT, item: COLLABORATION_FILTER_ITEM.MOST_RECENT, name: COLLABORATION_FILTER_NAME.MOST_RECENT },
        { id: COLLABORATION_FILTER_ID.INCONSISTENCY, item: COLLABORATION_FILTER_ITEM.INCONSISTENCY, name: COLLABORATION_FILTER_NAME.INCONSISTENCY },
        { id: COLLABORATION_FILTER_ID.PENDING, item: COLLABORATION_FILTER_ITEM.PENDING, name: COLLABORATION_FILTER_NAME.PENDING },
    ];
    selectedFilter = this.filterOptions[0];
    selectedFilterOption = 'All';
    pageSize = 10;
    pageNum = 1;
    noOfInconsistent = 0;
    noOfPending = 0;
    collabDetailsExist = false;
    collaborationsData = [];
    familyMembersData;
    COLLABORATION_DESC_TYPES = COLLABORATION_DESC_TYPES;
    private unsubscribe$ = new Subject<void>();
    accessRights;

    constructor(
        private advisorService: AdvisorService,
        private translate: TranslateService,
        private profileService: ClientProfileService,
        private router: Router,
        private store: Store<AppState>,
        private dataSharing: RefreshDataService,
        private accessRightsService: AccessRightService
    ) { }

    async  ngOnInit() {
        this.noOfInconsistent = 0;
        this.noOfPending = 0;
        this.collabDetailsExist = false;
        this.accessRightsService.getAccess(['DOCSHARE', 'RISKTOLERCLIENT', 'CLIVALUES']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.accessRights = res;
            this.collabDetailsExist = false;
        });
        this.getAdvisorCollaboration();
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(async message => {
            if (message.includes('risk_data_updated|')) {
                this.clientId = JSON.parse(message.replace('risk_data_updated|', ''));
                this.getAdvisorCollaboration();
            }
        });
    }

    async getAdvisorCollaboration() {
        if (this.clientId) {
            await this.profileService.getCollaborationDetails(this.clientId).toPromise().then(res => {
                this.collaborationsData = res;
                this.collabDetailsExist = true;
            }).catch(error => {
                this.collabDetailsExist = true;
                this.collaborations = {};
                this.collaborationsData = [];
            });
        } else {
            await this.store.select(getAdvisorCollaborationPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res && res.hasOwnProperty('collborations')) {
                    this.collaborations = res;
                    this.collaborationsData = res['collborations'];
                    this.collabDetailsExist = true;
                } else {
                    if (Array.isArray(res)) {
                        this.collaborationsData = [];
                        this.collabDetailsExist = true;
                    }
                }
            });
        }
        this.collaborationsData.forEach(collab => {
            if ((this.accessRights['RISKTOLERCLIENT'] && this.accessRights['RISKTOLERCLIENT']['accessLevel'] > 0 &&
                COLLABORATION_DESC_TYPES.RISK === collab['collabType']) || (this.accessRights['DOCSHARE']['accessLevel'] > 0 &&
                COLLABORATION_DESC_TYPES.VALUE === collab['collabType'])) {
                this.collabDetailsExist = true;
            }
        });
    }

    getFilterCollaboration(event) {
        this.selectedFilter = event;
        this.collaborations['collborations'] = [];
        this.noOfInconsistent = 0;
        this.noOfPending = 0;
        this.changePage.next(1);
        this.advisorService.getAdvisorCollaborationData(this.pageNum, this.pageSize, this.selectedFilter['item']);
    }

    getPageFilterCollaboration(event) {
        this.pageNum = event.currentPage;
        this.collaborations['collborations'] = [];
        this.noOfInconsistent = 0;
        this.noOfPending = 0;
        this.advisorService.getAdvisorCollaborationData(this.pageNum, this.pageSize, this.selectedFilter['item']);
    }

    changeCollaborationAction(index: number) {
        if ($('#dropdownCollaborationAction' + index).is(':visible')) {
            $('.dropdown-collaboration-action').hide();
        } else {
            $('.dropdown-collaboration-action').hide();
            $('#dropdownCollaborationAction' + index).toggle();
        }
    }

    removeAccess(clientId, collabType) {
        this.translate.get([
            'ADVISOR.DASHBOARD.COLLABORATION_TILE.REMOVE_ACCESS_WARNING.TITLE',
            'ADVISOR.DASHBOARD.COLLABORATION_TILE.REMOVE_ACCESS_WARNING.TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
            'SSID_LABELS.' + collabType
        ], { collabType: '####' }).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['ADVISOR.DASHBOARD.COLLABORATION_TILE.REMOVE_ACCESS_WARNING.TITLE'],
                text: String(i18MenuTexts['ADVISOR.DASHBOARD.COLLABORATION_TILE.REMOVE_ACCESS_WARNING.TEXT']).replace('####', i18MenuTexts['SSID_LABELS.' + collabType]),
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.profileService.removeCollaborationDetails(clientId, collabType).toPromise().then(async () => {
                        if (this.clientId) {
                            await this.profileService.getClientFamilyMembersRisk(this.clientId);
                        } else {
                            await this.advisorService.getAdvisorCollaborationData(this.pageNum, this.pageSize, this.selectedFilter['item']);
                        }
                        this.getAdvisorCollaboration();
                    }).catch(err => { });
                }
            });
        });
    }

    sendReminder(member: any) {
        if (member.clientId && member.email) {
            if (this.clientId) {
                this.router.navigate(['/client', this.clientId, 'overview', member.clientId, 'send-reminder']);
            } else {
                this.router.navigate(['/advisor', 'dashboard', member.familyId, member.clientId, 'send-reminder']);
            }
        } else {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT', 'RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.EMAIL_ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], i18text['RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.EMAIL_ALERT'], 'error');
            });
        }
    }

    unlockAndReset(personId) {
        this.profileService.resetAndUnlock(personId, { kyc: true, experience: true, riskTolerance: true }).toPromise().then(res => {
            this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.UNLOCK_RESET']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.UNLOCK_RESET'], 'success');
            });
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }


}
