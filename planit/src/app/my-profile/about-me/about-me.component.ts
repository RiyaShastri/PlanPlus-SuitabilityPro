import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { AppState, getProvincePayload, getCountryPayload, getAdvisorPayload, getAllCountryFormatePayload } from '../../shared/app.reducer';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { ClientProfileService } from '../../client/service';
import { SettingService } from '../../setting/service';
import { NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { PageTitleService } from '../../shared/page-title';
import { AccessRightService } from '../../shared/access-rights.service';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { ABOUT_ME_PORTFOLIO_CREATION_TYPE, ABOUT_ME_PORTFOLIO_SUB_TYPE, ABOUT_ME_INVESTMENT_POLICY_MANAGEMENT } from '../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-about-me',
    templateUrl: './about-me.component.html',
    styleUrls: ['./about-me.component.css']
})
export class AboutMeComponent implements OnInit, OnDestroy {
    ABOUT_ME_PORTFOLIO_CREATION_TYPE = ABOUT_ME_PORTFOLIO_CREATION_TYPE;
    ABOUT_ME_PORTFOLIO_SUB_TYPE = ABOUT_ME_PORTFOLIO_SUB_TYPE;
    ABOUT_ME_INVESTMENT_POLICY_MANAGEMENT = ABOUT_ME_INVESTMENT_POLICY_MANAGEMENT;
    advisorDetails = {};
    personalInfo = {};
    uploadedImage;
    avatarChanged = false;
    languages = [];
    countries = [];
    selectedCountry = {};
    provinces = [];
    allProvinces = [];
    designations = [];
    otherDesignation = {
        selected: false,
        desig: ''
    };
    checked = false;
    timeZones = [];
    riskToleranceOpts = [];
    tnEmailUpdateOpts = [];
    kycCheckbox = true;
    experienceCheckbox = true;
    role = 'Advisor';
    showWorkgroups;
    phoneFormate: string;
    selectedPostalCode: string;
    defaultPostalCode = '[0-9a-zA-Z]+[ -]?[0-9a-zA-Z]+';
    accessRights = {};
    formatsByCountry = {};
    userLicences = [];
    isAccessible = true;
    portfolioCreationTypeOpts = [];
    portfolioSubTypeOpts = [];
    investmentPolicyManageOpts = [];
    closeButtonDisable = false;
    saveDisable = false;
    isOutofRange = false;
    selectedCreationType;
    selectedSubType;
    selectedIvmType;
    isDisbleSubType = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private router: Router,
        private advisorService: AdvisorService,
        private settingService: SettingService,
        private clientProfileService: ClientProfileService,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'myProfileAboutMe' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.ABOUT_ME_TITLE');
        // this.designations.sort();
        this.personalInfo['selectedDesig'] = ['AIF', 'CIM', 'FCSI'];

        this.tnEmailUpdateOpts = [
            { id: 1, option: 'Don\'t send email updates' },
            { id: 2, option: 'Send daily summaries' },
            { id: 3, option: 'Combined updates (10 events per email)' },
            { id: 4, option: 'Every new event' },
        ];
        this.riskToleranceOpts = [
            { id: 2, label: 'FinaMetrica 10-questions' },
            { id: 1, label: 'FinaMetrica 25-questions' },
        ];
    }

    async ngOnInit() {
        this.translate.stream([
            'PREFERENCES.DROPDOWN.ACCOUNT',
            'PREFERENCES.DROPDOWN.INTENTED_USE',
            'PREFERENCES.DROPDOWN.STRATEGIC',
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                this.portfolioCreationTypeOpts = [
                    { id: this.ABOUT_ME_PORTFOLIO_CREATION_TYPE.ACCOUNT, description: i18Text['PREFERENCES.DROPDOWN.ACCOUNT']},
                    { id: this.ABOUT_ME_PORTFOLIO_CREATION_TYPE.INTENTED_USE, description: i18Text['PREFERENCES.DROPDOWN.INTENTED_USE']},
                    { id: this.ABOUT_ME_PORTFOLIO_CREATION_TYPE.STRATEGIC, description: i18Text['PREFERENCES.DROPDOWN.STRATEGIC']},
                ];
            });
        this.translate.stream([
            'PREFERENCES.DROPDOWN.INVESTOR',
            'PREFERENCES.DROPDOWN.OWNERSHIP_GROUP',
            'PREFERENCES.DROPDOWN.NONE',
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                this.portfolioSubTypeOpts = [
                    { id: this.ABOUT_ME_PORTFOLIO_SUB_TYPE.INVESTOR, description: i18Text['PREFERENCES.DROPDOWN.INVESTOR']},
                    { id: this.ABOUT_ME_PORTFOLIO_SUB_TYPE.OWNERSHIP_GROUP, description: i18Text['PREFERENCES.DROPDOWN.OWNERSHIP_GROUP']},
                    { id: this.ABOUT_ME_PORTFOLIO_SUB_TYPE.NONE, description: i18Text['PREFERENCES.DROPDOWN.NONE']},
                ];
        });
        this.translate.stream([
            'PREFERENCES.DROPDOWN.INVESTOR',
            'PREFERENCES.DROPDOWN.PORTFOLIO',
            'PREFERENCES.DROPDOWN.STRATEGIC',
            'PREFERENCES.DROPDOWN.NONE',
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                this.investmentPolicyManageOpts = [
                    { id: this.ABOUT_ME_INVESTMENT_POLICY_MANAGEMENT.INVESTOR, description: i18Text['PREFERENCES.DROPDOWN.INVESTOR']},
                    { id: this.ABOUT_ME_INVESTMENT_POLICY_MANAGEMENT.PORTFOLIO, description: i18Text['PREFERENCES.DROPDOWN.PORTFOLIO']},
                    { id: this.ABOUT_ME_INVESTMENT_POLICY_MANAGEMENT.STRATEGIC, description: i18Text['PREFERENCES.DROPDOWN.STRATEGIC']},
                    { id: this.ABOUT_ME_INVESTMENT_POLICY_MANAGEMENT.NONE, description: i18Text['PREFERENCES.DROPDOWN.NONE']},
                ];
                this.setPrefrenceDropdown();
        });
        this.accessRightService.getAccess(['WRKGR', 'WEB41', 'WEB10', 'RISKTOLERCLIENT', 'KYCINVITE', 'PLANTRACNOTIF']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {this.accessRights = res;

        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisorDetails => {
            if (advisorDetails) {
                Object.keys(advisorDetails).forEach(k => {
                    if (typeof advisorDetails[k] === 'string') {
                        advisorDetails[k] = advisorDetails[k].trim();
                    }
                });
                this.advisorService.getUserLicences().toPromise().then(res => {
                    this.userLicences = res;
                    this.userLicences.forEach(obj => {
                        if (advisorDetails['licenses'].includes(obj['licenseName'])) {
                            obj['authorized'] = true;
                        } else {
                            obj['authorized'] = false;
                        }
                    });
                }).catch(err => { });
                this.advisorService.getDesignations().toPromise().then(result => {
                    this.designations = result;
                }).catch(err => { });
                this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    if (data) {
                        this.formatsByCountry = data;
                        this.advisorDetails = Object.assign({}, advisorDetails);
                        this.kycCheckbox = this.advisorDetails['kyc'] == 1 ? true : false;
                        this.experienceCheckbox = this.advisorDetails['experience'] == 1 ? true : false;
                        this.setDropdownValues(Object.assign({}, advisorDetails));
                        this.isOutofRange = advisorDetails.outOfRange;
                    }
                });
            } else {
                // this.advisorService.getAdvisorPayload();
            }
        });
    });
        this.showWorkgroups = this.accessRights['WRKGR']['accessLevel'] > 0;
        if (this.accessRights.hasOwnProperty('WEB10')
            && this.accessRights['WEB10'].hasOwnProperty('accessLevel')
            && this.accessRights['WEB10'].hasOwnProperty('id')
            && this.accessRights['WEB10']['accessLevel'] !== ''
            && this.accessRights['WEB10']['id'] !== '') {
            this.isAccessible = this.accessRights['WEB10']['accessLevel'] > 0;
        } else {
            if (this.accessRights === null
                || this.accessRights.hasOwnProperty('WEB10') === false
                || this.accessRights['WEB10'].hasOwnProperty('accessLevel') === false
                || this.accessRights['WEB10'].hasOwnProperty('id') === false
                || this.accessRights['WEB10']['id'] === '') {    // should not be empty
                // async call a function to wait for accessRight ready
                this.startAsync();
            }
        }
    }

    setPrefrenceDropdown() {
        if (this.advisorDetails && this.portfolioCreationTypeOpts.length > 0 && this.portfolioSubTypeOpts.length > 0 && this.investmentPolicyManageOpts.length > 0) {
            if (this.advisorDetails['portfolioCreationType']) {
                this.selectedCreationType = this.portfolioCreationTypeOpts.find(x => x.id === this.advisorDetails['portfolioCreationType']);
                if (this.selectedCreationType.id === this.ABOUT_ME_PORTFOLIO_CREATION_TYPE.ACCOUNT) {
                    this.isDisbleSubType = true;
                    this.selectedSubType = this.portfolioSubTypeOpts.find(x => x.id === this.ABOUT_ME_PORTFOLIO_SUB_TYPE.NONE);
                }
            } else {
                this.selectedCreationType = this.portfolioCreationTypeOpts[1];
                if (this.advisorDetails['portfolioSubType']) {
                    this.selectedSubType = this.portfolioSubTypeOpts.find(x => x.id === this.advisorDetails['portfolioSubType']);
                } else {
                    this.selectedSubType = this.portfolioSubTypeOpts[0];
                }
            }
            if (this.advisorDetails['invPolicyManagement']) {
                this.selectedIvmType = this.investmentPolicyManageOpts.find(x => x.id === this.advisorDetails['invPolicyManagement']);
            } else {
                this.selectedIvmType = this.investmentPolicyManageOpts[1];
            }
        }
    }

    setDropdownValues(advisorObj) {
        this.settingService.getAccesibleLanguage().toPromise().then(resp => {
            this.languages = resp;
            Object.keys(resp).forEach(i => {
                if (resp[i]['langcode'] === advisorObj['language']) {
                    this.advisorDetails['language'] = resp[i];
                }
            });
        }).catch(errorResponse => {
        });
        // set Timezone
        this.settingService.getTimeZone().toPromise().then(timeZone => {
            if (timeZone && this.advisorDetails) {
                this.timeZones = timeZone;
                this.advisorDetails['timeZone'] = this.timeZones.find(timeZon => timeZon['tzID'] === advisorObj['timeZone']);
            }
        }).catch(err => { });
        // set province
        this.store.select(getProvincePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.allProvinces = data;
                this.provinces = this.allProvinces[advisorObj['country']];
                if (this.provinces && this.provinces.length > 0) {
                    this.advisorDetails['province'] = this.provinces.filter(province => province.provinceId === advisorObj['province'])[0];
                } else {
                    this.advisorDetails['province'] = '';
                }
            } else {
                this.clientProfileService.getProvince();
            }
        });
        this.store.select(getCountryPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.countries = data;
                this.advisorDetails['country'] = this.countries.find(country => country['countryCode'] === advisorObj['country']);
                if (this.advisorDetails['country']) {
                    this.selectedCountry = this.advisorDetails['country'];
                }

                if (this.formatsByCountry && this.formatsByCountry[advisorObj['country']] !== undefined) {
                    this.phoneFormate = Object.assign({}, this.formatsByCountry[advisorObj['country']])['teleFormat'];
                    this.selectedPostalCode = (this.formatsByCountry[advisorObj['country']]['zipFormat']).toLowerCase();
                    const postalcode = this.advisorDetails['postalcode'];
                    this.advisorDetails['postalcode'] = '';
                    setTimeout(() => {
                        this.advisorDetails['postalcode'] = postalcode;
                    }, 100);
                }
            } else {
                this.clientProfileService.getCountry();
            }
        });
        // set Risk Tolerance questionary type
        this.advisorDetails['rpqType'] = this.riskToleranceOpts.find(qType => qType.id === this.advisorDetails['rpqType']);
    }

    selectProvince() {
        this.selectedCountry = this.advisorDetails['country'];
        this.settingService.getTranslation(this.selectedCountry['countryCode'], this.advisorDetails['region']);
        this.provinces = this.allProvinces[this.advisorDetails['country']['countryCode']];
        this.advisorDetails['province'] = '';
        const countryPost = this.advisorDetails['postalcode'];
        this.advisorDetails['postalcode'] = '';
        if (this.selectedCountry) {
            if (this.formatsByCountry[this.selectedCountry['countryCode']] !== undefined) {
                this.phoneFormate = this.formatsByCountry[this.selectedCountry['countryCode']]['teleFormat'];
                this.selectedPostalCode = (this.formatsByCountry[this.selectedCountry['countryCode']]['zipFormat']).toLowerCase();
            }
            this.advisorDetails['postalcode'] = countryPost;

        }

        // if (this.selectedCountry) {
        //     if (this.formatsByCountry[this.selectedCountry['countryCode']] !== undefined) {
        //         this.phoneFormate = this.formatsByCountry[this.selectedCountry['countryCode']]['teleFormat'];
        //         this.selectedPostalCode = (this.formatsByCountry[this.selectedCountry['countryCode']]['zipFormat']).toLowerCase();
        //     }
        //     this.advisorDetails['postalcode'] = countryPost;
        // }
    }

    uploadeImage(event) {
        this.uploadedImage = event;
        this.avatarChanged = true;
    }

    saveAboutMeInfo(f: NgForm) {
        if (f.valid) {
            this.saveDisable = true;
            const reqObj = Object.assign({}, this.advisorDetails);
            reqObj['country'] = reqObj['country']['countryCode'];
            reqObj['language'] = reqObj['language']['langcode'];
            reqObj['province'] = reqObj['province'] ? reqObj['province']['provinceId'] : '';
            reqObj['rpqType'] = reqObj['rpqType'] ? reqObj['rpqType']['id'] : '';
            reqObj['role'] = this.role;
            reqObj['timeZone'] = reqObj['timeZone'] ? reqObj['timeZone']['tzID'] : '';
            reqObj['portfolioCreationType'] = this.selectedCreationType.id,
            reqObj['portfolioSubType'] = this.selectedSubType.id,
            reqObj['investmentPolicyManage'] = this.selectedIvmType.id;
            reqObj['outOfRange'] = this.isOutofRange;
            reqObj['kyc'] = this.kycCheckbox ? 1 : 0;
            reqObj['experience'] = this.experienceCheckbox ? 1 : 0;
            this.advisorService.updateAdvisorDetails(reqObj).toPromise().then(res => {
                if (this.avatarChanged) {
                    const formData = new FormData();
                    formData.append('file', this.uploadedImage ? this.uploadedImage : null);
                    this.settingService.uploadAvatar(formData, 'PLANNER').toPromise().then(avatarRes => {
                        this.translate.get(['MY_PROFILE.POPUP.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                            Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['MY_PROFILE.POPUP.SUCCESS'], 'success');
                        });
                        this.avatarChanged = false;
                        this.advisorService.getAdvisorPayload();
                    }).catch(err => {
                        this.translate.get(['MY_PROFILE.POPUP.ERROR']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                            Swal(i18text['MY_PROFILE.POPUP.ERROR'], err.error.errorMessage, 'error');
                        });
                    });
                } else {
                    this.translate.get(['MY_PROFILE.POPUP.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['MY_PROFILE.POPUP.SUCCESS'], 'success');
                    });
                    this.advisorService.getAdvisorPayload();
                }
                this.saveDisable = false;
            }).catch(err => {
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
                this.saveDisable = false;
            });
        }
    }

    back() {
        this._location.back();
    }

    async startAsync() {
        await this.delay(500);
        this.reroute(this);
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reroute(obj: AboutMeComponent): boolean {
        if (this.accessRights['WEB10']['accessLevel'] !== ''
            && this.accessRights['WEB10']['id'] !== '') {
            this.isAccessible = this.accessRights['WEB10']['accessLevel'] > 0;
            return true;
        } else {
            return false;
        }
    }

    onChangeCreationType(data) {
        if (data.id === this.ABOUT_ME_PORTFOLIO_CREATION_TYPE.ACCOUNT) {
            this.selectedSubType = this.portfolioSubTypeOpts.find(x => x.id === this.ABOUT_ME_PORTFOLIO_SUB_TYPE.NONE);
            this.isDisbleSubType = true;
        } else {
            this.isDisbleSubType = false;
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
