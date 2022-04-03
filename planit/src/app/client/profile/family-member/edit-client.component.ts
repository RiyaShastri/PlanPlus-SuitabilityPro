import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CalculateAgeFromDate } from '../../../core/utility/calculate-date-to-age';
import { ActivatedRoute, Router } from '@angular/router';
import { Relation, MaritalStatus } from '../../client-models';
import { Store } from '@ngrx/store';
import { AppState, getProvincePayload, getLangualePayload, getClientPayload, getAdvisorPayload, getAllCountryFormatePayload } from '../../../shared/app.reducer';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { PlanningService, ClientProfileService } from '../../service';
import { environment } from '../../../../environments/environment';
import { AccessRightService } from '../../../shared/access-rights.service';
import { PageTitleService } from '../../../shared/page-title';
import { getCurrencySymbol } from '@angular/common';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { Angulartics2 } from 'angulartics2';
import { SettingService } from '../../../setting/service';
import { FileUploadService } from '../../../ui';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { MARITAL_STATUS, PERSON_RELATION, PROVINCE } from '../../../shared/constants';
import { RefreshDataService } from '../../../shared/refresh-data';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-add-client',
    templateUrl: './edit-client.component.html'
})
export class EditClientComponent implements OnInit, OnDestroy {
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    avatarChanged = false;
    clientId: string;
    personalId;
    model: any = {};
    modelAddress: any = [];
    maritalArr = MaritalStatus;
    familyMemberAge;
    editFamilyMember;
    editClientAddress;
    loading = false;
    uploadedImage;
    relation = Relation;
    relationId = 0;
    modelFmailyData: any = [];
    countries = [];
    provinceArr = {};
    relationArr = [];
    provinces = [];
    languages = [];
    accessRights = {};
    maxDateValue = new Date();
    isGenderDisable = true;
    selectedCountry = '';
    phoneFormate: string;
    selectedPostalCode: string;
    formatsByCountry = {};
    defaultPostalCode = '[0-9a-zA-Z]+[ -]?[0-9a-zA-Z]+';
    isFileUploded = false;
    yearRange;
    minYear;
    invalidBirthdate = false;
    dateFormat = 'yy/mm/dd';
    saveDisabled = false;
    isCustInflation = false;
    initialInflation;
    invalidYear = false;
    MARITAL_STATUS_CONSTANTS = MARITAL_STATUS;
    PERSON_RELATION_CONSTANTS = PERSON_RELATION;
    clientMaritalStatus;
    matrimonialRegimes;
    MARITAL_STATUS = MARITAL_STATUS;
    PERSON_RELATION = PERSON_RELATION;
    PROVINCE_CONSTANT = PROVINCE;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private calculateAgeFromDate: CalculateAgeFromDate,
        private route: ActivatedRoute,
        private router: Router,
        private clientProfileService: ClientProfileService,
        private planningService: PlanningService,
        private profileService: ClientProfileService,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private advisorService: AdvisorService,
        private settingService: SettingService,
        private fileUploadService: FileUploadService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private refreshDataService: RefreshDataService,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'editFamilyMember' });
        this.yearRange = (this.maxDateValue.getFullYear() - 125) + ':' + this.maxDateValue.getFullYear();
        this.minYear = this.maxDateValue.getFullYear() - 125;
    }


    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_CLIENT_TITLE');

        this.profileService.getListOfMatrimonialRegimes().toPromise().then(res => {
            this.matrimonialRegimes = [];
            res.forEach(element => {
                this.translate.stream([
                    'SSID_LABELS.MATRIMONIAL_REGIMES.' + element.ssid
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                    element['displayName'] = text['SSID_LABELS.MATRIMONIAL_REGIMES.' + element.ssid];
                    if (element.id !== 1) {
                        this.matrimonialRegimes.push(element);
                    }
                });
            });
        }).catch(() => {
            this.matrimonialRegimes = [];
        });

        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(paramsObj => {
            this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
            });
            this.personalId = this.route.snapshot.params['personalId'];
            this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
                if (clientData && clientData.hasOwnProperty('planningCountry')) {
                    this.phoneFormate = clientData['teleFormat'];
                    this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                        if (data) {
                            this.formatsByCountry = data;
                            this.setDateFormat(clientData['planningCountry']);
                        }
                    });
                }
            });
            this.settingService.checkJurisdictions().toPromise().then(data => {
                this.countries = data;
                this.getFamilyMembers();
            }).catch(errorResponse => {
                this.countries = [];
            });
            this.store.select(getLangualePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data) {
                    this.languages = data;
                } else {
                    this.clientProfileService.getLanguages();
                }
            });
            this.store.select(getProvincePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data) {
                    this.provinceArr = data;
                } else {
                    this.clientProfileService.getProvince();
                }
            });
        });
        this.accessRightService.getAccess(['ROIAD']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
    }
    checkboxOnChange() {
        if (!this.isCustInflation) {
            this.initialInflation = this.model.inflation;
            this.model.inflation = this.model.defaultInflation;
        } else {
            this.model.inflation = this.initialInflation;
        }
    }

    setDateFormat(country) {
        const format = this.formatsByCountry[country]['dateFormate'];
        if (format.includes('yyyy') || format.includes('YYYY')) {
            this.dateFormat = format.replace('yyyy' || 'YYYY', 'yy');
        } else {
            this.dateFormat = format.replace('yy' || 'YY', 'y');
        }
    }

    getFamilyMembers() {
        this.clientProfileService.getIndividualFamilyMember(this.clientId, this.personalId).toPromise().then(result => {
            this.processFamilyMemberData(result);
        }).catch(errorResponse => {
        });
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

    async processFamilyMemberData(personDetail) {
        if (!personDetail) {
            this.router.navigate(['/client', this.clientId, 'profile', 'personal-info']);
        }
        this.model = Object.assign({}, personDetail);
        this.model.relation = this.relation.filter(relation => relation.id === this.model.relation)[0];
        this.relationId = this.model.relation.id;
        // Remove Client 1 from relation drop-down
        this.relationArr = this.relation.filter(relation => relation.id != PERSON_RELATION.CLIENT1 && relation.id != PERSON_RELATION.CLIENT2);
        this.familyMemberAge = this.model.age;
        this.model.birthDate = this.createDateAsUTC(new Date(this.model.birthDate));
        if (this.relationId === PERSON_RELATION.CLIENT1) {
            await this.getAddress(this.clientId);
            // temp fixed language and marital status
            this.model.maritalStatus = this.maritalArr.filter(maritalStatus => maritalStatus.id === personDetail.maritalStatus)[0];
            this.clientMaritalStatus = this.model.maritalStatus;
            this.model.language = this.languages.filter(language => language.langcode === personDetail.language)[0];
            this.isCustInflation = this.model.customInflation;
            this.initialInflation = this.model.inflation;
            if (personDetail.hasOwnProperty('selectedMatrimonialRegime')) {
                this.model.selectedMatrimonialRegime = this.matrimonialRegimes.find(m => m.id === personDetail.selectedMatrimonialRegime);
            }
        }
        if (this.relationId === PERSON_RELATION.CLIENT1 || this.relationId === PERSON_RELATION.OTHER || this.relationId === PERSON_RELATION.CLIENT2) {
            this.isGenderDisable = false;
        }
        if (this.model.uploadAvatar) {
            this.uploadedImage = this.model.uploadAvatar;
        }
        if (this.model.avatar) {
            this.isFileUploded = true;
        } else {
            this.isFileUploded = false;
            this.uploadedImage = undefined;
        }
    }
    selectProvince(country) {
        this.provinces = this.provinceArr[country.countryCode];
        this.selectedCountry = country.countryCode;
        const countryPost = this.modelAddress.postalCode;
        this.modelAddress.postalCode = '';
        this.modelAddress.province = '';
        if (this.selectedCountry) {
            this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data.hasOwnProperty('region')) {
                    this.settingService.getTranslation(this.selectedCountry, data['region']);
                }
            });
            this.phoneFormate = this.formatsByCountry[this.selectedCountry]['teleFormat'];
            this.modelAddress.postalCode = countryPost;
            this.selectedPostalCode = (this.formatsByCountry[this.selectedCountry]['zipFormat']).toLowerCase();
            this.setDateFormat(this.selectedCountry);
        }
    }

    calculateAge(birthDate: Date) {
        if (birthDate) {
            if (birthDate.getFullYear() >= this.minYear) {
                this.invalidYear = false;
                if (birthDate < this.maxDateValue) {
                    this.invalidBirthdate = false;
                    this.familyMemberAge = this.calculateAgeFromDate.calculate(birthDate);
                } else {
                    this.invalidBirthdate = true;
                    this.familyMemberAge = '';
                }
            } else {
                this.invalidYear = true;
            }
        }
    }

    async getAddress(clientId: string) {
        await this.clientProfileService.getFamilyAddress(clientId).toPromise().then(result => {
            const address = result.find(add => add.addressType === '01');
            if (address) {
                this.provinces = this.provinceArr[address.countryCode];
                if (this.provinces) {
                    address.province = this.provinces.find(provinces => provinces.provinceId === address.province);
                }
                if (this.countries) {
                    this.selectedCountry = address.countryCode;
                    this.phoneFormate = this.formatsByCountry[this.selectedCountry]['teleFormat'];
                    this.selectedPostalCode = this.formatsByCountry[this.selectedCountry]['zipFormat'].toLowerCase();
                    this.setDateFormat(this.selectedCountry);
                }
                setTimeout(() => {
                    this.modelAddress = JSON.parse(JSON.stringify(address));
                    this.modelAddress.country = this.countries.find(countries => countries.countryCode === address.countryCode);
                    this.modelAddress.isLocked = address.locked;
                }, 100);
            } else {
                this.modelAddress = {};
            }
        }).catch(errorResponse => {
            this.modelAddress = {};
        });
    }

    editClient(f: NgForm) {
        this.saveDisabled = true;
        if (f.invalid) {
            this.saveDisabled = false;
            return;
        } else if (this.invalidBirthdate || this.invalidYear) {
            this.translate.get([
                'ALERT_MESSAGE.OOPS_TEXT',
                'FORM.INVALID_BIRTHDATE'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                swal(text['ALERT_MESSAGE.OOPS_TEXT'], text['FORM.INVALID_BIRTHDATE'], 'error');
            });
            this.saveDisabled = false;
            return;
        }
        this.editFamilyMember = Object.assign({}, this.model);
        this.editFamilyMember.relation = this.model.relation.id;
        if (this.model['maritalStatus']['id'] === MARITAL_STATUS.MARRIED && this.modelAddress['province']['provinceId'] === this.PROVINCE_CONSTANT.QUEBEC) {
            if (this.model.hasOwnProperty('selectedMatrimonialRegime') && this.model.selectedMatrimonialRegime) {
                this.editFamilyMember.selectedMatrimonialRegime = this.model.selectedMatrimonialRegime.id;
            }
        } else {
            this.editFamilyMember.selectedMatrimonialRegime = '';
        }
        if (this.editFamilyMember['relation'] === PERSON_RELATION.CLIENT1) {
            this.editClientAddress = Object.assign({}, this.modelAddress);
            this.editClientAddress['countryCode'] = this.modelAddress.country.countryCode;
            this.editClientAddress['country'] = this.modelAddress.country.country;
            this.editClientAddress['province'] = this.modelAddress.province.provinceId;
            this.editClientAddress['clientId'] = this.clientId;
            this.editClientAddress['phone'] = this.model.homePhone;
            this.editFamilyMember.maritalStatus = this.model.maritalStatus.id;
            this.editFamilyMember.language = this.model.language.langcode;
            this.editFamilyMember.birthDate = moment(this.editFamilyMember.birthDate).format('YYYY-MM-DD');
            this.editFamilyMember.workPhone = this.editFamilyMember.mobilePhone;
            this.editFamilyMember['planningProvince'] = this.modelAddress.province.provinceId;
            this.editFamilyMember['planningCountry'] = this.modelAddress.country.countryCode;
        }
        this.editFamilyMember.birthDate = moment(this.model.birthDate).format('YYYY-MM-DD');
        this.loading = true;
        this.editFamilyMember.retired = this.model.retired ? 1 : 0;
        this.editFamilyMember.customInflation = this.isCustInflation;
        this.editFamilyMember.initials = this.model.initials;
        this.editFamilyMember.fees_cost = this.model.fees_cost;
        this.clientProfileService.updateFamilyDetails(this.editFamilyMember, this.clientId, this.personalId).toPromise().then(async res => {
            if (this.editFamilyMember.relation === PERSON_RELATION.CLIENT1) {
                this.clientProfileService.createUpdateAddressDetails(this.editClientAddress, this.clientId).toPromise().then(async resAddress => {
                    await this.uploadAvatar();
                    this.planningService.loadStoreData(this.clientId, true);
                });
            } else {
                await this.uploadAvatar();
                this.planningService.loadStoreData(this.clientId, true);
            }
            this.translate.get(['EDIT_CLIENT.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Success', i18text['EDIT_CLIENT.POPUP.SUCCESS'], 'success');
            });
            this.loading = false;
            this.router.navigate(['/client', this.clientId, 'profile', 'personal-info']);
            this.saveDisabled = false;
        }).catch(errorResponse => {
            this.loading = false;
            Swal('Oops...', errorResponse.error.errorMessage, 'error');
            this.saveDisabled = false;
        });
    }
    uploadImage(event) {
        this.uploadedImage = event;
        this.avatarChanged = true;
    }

    uploadAvatar() {
        const promise = new Promise(async (resolve, reject) => {
            if (this.avatarChanged) {
                const formData = new FormData();
                formData.append('file', this.uploadedImage ? this.uploadedImage : null);
                this.settingService.uploadAvatar(formData, this.personalId).toPromise().then(avatarRes => {
                    this.avatarChanged = false;
                    resolve('done');
                }).catch(err => {
                    resolve('done');
                });
            } else {
                resolve('done');
            }
        });
        return promise;
    }

    clientChange(event) {
        this.relationId = this.model.relation.id;
        this.isGenderDisable = true;
        if (this.relationId === PERSON_RELATION.OTHER || this.relationId === PERSON_RELATION.CLIENT2) {
            this.isGenderDisable = false;
        } else if (this.relationId === PERSON_RELATION.DAUGHTER || this.relationId === PERSON_RELATION.MOTHER || this.relationId === PERSON_RELATION.GRANDDAUGHTER || this.relationId === PERSON_RELATION.SISTER) {
            this.model.gender = 'F';
        } else {
            this.model.gender = 'M';
        }
    }

    changeMaritalStatus(event) {
        const newMaritalStatus = event.value.id;
        const clientIsMarried = this.clientMaritalStatus.id === MARITAL_STATUS.MARRIED || this.clientMaritalStatus.id === MARITAL_STATUS.COMMON_LAW;
        const newMaritalStatusIsMarried = newMaritalStatus === MARITAL_STATUS.MARRIED || newMaritalStatus === MARITAL_STATUS.COMMON_LAW;
        if (clientIsMarried) {
            if (!newMaritalStatusIsMarried) {
                // Join to single
                this.joinToSingleAction(newMaritalStatus);
            }
        } else {
            if (newMaritalStatusIsMarried) {
                // Single to join
                this.singleToJoinAction(newMaritalStatus);
            }
        }
    }

    addOrFreeSpouse(reqObj) {
        this.advisorService.removeSpouse(reqObj).toPromise().then((res: any) => {
            this.planningService.loadStoreData(this.clientId, true);
            this.router.navigate(['/client', this.clientId, 'profile', 'personal-info']);
        });
    }

    singleToJoinAction(newMaritalStatus) {
        this.translate.get([
            'EDIT_CLIENT.CHANGE_MARITAL_STATUS.SINGLE_TO_JOINT',
            'EDIT_CLIENT.CHANGE_MARITAL_STATUS.SEARCH_CLIENT2',
            'EDIT_CLIENT.CHANGE_MARITAL_STATUS.MANUALLY_ADD_CLIENT2',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['EDIT_CLIENT.CHANGE_MARITAL_STATUS.SINGLE_TO_JOINT'],
                // tslint:disable-next-line:max-line-length
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18text['EDIT_CLIENT.CHANGE_MARITAL_STATUS.SEARCH_CLIENT2'],
                cancelButtonText: i18text['EDIT_CLIENT.CHANGE_MARITAL_STATUS.MANUALLY_ADD_CLIENT2'],
                allowEscapeKey: false,
                allowOutsideClick: false,
                useRejections: true,
                expectRejections: true
            }).then((result: any) => {
                this.refreshDataService.changeMessage('search-spouse-client1-marital-status-' + newMaritalStatus);
                this.router.navigate(['/client', this.clientId, 'profile', 'personal-info', this.personalId, 'edit', 'search-spouse']);
            }, error => {
                if (error === 'cancel') {
                    this.refreshDataService.changeMessage('add-spouse-client1-marital-status-' + newMaritalStatus);
                    this.router.navigate(['/client', this.clientId, 'profile', 'personal-info', this.personalId, 'edit', 'add-spouse']);
                }
            });
        });
    }

    async joinToSingleAction(newMaritalStatus) {
        const spouseData = await this.advisorService.getSpouse(this.clientId).toPromise();
        const reqObj: any = {
            'familyKey': this.clientId,
            'familyMemberKey': spouseData.familyMemberKey,
            'oldMaritalStatus': this.clientMaritalStatus.id,
            'toMaritalStatus': newMaritalStatus
        };
        this.translate.get([
            'EDIT_CLIENT.CHANGE_MARITAL_STATUS.JOINT_TO_SINGLE',
            'EDIT_CLIENT.CHANGE_MARITAL_STATUS.CLIENT2_REMOVE',
            'EDIT_CLIENT.CHANGE_MARITAL_STATUS.CLIENT2_ACCOUNT_OWNER',
            'EDIT_CLIENT.CHANGE_MARITAL_STATUS.REMOVE',
            'EDIT_CLIENT.CHANGE_MARITAL_STATUS.CREATE_NEW_FILE',
        ], { client2Name: spouseData['personName'], noOfAccounts: spouseData['accountCount'] }).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['EDIT_CLIENT.CHANGE_MARITAL_STATUS.JOINT_TO_SINGLE'],
                // tslint:disable-next-line:max-line-length
                html: '<span class="fw-600">' + i18text['EDIT_CLIENT.CHANGE_MARITAL_STATUS.CLIENT2_REMOVE'] + '</span><br> <span class="fw-600">' + i18text['EDIT_CLIENT.CHANGE_MARITAL_STATUS.CLIENT2_ACCOUNT_OWNER'] + '</span><br>',
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18text['EDIT_CLIENT.CHANGE_MARITAL_STATUS.CREATE_NEW_FILE'],
                cancelButtonText: i18text['EDIT_CLIENT.CHANGE_MARITAL_STATUS.REMOVE'],
                allowEscapeKey: true,
                allowOutsideClick: true,
                useRejections: true,
                expectRejections: true
            }).then(result => {
                reqObj.removeOption = 1;
                this.addOrFreeSpouse(reqObj);
            }, error => {
                if (error === 'cancel') {
                    reqObj.removeOption = 2;
                    this.addOrFreeSpouse(reqObj);
                }
            });
        });
    }

    back() {
        this.router.navigate(['/client/' + this.clientId + '/profile/personal-info/']);
    }

    memberSwitch(memberId) {
        this.invalidYear = false;
        this.invalidBirthdate = false;
        this.isGenderDisable = true;
        this.router.navigate(['/client/' + this.clientId + '/profile/personal-info/' + memberId + '/edit']);
        this.isFileUploded = undefined;
        this.model['avatar'] = '';
    }

    deleteFamilyMember() {
        this.translate.get([
            'EDIT_CLIENT.DELETE_POPUP.TITLE',
            'EDIT_CLIENT.DELETE_POPUP.TEXT1',
            'EDIT_CLIENT.DELETE_POPUP.TEXT2',
            'EDIT_CLIENT.DELETE_POPUP.SUCCESS',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['EDIT_CLIENT.DELETE_POPUP.TITLE'],
                // tslint:disable-next-line:max-line-length
                html: i18text['EDIT_CLIENT.DELETE_POPUP.TEXT1'] + '<br/> <span class="fw-600">' + this.model.firstName + ' ' + this.model.lastName + '</span> ? <br/> <small>' + i18text['EDIT_CLIENT.DELETE_POPUP.TEXT2'] + '</small>',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes'
            }).then(result => {
                if (result.value) {
                    this.profileService.deleteFamilyMember(this.clientId, this.personalId).toPromise().then(res => {
                        Swal('Done!', i18text['EDIT_CLIENT.DELETE_POPUP.SUCCESS'], 'success');
                        this.planningService.loadStoreData(this.clientId, true);
                        this.router.navigate(['/client/' + this.clientId + '/profile/personal-info/']);
                    }).catch(err => {
                        Swal('Error', err.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
