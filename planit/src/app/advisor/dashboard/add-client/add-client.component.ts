import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { slideInOutAnimation } from '../../../shared/animations';
import { MaritalStatus } from '../../../client/client-models';
import { CalculateAgeFromDate } from '../../../core/utility/calculate-date-to-age';
import { AdvisorService } from '../../service/advisor.service';
import { SetAdvisorClient } from '../../../shared/app.actions';
import { RefreshDataService } from '../../../shared/refresh-data';
import { ClientProfileService } from '../../../client/service';
import { PageTitleService } from '../../../shared/page-title';
import { AccessRightService } from '../../../shared/access-rights.service';
import { SettingService } from '../../../setting/service';
import { AppState, getAllCountryFormatePayload, getAdvisorPayload } from '../../../shared/app.reducer';
import { PERSON_RELATION } from '../../../shared/constants';

@Component({
    selector: 'app-add-client',
    templateUrl: './add-client.component.html',
    styleUrls: ['./add-client.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})

export class AddClientComponent implements OnInit, OnDestroy {
    uploadedImage;
    familyMemberAge;
    clientModel: any;
    loading = false;
    maxDate = new Date();
    yearRange = (this.maxDate.getFullYear() - 125) + ':' + this.maxDate.getFullYear();
    maritalStatuses = MaritalStatus;
    @ViewChild('f') public form: NgForm;
    client: any = {};
    allowSpouseAdd = false;
    client1FormData = new FormData();
    clientId;
    isClient2Added = false;
    isFormSubmitted = false;
    accessRights = {};
    isAvatar;
    isFileUploded = false;
    invalidBirthdate = false;
    formatsByCountry = [];
    dateFormat = 'yy/mm/dd';
    closeButtonDisable = false;
    minYear = this.maxDate.getFullYear() - 125;
    invalidYear = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private calculateAgeFromDate: CalculateAgeFromDate,
        private clientProfileService: ClientProfileService,
        private advisorService: AdvisorService,
        private store: Store<AppState>,
        private _location: Location,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private settingService: SettingService,
        private router: Router,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService
    ) {
        setTimeout(() => {
            this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_CLIENT_TITLE');
        }, 0);
        this.client.gender = 'M';
    }

    ngOnInit() {
        this.accessRightService.getAccess(['WEB21', 'CLI18']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.formatsByCountry = data;
                this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                    if (res) {
                      if (this.formatsByCountry[res['country']]) {
                        const format = this.formatsByCountry[res['country']]['dateFormate'];
                        if (format.includes('yyyy') || format.includes('YYYY')) {
                          this.dateFormat = format.replace('yyyy' || 'YYYY', 'yy');
                        } else {
                          this.dateFormat = format.replace('yy' || 'YY', 'y');
                        }
                      }
                    }
                });
            }
        });
    }

    back() {
        this.clientId = null;
        this.allowSpouseAdd = false;
        this.refreshDataService.changeMessage('getClientList');
        this._location.back();
    }

    uploadeImage(event) {
        this.uploadedImage = event;
        this.isFileUploded = true;
    }

    calculateAge(birthDate: Date) {
        if (birthDate) {
            if (birthDate.getFullYear() >= this.minYear) {
                this.invalidYear = false;
                if (birthDate < this.maxDate) {
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

    addClient(isValid, option) {
        this.isFormSubmitted = true;
        if (this.form.invalid) {
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
        // if (isValid) {
        const formData = new FormData();
        formData.append('mediaType', 'image/png');
        formData.append('image', this.uploadedImage);
        if (!this.allowSpouseAdd) {
            this.saveClient(option, formData);
        } else {
            this.saveSpouse(this.clientId, formData, option);
        }
        // }
    }
    getAdvisorClient(option, clientNum) {
        const searchParameters = {
            'pageNum': 1,
            'pageSize': 10,
            'viewBy': 0
        };
        this.advisorService.getClientList(searchParameters).toPromise().then(result => {
            this.store.dispatch(new SetAdvisorClient(result));
            if (option === 1) {
                if (!this.allowSpouseAdd) {
                    this._location.back();
                }
            } else if (option === 2) {
                // this._location.back(); // remove when edit code done with live
                this.router.navigate(['/client', clientNum, 'profile', 'personal-info', clientNum, 'edit']);
            } else if (option === 3) {
                // this._location.back(); // remove when edit code done with live
                if (this.isClient2Added) {
                    this.isClient2Added = false;
                    this.router.navigate(['/advisor', 'dashboard', clientNum, 'add-family-member']);
                }
            }
        });
    }
    saveClient(option, formData) {
        this.translate.get([
            'ADD_CLIENT.POPUP.FROM',
            'ADD_CLIENT.POPUP.TO',
            'ADD_CLIENT.POPUP.SUCCESS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.clientModel = Object.assign({}, this.client);
            this.clientModel.maritalStatus = this.client.maritalStatus.id;
            this.clientModel.birthDate = moment(this.client.birthDate).format('YYYY-MM-DD');
            this.clientModel.retired = this.client.retired ? 1 : 0;
            this.clientModel.status = 1;
            this.clientModel.initials = this.client.initials;
            this.loading = true;
            if (option === 3) {
                if (this.client.maritalStatus.name !== 'Married' && this.client.maritalStatus.name !== 'Common law' && this.client.maritalStatus.name !== 'Married/Single') {
                    Swal('', i18text['ADD_CLIENT.POPUP.FROM'] + this.client.maritalStatus.name + i18text['ADD_CLIENT.POPUP.TO'], 'warning');
                    this.loading = false;
                    return;
                }
            }
            this.clientProfileService.addNewClient(this.clientModel).toPromise().then(async response => {
                this.clientId = response['clientNum'];
                if ((
                    this.client.maritalStatus.name === 'Married' ||
                    this.client.maritalStatus.name === 'Common law' ||
                    this.client.maritalStatus.name === 'Married/Single') &&
                    this.accessRights['WEB21']['accessLevel'] === 3
                ) {
                    this.allowSpouseAdd = true;
                    Swal('Success', i18text['ADD_CLIENT.POPUP.SUCCESS'], 'success');
                }
                this.form.reset();
                this.familyMemberAge = '';
                this.isFormSubmitted = false;
                this.client.gender = 'F';
                if (this.uploadedImage) {
                    await this.uploadAvatar(this.clientId);
                } else {
                    this.loading = false;
                }
                this.getAdvisorClient(option, response['clientNum']);
                this.advisorService.clientAdded.emit();
            }).catch(errorResponse => {
                this.loading = false;
                Swal('Oops...', errorResponse['error']['errorMessage'], 'error');
            });
        });
    }
    saveSpouse(clientId, formData, option) {
        const client2 = {
            age: '',
            avatar: '',
            birthDate: moment(this.client.birthDate).format('YYYY-MM-DD'),
            birthPlace: '',
            docInviteStatus: 0,
            email: this.client.email,
            firstName: this.client.firstName,
            lastName: this.client.lastName,
            gender: this.client.gender,
            governmentID: '',
            id: '',
            initials: this.client.initials,
            relation: PERSON_RELATION.CLIENT2,
            retired: this.client.retired ? 1 : 0,
            riskInviteStatus: 0

        };
        this.clientProfileService.addFamilyMember(client2, clientId).toPromise().then(async res => {
            this.allowSpouseAdd = false;
            this.isClient2Added = true;
            if (this.uploadedImage) {
                await this.uploadAvatar(res['id']);
                this.getAdvisorClient(option, this.clientId);
            } else {
                this.loading = false;
                this.getAdvisorClient(option, this.clientId);
            }
            this.advisorService.clientAdded.emit();
        }).catch(errorResponse => {
            this.loading = false;
            Swal('Oops...', errorResponse['error']['errorMessage'], 'error');
        });
    }

    uploadAvatar(personId) {
        const promise = new Promise(async (resolve, reject) => {
            const formData = new FormData();
            formData.append('file', this.uploadedImage);
            this.settingService.uploadAvatar(formData, personId).toPromise().then(avatarRes => {
                this.uploadedImage = undefined;
                this.loading = false;
                this.isAvatar = '';
                this.isFileUploded = false;
                resolve('done');
            }).catch(err => {
            });
        });
        return promise;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
