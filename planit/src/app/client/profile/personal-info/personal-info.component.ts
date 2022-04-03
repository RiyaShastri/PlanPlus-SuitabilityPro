import { AppState, getFamilyMemberPayload, getOtherBeneficiary, getEntities } from '../../../shared/app.reducer';
import { fadeInAnimation } from '../../../shared/animations';
import { ActivatedRoute } from '@angular/router';
import { EstateService, ClientProfileService, PlanningService } from '../../service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { PageTitleService } from '../../../shared/page-title';
import { AccessRightService } from '../../../shared/access-rights.service';
import { Angulartics2 } from 'angulartics2';
import { RefreshDataService } from '../../../shared/refresh-data';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { MARITAL_STATUS, PERSON_RELATION } from '../../../shared/constants';

@Component({
    selector: 'app-personal-info',
    templateUrl: './personal-info.component.html',
    styleUrls: ['./personal-info.component.css'],
    animations: [fadeInAnimation],
    // attach the fade in animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@fadeInAnimation]': '' }
})
export class PersonalInfoComponent implements OnInit, OnDestroy {
    public clientId: string;
    public familyMembers = [];
    base64Image;
    accessRights = {};
    displayWarning = false;
    beneficiaryExpanded = false;
    beneficiaryRelations: any = {};
    otherBeneficiaries = [];
    entitiesList = [];
    private unsubscribe$ = new Subject<void>();
    i18Text = {};
    MARITAL_STATUS = MARITAL_STATUS;
    PERSON_RELATION = PERSON_RELATION;
   constructor(
        private estateService: EstateService,
        private pageTitleService: PageTitleService,
        private route: ActivatedRoute,
        private accessRightService: AccessRightService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private refreshDataService: RefreshDataService,
        private profileService: ClientProfileService,
        private translate: TranslateService,
        private planningService: PlanningService
    ) {
        this.angulartics2.eventTrack.next({ action: 'familyMembersListing' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.FAMILY_MEMBER_LIST_TITLE');
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    async ngOnInit() {
        this.translate.stream([
            'DELETE.POPUP.ENTITY_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'ENTITY.DELETE_MESSAGE',
            'DELETE.POPUP.DELETE_TITLE',
            'DELETE.POPUP.NOT_UNDO',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            this.i18Text = i18MenuTexts;
        });
        await this.accessRightService.getAccess(['CLI18', 'CLI01', 'AL_BENEF', 'ENTITY']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        await this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                this.familyMembers = data['familyMembers'];
                if (this.familyMembers && this.familyMembers.length > 0) {
                    if (this.familyMembers.length === 1) {
                        if (this.familyMembers[0].maritalStatus === MARITAL_STATUS.MARRIED || this.familyMembers[0].maritalStatus === MARITAL_STATUS.COMMON_LAW || this.familyMembers[0].maritalStatus === MARITAL_STATUS.MARRIED_SINGLE) {
                            this.displayWarning = true;
                        } else {
                            this.displayWarning = false;
                        }
                    } else if (this.familyMembers.length > 1) {
                        for (const member of this.familyMembers) {
                            if (this.familyMembers[0].maritalStatus === MARITAL_STATUS.MARRIED || this.familyMembers[0].maritalStatus === MARITAL_STATUS.COMMON_LAW || this.familyMembers[0].maritalStatus === MARITAL_STATUS.MARRIED_SINGLE) {
                                if (member.relation === PERSON_RELATION.CLIENT2) {
                                    this.displayWarning = false;
                                    break;
                                } else {
                                    this.displayWarning = true;
                                }
                            }
                        }
                    }
                }
            }
        });
        await this.estateService.getRelationsForBeneficiaries().toPromise().then(res => {
            res.forEach(relation => {
                this.beneficiaryRelations[relation.id] = relation.ssid;
            });
        }).catch(() => this.beneficiaryRelations = []);

        this.getBeneficiaries();
        this.getEntities();

        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('refresh_other_beneficiaries')) {
                this.getBeneficiaries();
            }
        });
    }

    getBeneficiaries() {
        this.store.select(getOtherBeneficiary).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result) {
                this.otherBeneficiaries = result;
            }
        });
    }

    getEntities() {
        this.store.select(getEntities).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result) {
                this.entitiesList = result;
            }
        });
    }

    getbase64Image(inputValue: any) {
        const file: File = inputValue;
        const myReader: FileReader = new FileReader();
        let ba4Image;
        myReader.onloadend = (e) => {
            ba4Image = myReader.result;
        };
        myReader.readAsDataURL(file);
        return ba4Image;
    }

    changePersonalInfoAction(index: number) {
        if ($('#dropdownPersonalInfoAction' + index).is(':visible')) {
            $('.dropdown-personal-info-action').hide();
        } else {
            $('.dropdown-personal-info-action').hide();
            $('#dropdownPersonalInfoAction' + index).toggle();
        }
    }

    deleteEntity(entityId, entityName) {
        swal({
            title: this.i18Text['DELETE.POPUP.ENTITY_TITLE'],
            html: this.i18Text['DELETE.POPUP.DELETE_TITLE'] +
                '&nbsp; <span class="fw-600">' + entityName + '</span> ? <br/> <small>' + this.i18Text['DELETE.POPUP.NOT_UNDO'] + '</small>',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.i18Text['DELETE.POPUP.YES']
        }).then(result => {
            if (result.value) {
                this.profileService.deleteEntity(this.clientId, entityId).toPromise().then(response => {
                    this.profileService.getEntities(this.clientId);
                    this.profileService.getCorporation(this.clientId);
                    this.planningService.getClientPlanningSummary(this.clientId);
                    swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18Text['ENTITY.DELETE_MESSAGE'], 'success');
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

