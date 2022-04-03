import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, getFamilyMemberPayload, getClientPayload } from '../../../../shared/app.reducer';
import { PlanningService } from '../../../service';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { PROVINCE, LEGAL_CODES, MARITAL_STATUS } from '../../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PERSON_RELATION } from '../../../../shared/constants';

@Component({
    selector: 'app-information',
    templateUrl: './information.component.html',
    styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit, OnDestroy {
    clientId = '';
    client = false;
    familyData = {};
    legalinformationData = {};
    todayDate = new Date();
    PROVINCE = PROVINCE;
    isCivilLaw = false;
    LEGAL_CODES = LEGAL_CODES;
    clientData = {};
    MARITAL_STATUS = MARITAL_STATUS;
    invalidClientWillDate = false;
    invalidSpouseWillDate = false;
    invalidClientPowerOfAttorney = false;
    invalidSpousePowerOfAttorney = false;
    invalidClientPowerOfAttorneyPC = false;
    invalidSpousePowerOfAttorneyPC = false;
    invalidClientRenunPatriDate = false;
    invalidSpouseRenunPatriDate = false;
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private planningService: PlanningService,
        private translate: TranslateService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.setInformationData();
    }

    setInformationData() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData) {
                this.clientData = clientData;
                this.isCivilLaw = (this.clientData['legalCode'] === this.LEGAL_CODES.CIVIL_LAW) ? true : false;
            }
        });
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(familyData => {
            if (familyData && familyData['familyMembers'] && familyData['familyMembers'].length > 0) {
                familyData['familyMembers'].forEach(member => {
                    if (member.relation === PERSON_RELATION.CLIENT1 || member.relation === PERSON_RELATION.CLIENT2) {
                        this.familyData[member.id] = member;
                    }
                });
            }
        });
        this.planningService.getLegalInformation(this.clientId).toPromise().then(result => {
            if (result) {
                this.legalinformationData = result;
                this.legalinformationData['clientWill'] = this.legalinformationData['clientWill'] === 1 ? true : false;
                this.legalinformationData['spousetWill'] = this.legalinformationData['spousetWill'] === 1 ? true : false;
                // PowerOfAttorney
                this.legalinformationData['clientPowerOfAttorney'] = this.legalinformationData['clientPowerOfAttorney'] === 1 ? true : false;
                this.legalinformationData['spousePowerOfAttorney'] = this.legalinformationData['spousePowerOfAttorney'] === 1 ? true : false;
                // PowerOfAttorneyPC
                this.legalinformationData['clientPowerOfAttorneyPC'] = this.legalinformationData['clientPowerOfAttorneyPC'] === 1 ? true : false;
                this.legalinformationData['spousePowerOfAttorneyPC'] = this.legalinformationData['spousePowerOfAttorneyPC'] === 1 ? true : false;
                // Renunciation of family patrimony partition
                this.legalinformationData['clientRenunPatri'] = this.legalinformationData['clientRenunPatri'] === 1 ? true : false;
                this.legalinformationData['spouseRenunPatri'] = this.legalinformationData['spouseRenunPatri'] === 1 ? true : false;

            }
        });
    }

    saveLegalInformation() {
        const informationPayload = JSON.parse(JSON.stringify(this.legalinformationData));
        informationPayload['clientWill'] = this.legalinformationData['clientWill'] === true ? 1 : 0;
        informationPayload['spousetWill'] = this.legalinformationData['spousetWill'] === true ? 1 : 0;
        informationPayload['clientWillDate'] = moment(informationPayload['clientWillDate']).format('YYYY-MM-DD');
        informationPayload['spouseWillDate'] = moment(informationPayload['spouseWillDate']).format('YYYY-MM-DD');
        // PowerOfAttorney
        informationPayload['clientPowerOfAttorney'] = this.legalinformationData['clientPowerOfAttorney'] === true ? 1 : 0;
        informationPayload['spousePowerOfAttorney'] = this.legalinformationData['spousePowerOfAttorney'] === true ? 1 : 0;
        informationPayload['clientPowerOfAttorneyDate'] = moment(informationPayload['clientPowerOfAttorneyDate']).format('YYYY-MM-DD');
        informationPayload['spousePowerOfAttorneyDate'] = moment(informationPayload['spousePowerOfAttorneyDate']).format('YYYY-MM-DD');
        // PowerOfAttorneyPC
        informationPayload['clientPowerOfAttorneyPC'] = this.legalinformationData['clientPowerOfAttorneyPC'] === true ? 1 : 0;
        informationPayload['spousePowerOfAttorneyPC'] = this.legalinformationData['spousePowerOfAttorneyPC'] === true ? 1 : 0;
        informationPayload['clientPowerOfAttorneyPCDate'] = moment(informationPayload['clientPowerOfAttorneyPCDate']).format('YYYY-MM-DD');
        informationPayload['spousePowerOfAttorneyPCDate'] = moment(informationPayload['spousePowerOfAttorneyPCDate']).format('YYYY-MM-DD');
        // Renunciation of family patrimony partition
        informationPayload['clientRenunPatri'] = this.legalinformationData['clientRenunPatri'] === true ? 1 : 0;
        informationPayload['spouseRenunPatri'] = this.legalinformationData['spouseRenunPatri'] === true ? 1 : 0;
        informationPayload['clientRenunPatriDate'] = moment(informationPayload['clientRenunPatriDate']).format('YYYY-MM-DD');
        informationPayload['spouseRenunPatriDate'] = moment(informationPayload['spouseRenunPatriDate']).format('YYYY-MM-DD');
        this.planningService.saveLegalInformation(this.clientId, informationPayload).toPromise().then(response => {
            this.translate.get([
                'ESTATE_PLANING.LEGAL_INFORMATION.POPUP.SUCESS',
                'ALERT.TITLE.SUCCESS'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                swal(i18Text['ALERT.TITLE.SUCCESS'], i18Text['ESTATE_PLANING.LEGAL_INFORMATION.POPUP.SUCESS'], 'success');
            });
            this.setInformationData();
        }).catch(errorResponse => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
            });
        });
    }

    checkDate() {
        const date = moment(this.todayDate).format('YYYY-MM-DD');
        this.invalidClientWillDate = (this.legalinformationData['clientWillDate'] && moment(this.legalinformationData['clientWillDate']).format('YYYY-MM-DD') > date) ? true : false;
        this.invalidSpouseWillDate = (this.legalinformationData['spouseWillDate'] && moment(this.legalinformationData['spouseWillDate']).format('YYYY-MM-DD') > date) ? true : false;
        // tslint:disable-next-line:max-line-length
        this.invalidClientPowerOfAttorney = (this.legalinformationData['clientPowerOfAttorneyDate'] && moment(this.legalinformationData['clientPowerOfAttorneyDate']).format('YYYY-MM-DD') > date) ? true : false;
        // tslint:disable-next-line:max-line-length
        this.invalidSpousePowerOfAttorney = (this.legalinformationData['spousePowerOfAttorneyDate'] && moment(this.legalinformationData['spousePowerOfAttorneyDate']).format('YYYY-MM-DD') > date) ? true : false;
        // tslint:disable-next-line:max-line-length
        this.invalidClientPowerOfAttorneyPC = (this.legalinformationData['clientPowerOfAttorneyPCDate'] && moment(this.legalinformationData['clientPowerOfAttorneyPCDate']).format('YYYY-MM-DD') > date) ? true : false;
        // tslint:disable-next-line:max-line-length
        this.invalidSpousePowerOfAttorneyPC = (this.legalinformationData['spousePowerOfAttorneyPCDate'] && moment(this.legalinformationData['spousePowerOfAttorneyPCDate']).format('YYYY-MM-DD') > date) ? true : false;
        this.invalidClientRenunPatriDate = (this.legalinformationData['clientRenunPatriDate'] && moment(this.legalinformationData['clientRenunPatriDate']).format('YYYY-MM-DD') > date) ? true : false;
        this.invalidSpouseRenunPatriDate = (this.legalinformationData['spouseRenunPatriDate'] && moment(this.legalinformationData['spouseRenunPatriDate']).format('YYYY-MM-DD') > date) ? true : false;
    }
    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
