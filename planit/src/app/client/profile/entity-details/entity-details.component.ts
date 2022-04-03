import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { ENTITY_TYPES, CORPORATION_OPTIONS, FAMILY_MEMBER_DROPDOWN_TYPE, OPCO_ENTITY_ASSUMPTION_TYPES } from '../../../shared/constants';
import { Store } from '@ngrx/store';
import { AppState, getProvincePayload, getClientPayload, getCorporationList } from '../../../shared/app.reducer';
import { ClientProfileService, EntitiesService } from '../../service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { getCurrencySymbol } from '@angular/common';
import swal from 'sweetalert2';
import { ENTITY_SSID } from '../../../shared/constants';
import { PageTitleService } from '../../../shared/page-title';

@Component({
    selector: 'app-entity-details',
    templateUrl: './entity-details.component.html',
    styleUrls: ['./entity-details.component.css']
})
export class EntityDetailsComponent implements OnInit, OnDestroy {
    clientId;
    entityId;
    private unsubscribe$ = new Subject<void>();
    isFileUploded = false;
    entityDetail = {};
    uploadedImage;
    typeDropList = [];
    i18Text = {};
    TYPES = ENTITY_TYPES;
    provinceArr = [];
    selectedProvince;
    selectedType;
    clientData = {};
    CORPORATION_OPTIONS = CORPORATION_OPTIONS;
    relatedCorporateList = [];
    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency
    });
    ENTITY_TYPE = FAMILY_MEMBER_DROPDOWN_TYPE.ENTITY;
    saveDisabled = false;
    avatarChanged = false;
    taxAssuption = {};
    SSID = ENTITY_SSID;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService,
        private store: Store<AppState>,
        private clientProfileService: ClientProfileService,
        private entitiesService: EntitiesService,
        private pageTitleService: PageTitleService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    async ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PERSONAL_INFO_ENTITY_DETAILS');
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
            this.translate.stream([
                'ALERT.TITLE.SUCCESS',
                'ALERT_MESSAGE.OOPS_TEXT',
                'ALERT_MESSAGE.ALERT_TITLE',
                'ENTITY.ACTIVE_BUISNESS',
                'ENTITY.HOLDING_COMPANY',
                'ENTITY.UPDATE_MESSAGE',
                'ENTITY.RELATED_CORPORATION_ALERT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                this.i18Text = i18Text;
                this.typeDropList = [
                    { id: this.TYPES.ACTIVE_BUISNESS, name: this.i18Text['ENTITY.ACTIVE_BUISNESS'] },
                    { id: this.TYPES.HOLDING_COMPANY, name: this.i18Text['ENTITY.HOLDING_COMPANY'] },
                ];
            });
            this.store.select(getCorporationList).pipe(takeUntil(this.unsubscribe$)).subscribe(corporations => {
                if (corporations) {
                    this.relatedCorporateList = corporations.filter(corporation => corporation.entityId !== this.entityId);
                }
            });
            this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
                if (clientData) {
                    this.clientData = clientData;
                    this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
                    this.currencyMask = createNumberMask({
                        prefix: this.currency
                    });
                    this.store.select(getProvincePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                        if (data) {
                            if (this.clientData && this.clientData.hasOwnProperty('planningCountry')) {
                                this.provinceArr = data[this.clientData['planningCountry']];
                                this.getEntity();
                            }
                        } else {
                            this.clientProfileService.getProvince();
                        }
                    });
                }
            });
        });
    }

    getEntity() {
        this.clientProfileService.getEntityByEntityId(this.clientId, this.entityId).toPromise().then(result => {
            this.entitiesService.getTaxAssumptionData(this.clientId, this.entityId).toPromise().then(data => {
                this.entityDetail = result;
                this.taxAssuption = data;
                this.selectedProvince = this.provinceArr.find(x => x.provinceId === this.entityDetail['province']);
                this.selectedType = this.typeDropList.find(x => x.id === this.entityDetail['entityType']);
                this.entityDetail['relatedCorpo'] = this.entityDetail['relCorp'] ? this.CORPORATION_OPTIONS.YES : this.CORPORATION_OPTIONS.NO;
                this.entityDetail['relatedCorporate'] = this.relatedCorporateList.find(x => x.entityId === this.entityDetail['relCorpId']);
                if (this.entityDetail['imageUrl']) {
                    this.isFileUploded = true;
                } else {
                    this.isFileUploded = false;
                    this.uploadedImage = undefined;
                }
            }).catch(err => { });
        }).catch(entityError => {
            if (entityError.status === 403 || entityError.status === 404) {
                this.router.navigate(['/client/' + this.clientId + '/profile/personal-info']);
            }
        });
    }

    memberSwitch(memberId) {
        this.router.navigate(['/client/' + this.clientId + '/profile/personal-info/' + memberId + '/entity-details']);
        this.isFileUploded = undefined;
        this.entityDetail['imageUrl'] = '';
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    uploadImage(event) {
        this.uploadedImage = event;
        this.avatarChanged = true;
    }

    back() {
        this.router.navigate(['/client/' + this.clientId + '/profile/personal-info/']);
    }

    updateEntity() {
        if (this.entityDetail['relatedCorpo'] === this.CORPORATION_OPTIONS.YES && this.entityDetail['relatedCorporate'] && this.entityDetail['relatedCorporate']['entityId'] === this.entityId) {
            this.saveDisabled = false;
            this.entityDetail['relatedCorporate'] = null;
            swal(this.i18Text['ALERT_MESSAGE.ALERT_TITLE'], this.i18Text['ENTITY.RELATED_CORPORATION_ALERT'], 'warning');
            return;
        }
        const obj = {
            ...this.entityDetail,
            'entityType': this.selectedType['id'],
            'province': this.selectedProvince['provinceId'],
            'relCorp': this.entityDetail['relatedCorpo'] === this.CORPORATION_OPTIONS.YES
        };
        if (this.entityDetail['relatedCorpo'] === this.CORPORATION_OPTIONS.YES && this.entityDetail['relatedCorporate'] && this.entityDetail['relatedCorporate']['entityId'] !== this.entityId) {
            obj['relCorpDesc'] = this.entityDetail['relatedCorporate']['description'];
            obj['relCorpId'] = this.entityDetail['relatedCorporate']['entityId'];
        }
        this.clientProfileService.updateEntityDetails(this.clientId, this.entityId, obj).toPromise().then(result => {
            this.entitiesService.updateTaxAssumption(this.clientId, this.entityId, this.taxAssuption).toPromise().then(async response => {
                await this.uploadAvatar();
                this.clientProfileService.getEntities(this.clientId);
                this.clientProfileService.getCorporation(this.clientId);
                this.back();
                swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['ENTITY.UPDATE_MESSAGE'], 'success');
                this.saveDisabled = false;
            }).catch(errorResponse => {
                swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                this.saveDisabled = false;
            });
        }).catch(errorResponse => {
            swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
            this.saveDisabled = false;
        });
    }

    uploadAvatar() {
        const promise = new Promise(async (resolve, reject) => {
            if (this.avatarChanged) {
                const formData = new FormData();
                formData.append('file', this.uploadedImage ? this.uploadedImage : null);
                this.clientProfileService.uploadEntityImage(this.clientId, this.entityId, formData).toPromise().then(avatarRes => {
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

    onEntityTypeChange() {
        if (this.selectedType['id'] === this.TYPES.ACTIVE_BUISNESS) {
            const opcoAssumptions = [{
                'ssid': OPCO_ENTITY_ASSUMPTION_TYPES.SDB_RATE,
                'federal': 0.0,
                'provincial': 0.0,
                'currency': true
            },
            {
                'ssid': OPCO_ENTITY_ASSUMPTION_TYPES.DBD_RATE,
                'federal': 0.0,
                'provincial': 0.0,
                'currency': true
            }];
            this.taxAssuption['entityAssumptions'].splice(0, 0, opcoAssumptions[0], opcoAssumptions[1]);

        } else {
            this.taxAssuption['entityAssumptions'].splice(0, 2);
        }
    }
}
