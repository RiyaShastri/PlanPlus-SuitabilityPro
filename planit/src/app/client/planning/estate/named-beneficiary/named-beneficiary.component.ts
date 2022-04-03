import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PlanningService } from '../../../service';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { RELATION } from '../../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-named-beneficiary',
    templateUrl: './named-beneficiary.component.html',
    styleUrls: ['./named-beneficiary.component.css']
})
export class NamedBeneficiaryComponent implements OnInit {
    clientId;
    allAccountsData = [];
    RELATION = RELATION;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private planningService: PlanningService,
        private refreshDataService: RefreshDataService,
        private translate: TranslateService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('update_all_account_named_beneficiary')) {
                this.getAllAccountData();
                this.refreshDataService.changeMessage('default message');
            }
        });
    }

    ngOnInit() {
        this.getAllAccountData();
    }

    getAllAccountData() {
        this.planningService.getFamilyAllAccountBeneficiary(this.clientId).toPromise().then(result => {
            this.allAccountsData = JSON.parse(JSON.stringify(result));
            this.allAccountsData.forEach(account => {
                const splitedString = account['majorityOwnerName'].split(' ');
                account['initials'] = splitedString.length > 1 ? splitedString[0][0].toUpperCase() + splitedString[1][0].toUpperCase() :
                    splitedString[0][0].toUpperCase();
                account['majorityDetails'].forEach(item => {
                    account['ownership'] = item['account']['ownership'];
                    item['account']['liquidDeath'] = item['account']['liquidDeath'] === 1 ? true : false;
                    item['account']['liquidEmergency'] = item['account']['liquidEmergency'] === 1 ? true : false;
                    item['account']['subjectProbate'] = item['account']['subjectProbate'] === 1 ? true : false;
                    item['primaryBeneficiary'] = [];
                    item['contingentBeneficiary'] = [];
                    item['namedBeneficiaries'].forEach(data => {
                        if (data['primaryBeneficiary']) {
                            item['primaryBeneficiary'].push(data);
                        } else {
                            item['contingentBeneficiary'].push(data);
                        }
                    });
                });
            });
        }).catch(error => { });
    }

    changeOwnershipAction(ownerIndex: number, index: number) {
        if ($('#dropdownOwnershipAction' + ownerIndex + index).is(':visible')) {
            $('.dropdown-portfolio-owned-action').hide();
        } else {
            $('.dropdown-portfolio-owned-action').hide();
            $('#dropdownOwnershipAction' + ownerIndex + index).toggle();
        }
    }

    updateBeneficiaries() {
        const savePayload = [];
        const data = JSON.parse(JSON.stringify(this.allAccountsData));
        data.forEach(account => {
            account['majorityDetails'].forEach(item => {
                savePayload.push({
                    'accountId': item['account']['id'],
                    'liquidDeath': item['account']['liquidDeath'] ? 1 : 0,
                    'liquidEmergency': item['account']['liquidEmergency'] ? 1 : 0,
                    'subjectProbate': item['account']['subjectProbate'] ? 1 : 0,
                });
            });
        });
        this.translate.get([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_UPDATED'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.planningService.updateAccountProbateAndLiquidity(this.clientId, savePayload).toPromise().then(result => {
                Swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['ESTATE_PLANING.POPUP.BENEFICIARY_SUCCESSFULLY_UPDATED'], 'success');
                this.getAllAccountData();
            }).catch(errorResponse => {
                Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
            });
        });
    }

    back() {
        this.router.navigate(['/client', this.clientId, 'planning', 'estate', 'information']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
