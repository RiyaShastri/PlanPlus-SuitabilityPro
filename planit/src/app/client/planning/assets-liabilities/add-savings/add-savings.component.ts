import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Location, getCurrencySymbol } from '@angular/common';
import swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { PlanningService, GoalService, ClientProfileService } from '../../../service';
import { slideInOutAnimation } from '../../../../shared/animations';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { AppState, getClientPayload, getGoalPayload } from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';


@Component({
    selector: 'app-add-savings',
    templateUrl: './add-savings.component.html',
    styleUrls: ['./add-savings.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddSavingsComponent implements OnInit, OnDestroy {
    goals = null;
    goalId = '';
    clientId;
    accountId;
    currentAccount;
    savings = {};
    today = new Date();
    accountsDropdown = [];
    selectedScenario: Scenario = {id: '00', name: 'Current Scenario'};
    currencyMask = createNumberMask({
        prefix: '$'
    });
    goalsList = [{ id: null, description: 'Unallocated' }];
    selectedGoalsList = [{ id: null, description: 'Unallocated' }];
    fixedGoal = false;
    noAccounts = true;
    clientData = {};
    @ViewChild('f') public form: NgForm;
    saveDisabled = false;
    closeButtonDisable = false;
    isOnAL = false;
    accessRights:any = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _location: Location,
        private assetsServices: PlanningService,
        private store: Store<AppState>,
        private goalService: GoalService,
        private dataSharing: RefreshDataService,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private profileService: ClientProfileService,
        private accessRightService: AccessRightService,
        private translate: TranslateService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_SAVING');
        this.angulartics2.eventTrack.next({ action: 'addSaving' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.accountId = this.route.snapshot.params['accountId'];
        if (!this.accountId) {
            this.accountId = this.route.parent.snapshot.params['accountId'];
        }
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.goalId = params['goalId'];
        });
        if (!this.goalId) {
            this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.goalId = params['goalId'];
            });
        }

        this.route.parent.url.pipe(takeUntil(this.unsubscribe$)).subscribe((urlPath) => {
            const url = urlPath[urlPath.length - 1].path
            if(url.includes('assets-liabilities')){
                this.isOnAL = true;
            };
        });
        
        
    }

    ngOnInit() {

        this.accessRightService.getAccess(['SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

        this.dataSharing.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
            if(scenario){
                this.selectedScenario = scenario
            }
        });
        
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        this.goalService.getGoalsByClientId(this.clientId, 'goal_type', 'age', this.selectedScenario.id).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.goals = data;
                this.getGoalsDropdown();
            } else {
                this.goalService.getClientGoalPayload(this.clientId);
            }
        });
        this.getAccountsDropdown();
    }

    getAccountsDropdown() {
        this.assetsServices.getAccountsByClientID(this.clientId).toPromise().then(res => {
            this.accountsDropdown = res;
            if (this.accountsDropdown.length > 0) {
                this.noAccounts = false;
                if (this.accountId) {
                    this.savings['linkedAccountKey'] = this.accountsDropdown.find(account => account.id === this.accountId);
                    this.accountSelected();
                }
            }
        }).catch(err => {
            this.noAccounts = true;
        });
    }

    getGoalsDropdown() {
        for (let i = 0; i < this.goals.length; i++) {
            this.goalsList.push({ id: this.goals[i]['key'], description: this.goals[i]['description'] });
            if (this.goals[i]['goalType'] === '3') {
                this.selectedGoalsList.push({ id: this.goals[i]['key'], description: this.goals[i]['description'] });
            }
            if (this.goalId && this.goalId === this.goals[i]['key']) {
                this.savings['linkedGoal'] = { id: this.goals[i]['key'], description: this.goals[i]['description'] };
            }
        }
    }

    back() {
        this._location.back();
    }

    accountSelected() {
        this.currentAccount = this.savings['linkedAccountKey'];
    }

    addSavings(opt) {
        if (this.savings['linkedGoal'].description !== 'Unallocated') {
            this.savings['linkedGoal'] = this.savings['linkedGoal'].id;
        } else {
            this.savings['linkedGoal'] = null;
        }

        const reqObj = {
            linkedGoal: this.savings['linkedGoal'],
            tier1Amount: this.savings['tier1Amount'],
            thirdPartySavings1: this.savings['thirdPartySavings1']
        };

        this.assetsServices.addSavings(this.currentAccount['id'], reqObj, this.selectedScenario.id).toPromise().then(res => {
            this.translate.get(['SAVINGS.ADD_SAVINGS.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['SAVINGS.ADD_SAVINGS.SUCCESS'], 'success');
            });
            this.dataSharing.changeMessage('refresh_savings_list');
            this.profileService.getClientNetworthInvestmentPayload(this.clientId);
            this.profileService.getInvestmentData(this.clientId);
            if (opt === 1) {
                this.form.reset();
                this.saveDisabled = true;
                this.back();
            } else if (opt === 2) {
                this.router.navigate(['/client', this.clientId, 'planning', 'assets-liabilities-savings', res['key'], 'edit-savings']);
                this.saveDisabled = true;
            } else if (opt === 3) {
                this.form.resetForm();
                this.savings = {};
                this.saveDisabled = true;
            }
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
