import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, getCurrencySymbol } from '@angular/common';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { Relation } from '../../../client-models';
import { slideInOutAnimation } from '../../../../shared/animations';
import { EstateService } from '../../../service';
import { AppState, getFamilyMemberPayload, getClientPayload, getOtherBeneficiary } from '../../../../shared/app.reducer';
import { NgForm } from '@angular/forms';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-add-distribution',
    templateUrl: './add-distribution.component.html',
    styleUrls: ['./add-distribution.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddDistributionComponent implements OnInit, OnDestroy {
    clientId;
    familyMembers = [];
    bequestList = [];
    beneficiaryList = [];
    allBeneficiaries = [];
    distribution: any = {};
    relations: any = {};
    beneficiaryRelations: any = {};
    otherBeneficiaries = false;
    currencyMask = createNumberMask({
        prefix: '$'
    });
    percentDecimalMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 1
    });
    clientData = {};
    closeButtonDisabled = false;
    saveButtonDisabled = false;
    isEditDistribution = false;
    testatorId;
    beneficiaryId;
    distributionData;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private _location: Location,
        private store: Store<AppState>,
        private estateService: EstateService,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService
    ) {
        if (!this.clientId) {
            this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
            });
        }
        Relation.forEach(relation => {
            this.relations[relation.id] = relation.name;
        });
        if (this.router.url.includes('edit-distribution')) {
            this.isEditDistribution = true;
            this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.testatorId = params.testatorId;
                this.beneficiaryId = params.beneficiaryId;
            });
        } else {
            this.isEditDistribution = false;
        }
    }

    async ngOnInit() {
        this.distribution['distributionMethod'] = 'amount';
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(family => {
            if (family.familyMembers.length > 0) {
                this.familyMembers = family.familyMembers;
                family.familyMembers.forEach((member) => {
                    if (member.relation === 1 || member.relation === 2) {
                        const obj = { id: member.id, name: member.firstName + ' ' + member.lastName };
                        this.bequestList.push(obj);
                        if (this.isEditDistribution && this.testatorId && this.testatorId === member.id) {
                            this.distribution['bequest'] = obj;
                        }
                        if (!this.isEditDistribution && member.relation === 1) {
                            this.distribution['bequest'] = obj;
                        }
                    }
                    const beneficiaryObj = {
                        id: member.id,
                        name: member.firstName + ' ' + member.lastName,
                        relationId: member.relation,
                        relationName: member.relation === 1 || member.relation === 2 ? 'Spouse' : this.relations[member.relation],
                        isOtherBeneficiary: false
                    };
                    this.allBeneficiaries.push(beneficiaryObj);
                    if (!this.isEditDistribution && beneficiaryObj.id !== this.distribution['bequest'].id ||
                        (this.isEditDistribution && this.testatorId && this.testatorId !== beneficiaryObj.id)) {
                        this.beneficiaryList.push(beneficiaryObj);
                    }
                });
            }
        });
        await this.estateService.getRelationsForBeneficiaries().toPromise().then(res => {
            res.forEach(relation => {
                this.beneficiaryRelations[relation.id] = relation.ssid;
            });
        });
        this.getOtherBeneficiaries();
    }

    async getOtherBeneficiaries() {
        this.otherBeneficiaries = false;
        this.store.select(getOtherBeneficiary).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result) {
                result.forEach(beneficiary => {
                    const beneficiaryObj = {
                        id: beneficiary.benificaryId,
                        name: beneficiary.firstName + ' ' + beneficiary.lastName,
                        relationId: beneficiary.relationCode,
                        relationName: this.beneficiaryRelations[beneficiary.relationCode],
                        isOtherBeneficiary: true
                    };
                    this.allBeneficiaries.push(beneficiaryObj);
                    this.beneficiaryList.push(beneficiaryObj);
                });
                this.otherBeneficiaries = true;
            }
        });
        if (this.isEditDistribution && this.testatorId && this.beneficiaryId) {
            this.getDistributionData();
        }
    }
    getDistributionData() {
        this.estateService.getDistributions(this.clientId).toPromise().then(res => {
            res.forEach(testator => {
                if (testator.testatorId === this.testatorId) {
                    testator.distributionBeneficiaryDetails.forEach(beneficiary => {
                        if (beneficiary.beneficiaryId === this.beneficiaryId) {
                            this.distribution['distributionMethod'] = beneficiary.distributeType;
                            this.distribution['distributionValue'] = beneficiary.value;
                        }
                    });
                }
            });
        });
        this.distribution['beneficiary'] = this.beneficiaryList.find(beneficiary => beneficiary.id === this.beneficiaryId);
    }

    filterDropdown(event) {
        this.beneficiaryList = [];
        this.allBeneficiaries.forEach(beneficiary => {
            if (beneficiary.id !== event.id) {
                this.beneficiaryList.push(beneficiary);
            }
        });
    }

    back() {
        this._location.back();
        this.closeButtonDisabled = false;
    }

    editDistribution(beneficiary) {
        this.isEditDistribution = true;
    }

    async submitForm(f: NgForm) {
        this.saveButtonDisabled = true;
        const payload = {
            beneficiaryId: this.distribution['beneficiary']['id'],
            beneficiaryName: this.distribution['beneficiary']['name'],
            distributeType: this.distribution['distributionMethod'],
            relation: this.distribution['beneficiary']['relationId'],
            residualBeneficiary: false,
            testatorId: this.distribution['bequest']['id'],
            value: this.distribution['distributionValue']
        };
        await this.estateService.addDistribution(this.clientId, payload).toPromise().then(res => {
            this.translate.get([
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ESTATE_PLANING.POPUP.DISTRIBUTION_SUCCESSFULLY_ADDED',
                'ESTATE_PLANING.POPUP.DISTRIBUTION_SUCCESSFULLY_UPDATED'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                if (this.isEditDistribution) {
                    Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['ESTATE_PLANING.POPUP.DISTRIBUTION_SUCCESSFULLY_UPDATED'], 'success');
                } else {
                    Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['ESTATE_PLANING.POPUP.DISTRIBUTION_SUCCESSFULLY_ADDED'], 'success');
                }
            });
            this.refreshDataService.changeMessage('refresh_estate_distributions');
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
        this.back();
        this.saveButtonDisabled = false;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
