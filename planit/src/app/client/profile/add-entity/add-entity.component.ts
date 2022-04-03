import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { slideInOutAnimation } from '../../../shared/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState, getProvincePayload, getClientPayload, getCorporationList } from '../../../shared/app.reducer';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ClientProfileService, PlanningService } from '../../service';
import swal from 'sweetalert2';
import { RefreshDataService } from '../../../shared/refresh-data';
import { NgForm } from '@angular/forms';
import { ENTITY_TYPES, SAVE_OPTIONS, CORPORATION_OPTIONS } from '../../../shared/constants';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../shared/page-title';

@Component({
    selector: 'app-add-entity',
    templateUrl: './add-entity.component.html',
    styleUrls: ['./add-entity.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddEntityComponent implements OnInit, OnDestroy {
    clientId;
    entityData = {};
    typeDropList = [];
    province = [];
    isAvatar;
    uploadedImage;
    isFileUploded = false;
    provinceArr = [];
    selectedProvince = {};
    clientData = {};
    relatedCorporateList = [];
    @ViewChild('f') public form: NgForm;
    unsubscribe$ = new Subject<void>();
    TYPES = ENTITY_TYPES;
    SAVE_OPTIONS = SAVE_OPTIONS;
    i18Text = {};
    cancelDisable = false;
    saveDisabled = false;
    CORPORATION_OPTIONS = CORPORATION_OPTIONS;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private store: Store<AppState>,
        private clientProfileService: ClientProfileService,
        private refreshdataService: RefreshDataService,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private planningService: PlanningService
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PERSONAL_INFO_ADD_ENTITY');
        this.entityData['relatedCorpo'] = this.CORPORATION_OPTIONS.NO;
        this.translate.stream([
            'ALERT.TITLE.SUCCESS',
            'ENTITY.SUCCESS_MESSAGE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ENTITY.ACTIVE_BUISNESS',
            'ENTITY.HOLDING_COMPANY',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
            this.typeDropList = [
                { id: this.TYPES.ACTIVE_BUISNESS, name: this.i18Text['ENTITY.ACTIVE_BUISNESS'] },
                { id: this.TYPES.HOLDING_COMPANY, name: this.i18Text['ENTITY.HOLDING_COMPANY'] },
            ];
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData) {
                this.clientData = clientData;
                this.store.select(getProvincePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    if (data) {
                        if (this.clientData && this.clientData.hasOwnProperty('planningCountry')) {
                            this.provinceArr = data[this.clientData['planningCountry']];
                            this.selectedProvince = this.provinceArr.find(x => x.provinceId === this.clientData['planningProvince']);
                        }
                    } else {
                        this.clientProfileService.getProvince();
                    }
                });
            }
        });
        this.store.select(getCorporationList).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result) {
                this.relatedCorporateList = result;
            }
        });
    }

    uploadImage(event) {
        this.uploadedImage = event;
        this.isFileUploded = true;
    }

    addEntity(f, opt) {
        if (f.valid) {
            const addPayload = {
                description: this.entityData['description'],
                entityType: this.entityData['type']['id'],
                province: this.selectedProvince['provinceId'],
                relCorp: this.entityData['relatedCorpo'] === this.CORPORATION_OPTIONS.YES
            };
            if (this.entityData['relatedCorpo'] === this.CORPORATION_OPTIONS.YES && this.relatedCorporateList.length > 0) {
                addPayload['relCorpDesc'] = this.entityData['relatedCorporate']['description'];
                addPayload['relCorpId'] = this.entityData['relatedCorporate']['entityId'];
            }
            this.clientProfileService.addEntity(this.clientId, addPayload).toPromise().then(async result => {
                if (this.uploadedImage) {
                    const formData = new FormData();
                    formData.append('file', this.uploadedImage);
                    await this.clientProfileService.uploadEntityImage(this.clientId, result['entityId'], formData).toPromise().then(avatarRes => {
                        this.isFileUploded = false;
                        this.uploadedImage = '';
                        this.isAvatar = '';
                    }).catch(err => { });
                }
                this.clientProfileService.getEntities(this.clientId);
                swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['ENTITY.SUCCESS_MESSAGE'], 'success');
                this.clientProfileService.getCorporation(this.clientId);
                this.planningService.getClientPlanningSummary(this.clientId);
                if (opt === this.SAVE_OPTIONS['SAVE_ENTITY']) {
                    this.back();
                }
                if (opt === this.SAVE_OPTIONS['SAVE/ADD_ENTITY']) {
                    this.form.resetForm();
                    setTimeout(() => {
                        this.selectedProvince = this.provinceArr.find(x => x.provinceId === this.clientData['planningProvince']);
                        this.entityData['relatedCorpo'] = this.CORPORATION_OPTIONS.NO;
                    }, 50);
                }
                if (opt === this.SAVE_OPTIONS['SAVE_AND_EDIT_ENTITY']) {
                    this.router.navigate(['/client/' + this.clientId + '/profile/personal-info/' + result['entityId'] + '/entity-details']);
                }
                this.saveDisabled = false;
            }).catch(errorResponse => {
                this.saveDisabled = false;
                swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
            });
        }
    }

    back() {
        this.location.back();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
