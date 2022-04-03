import { AppState, getFamilyMemberRiskPayload, getAdvisorPayload, getAdvisorCollaborationPayload } from '../../../../shared/app.reducer';
import { slideInOutAnimation } from '../../../../shared/animations';
import { ActivatedRoute, Router } from '@angular/router';
import {ClientProfileService, DocumentService} from '../../../service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { AdvisorService } from '../../../../advisor/service/advisor.service';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';
import { SEND_INVITATION_PARAM } from '../../../../shared/constants';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-send-reminder',
    templateUrl: './send-reminder.component.html',
    styleUrls: ['./send-reminder.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})

export class SendReminderComponent implements OnInit, OnDestroy {
    clientId;
    reminder = {
        from: '',
        to: '',
        subject: 'Reminder to collaborate on miPlanPlus',
        message: '',
        guideMessage: '',
        intro: '',
        inviteOptionPayload: {
            invitetoDocumentVault: true,
            enableReadReceipt: false,
            showReport: false
        },
        inviteType: SEND_INVITATION_PARAM.RISK_TOLERANCE
    };
    personalId;
    firstName = '';
    lastName = '';
    advisorName = '';
    inviteOptions: any;
    invitAccess = false;
    closeButtonDisable = false;
    saveDisabled = false;
    SEND_INVITATION_PARAM = SEND_INVITATION_PARAM;
    isAccessFromDashboard = false;
    docid = '';
    docTypeId = '';
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private clientProfileService: ClientProfileService,
        private advisorService: AdvisorService,
        private _location: Location,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private router: Router,
        private documentService: DocumentService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.SEND_REMINDER');
        this.isAccessFromDashboard = this.router.url.indexOf('advisor/dashboard') > 0;
    }

    async ngOnInit() {
        this.reminder.from = 'advisor@gmail.com';
        this.advisorName = 'Joe Advisor';

        await Observable.of(
            this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res) {
                    this.reminder.from = res['email'];
                    this.advisorName = res['plannerName'];
                } else {
                    // this.advisorService.getAdvisorPayload();
                }
            })
        )
        .toPromise()
        .catch(err => {
        });

      this.reminder.inviteType = SEND_INVITATION_PARAM.RISK_TOLERANCE;

        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];

        });
        if (!this.clientId) {
            this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
            });
        }
        if (!this.clientId) {
            this.route.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
                this.reminder.inviteType = SEND_INVITATION_PARAM.VALUES;
            });
        }
      this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
        if (params['docId']) {
          this.reminder.inviteType = SEND_INVITATION_PARAM.DOCUMENT;
          this.docid = params['docId'];
          this.docTypeId = params['docTypeId'];
        }});
        this.personalId = this.route.snapshot.params['personalId'];
        if (!this.clientId) {
            this.personalId = '';
            this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
                this.personalId = params['personalId'];
            });
        }
        if (this.personalId) {
            if (!this.isAccessFromDashboard) {
                this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    if (data) {
                        this.setData(data);
                    }
                });
            } else {
                this.store.select(getAdvisorCollaborationPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    if (data) {
                        this.setData(data['collborations']);
                    }
                });
            }
            this.clientProfileService.getInviteOptions(this.clientId, this.personalId).toPromise().then(res => {
                this.invitAccess = res.hasOwnProperty('invitetoDocumentVault');
                this.inviteOptions = res;
                this.reminder['inviteOptionPayload']['enableReadReceipt'] = res['enableReadReceipt'];
                this.reminder['inviteOptionPayload']['showReport'] = res['showReport'];
            });
        }
    }

    setData(data) {
        let clientEmail = '';
        if (!this.isAccessFromDashboard) {
            const client = data[data.findIndex(member => member.personalDetails.id === this.clientId)];
            if ( client ) {
              clientEmail = client.personalDetails.email;
            } else {
              clientEmail = '';
            }
        }
        // If we assume that client1 details will be at index 0 of the response;
        // clientEmail = data[0]['personalDetails'].email;
        data.forEach(risk => {
            if (!this.isAccessFromDashboard) {
                if (risk.personalDetails.id === this.personalId) {
                    clientEmail = risk.email;
                    this.reminder.to = risk.personalDetails.email;
                    if (risk.personalDetails.relation > 2) {
                        this.reminder.to = clientEmail;
                    }
                    this.firstName = risk.personalDetails.firstName;
                    this.lastName = risk.personalDetails.lastName;
                    this.setMessage();
                }
            } else {
                if (risk.clientId === this.personalId) {
                    clientEmail = risk.email;
                    this.reminder.to = risk.email;
                    this.firstName = risk.firstName;
                    this.lastName = risk.lastName;
                    this.setMessage();
                }
            }
        });
    }

    setMessage() {
        this.translate.get(['RISK_TOLERANCE_PAGE.SEND_REMINDER.REMINDER_INTRO_MESSAGE', 'RISK_TOLERANCE_PAGE.SEND_REMINDER.DOCUMENT_SHARE',
            'RISK_TOLERANCE_PAGE.SEND_INVITE.GUIDEMESSAGE', 'RISK_TOLERANCE_PAGE.SEND_INVITE.INVITE_INTRO'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                this.reminder.message = i18text['RISK_TOLERANCE_PAGE.SEND_REMINDER.REMINDER_INTRO_MESSAGE'];
                if ( this.reminder.inviteType === SEND_INVITATION_PARAM.DOCUMENT ) {
                  this.reminder.message = i18text['RISK_TOLERANCE_PAGE.SEND_REMINDER.DOCUMENT_SHARE'];
                }
                this.reminder.message = this.reminder.message.replace('{{firstname}}', this.firstName).replace('{{lastname}}', this.lastName).replace('{{advisorname}}', this.advisorName);
                this.reminder.guideMessage = i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.GUIDEMESSAGE'];
                this.reminder.guideMessage = this.reminder.guideMessage.replace('{{firstname}}', this.firstName).replace('{{lastname}}', this.lastName);
                this.reminder.intro = i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.INVITE_INTRO'];

            });
        if (!this.reminder.to && this.router.url.indexOf('send-reminder') > -1) {
            this.translate.get(['RISK_TOLERANCE_PAGE.SEND_INVITE.POPUP.ALERT'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Oops...', i18text['RISK_TOLERANCE_PAGE.SEND_INVITE.POPUP.ALERT'], 'error');
            });
            this.back();
        }
    }
    sendReminder() {
        this.saveDisabled = true;
        this.clientProfileService.sendReminder(this.clientId, this.personalId, this.reminder).toPromise().then(res => {
          if (this.reminder.inviteType === SEND_INVITATION_PARAM.DOCUMENT) {
            this.documentService.pushInvite(this.docid, this.docTypeId);
          }
          this.translate.get(['RISK_TOLERANCE_PAGE.SEND_REMINDER.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Success', i18text['RISK_TOLERANCE_PAGE.SEND_REMINDER.SUCCESS'], 'success');
            });
            this.back();
            this.saveDisabled = false;
        }).catch(errorResponse => {
            Swal('Oops...', errorResponse.error.errorMessage, 'error');
            this.saveDisabled = false;
        });
    }
    back() {
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
