import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { PlanningService } from '../../../service/planning.service';
import { ClientProfileService } from '../../../service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-assets-header',
    templateUrl: './assets-header.component.html',
    styleUrls: ['./assets-header.component.css']
})
export class AssetsHeaderComponent implements OnInit, OnDestroy {
    @Output() public switchAccount = new EventEmitter();
    @Input() public clientId;
    @Input() public accountId;
    @Input() public currentPage;
    public accountsData = [];
    public accountName: string;
    selectedAccount = {};
    unsubscribe$: any;
    constructor(
        private router: Router,
        private planningServices: PlanningService,
        private profileService: ClientProfileService,
        public translate: TranslateService,
    ) { }

    ngOnInit() {
        this.planningServices.getAccountSummaryByAccountType(this.clientId).toPromise().then(data => {
            data.accounts.forEach(account => {
                if (account.investmentAccount) {
                    account.investmentAccount.forEach(acc => {
                        this.accountsData.push({ id: acc.id, description: acc.description });
                        if (acc.id === this.accountId) {
                            this.selectedAccount = acc;
                            this.accountName = acc.description;
                        }
                    });
                } else {
                    account.nonInvestmentAccount.forEach(acc => {
                        this.accountsData.push({ id: acc.id, description: acc.description });
                        if (acc.id === this.accountId) {
                            this.selectedAccount = acc;
                            this.accountName = acc.description;
                        }
                    });
                }
            });
        }).catch(error => {
        });
    }

    deleteAccount() {
        this.unsubscribe$ = this.translate.get([
            'DELETE.POPUP.ACCOUNT_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.ACCOUNT_DELETE',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.ACCOUNT_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.planningServices.deleteAccountById(this.accountId).toPromise().then(data => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.ACCOUNT_DELETE'], 'success');
                        this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                        this.profileService.getInvestmentData(this.clientId);
                        this.router.navigate(['./client', this.clientId, 'planning', 'assets-liabilities']);
                    }).catch(errorResponse => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                    });
                }
            });
        });
    }

    changeAccount(accountId) {
        this.accountId = accountId;
        this.selectedAccount = this.accountsData[this.accountsData.findIndex(d => d.id === accountId)];
        this.accountName = this.selectedAccount['description'];
        this.switchAccount.emit(accountId);
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
