import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Relation, MaritalStatus } from '../../client-models';
import { slideInOutAnimation } from '../../../shared/animations';
import { ClientProfileService, PlanningService, EstateService } from '../../service';
import { AppState, getFamilyMemberPayload, getAllCountryFormatePayload, getClientPayload } from '../../../shared/app.reducer';
import { CalculateAgeFromDate } from '../../../core/utility/calculate-date-to-age';
import { environment } from '../../../../environments/environment';
import { PageTitleService } from '../../../shared/page-title';
import { NgForm } from '@angular/forms';
import { Angulartics2 } from 'angulartics2';
import { SettingService } from '../../../setting/service';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { RefreshDataService } from '../../../shared/refresh-data';
import { takeUntil } from 'rxjs/operators';
import { PERSON_RELATION, MARITAL_STATUS, OTHER_BENEFICIARY_RELATION } from '../../../shared/constants';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-add-client',
    templateUrl: './add-family-member.component.html',
    styleUrls: ['./add-family-member.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddFamilymemberComponent implements OnInit, OnDestroy {
    model: any = {};
    familyMemberModel: any = {};
    uploadedImage;
    loading = false;
    familyRelation;
    clientId;
    uploadedFiles;
    maxDate = new Date();
    yearRange;
    isGenderDisable = true;
    familyMembers;
    client2Exist = false;
    client1 = {};
    addSpouseAllowed = false;
    addSpouse = false;
    maritalStatus = MaritalStatus;
    isRedirectToDashboard: boolean;
    @ViewChild('f') public form: NgForm;
    isFormSubmitted = false;
    isFileUploded = false;
    isAvatar;
    formatsByCountry = [];
    dateFormat = 'yy/mm/dd';
    invalidBirthdate = false;
    closeButtonDisable = false;
    minYear;
    invalidYear = false;
    client1MaritalStatus = 0;
    client1Gender = '';
    otherBeneficiary = false;
    isAddNewBeneficiary = false;
    editBeneficiary = true;
    beneficiaryData;
    beneficiaryId = '';
    beneficiaryLoaded = false;
    fromDistributions = false;
    PERSON_RELATION = PERSON_RELATION;
    MARITAL_STATUS = MARITAL_STATUS;
    OTHER_BENEFICIARY_RELATION = OTHER_BENEFICIARY_RELATION;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private calculateAgeFromDate: CalculateAgeFromDate,
        private route: ActivatedRoute,
        private router: Router,
        private clientProfileService: ClientProfileService,
        private planningService: PlanningService,
        private settingService: SettingService,
        private _location: Location,
        private pageTitleService: PageTitleService,
        private store: Store<AppState>,
        private refreshDataService: RefreshDataService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private estateService: EstateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'addFamilyMemberSidePanel' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_FAMILY_MEMBER_TITLE');
        this.yearRange = (this.maxDate.getFullYear() - 125) + ':' + this.maxDate.getFullYear();
        this.minYear = this.maxDate.getFullYear() - 125;
        this.clientId = this.route.snapshot.params['clientId'];
        if (!this.clientId) {
            this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
            });
        }
        if (this.router.url.indexOf('/add-spouse') > -1) {
            this.addSpouse = true;
            this.model.relation = Relation.filter(relation => relation.id === PERSON_RELATION.CLIENT2)[0];
            this.setGender(this.model.relation);
        }
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.indexOf('add-spouse-client1-marital-status-') > -1) {
                this.client1MaritalStatus = parseInt(message.replace('add-spouse-client1-marital-status-', ''));
            }
        });
        this.isRedirectToDashboard = this.router.url.includes('/dashboard/') ? true : false;
        this.otherBeneficiary = this.router.url.includes('add-beneficiary') || this.router.url.includes('edit-beneficiary') ? true : false;
        this.editBeneficiary = this.router.url.includes('edit-beneficiary') ? true : false;
        this.fromDistributions = this.router.url.includes('/estate/distributions') ? true : false;

        if (this.editBeneficiary) {
            this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.beneficiaryId = params['beneficiaryId'];
            });
        }
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('add_New_Beneficiary')) {
                this.isAddNewBeneficiary = true;
                this.beneficiaryData = JSON.parse(message.replace('add_New_Beneficiary|', ''));
            }
        });
    }

    ngOnInit() {
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.formatsByCountry = data;
                this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
                    this.client1Gender = clientData.gender;
                    if (clientData && clientData['planningCountry']) {
                        const format = this.formatsByCountry[clientData['planningCountry']]['dateFormate'];
                        if (format.includes('yyyy') || format.includes('YYYY')) {
                            this.dateFormat = format.replace('yyyy' || 'YYYY', 'yy');
                        } else {
                            this.dateFormat = format.replace('yy' || 'YY', 'y');
                        }
                    }
                });
            }
        });

        if (!this.otherBeneficiary) {
            this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                    this.familyMembers = data['familyMembers'];
                    this.familyMembers.forEach(member => {
                        if (member.relation === PERSON_RELATION.CLIENT2) {
                            this.client2Exist = true;
                        }
                        if (member.relation === PERSON_RELATION.CLIENT1) {
                            this.client1 = member;
                        }
                    });
                    if (this.client2Exist ||
                        (!this.client2Exist &&
                            (this.client1['maritalStatus'] === MARITAL_STATUS.MARRIED || this.client1['maritalStatus'] === MARITAL_STATUS.COMMON_LAW || this.client1['maritalStatus'] === MARITAL_STATUS.MARRIED_SINGLE))) {
                        this.addSpouseAllowed = true;
                    } else {
                        this.addSpouseAllowed = false;
                    }
                }
                this.familyRelation = Relation.filter(x =>
                    x.id !== PERSON_RELATION.CLIENT1 && (this.client2Exist == true ? x.id !== PERSON_RELATION.CLIENT2 : x.id !== PERSON_RELATION.CLIENT1)
                );
            });
        } else {
            this.getBeneficiaryDetails();
        }
    }

    async getBeneficiaryDetails() {
        if (this.editBeneficiary && this.beneficiaryId) {
            await this.estateService.getBeneficiaryById(this.clientId, this.beneficiaryId).toPromise().then(res => {
                this.model['relation'] = res.relationCode;
                this.model['firstName'] = res['firstName'];
                this.model['lastName'] = res['lastName'];
                this.model['gender'] = res['gender'];
                this.model['birthDate'] = this.createDateAsUTC(new Date(res['birthDate']));
                this.model['beneficiaryDisabled'] = res['disabled'];
                if (res['beneficiaryAvatar']) {
                    this.isAvatar = res['beneficiaryAvatar'];
                    this.isFileUploded = true;
                } else {
                    this.isFileUploded = false;
                    this.uploadedImage = undefined;
                }
                this.calculateAge(this.model['birthDate']);
            }).catch(err => { });
        }
        await this.estateService.getRelationsForBeneficiaries().toPromise().then(res => {
            this.familyRelation = [];
            res.forEach(relation => {
                this.translate.stream(['SSID_LABELS.BENEFICIARY_RELATIONS.' + relation.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                    relation['name'] = text['SSID_LABELS.BENEFICIARY_RELATIONS.' + relation.ssid];
                });
                this.familyRelation.push(relation);
            });
        }).catch(() => this.familyRelation = []);
        this.model['relation'] = this.familyRelation.find(r => r.id === this.model['relation']);
        if (this.editBeneficiary) {
            this.setGender(this.model['relation']);
        }
        this.beneficiaryLoaded = true;
    }

    createDateAsUTC(date) {
        let d1;
        if (date == null) {
            d1 = new Date();
        } else {
            d1 = new Date(date);
        }
        return new Date(d1.getTime() + d1.getTimezoneOffset() * 60 * 1000);
    }

    calculateAge(birthDate: Date) {
        if (birthDate) {
            if (birthDate.getFullYear() >= this.minYear) {
                this.invalidYear = false;
                if (birthDate < this.maxDate) {
                    this.invalidBirthdate = false;
                    this.model.familyMemberAge = this.calculateAgeFromDate.calculate(birthDate);
                } else {
                    this.invalidBirthdate = true;
                    this.model.familyMemberAge = '';
                }
            } else {
                this.invalidYear = true;
            }
        } else {
            this.invalidBirthdate = true;
            this.model.familyMemberAge = '';
        }
    }

    async register(f, opt) {
        if (f.invalid) {
            return;
        } else if (this.invalidBirthdate || this.invalidYear) {
            this.translate.get([
                'ALERT_MESSAGE.OOPS_TEXT',
                'FORM.INVALID_BIRTHDATE'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                swal(text['ALERT_MESSAGE.OOPS_TEXT'], text['FORM.INVALID_BIRTHDATE'], 'error');
            });
            return;
        }
        this.isFormSubmitted = true;
        this.loading = true;
        if (this.otherBeneficiary) {
            const payload = {
                beneficiaryAvatar: '',
                relationCode: this.model.relation.id,
                firstName: this.model.firstName,
                lastName: this.model.relation.id !== OTHER_BENEFICIARY_RELATION.CHARITY ? this.model.lastName : '',
                gender: this.model.gender,
                birthDate: this.model.relation.id !== OTHER_BENEFICIARY_RELATION.CHARITY ? (this.model.birthDate !== null ? moment(this.model.birthDate).format('YYYY-MM-DD') : null) : null,
                age: this.model.relation.id !== OTHER_BENEFICIARY_RELATION.CHARITY ? (this.model.birthDate !== null ? this.model.familyMemberAge : 0 ) : 0,
                disabled: this.model.beneficiaryDisabled,
            };
            if (this.editBeneficiary) {
                payload['benificaryId'] = this.beneficiaryId;
                this.updateBeneficiary(payload);
            } else {
                this.addNewBeneficiary(payload);
            }
        } else {
            if (!this.addSpouse && this.model.relation.id === PERSON_RELATION.CLIENT2 && !this.addSpouseAllowed) {
                const maritalStatus = MaritalStatus.filter(x => x.id === this.client1['maritalStatus'])[0];
                this.translate.get([
                    'ADD_CLIENT.POPUP.FROM',
                    'ADD_CLIENT.POPUP.TO',
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal('', i18text['ADD_CLIENT.POPUP.FROM'] + maritalStatus.name + i18text['ADD_CLIENT.POPUP.TO'], 'warning');
                });
                return;
            }
            if (this.addSpouse) {
                this.client1['maritalStatus'] = this.client1MaritalStatus;
                await this.clientProfileService.updateFamilyDetails(this.client1, this.clientId, this.clientId).toPromise();
            }
            this.familyMemberModel = {
                age: this.model.familyMemberAge,
                avatar: '',
                birthDate: moment(this.model.birthDate).format('YYYY-MM-DD'),
                birthPlace: '',
                docInviteStatus: 0,
                email: this.model.relation.id === PERSON_RELATION.CLIENT2 && this.model.email ? this.model.email : '',
                firstName: this.model.firstName,
                gender: this.model.gender,
                governmentID: '',
                id: '',
                initials: this.model.initials,
                kyc: '',
                lastName: this.model.lastName,
                mobilePhone: '',
                preferredName: '',
                relation: this.model.relation.id,
                retired: this.model.relation.id === PERSON_RELATION.CLIENT2 && this.model.retired ? 1 : 0,
                risk: '',
                riskInviteStatus: 0,
                self: '',
                title: '',
            };
            await this.clientProfileService.addFamilyMember(this.familyMemberModel, this.clientId).toPromise().then(async res => {
                if (this.uploadedImage) {
                    const formData = new FormData();
                    formData.append('file', this.uploadedImage);
                    await this.settingService.uploadAvatar(formData, res['id']).toPromise().then(avatarRes => {
                        this.isFileUploded = false;
                        this.uploadedImage = undefined;
                        this.isAvatar = '';
                    }).catch(err => {
                    });
                }
                await this.planningService.loadStoreData(this.clientId, false);
                this.loading = false;
                this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'ADD_FAMILY_MEMBER.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['ADD_FAMILY_MEMBER.POPUP.SUCCESS'], 'success');
                });
                if (f.valid && opt === 1) {
                    if (this.addSpouse) {
                        this.router.navigate(['/client', this.clientId, 'profile', 'personal-info']);
                    } else {
                        this.back();
                    }
                } else if (opt === 2) {
                    this.form.reset();
                    this.model['familyMemberAge'] = '';
                    this.isFormSubmitted = false;
                }
            }).catch(errorResponse => {
                this.loading = false;
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                    Swal(text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                });
            });
        }
    }

    async addNewBeneficiary(payload) {
        await this.estateService.saveOtherBeneficiary(this.clientId, payload).toPromise().then(res => {
            if (this.uploadedImage) {
                const formData = new FormData();
                formData.append('file', this.uploadedImage);
                this.settingService.uploadAvatar(formData, res['benificaryId']).toPromise().then(avatarRes => {
                    this.isFileUploded = false;
                    this.uploadedImage = undefined;
                    this.isAvatar = '';
                }).catch(err => { });
            }
            this.estateService.getOtherBeneficiaryList(this.clientId);
            this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_ADDED'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_ADDED'], 'success');
            });
            if (this.isAddNewBeneficiary) {
                this.refreshDataService.changeMessage('refresh_other_beneficiaries|' + JSON.stringify(this.beneficiaryData));
            } else {
                this.refreshDataService.changeMessage('refresh_other_beneficiaries');
            }
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
        this.loading = false;
        this.back();
    }

    async updateBeneficiary(payload) {
        await this.estateService.updateBeneficiary(this.clientId, payload).toPromise().then(res => {
            if (this.uploadedImage) {
                const formData = new FormData();
                formData.append('file', this.uploadedImage);
                this.settingService.uploadAvatar(formData, this.beneficiaryId).toPromise().then(avatarRes => {
                    this.isFileUploded = false;
                    this.uploadedImage = undefined;
                    this.isAvatar = '';
                }).catch(err => { });
            }
            this.estateService.getOtherBeneficiaryList(this.clientId);
            this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_UPDATED']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_UPDATED'], 'success');
            });
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
        this.loading = false;
        this.back();
    }

    back() {
        if (this.isRedirectToDashboard) {
            this.router.navigate(['/advisor/dashboard']);
        } else if (this.fromDistributions) {
            this.refreshDataService.changeMessage('cancel_Add_new_beneficiary|' + JSON.stringify(this.beneficiaryData));
            this._location.back();
        } else if (this.isAddNewBeneficiary) {
            if (this.closeButtonDisable) {
                this.refreshDataService.changeMessage('cancel_Add_new_beneficiary|' + JSON.stringify(this.beneficiaryData));
            }
            if (this.beneficiaryData.hasOwnProperty('isFromEditBeneficiary') && this.beneficiaryData['isFromEditBeneficiary']) {
                setTimeout(() => {
                    this.router.navigate(['/client', this.clientId, 'planning', 'estate', 'named-beneficiary', this.beneficiaryData['accountId'], 'add-named-beneficiary']);
                }, 100);
            } else {
                setTimeout(() => {
                    this.router.navigate(['/client', this.clientId, 'planning', 'assets-liabilities', this.beneficiaryData['accountId'], 'edit-account' , 'add-named-beneficiary']);
                }, 100);
            }
        } else {
            this._location.back();
        }
    }

    uploadImage(event) {
        this.uploadedImage = event;
        this.isFileUploded = true;
    }

    setGender(relation) {
        this.isGenderDisable = true;
        if (!this.otherBeneficiary) {
            if (relation.id === PERSON_RELATION.CLIENT2 || relation.id === PERSON_RELATION.OTHER) {
                this.isGenderDisable = false;
                this.model.gender = 'F';
            } else if (relation.id === PERSON_RELATION.DAUGHTER || relation.id === PERSON_RELATION.SISTER || relation.id === PERSON_RELATION.MOTHER || relation.id === PERSON_RELATION.GRANDDAUGHTER) {
                this.model.gender = 'F';
            } else {
                this.model.gender = 'M';
            }
        } else {
            if (relation.id === OTHER_BENEFICIARY_RELATION.SPOUSE) {
                if (this.client1Gender === 'M') {
                    this.model.gender = 'F';
                } else {
                    this.model.gender = 'M';
                }
            } else if (relation.id === OTHER_BENEFICIARY_RELATION.CHILD || relation.id === OTHER_BENEFICIARY_RELATION.GRAND_PARENT || relation.id === OTHER_BENEFICIARY_RELATION.SIBLING || relation.id === OTHER_BENEFICIARY_RELATION.BUSINESS_PARTNER || relation.id === OTHER_BENEFICIARY_RELATION.NEPHEW || relation.id === OTHER_BENEFICIARY_RELATION.NIECE) {
                this.isGenderDisable = false;
                this.model.gender = 'F';
            } else if (relation.id === OTHER_BENEFICIARY_RELATION.SISTER || relation.id === OTHER_BENEFICIARY_RELATION.DAUGHTER || relation.id === OTHER_BENEFICIARY_RELATION.MOTHER || relation.id === OTHER_BENEFICIARY_RELATION.GRANDDAUGHTER) {
                this.model.gender = 'F';
            } else if (relation.id !== OTHER_BENEFICIARY_RELATION.OTHER_OTHER && relation.id !== OTHER_BENEFICIARY_RELATION.CHARITY) {
                this.model.gender = 'M';
            } else if (relation.id === OTHER_BENEFICIARY_RELATION.OTHER_OTHER) {
                this.isGenderDisable = false;
            } else if (relation.id === OTHER_BENEFICIARY_RELATION.CHARITY) {
                this.form.resetForm();
                this.model.relation = this.familyRelation.find(r => r.id === OTHER_BENEFICIARY_RELATION.CHARITY);
            }
        }
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
