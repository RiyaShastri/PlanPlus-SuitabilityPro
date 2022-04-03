import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../shared/animations';
import { Store } from '@ngrx/store';
import { AppState, getFamilyMemberPayload, getOtherBeneficiary } from '../../../../shared/app.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, EstateService } from '../../../service';
import swal from 'sweetalert2';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { BENEFICIARY_RELATION, BENEFICIARY_TYPE } from '../../../../shared/constants';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { PERSON_RELATION } from '../../../../shared/constants';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-add-named-beneficiary',
    templateUrl: './add-named-beneficiary.component.html',
    styleUrls: ['./add-named-beneficiary.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddNamedBeneficiaryComponent implements OnInit, OnDestroy {
    clientId;
    accountId;
    beneficiaryList = [];
    familyMemberData = [];
    otherBeneficiary = [];
    parseData = null;
    RELATION = BENEFICIARY_RELATION;
    BENEFICIARY_TYPE = BENEFICIARY_TYPE;
    beneficiaryData = {};
    isFromEditBeneficiary;
    fromDistributions = false;
    isFromEditAccount = false;
    selectedOwnerShipId;
    selectedOwnerType: number;
    testatorId = '';
    residualDistribution = [];
    spousData = {};
    isSpousalRollover = false;
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<AppState>,
        private planningService: PlanningService,
        private refreshDataService: RefreshDataService,
        private translate: TranslateService,
        private estateService: EstateService
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.accountId = this.route.parent.snapshot.params['accountId'];
        if (!this.accountId) {
            this.accountId = this.route.snapshot.params['accountId'];
        }
        this.isFromEditBeneficiary = this.router.url.includes('/estate/named-beneficiary/') ? true : false;
        this.fromDistributions = this.router.url.includes('/estate/distributions/') ? true : false;
        this.isFromEditAccount = this.router.url.includes('/edit-account/add-named-beneficiary') ? true : false;

        if (this.fromDistributions) {
            this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.testatorId = params.testatorId;
            });
        }
        
        if (this.isFromEditAccount) {
            this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.selectedOwnerShipId = params.selectedOwnerShipId;
                this.selectedOwnerType = params.selectedOwnerType;
            });
        }

        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            this.parseData = null;
            if (message.includes('add_Named_Beneficiary_residual|')) {
                this.residualDistribution = JSON.parse(message.replace('add_Named_Beneficiary_residual|', ''));
            } else if (message.includes('refresh_other_beneficiaries|')) {
                this.parseData = JSON.parse(message.replace('refresh_other_beneficiaries|', ''));
            } else if (message.includes('cancel_Add_new_beneficiary')) {
                this.parseData = JSON.parse(message.replace('cancel_Add_new_beneficiary|', ''));
            }
            if (this.parseData && this.parseData.hasOwnProperty('selectedBeneficiary')) {
                this.setBeneficiary();
            }
        });
    }

    ngOnInit() {
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data && data.hasOwnProperty('familyMembers')) {
                this.familyMemberData = data['familyMembers'];
                this.setBeneficiary();
            }
        });
        this.planningService.getAccountByID(this.accountId).toPromise().then(result => {
            let isMultipleOwnership = true;
            if (result['regulatoryTypeDTO']['jointTic'] === 0 && result['regulatoryTypeDTO']['jointWros'] === 0 &&
                result['regulatoryTypeDTO']['jointQcNonspouse'] === 0 && result['regulatoryTypeDTO']['itfCapable'] === 0) {
                isMultipleOwnership = false;
            }
            if (!isMultipleOwnership) {
                for (let i = 0; i < result['ownership'].length; i++) {
                    if (result['ownership'][i]['owned'] === 100 &&
                    (result['ownership'][i]['personDetails']['relation'] === this.RELATION.CLIENT || result['ownership'][i]['personDetails']['relation'] === this.RELATION.SPOUSE)) {
                        this.isSpousalRollover = true;
                        this.spousData['key'] = result['ownership'][i]['personDetails']['id'];
                        break;
                    } else {
                        this.isSpousalRollover = false;
                    }
                }
            }
        }).catch(error => { });
    }

    setBeneficiary() {
        this.store.select(getOtherBeneficiary).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result) {
                this.otherBeneficiary = result;
                if (this.fromDistributions) {
                    const clientIndex = this.familyMemberData.findIndex(member => member.relation === PERSON_RELATION.CLIENT1);
                    const spouseIndex = this.familyMemberData.findIndex(member => member.relation === PERSON_RELATION.CLIENT2);
                    if (clientIndex >= 0) {
                        this.familyMemberData.splice(clientIndex, 1);
                    }
                    if (spouseIndex >= 0) {
                        this.familyMemberData.splice(spouseIndex, 1);
                    }
                }
                this.beneficiaryList = this.familyMemberData.concat(this.otherBeneficiary);
                this.beneficiaryList.forEach(ele => {
                    ele['nameDescription'] = ele['firstName'] !== '' && ele['lastName'] !== '' ?
                        ele['firstName'] + ' ' + ele['lastName'] : ele['firstName'];
                });
                setTimeout(() => {
                    if (this.parseData && this.parseData.hasOwnProperty('selectedBeneficiary')) {
                        this.beneficiaryData['selectedBeneficiary'] = this.parseData['selectedBeneficiary'];
                        this.beneficiaryData['isSpousal'] = this.parseData['isSpousal'];
                        this.beneficiaryData['type'] = this.parseData['type'];
                        this.parseData['isSpousalRollover'] = this.isSpousalRollover;
                        this.parseData['spousData'] = this.spousData;
                        this.refreshDataService.changeMessage('default messsage');
                    }
                }, 100);
            }
        });
    }

    addNewBeneficiary() {
        const parseData = Object.assign({}, this.beneficiaryData);
        if (this.fromDistributions) {
            parseData['fromDistributions'] = this.fromDistributions;
            parseData['testatorId'] = this.testatorId;
            parseData['residualDistribution'] = this.residualDistribution;
        } else {
            parseData['isFromEditBeneficiary'] = this.isFromEditBeneficiary;
            parseData['accountId'] = this.accountId;
            parseData['isSpousalRollover'] = this.isSpousalRollover;
            parseData['spousData'] = this.spousData;
        }
        this.refreshDataService.changeMessage('add_New_Beneficiary|' + JSON.stringify(parseData));
        if (this.fromDistributions) {
            this.router.navigate(['/client', this.clientId, 'planning', 'estate', 'distributions', 'add-beneficiary']);
        } else {
            this.router.navigate(['/client', this.clientId, 'profile', 'personal-info', 'add-beneficiary']);
        }
    }

    saveData(f: NgForm) {
        if (f.valid) {
            const data = Object.assign({}, this.beneficiaryData['selectedBeneficiary']);
            if (this.fromDistributions) {
                this.saveResidualBeneficiary(data);
            } else {
                const savePayload = {
                    'otherBeneficiary': {
                        'benificaryId': data['benificaryId'] ? data['benificaryId'] : data['id'],
                        'familyKey': this.clientId,
                        'relationCode': data['relationCode'] ? data['relationCode'] : data['relation'],
                        'firstName': data['firstName'],
                        'lastName': data['lastName'],
                        'birthDate': data['birthDate'],
                        'age': data['age'],
                        'disabled': data['disabled'],
                        'beneficiaryAvatar': ''
                    },
                    'owned': 0,
                    'primaryBeneficiary': this.beneficiaryData['type'] === this.BENEFICIARY_TYPE.PRIMARY ? true : false,
                    'rollover': this.beneficiaryData['isSpousal']
                };
                this.translate.get([
                    'ALERT_MESSAGE.SUCCESS_TITLE',
                    'ALERT_MESSAGE.OOPS_TEXT',
                    'ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_ADDED'
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    this.planningService.saveNamedBeneficiaries(this.clientId, this.accountId, savePayload).toPromise().then(result => {
                        swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_ADDED'], 'success');
                        if (this.isFromEditBeneficiary) {
                            this.refreshDataService.changeMessage('EDITED_NAMED_BENEFICIARY');
                        } else {
                            this.refreshDataService.changeMessage('NEW_BENEFICIARY_ADDED');
                        }
                        this.back();
                    }).catch(errorResponse => {
                        swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                    });
                });
            }
        }
    }

    saveResidualBeneficiary(beneficiaryData) {
        const payload = {
            'beneficiaryId': beneficiaryData['benificaryId'],
            'primaryBeneficiary': this.beneficiaryData['type'] === this.BENEFICIARY_TYPE.PRIMARY ? true : false,
            'relation': beneficiaryData['relationCode'],
            'residualBeneficiary': true,
            'rollover': this.beneficiaryData['isSpousal'],
            'testatorId': this.testatorId,
            'distributeType': 'percentage'
        };
        this.translate.get([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_ADDED'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.estateService.addDistribution(this.clientId, payload).toPromise().then(response => {
                swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_ADDED'], 'success');
                this.back();
            }).catch(errorResponse => {
                swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
            });
        });
    }

    back() {
        if (this.isFromEditBeneficiary) {
            this.router.navigate(['/client', this.clientId, 'planning', 'estate', 'named-beneficiary', this.accountId, 'edit-named-beneficiary']);
        } else if (this.fromDistributions) {
            this.refreshDataService.changeMessage('back_from_Named_Beneficiary|' + JSON.stringify(this.residualDistribution));
            this.router.navigate(['/client', this.clientId, 'planning', 'estate', 'distributions', this.testatorId, 'residual-distribution']);
        } else {
            this.router.navigate(['/client', this.clientId, 'planning', 'assets-liabilities', this.accountId, 'edit-account'],
                    { queryParams: { page: 'add-named-beneficiary', selectedOwnerShipId: this.selectedOwnerShipId, selectedOwnerType: this.selectedOwnerType }});
        }
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
