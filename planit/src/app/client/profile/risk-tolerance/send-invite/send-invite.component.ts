import { slideInOutAnimation } from '../../../../shared/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {ClientProfileService, DocumentService} from '../../../service';
import {
  AppState,
  getFamilyMemberRiskPayload,
  getAdvisorPayload,
  getFamilyMemberPayload
} from '../../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { AdvisorService } from '../../../../advisor/service/advisor.service';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';
import { environment } from '../../../../../environments/environment';
import { SEND_INVITATION_PARAM } from '../../../../shared/constants';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-send-invite',
    templateUrl: './send-invite.component.html',
    styleUrls: ['./send-invite.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})

export class SendInviteComponent implements OnInit, OnDestroy {
    public clientId: string;
    public invite = {
        from: '',
        to: '',
        subject: 'Invite to collaborate on miPlanPlus',
        message: '',
        guideMessage: '',
        intro: '',
        questionnaireType: '',
        kyc: false,
        experience: false,
        riskTolerance: false,
        inviteOptionPayload: {
            invitetoDocumentVault: true,
            enableReadReceipt: false,
            showReport: false
        },
        inviteType: SEND_INVITATION_PARAM.RISK_TOLERANCE,
        docID: ''
    };
    public returnUrl: string;
    public personalId = '';
    clientName = '';
    firstName = '';
    lastName = '';
    advisorName = '';
    // selectedQuestionnaire = 2;
    inviteOptions: any;
    invitAccess = false;
    closeButtonDisable = false;
    saveDisabled = false;
    accessRights = {};
    environment = environment;
    docid = '';
    docTypeId = '';
    description: ''
    SEND_INVITATION_PARAM = SEND_INVITATION_PARAM;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<AppState>,
        private clientProfileService: ClientProfileService,
        private advisorService: AdvisorService,
        private _location: Location,
        private dataSharing: RefreshDataService,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private documentService: DocumentService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.SEND_INVITE');
    }

    async ngOnInit() {
      this.accessRightService.getAccess(['MIPDOC', 'INVITEREADRECEIPT', 'DOCVAULTINVITE']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {

        this.accessRights = res;

      });
      await Observable.of(
          this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
              this.invite.from = res['email'];
              this.advisorName = res['plannerName'];
            } else {
              // this.advisorService.getAdvisorPayload();
            }
          })
        )
        .toPromise()
        .catch(err => {
        });
        this.route.root.firstChild.firstChild.params.pipe(takeUntil(this.unsubscribe$)).subscribe( params => {
          this.clientId = params['clientId'];
        });
      this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
        if (params['docId']) {
          this.invite.inviteType = SEND_INVITATION_PARAM.DOCUMENT;
          this.docid = params['docId'];
          this.docTypeId = params['docTypeId'];
        } else {
          if (this.route.parent.component.toString().includes('Engagement')) {
            this.invite.inviteType = SEND_INVITATION_PARAM.VALUES;
          } else {
            this.invite.inviteType = SEND_INVITATION_PARAM.RISK_TOLERANCE;
          }
        }
      });



      this.dataSharing.currentReplays.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
        let msg = message.toString();
        if (msg.includes('selectedQuestionnaire_')) {
          this.invite['questionnaireType'] = msg.replace('selectedQuestionnaire_', '');
        }
        if (msg.includes('isKYCSelected_')) {
          this.invite.kyc = msg.includes('true');
        }
        if (msg.includes('isExperienceSelected_')) {
          this.invite.experience = msg.includes('true');
        }
        if (msg.includes('isRTSelected_')) {
          this.invite.riskTolerance = msg.includes('true');
        }
      });
        this.personalId = this.route.snapshot.params['personalId'];
        if (this.personalId) {
            this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data) {
                    let clientEmail = '';
                    const client = data.familyMembers.find(member => member.id === this.clientId);
                    if (client === undefined) {
                        return;
                    }
                    clientEmail = client.email;
                    // If we assume that client1 details will be at index 0 of the response;
                    // clientEmail = data[0]['personalDetails'].email;
                    data.familyMembers.forEach(person => {
                        if (person.id === this.personalId) {
                            this.invite.to = person.email;
                            if (person.relation > 2) {
                                this.invite.to = clientEmail;
                            }
                            this.firstName = person.firstName;
                            this.lastName = person.lastName;
                            this.translate.get(['RISK_TOLERANCE_PAGE.SEND_INVITE.INVITE_INTRO_MESSAGE',
                            'RISK_TOLERANCE_PAGE.SEND_INVITE.GUIDEMESSAGE', 'RISK_TOLERANCE_PAGE.SEND_INVITE.INVITE_INTRO','RISK_TOLERANCE_PAGE.SEND_INVITE.DESCRIPTION', 'RISK_TOLERANCE_PAGE.SEND_REMINDER.DOCUMENT_SHARE','DOCUMENT_SHARE_PAGE.SEND_SHARE.DOCUMENT_SHARE','DOCUMENT_SHARE_PAGE.SEND_SHARE.SUBJECT'])
                            .pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                                this.invite.message = i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.INVITE_INTRO_MESSAGE'];
                                if ( this.invite.inviteType === SEND_INVITATION_PARAM.DOCUMENT) {
                                    this.invite.message = i18text['DOCUMENT_SHARE_PAGE.SEND_SHARE.DOCUMENT_SHARE'];
                                    this.invite.message = this.invite.message.replace('{{firstname}}', this.firstName).replace('{{lastname}}', this.lastName).replace('{{advisorname}}', this.advisorName);
                                    this.invite.subject = i18text['DOCUMENT_SHARE_PAGE.SEND_SHARE.SUBJECT'];
                                    this.invite.guideMessage = '';
                                    this.invite.intro = '';
                                    this.description = '';
                                } else {this.invite.message = this.invite.message.replace('{{firstname}}', this.firstName).replace('{{lastname}}', this.lastName).replace('{{advisorname}}', this.advisorName);
                                this.invite.guideMessage = i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.GUIDEMESSAGE'];
                                this.invite.guideMessage = this.invite.guideMessage.replace('{{firstname}}', this.firstName).replace('{{lastname}}', this.lastName);
                                this.invite.intro = i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.INVITE_INTRO'];
                                this.description = i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.DESCRIPTION'];

                                }
                            });
                            if (!this.invite.to) {
                                this.translate.get(['RISK_TOLERANCE_PAGE.SEND_INVITE.POPUP.ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                                    Swal('Oops...', i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.POPUP.ALERT'], 'error');
                                });
                                this.back();
                            }
                        }
                    });
                }
            });
          if (this.invite.inviteType === SEND_INVITATION_PARAM.DOCUMENT) {
            this.documentService.getInviteOptions(this.clientId, this.personalId).toPromise().then(res => {
              this.invitAccess = res.hasOwnProperty('invitetoDocumentVault') ? this.invite.inviteType === SEND_INVITATION_PARAM.RISK_TOLERANCE : false;
              this.inviteOptions = res;
              this.invite['inviteOptionPayload']['enableReadReceipt'] = res['enableReadReceipt'];
              this.invite['inviteOptionPayload']['showReport'] = res['showReport'];
            });
          } else {
            this.clientProfileService.getInviteOptions(this.clientId, this.personalId).toPromise().then(res => {
              this.invitAccess = res.hasOwnProperty('invitetoDocumentVault') ? this.invite.inviteType === SEND_INVITATION_PARAM.RISK_TOLERANCE : false;
              this.inviteOptions = res;
              this.invite['inviteOptionPayload']['enableReadReceipt'] = res['enableReadReceipt'];
              this.invite['inviteOptionPayload']['showReport'] = res['showReport'];
            });
          }
        }
    }

    sendInvite() {
        this.saveDisabled = true;
        this.invite.docID = this.docid;

          if (this.invite.inviteType === SEND_INVITATION_PARAM.DOCUMENT) {
            this.documentService.sendInvite(this.clientId, this.personalId, this.invite).toPromise().then(res => {
            this.documentService.pushInvite(this.docid, this.docTypeId);
              this.dataSharing.changeMessage('default message');
              this.translate.get(['RISK_TOLERANCE_PAGE.SEND_INVITE.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Success', i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.POPUP.SUCCESS'], 'success');
              });
              this.back();
              this.saveDisabled = false;

            }).catch(errorResponse => {
              Swal('Oops...', errorResponse.error.errorMessage, 'error');
              this.saveDisabled = false;
            });
          } else {
            this.clientProfileService.sendInvite(this.clientId, this.personalId, this.invite).toPromise().then(res => {

              this.clientProfileService.getClientFamilyMembersRisk(this.clientId);
              this.dataSharing.changeMessage('default message');
              this.translate.get(['RISK_TOLERANCE_PAGE.SEND_INVITE.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Success', i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.POPUP.SUCCESS'], 'success');
              });
              this.back();
              this.saveDisabled = false;
            }).catch(errorResponse => {
              Swal('Oops...', errorResponse.error.errorMessage, 'error');
              this.saveDisabled = false;
            });
          }
    }
    back() {
        this._location.back();
    }

  ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
