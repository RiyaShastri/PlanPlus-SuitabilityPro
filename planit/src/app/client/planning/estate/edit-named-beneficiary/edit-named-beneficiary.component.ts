import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { slideInOutAnimation } from '../../../../shared/animations';
import { PlanningService } from '../../../service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { BENEFICIARY_RELATION } from '../../../../shared/constants';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-edit-named-beneficiary',
    templateUrl: './edit-named-beneficiary.component.html',
    styleUrls: ['./edit-named-beneficiary.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class EditNamedBeneficiaryComponent implements OnInit, OnDestroy {
    clientId;
    accountId;
    accountData;
    beneficiariesData = [];
    primaryBeneficiary = [];
    contingentBeneficiary = [];
    primaryTotal = 100;
    contingentTotal = 100;
    BENEFICIARY_RELATION = BENEFICIARY_RELATION;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private planningService: PlanningService,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.accountId = this.route.snapshot.params['accountId'];
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('EDITED_NAMED_BENEFICIARY')) {
                this.getAccountData();
            }
        });
    }

    ngOnInit() {
        this.getAccountData();
    }

    getAccountData() {
        this.planningService.getAccountWithBeneficiary(this.clientId, this.accountId).toPromise().then(result => {
            this.accountData = JSON.parse(JSON.stringify(result));
            this.beneficiariesData = this.accountData['namedBeneficiaries'];
            setTimeout(() => {
                this.setBeneficiaryData(this.beneficiariesData);
                this.refreshDataService.changeMessage('default messsage');
            }, 100);
            this.setBeneficiaryData(this.beneficiariesData);
        }).catch(error => { });
    }

    setBeneficiaryData(benificary) {
        this.primaryBeneficiary = [];
        this.contingentBeneficiary = [];
        this.beneficiariesData = benificary;
        this.beneficiariesData.forEach(data => {
            let details = {};
            if (data && data['defaultNamedBeneficiaryDescription']) {
                const splitedString = data['defaultNamedBeneficiaryDescription'].split(' ');
                data['initials'] = splitedString.length > 1 ? splitedString[0][0] + splitedString[1][0] :
                    splitedString[0][0];
                data['isOther'] = false;
                details = data;
            } else {
                data['initials'] = data['otherBeneficiary']['firstName'][0] +
                    ((data['otherBeneficiary']['lastName']) ? data['otherBeneficiary']['lastName'][0] : '');
                data['isOther'] = true;
                details = data;
            }
            if (data['primaryBeneficiary']) {
                this.primaryBeneficiary.push(details);
            } else {
                this.contingentBeneficiary.push(details);
            }
        });
    }

    totalBeneficiary(event, i, isPrimary) {
        let index = 0;
        let total = 0;
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 || event.keyCode === 46) {
            if (isPrimary) {
                this.primaryTotal = 0;
                this.primaryBeneficiary.forEach((element, ind) => {
                    if (element['canDelete'] === true) {
                        total = total + parseInt(element.owned, 10);
                    } else {
                        index = ind;
                    }
                });
                if (this.primaryBeneficiary[i]['owned'] >= 0 && total <= 100) {
                    this.primaryBeneficiary[index]['owned'] = 100 - total;
                }
                this.primaryBeneficiary.forEach(element => {
                    this.primaryTotal = this.primaryTotal + parseInt(element.owned, 10);
                });
            } else {
                this.contingentTotal = 0;
                this.contingentBeneficiary.forEach((element, ind) => {
                    if (element['canDelete'] === true) {
                        total = total + parseInt(element.owned, 10);
                    } else {
                        index = ind;
                    }
                });
                if (this.contingentBeneficiary[i]['owned'] >= 0 && total <= 100) {
                    this.contingentBeneficiary[index]['owned'] = 100 - total;
                }
                this.contingentBeneficiary.forEach(element => {
                    this.contingentTotal = this.contingentTotal + parseInt(element.owned, 10);
                });
            }
        }
    }

    deleteBeneficiary(data, isPrimary) {
        if (data && data.hasOwnProperty('otherBeneficiary')) {
            this.translate.get([
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ALERT_MESSAGE.OOPS_TEXT',
                'ESTATE_PLANING.POPUP.BENEFICIARY_DELETED_SUCCESSFULLY'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                this.planningService.deleteNamedBeneficiaries(this.clientId, this.accountId, data['otherBeneficiary']['benificaryId'], data['primaryBeneficiary'])
                    .toPromise().then(result => {
                        if (isPrimary) {
                            const index = this.primaryBeneficiary.findIndex(x => x['canDelete'] === false);
                            this.primaryBeneficiary[index]['owned'] = parseInt(this.primaryBeneficiary[index]['owned'], 10) + parseInt(data['owned'], 10);
                        } else {
                            const index = this.contingentBeneficiary.findIndex(x => x['canDelete'] === false);
                            this.contingentBeneficiary[index]['owned'] = parseInt(this.contingentBeneficiary[index]['owned'], 10) + parseInt(data['owned'], 10);
                        }
                        this.getAccountData();
                        Swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['ESTATE_PLANING.POPUP.BENEFICIARY_DELETED_SUCCESSFULLY'], 'success');
                    }).catch(errorResponse => {
                        Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                    });
            });
        }
    }

    updateBeneficiaries() {
        const accountData = this.accountData['accountPayload'];
        const accountValue = {
            key: this.accountId,
            description: accountData['description'],
            accountNumber: accountData['accountNumber'],
            accountType: accountData['accountType'],
            regulatoryType: accountData['regulatoryType'],
            renewalDate: accountData['created'],
            portfolioKey: accountData['portfolio'],
            ownerList: accountData['ownership'],
            managed: accountData['managed'],
            planning: accountData['included'],
        };
        const tempPrimaryBeneficiary = JSON.parse(JSON.stringify(this.primaryBeneficiary));
        const tempContingentBeneficiary = JSON.parse(JSON.stringify(this.contingentBeneficiary));
        const namedBeneficiaries = [];
        tempPrimaryBeneficiary.forEach(element => {
            delete element['initials'];
            delete element['isOther'];
            namedBeneficiaries.push(element);
        });
        tempContingentBeneficiary.forEach(element => {
            delete element['initials'];
            delete element['isOther'];
            namedBeneficiaries.push(element);
        });
        const savePayload = {
            'accountPayloadDTO': accountValue,
            'namedBeneficiaries': namedBeneficiaries
        };
        this.translate.get([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_UPDATED'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.planningService.updateAccountWithBeneficiary(this.clientId, this.accountId, savePayload)
                .toPromise().then(response => {
                    Swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_UPDATED'], 'success');
                    this.refreshDataService.changeMessage('update_all_account_named_beneficiary');
                    this.back();
                }).catch(errorResponse => {
                    Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                });
        });
    }

    back() {
        this.router.navigate(['/client/' + this.clientId + '/planning/estate/named-beneficiary']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
