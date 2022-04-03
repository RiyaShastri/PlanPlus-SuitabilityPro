import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoalService, PortfolioService, ClientProfileService } from '../../../service';
import { Store } from '@ngrx/store';
import { AppState, getFamilyMemberPayload, getGoalRetirementAssumptionPayload } from '../../../../shared/app.reducer';
import { Location, getCurrencySymbol } from '@angular/common';
import Swal from 'sweetalert2';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';
import { GOAL_TYPE } from '../../../../shared/constants';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { PERSON_RELATION } from '../../../../shared/constants';

@Component({
    selector: 'app-edit-goal',
    templateUrl: './edit-goal.component.html',
    styleUrls: ['./edit-goal.component.css']
})
export class EditGoalComponent implements OnInit, OnDestroy {

    currencyMask = createNumberMask({
        prefix: '$'
    });
    percentDecimalMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    clientId;
    goalId;
    viewBy = [
        { id: 1, name: 'Year' },
        { id: 2, name: 'Age' },
    ];
    selectedViewBy = this.viewBy[0];
    inflatation = false;
    goal = {};
    goalList = [];
    currentGoal = {};
    allCurrencyList = [];
    familyMembers = [];
    client1;
    client2;
    tierList = [];
    clientData = {};
    clientBirthYear = 0;
    spouseBirthYear = 0;
    secondTier: boolean;
    thirdTier: boolean;
    disabled = false;
    institutionAmount = 0;
    environment = {};
    GOAL_TYPE = GOAL_TYPE;
    closeButtonDisable = false;
    saveDisabled = false;
    currentYear;
    familyData = {};
    educationFundData;
    educationFundStartAge;
    educationFundStartYear;
    educationFundEndYear;
    educationFundEndAge;
    scenario;
    initialInflation;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private goalService: GoalService,
        private store: Store<AppState>,
        private _location: Location,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private refreshDataService: RefreshDataService,
        private accessRightService: AccessRightService,
        private translate: TranslateService,
        private portfolioService: PortfolioService,
        private clientProfile: ClientProfileService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_GOAL');
        this.angulartics2.eventTrack.next({ action: 'editGoal' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });

    }

    async ngOnInit() {
        this.accessRightService.getAccess(['SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                this.familyData = data;
            }
        });
        await this.goalService.getGoalTypes().toPromise().then(goal => {
            this.goalList = Object.assign([], goal);
        });
        await this.goalService.getAllCurrencyDetail().toPromise().then(currency => {
            this.allCurrencyList = Object.assign([], currency);
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.disabled = false;
            this.goalId = params['goalId'];
            this.setGoalData();
        });
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('on_edit_goal_education_add|')) {
                this.institutionAmount = JSON.parse(message.replace('on_edit_goal_education_add|', ''));
                if (this.institutionAmount && this.tierList) {
                    this.tierList[0].data['amount'] = this.institutionAmount;
                    // this.refreshDataService.changeMessage('default_message');
                }
            }
        });
        this.store.select(getGoalRetirementAssumptionPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            this.setGoalData();
        });
    }

    async setGoalData() {
        await this.goalService.getGoalByGoalId(this.goalId).toPromise().then(response => {
            if (response) {
                this.currentGoal = response;

                if(this.accessRights['SCENARIOACCESS']['accessLevel'] > 0){
                    this.scenario = this.currentGoal['scenarioName'];
                    this.clientProfile.getClientScenarios(this.clientId).toPromise().then((result: any[]) => result.forEach(scenario => {
                        if(scenario.scenarioDescription == this.scenario){
                            this.refreshDataService.selectScenario({name: scenario.scenarioDescription, id: scenario.scenarioType});
                        }
                    }));
                }
                if (this.currentGoal && this.goalList.length > 0 && this.allCurrencyList.length > 0) {
                    const goal = parseInt(this.currentGoal['goalType'], 10);
                    const goalType = this.goalList.find(type => type.goaltype === goal);
                    const currency = this.allCurrencyList.find(curr => curr.currencyCode.trim() === this.currentGoal['curCode']);
                    if (goal === this.GOAL_TYPE.EDUCATION) {
                        this.educationFundData = this.familyData['familyMembers'].find(x => x.id === this.currentGoal['personKey']);
                        if (this.educationFundData && this.educationFundData['id']) {
                            this.clientBirthYear = new Date(this.educationFundData['birthDate']).getFullYear();
                        } else {
                            this.clientBirthYear = new Date(this.familyData['familyMembers'].find(x => x.relation === 1)['birthDate']).getFullYear();
                        }
                        this.educationFundEndYear = this.currentGoal['goalEndYear'];
                        this.educationFundStartYear = this.currentGoal['goalStartYear'];
                        this.educationFundEndAge = this.educationFundEndYear - (this.clientBirthYear);
                        this.educationFundStartAge = this.educationFundStartYear - this.clientBirthYear;
                    } else {
                        this.clientBirthYear = new Date(this.familyData['familyMembers'].find(x => x.relation === PERSON_RELATION.CLIENT1)['birthDate']).getFullYear();
                        let spouse = this.familyData['familyMembers'].find(x => x.relation === PERSON_RELATION.CLIENT2);
                        if (spouse !== undefined && spouse !== null) {
                            this.spouseBirthYear = new Date(spouse['birthDate']).getFullYear();
                        } else {
                            this.spouseBirthYear = 0;   // invalid data
                        }
                    }
                    this.currentYear = new Date().getFullYear();
                    this.goal['percentAmount'] = 'percent';
                    this.goal = {
                        ...this.currentGoal,
                        'goalType': goalType,
                        'currency': currency
                    };
                    this.makeTierData(response);

                    this.currencyMask = createNumberMask({
                        prefix: getCurrencySymbol(currency['currencyCode'].trim(), 'narrow')
                    });
                    this.initialInflation = this.goal['defaultIndexRate'];
                }
            }
        }).catch(errorResponse => {
        });
    }

    makeTierData(response) {
        const tierDetail = {};
        this.tierList = [];
        const tierKeys = ['Tier1', 'Tier2', 'Tier3'];
        tierDetail['tierKeys'] = [];
        tierKeys.forEach((tierKey, i) => {
            const tierData = this.getTierDetail(tierKey, response);
            tierDetail['tierKeys'].push(tierKey);
            tierDetail[tierKey] = tierData;
            if (parseInt(this.currentGoal['goalType'], 10) === this.GOAL_TYPE.EDUCATION) {
                if (tierDetail[tierKey].amount > 0 || tierKey === 'Tier1') {
                    tierDetail[tierKey].clientStartAge = this.educationFundStartAge;
                    tierDetail[tierKey].clientEndAge = this.educationFundEndAge;
                    tierDetail[tierKey].spouseStartAge = 0;
                    tierDetail[tierKey].spouseEndAge = 0;
                    this.tierList.push({ tierNumber: i + 1, tierKey: tierKey, data: tierDetail[tierKey] });
                }
            } else {
                if (tierDetail[tierKey].amount > 0 || tierKey === 'Tier1') {
                    tierDetail[tierKey].clientStartAge = tierDetail[tierKey].clientStartAge !== 0 ? tierDetail[tierKey].clientStartAge : tierDetail[tierKey].startYear - this.clientBirthYear;
                    tierDetail[tierKey].clientEndAge = tierDetail[tierKey].clientEndAge !== 0 ? tierDetail[tierKey].clientEndAge : tierDetail[tierKey].endYear - this.clientBirthYear;
                    if ((tierDetail[tierKey].spouseStartAge) !== 0 && (tierDetail[tierKey].spouseEndAge) !== 0) {
                        tierDetail[tierKey].spouseStartAge = tierDetail[tierKey].spouseStartAge;
                        tierDetail[tierKey].spouseEndAge = tierDetail[tierKey].spouseEndAge;
                    }
                    this.tierList.push({ tierNumber: i + 1, tierKey: tierKey, data: tierDetail[tierKey] });
                }
            }
        });
    }

    checkboxOnChange() {
        if (!this.goal['customIndex']) {
            this.initialInflation = this.goal['indexRate'];
            this.goal['indexRate'] = this.goal['defaultIndexRate']
        } else {
            this.goal['indexRate'] = this.initialInflation;
        }
    }

    getTierDetail(tier, response) {
        return {
            amount: response['goal' + tier + 'Amount'],
            endYear: response['goal' + tier + 'EndYear'],
            startYear: response['goal' + tier + 'StartYear'],
            clientEndAge: response[tier.toLowerCase() + 'ClientEndAge'],
            clientStartAge: response[tier.toLowerCase() + 'ClientStartAge'],
            spouseStartAge: (response[tier.toLowerCase() + 'SpouseStartAge']),
            spouseEndAge: (response[tier.toLowerCase() + 'SpouseEndAge'])
        };
    }

    addTier() {
        if (this.tierList.length < 3) {
            const lastTierIndex = this.tierList.length - 1;
            const obj = {
                tierNumber: this.tierList[lastTierIndex].tierNumber + 1,
                tierKey: 'Tier' + [this.tierList[lastTierIndex].tierNumber + 1],
                data: {
                    amount: this.tierList[lastTierIndex].data.amount,
                    endYear: this.tierList[lastTierIndex].data.endYear,
                    startYear: parseInt(this.tierList[lastTierIndex].data.startYear, 10) + 6,
                    clientStartAge: parseInt(this.tierList[lastTierIndex].data.clientStartAge, 10) + 6,
                    spouseStartAge: (this.goal['spouseAge'] && this.tierList[lastTierIndex].data.spouseStartAge) ? parseInt(this.tierList[lastTierIndex].data.spouseStartAge, 10) + 6 : 0,
                    clientEndAge: this.tierList[lastTierIndex].data.endYear - this.clientBirthYear,
                    spouseEndAge: (this.goal['spouseAge'] && this.tierList[lastTierIndex].data.spouseEndAge) ? parseInt(this.tierList[lastTierIndex].data.endYear, 10) - this.spouseBirthYear : 0
                }
            };
            this.tierList[lastTierIndex].data.endYear = parseInt(this.tierList[lastTierIndex].data.startYear, 10) + 5;
            this.tierList[lastTierIndex].data.clientEndAge = parseInt(this.tierList[lastTierIndex].data.clientStartAge, 10) + 5;
            this.tierList[lastTierIndex].data.spouseEndAge = (this.goal['spouseAge'] && this.tierList[lastTierIndex].data.spouseStartAge) ? this.tierList[lastTierIndex].data.spouseStartAge + 5 : 0;
            this.tierList.push(obj);
            if (lastTierIndex === 0) {
                this.secondTier = true;
            } else if (lastTierIndex === 1) {
                this.thirdTier = true;
            }
            if (obj.data.startYear > 0 && obj.data.startYear > obj.data.endYear ||
                this.tierList[lastTierIndex].data.startYear > 0 && this.tierList[lastTierIndex].data.startYear > this.tierList[lastTierIndex].data.endYear) {
                this.disabled = true;
            } else {
                this.disabled = false;
            }
            for (let i = 0; i < this.tierList.length; i++) {
                if (this.tierList[i].data.startYear < this.currentYear || (this.tierList[i].data.startYear > 0 && this.tierList[i].data.startYear > this.tierList[i].data.endYear)) {
                    this.disabled = true;
                    break;
                } else {
                    this.disabled = false;
                }

            }
        } else {
            this.translate.get(['EDIT_GOAL.POPUP.TIER_ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Sorry!', i18text['EDIT_GOAL.POPUP.TIER_ALERT'], 'warning');
            });
        }
    }

    deleteTier(tierIndex: number) {
        this.tierList[tierIndex - 1].data.endYear = this.tierList[tierIndex].data.endYear;
        this.tierList[tierIndex - 1].data.clientEndAge = this.tierList[tierIndex].data.clientEndAge;
        this.tierList[tierIndex - 1].data.spouseEndAge = this.tierList[tierIndex].data.spouseEndAge;
        this.goal['goal' + this.tierList[tierIndex]['tierKey'] + 'Amount'] = 0;
        this.goal['goal' + this.tierList[tierIndex]['tierKey'] + 'EndYear'] = 0;
        this.goal['goal' + this.tierList[tierIndex]['tierKey'] + 'StartYear'] = 0;
        this.tierList.splice(tierIndex, 1);
        for (let i = 0; i < this.tierList.length; i++) {
            if (this.tierList[i].data.startYear < this.currentYear || (this.tierList[i].data.startYear > 0 && this.tierList[i].data.startYear > this.tierList[i].data.endYear)) {
                this.disabled = true;
                break;
            } else {
                this.disabled = false;
            }
        }
    }

    changeEndYear(value: string, n: number) {
        if (value.length === 4) {
            this.tierList[n].data.clientEndAge = parseInt(value, 10) - this.clientBirthYear;
            if (this.tierList.length > 1) {
                if (this.tierList.length > n + 1) {
                    this.tierList[n + 1].data.clientStartAge = parseInt(this.tierList[n].data.clientEndAge, 10) + 1;
                    this.tierList[n + 1].data.startYear = parseInt(this.tierList[n].data.endYear, 10) + 1;
                }
            }
            if (this.goal['spouseAge'] && this.tierList[n].data.spouseEndAge !== 0 && this.tierList[n].data.spouseEndAge && this.goal['spouseAge'] !== 0) {
                this.tierList[n].data.spouseEndAge = parseInt(value, 10) - this.spouseBirthYear;
                if (this.tierList.length > n + 1) {
                    this.tierList[n + 1].data.spouseStartAge = parseInt(this.tierList[n].data.spouseEndAge, 10) + 1;
                }
            }
            for (let i = 0; i < this.tierList.length; i++) {
                if (this.tierList[i].data.startYear < this.currentYear || (this.tierList[i].data.startYear > 0 && this.tierList[i].data.startYear > this.tierList[i].data.endYear)) {
                    this.disabled = true;
                    break;
                } else {
                    this.disabled = false;
                }

            }
        }
    }

    changeStartYear(value: string, n: number) {
        if (value.length === 4) {
            if (this.tierList[n].data.startYear < this.currentYear) {
                this.disabled = true;
                return;
            } else {
                this.disabled = false;
            }
            this.tierList[n].data.clientStartAge = parseInt(value, 10) - this.clientBirthYear;
            if (this.tierList.length !== 1 && this.tierList.length > n) {
                this.tierList[n - 1].data.clientEndAge = parseInt(this.tierList[n].data.clientStartAge, 10) - 1;
                this.tierList[n - 1].data.endYear = parseInt(this.tierList[n].data.startYear, 10) - 1;
            }
            if (this.goal['spouseAge'] && this.tierList[n].data.spouseEndAge !== 0 && this.tierList[n].data.spouseEndAge && this.goal['spouseAge'] !== 0) {
                this.tierList[n].data.spouseStartAge = parseInt(value, 10) - this.spouseBirthYear;
                if (this.tierList.length > n && this.tierList.length !== 1) {
                    this.tierList[n - 1].data.spouseEndAge = parseInt(this.tierList[n].data.spouseStartAge, 10) - 1;
                }
            }
            for (let i = 0; i < this.tierList.length; i++) {
                if (this.tierList[i].data.startYear < this.currentYear || (this.tierList[i].data.startYear > 0 && this.tierList[i].data.startYear > this.tierList[i].data.endYear)) {
                    this.disabled = true;
                    break;
                } else {
                    this.disabled = false;
                }

            }
        }
    }

    changeAge(value: string, n: number, age) {
        if (value.length === 2 || value.length === 3) {
            if (age === 'start_age') {
                this.tierList[n].data.startYear = this.clientBirthYear + parseInt(value, 10);
                if (this.tierList.length !== 1 && this.tierList.length > n) {
                    this.tierList[n - 1].data.endYear = parseInt(this.tierList[n].data.startYear, 10) - 1;
                    this.tierList[n - 1].data.clientEndAge = parseInt(this.tierList[n].data.clientStartAge, 10) - 1;
                }
                if (this.goal['spouseAge'] && this.tierList[n].data.spouseEndAge !== 0 && this.tierList[n].data.spouseEndAge && this.goal['spouseAge'] !== 0) {
                    this.tierList[n].data.spouseStartAge = this.tierList[n].data.startYear - this.spouseBirthYear;
                    if (this.tierList.length !== 1 && this.tierList.length > n) {
                        this.tierList[n - 1].data.spouseEndAge = parseInt(this.tierList[n].data.spouseStartAge, 10) - 1;
                    }
                }
            } else if (age === 'end_age') {
                this.tierList[n].data.endYear = this.clientBirthYear + parseInt(value, 10);
                if (this.tierList.length > n + 1 && this.tierList.length !== 1) {
                    this.tierList[n + 1].data.startYear = parseInt(this.tierList[n].data.endYear, 10) + 1;
                    this.tierList[n + 1].data.clientStartAge = parseInt(this.tierList[n].data.clientEndAge, 10) + 1;
                }
                if (this.goal['spouseAge'] && this.tierList[n].data.spouseEndAge !== 0 && this.tierList[n].data.spouseEndAge && this.goal['spouseAge'] !== 0) {
                    this.tierList[n].data.spouseEndAge = this.tierList[n].data.endYear - this.spouseBirthYear;
                    if (this.tierList.length > n + 1 && this.tierList.length !== 1) {
                        this.tierList[n + 1].data.spouseStartAge = parseInt(this.tierList[n].data.spouseEndAge, 10) + 1;
                    }
                }
            }
            for (let i = 0; i < this.tierList.length; i++) {
                if (this.tierList[i].data.startYear < this.currentYear || (this.tierList[i].data.startYear > 0 && this.tierList[i].data.startYear > this.tierList[i].data.endYear)) {
                    this.disabled = true;
                    break;
                } else {
                    this.disabled = false;
                }

            }
        }
    }

    sorting(event) {
        this.selectedViewBy = event;
    }

    saveGoal() {
        this.saveDisabled = true;
        const obj = JSON.parse(JSON.stringify(this.goal));
        obj['goalType'] = obj['goalType'].goaltype;
        this.tierList.forEach((tier, i) => {
            const tierNo = i + 1;
            obj['goalTier' + tierNo + 'Amount'] = tier.data.amount;
            obj['goalTier' + tierNo + 'EndYear'] = parseInt(tier.data.endYear, 10);
            obj['goalTier' + tierNo + 'StartYear'] = parseInt(tier.data.startYear, 10);
            obj['tier' + tierNo + 'ClientEndAge'] = tier.data.clientEndAge;
            obj['tier' + tierNo + 'ClientStartAge'] = tier.data.clientStartAge;
            obj['tier' + tierNo + 'SpouseStartAge'] = tier.data.spouseStartAge;
            obj['tier' + tierNo + 'SpouseEndAge'] = tier.data.spouseEndAge;
        });
        if (this.tierList.length > 0) {
            const length = this.tierList.length;
            obj['goalStartYear'] = parseInt(this.tierList[0].data.startYear, 10);
            obj['goalEndYear'] = parseInt(this.tierList[length - 1].data.endYear, 10);
            obj['amountPerYear'] = parseInt(this.tierList[0].data['amount'], 10);
        }
        delete obj['currency'];
        this.goalService.updateGoal(this.clientId, obj).toPromise().then(response => {
            this.portfolioService.getClientPortfolioPayload(this.clientId);
            this.router.navigate(['/client/' + this.clientId + '/planning/goals/summary']);
            this.refreshDataService.changeMessage('default message');
            this.translate.get(['EDIT_GOAL.POPUP.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                Swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['EDIT_GOAL.POPUP.SUCCESS'], 'success');
            });
            this.goalService.getClientGoalPayload(this.clientId);
            this.saveDisabled = false;
        }).catch(errRespose => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errRespose.error.errorMessage, 'error');
            });
            this.saveDisabled = false;
        });
    }

    changeGoal(goalId) {
        this.goalId = goalId;
        this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + this.goalId + '/edit-goal']);
    }

    back() {
        this._location.back();
        this.refreshDataService.changeMessage('default message');
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
