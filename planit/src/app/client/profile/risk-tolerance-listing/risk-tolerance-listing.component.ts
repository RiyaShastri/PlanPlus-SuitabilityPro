import { Component, OnInit, Input, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { ClientProfileService } from '../../service';
import { riskScoreBadge } from '../../client-models';
import {
    AppState,
    getFamilyMemberRiskPayload,
    getFamilyMemberPayload,
    getAdvisorPayload
} from '../../../shared/app.reducer';
import { RefreshDataService } from '../../../shared/refresh-data';
import { AccessRightService } from '../../../shared/access-rights.service';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PERSON_RELATION } from '../../../shared/constants';
@Component({
    selector: 'app-risk-tolerance-listing',
    templateUrl: './risk-tolerance-listing.component.html',
    styleUrls: ['./risk-tolerance-listing.component.css']
})
export class RiskToleranceListingComponent implements OnInit, OnDestroy {
    @Input() isTile: boolean;
    @Input() clientId = '';
    familyMembersRisk = [];
    selectedQuestionnaire = '';
    riskScoreBadge = riskScoreBadge;
    changeQuestionnaireType = 'sendInvite';
    changeQuestionnaireHeader = 'RISK_TOLERANCE_PAGE.TABLE.ACTIONS.SEND_INVITE';
    accessRights = null;
    isQuestionnarieSelected = false;
    riskToleranceOpts = [
        { id: 2, label: 'FinaMetrica 10-questions' },
        { id: 1, label: 'FinaMetrica 25-questions' },
    ];
    defaultQuestionnaireType = true;
    private unsubscribe$ = new Subject<void>();
    PERSON_RELATION = PERSON_RELATION;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private profileService: ClientProfileService,
        private accessRightService: AccessRightService,
        private dataSharing: RefreshDataService,
        private translate: TranslateService,
        private advisorService: AdvisorService
    ) { }

    async ngOnInit() {
        this.accessRightService.getAccess(['RISKTOLERCLIENT', 'FM10', 'FM25', 'KYCINVITE']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res } });
        await this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.familyMembersRisk = data;
                if (this.isTile) {
                    this.familyMembersRisk = this.familyMembersRisk.slice(0, 3);
                }
                if (data[0]) {
                    this.selectedQuestionnaire = data[0].questionnaireType === 'FinaMetrica 25' ? '1' : '2';
                    this.isQuestionnarieSelected = true;
                    this.defaultQuestionnaireType = data[0].defaultQuestionnaireType;
                }
                this.familyMembersRisk.forEach(member => {
                    member.questionnaire = true;
                });
                if (!this.isQuestionnarieSelected) {
                    this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisorDetails => {
                        const questionnaire = this.riskToleranceOpts.find(qType => qType.id === advisorDetails['rpqType']);
                        if (questionnaire) {
                            this.selectedQuestionnaire = questionnaire['id'].toString();
                        }
                    });
                }
            } else {
                // this.profileService.getClientFamilyMembersRisk(this.clientId);
            }
        });
    }


    changeRiskAction(index: number) {
        if ($('#dropdownQuestionnaire' + index).is(':visible')) {
            $('#dropdownRiskAction' + index).hide();
        } else {
            if ($('#dropdownRiskAction' + index).is(':visible')) {
                $('.dropdown-risk-action').hide();
            } else {
                $('.dropdown-risk-action').hide();
                $('#dropdownRiskAction' + index).toggle();
            }
        }
    }

    QuestionnaireTypeOnChange(val, index) {
        if (!this.defaultQuestionnaireType) {
            this.translate.get([
                'RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.ON_CHANGE_QUESTIONNAIRE',
                'RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.ON_CHANGE_QUESTIONNAIRE_TITLE',
                'RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.SUCCESS',
                'ALERT_MESSAGE.OOPS_TEXT',
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
                'FORM.ACTION.PROCEED'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal({
                    title: i18text['RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.ON_CHANGE_QUESTIONNAIRE_TITLE'],
                    text: i18text['RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.ON_CHANGE_QUESTIONNAIRE'],
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: i18text['FORM.ACTION.PROCEED'],
                    cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
                }).then(result => {
                    if (result.value) {

                        this.profileService.resetRiskTolerance(this.clientId).toPromise().then(async resut => {
                            this.familyMembersRisk = [];
                            await this.profileService.getClientFamilyMembersRisk(this.clientId);
                            this.advisorService.getAdvisorCollaborationData();
                            this.dataSharing.changeMessage('risk_data_updated|' + JSON.stringify(this.clientId));
                            Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.SUCCESS'], 'success');
                            this.selectedQuestionnaire = val.toString();
                        }).catch(error => {
                            this.selectedQuestionnaire = val == 1 ? '2' : '1';
                            Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], error, 'error');
                        });
                    } else {
                        this.selectedQuestionnaire = val == 1 ? '2' : '1';
                    }
                });
            });
        }
    }

    changeQuestionnaire(index: string, type?: string) {
        this.changeQuestionnaireType = type;
        this.changeQuestionnaireHeader = (type === 'sendInvite') ? 'RISK_TOLERANCE_PAGE.TABLE.ACTIONS.SEND_INVITE' :
            (type === 'completeQuestionnaire') ? 'RISK_TOLERANCE_PAGE.TABLE.ACTIONS.COMPLETE_QUEST' : 'RISK_TOLERANCE_PAGE.TABLE.ACTIONS.UNLOCK_RESET';
        $('#dropdownQuestionnaire' + index).toggle();
    }

    sendInvite(member: any) {
        this.dataSharing.addMessage('selectedQuestionnaire_' + this.selectedQuestionnaire);
        this.dataSharing.addMessage('isKYCSelected_' + member.kycDefault);
        this.dataSharing.addMessage('isExperienceSelected_' + member.experienceDefault);
        this.dataSharing.addMessage('isRTSelected_' + member.questionnaire);
        if (this.isTile) {
            this.router.navigate(['/client', this.clientId, 'overview', member.personalDetails.id, 'send-invitation']);
        } else {
            this.router.navigate(['/client', this.clientId, 'profile', 'risk-tolerance', member.personalDetails.id, 'send-invitation']);
        }
    }

    sendReminder(member: any) {
        if (member.personalDetails.email) {
            if (this.isTile) {
                this.router.navigate(['/client', this.clientId, 'overview', member.personalDetails.id, 'send-reminder']);
            } else {
                this.router.navigate(['/client', this.clientId, 'profile', 'risk-tolerance', member.personalDetails.id, 'send-reminder']);
            }
        } else {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT', 'RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.EMAIL_ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], i18text['RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.EMAIL_ALERT'], 'error');
            });
        }
    }

    resetAndUnlock(member: any, hasAccessToDropdown: boolean) {
        let reqObj;
        if (hasAccessToDropdown) {
            reqObj = {
                experience: member.experienceDefault,
                kyc: member.kycDefault,
                riskTolerance: member.questionnaire
            };
        } else {
            reqObj = {
                experience: true,
                kyc: true,
                riskTolerance: true
            };
        }
        this.profileService.resetAndUnlock(member.personalDetails.id, reqObj).toPromise().then(res => {
            this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.UNLOCK_RESET']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['RISK_TOLERANCE_PAGE.QUESTIONNAIRE_POPUP.UNLOCK_RESET'], 'success');
            });
            this.familyMembersRisk = [];
            this.profileService.getClientFamilyMembersRisk(this.clientId);
            this.advisorService.getAdvisorCollaborationData();
            this.dataSharing.changeMessage('risk_data_updated|' + JSON.stringify(this.clientId));
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
    }

    async completeQuestionnaire(member: any, region: string) {
        const importantStuff = window.open('', '_blank');
        importantStuff.document.write('Loading preview...');
        const reqObj = {};
        reqObj['questionnaireType'] = this.selectedQuestionnaire;
        reqObj['riskTolerance'] = member.questionnaire;
        reqObj['kyc'] = member.kycDefault;
        reqObj['experience'] = member.experienceDefault;
        this.profileService.setupMIPClient(this.clientId, member.personalDetails.id, reqObj).toPromise().then(response => {
            this.familyMembersRisk = [];
            // This causes a race condition that can break MIP we may need to revisit this in the future so that is why it is commented.
            this.profileService.getClientFamilyMembersRisk(this.clientId);
            // this.advisorService.getAdvisorCollaborationData();
            this.dataSharing.changeMessage('risk_data_updated|' + JSON.stringify(this.clientId));
            importantStuff.location.href = window.location.origin + '/miplanplus/' + region + '/sso.jsp?clinum=' + member.personalDetails.id;
            // window.open(window.location.origin + '/miplanplus/sso.jsp?clinum=' + personId, '_blank');
        }).catch(error => {
            importantStuff.document.write(error.error.errorMessage);
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], error.error.errorMessage, 'error');
            });
        });
    }

    disableAction(member: any, optionType: string) {
        if (this.changeQuestionnaireType == 'unlock-reset') {
            if (optionType == 'questionnaireOption' && !member.completed) {
                member.questionnaire = false;
                return true;
            }
            if (optionType == 'experienceOption' && !member.experienceCompleted) {
                member.experienceDefault = false;
                return true;
            }
            if (optionType == 'kycOption' && !member.kycCompleted) {
                member.kycDefault = false;
                return true;
            }
        }

        if (this.changeQuestionnaireType == 'completeQuestionnaire' || this.changeQuestionnaireType == 'sendInvite') {
            if (optionType == 'questionnaireOption' && member.completed) {
                member.questionnaire = true;
                return true;
            }
            if (optionType == 'experienceOption' && member.experienceCompleted) {
                member.experienceDefault = true;
                return true;
            }
            if (optionType == 'kycOption' && member.kycCompleted) {
                member.kycDefault = true;
                return true;
            }
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
