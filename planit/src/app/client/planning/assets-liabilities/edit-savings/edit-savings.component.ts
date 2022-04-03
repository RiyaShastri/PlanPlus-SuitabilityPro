import { Component, OnInit, OnDestroy } from '@angular/core';
import { getCurrencySymbol, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { SelectItem } from 'primeng/api';
import { PlanningService, GoalService, ClientProfileService } from '../../../service';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import {AppState, getClientPayload, getFamilyMemberPayload} from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { PERSON_RELATION } from '../../../../shared/constants';
@Component({
    selector: 'app-edit-savings',
    templateUrl: './edit-savings.component.html',
    styleUrls: ['./edit-savings.component.css']
})

export class EditSavingsComponent implements OnInit, OnDestroy {

    goals = null;
    savings = null;
    clientId: string;
    savingsId: any;
    accountId: string;
    goalId: string;
    clientData: any = {};
    portfolios: any;
    linkedGoal: any = {};
    secondTier: boolean;
    thirdTier: boolean;
    portfolioType: any;
    frequencyOptions = [];
    savingsData = [];
    currentYear = new Date().getFullYear();
    savingsName = '';
    currentSavings: any = {};
    clientBirthYear = 0;
    spouseBirthYear = 0;
    viewBy = [
        { id: 1, name: 'Year' },
        { id: 2, name: 'Age' },
    ];
    selectedViewBy = this.viewBy[0];
    endYearOptions = [];
    selectedEndYearOptions = [];
    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
      allowDecimal: true
    });
    goalsList: SelectItem[] = [{ value: 0, label: 'Unallocated' }];
    selectedGoalsList: SelectItem[] = [{ value: 0, label: 'Unallocated' }];
    clientCurrentAge = 0;
    spouseCurrentAge = 0;
    closeButtonDisable = false;
    saveDisable = false;
    isSpecifiedAccount = false;
    isSpecifiedGoalSaving = false;
    scenario: Scenario = {id: '00', name: 'Current Scenario'};
    accessRights:any = {};
    isAllGoalSaving = false;
    isOnAL = false;
    startYear: any;
    private unsubscribe$ = new Subject<void>();
    defaultIndex = 0;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private planningServices: PlanningService,
        private goalService: GoalService,
        private dataSharing: RefreshDataService,
        private store: Store<AppState>,
        private _location: Location,
        private angulartics2: Angulartics2,
        private accessRightService: AccessRightService,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private profileService: ClientProfileService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_SAVINGS');
        this.angulartics2.eventTrack.next({ action: 'editSaving' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.savingsId = params['savingsId'];
            this.goalId = params['goalId'];
            this.accountId = params['accountId'];
        });
        if (this.goalId) {
            this.isSpecifiedGoalSaving = true;
        } else if (this.accountId) {
            this.isSpecifiedAccount = true;
        }
        const urlPath = this.router.url;
        if (urlPath.includes('/goals') && !this.goalId) {
            this.isAllGoalSaving = true;
        }
        
        if(urlPath.includes('assets-liabilities')){
                this.isOnAL = true;
            };
    }

    ngOnInit() {
        this.accessRightService.getAccess(['SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        
        this.dataSharing.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
            if(scenario){
                this.scenario = scenario;
            }
            
        });
            
            
        
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currency
            });

        });
      this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
        if (result.hasOwnProperty('familyMembers') && result['familyMembers'].length > 0) {

          this.defaultIndex = result['familyMembers'][0]['inflation'];
        }
      });
        this.planningServices.getFrequencyListForSavings().toPromise().then((res: any) => {
            this.frequencyOptions = res;
        }).catch(errorResponse => { });

        this.planningServices.getSavingsEndYearLinkOptions().toPromise().then((response: any[]) => {
            response.forEach(e => {
                if (e.endOptionId !== 1 && e.endOptionId !== 2) {
                    this.selectedEndYearOptions.push(e);
                }
            });
            this.endYearOptions = response;
        }).catch(errorResponse => { });

        let url = '';
        if (this.isSpecifiedAccount) {
            url = '/v30/accounts/' + this.accountId + '/savings?';
            this.setSavingData(url);
        } else if (this.isSpecifiedGoalSaving) {
            url = '/v30/accounts/goal/' + this.goalId + '/savings';
            this.setSavingData(url);
        } else {
            url = '/v30/accounts/savings/' + this.clientId + '?scenario=' + this.scenario.id;
            this.setSavingData(url);
        }
        this.getGoalsDropdown();
    }

    setSavingData(url) {
        this.planningServices.getDropdownData(url).toPromise().then((data: any[]) => {
            this.savingsData = data;
            this.savingsName = this.savingsData.filter(savings => savings.key === this.savingsId)[0]['description'];
        }).catch((err: any) => {
            this.savingsData = null;
        });
    }

   getGoalsDropdown() {
        this.goalService.getGoalsByClientId(this.clientId, 'goal_type' , 'age', this.scenario.id).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.goals = data;
                this.goals.forEach(goal => {
                    this.goalsList.push({ value: goal.key, label: goal.description });
                    if (goal.goalType === '3') {
                        this.selectedGoalsList.push({ value: goal.key, label: goal.description });
                    }
                });
                if (this.goalsList.length > 0) {
                    this.getCurrentSavings();
                }
            } else {
                this.goalService.getClientGoalPayload(this.clientId);
            }
        });
    }

    async getCurrentSavings() {
        const response = await this.planningServices.getSavingsBySavingsId(this.savingsId).toPromise();
        const data = await this.planningServices.processSavingsData(this.clientId, [response]);
        this.currentSavings = data[0];
        this.makeSavingsData();
    }

    makeSavingsData() {
        this.currentSavings.tierPayloadList.forEach(tier => {
            if (tier.endYearLinkType > 0) {
                tier.endYearLinkType = this.endYearOptions[this.endYearOptions.findIndex(e => e.endOptionId === tier.endYearLinkType)];
            }
        });
        if (this.currentSavings.linkedGoal !== null) {
            this.linkedGoal = this.goals[this.goals.findIndex(g => g.key === this.currentSavings['linkedGoal'])];
            this.linkedGoal['goalStartYear'] = parseInt(this.linkedGoal['goalStartYear'], 10);
            this.linkedGoal['goalEndYear'] = parseInt(this.linkedGoal['goalEndYear'], 10);
            this.currentSavings.linkedGoal = this.linkedGoal.key;
        } else {
            this.linkedGoal = null;
            this.currentSavings.linkedGoal = 0;
        }
        this.currentSavings.frequency = this.frequencyOptions[this.frequencyOptions.findIndex(f => f.frequencyId === this.currentSavings.frequency)];
        this.currentSavings.ownersList.forEach(owner => {
            if (owner.relation === PERSON_RELATION.CLIENT1) {
                this.clientBirthYear = owner.birthYear;
                this.clientCurrentAge = this.currentYear - this.clientBirthYear;
            } else if (owner.relation === PERSON_RELATION.CLIENT2) {
                this.spouseBirthYear = owner.birthYear;
                this.spouseCurrentAge = this.currentYear - this.spouseBirthYear;
            }
        });
        this.secondTier = this.currentSavings.tierPayloadList.length > 1;
        this.thirdTier = this.currentSavings.tierPayloadList.length === 3;
        this.savings = JSON.parse(JSON.stringify(this.currentSavings));
        this.savings.useDefaultIndex = this.currentSavings.useDefaultIndex === 1 ? false : true;
    }

    changeSavings(savingsId: string, savingsName: string) {
        this.savingsId = savingsId;
        this.savingsName = savingsName;
        this.getCurrentSavings();
        if (this.isSpecifiedAccount) {
            this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities/' + this.accountId + '/savings/' + savingsId + '/edit-savings']);
        } else if (this.isSpecifiedGoalSaving) {
            this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + this.goalId + '/savings/' + savingsId + '/edit-savings']);
        } else if (this.isAllGoalSaving) {
            this.router.navigate(['/client/' + this.clientId + '/planning/goals/savings/' + savingsId + '/edit-savings']);
        } else {
            this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities-savings/' + savingsId + '/edit-savings']);
        }
    }

    changeGoal(value: number) {
        const lastIndex = this.savings.tierPayloadList.length - 1;
        this.linkedGoal = value !== 0 ? this.goals[this.goals.findIndex(g => g.key === value)] : null;
        if (this.linkedGoal !== null) {
            this.linkedGoal.goalStartYear = parseInt(this.linkedGoal.goalStartYear, 10);
            this.linkedGoal.goalEndYear = parseInt(this.linkedGoal.goalEndYear, 10);
        } else {
            this.savings.tierPayloadList[lastIndex].endYearLinkType = this.selectedEndYearOptions[0];
        }
        this.changeEndYearAge(this.savings.tierPayloadList[lastIndex].endYearLinkType, lastIndex);
    }

    displayViewBy(event) {
        this.selectedViewBy = event;
    }

    addTier() {
        if (this.savings.tierPayloadList.length < 3) {
            const lastTierIndex = this.savings.tierPayloadList.length - 1;

            const obj = {
                tierNumber: parseInt(this.savings.tierPayloadList[lastTierIndex].tierNumber, 10) + 1,
                startYear: parseInt(this.savings.tierPayloadList[lastTierIndex].startYear, 10) + 6,
                clientStartAge: parseInt(this.savings.tierPayloadList[lastTierIndex].clientStartAge, 10) + 6,
                endYear: this.savings.tierPayloadList[lastTierIndex].endYear,
                clientEndAge: parseInt(this.savings.tierPayloadList[lastTierIndex].endYear, 10) - this.clientBirthYear,
                startYearLinkType: this.savings.tierPayloadList[lastTierIndex].startYearLinkType,
                endYearLinkType: this.savings.tierPayloadList[lastTierIndex].endYearLinkType,
                savingsAmount: this.savings.tierPayloadList[lastTierIndex].savingsAmount,
                thirdPartySavings: this.savings.tierPayloadList[lastTierIndex].thirdPartySavings
            };
            if (this.savings['ownersList'].length > 1) {
                obj['spouseStartAge'] = parseInt(this.savings.tierPayloadList[lastTierIndex].spouseStartAge, 10) + 6;
                obj['spouseEndAge'] = parseInt(this.savings.tierPayloadList[lastTierIndex].endYear, 10) - this.spouseBirthYear;
                this.savings.tierPayloadList[lastTierIndex].spouseEndAge = parseInt(this.savings.tierPayloadList[lastTierIndex].spouseStartAge, 10) + 5;
            }
            this.savings.tierPayloadList[lastTierIndex].endYear = parseInt(this.savings.tierPayloadList[lastTierIndex].startYear, 10) + 5;
            this.savings.tierPayloadList[lastTierIndex].clientEndAge = parseInt(this.savings.tierPayloadList[lastTierIndex].clientStartAge, 10) + 5;
            this.savings.tierPayloadList[lastTierIndex].endYearLinkType = '';
            this.savings.tierPayloadList.push(obj);

            if (lastTierIndex === 0) {
                this.secondTier = true;
            } else if (lastTierIndex === 1) {
                this.thirdTier = true;
            }
        } else {
            this.translate.get([
                'SAVINGS.POPUP.ALERT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Sorry!', i18text['SAVINGS.POPUP.ALERT'], 'warning');
            });
        }
    }

    deleteTier(tierIndex: number) {
        if (tierIndex === 2) {
            this.thirdTier = false;
        } else {
            this.secondTier = false;
        }
        this.savings.tierPayloadList[tierIndex - 1]['endYearLinkType'] = this.savings.tierPayloadList[tierIndex]['endYearLinkType'];
        if (this.savings.tierPayloadList[tierIndex]['endYearLinkType'].endOptionId === 4) {
            this.changeEndYearAge(this.savings.tierPayloadList[tierIndex]['endYearLinkType'], tierIndex - 1);
        } else {
            this.savings.tierPayloadList[tierIndex - 1].endYear = this.savings.tierPayloadList[tierIndex].endYear;
            this.savings.tierPayloadList[tierIndex - 1].clientEndAge = this.savings.tierPayloadList[tierIndex].clientEndAge;
            if (this.savings['ownersList'].length > 1) {
                this.savings.tierPayloadList[tierIndex - 1].spouseEndAge = this.savings.tierPayloadList[tierIndex].spouseEndAge;
            }
        }
        this.savings.tierPayloadList.splice(tierIndex, 1);
    }

    changeYear(value: string, n: string | number) {
        this.startYear = value;
        if (value.length === 4 ) {
             if(parseInt(value, 10) < this.currentYear){
                value = this.currentYear.toString();
             }
            if (n === 2) {
                this.savings.tierPayloadList[n].clientEndAge = parseInt(value, 10) - this.clientBirthYear;
                if (this.savings['ownersList'].length > 1) {
                    this.savings.tierPayloadList[n].spouseEndAge = parseInt(value, 10) - this.spouseBirthYear;
                }
            } else if (n === 0 || n === 1) {
                const next = n + 1;
                this.savings.tierPayloadList[n].clientEndAge = parseInt(value, 10) - this.clientBirthYear;
                if (this.savings['ownersList'].length > 1) {
                    this.savings.tierPayloadList[n].spouseEndAge = parseInt(value, 10) - this.spouseBirthYear;
                }
                if ((n === 0 && this.secondTier) || (n === 1 && this.thirdTier)) {
                    this.savings.tierPayloadList[next].startYear = parseInt(value, 10) + 1;
                    this.savings.tierPayloadList[next].clientStartAge = parseInt(this.savings.tierPayloadList[next].startYear, 10) - this.clientBirthYear;
                    if (this.savings['ownersList'].length > 1) {
                        this.savings.tierPayloadList[next].spouseStartAge = parseInt(this.savings.tierPayloadList[next].startYear, 10) - this.spouseBirthYear;
                    }
                }
            } else if (n === 'tier1_startYear') {
                if(this.startYear<this.currentYear)
                    this.savings.tierPayloadList[0].clientStartAge = this.startYear - this.clientBirthYear;
                else
                    this.savings.tierPayloadList[0].clientStartAge = parseInt(value, 10) - this.clientBirthYear;
                if (this.savings['ownersList'].length > 1) {
                    this.savings.tierPayloadList[0].spouseStartAge = parseInt(value, 10) - this.spouseBirthYear;
                }
            }
        }
    }

    changeAge(value: string, n: string | number) {
        if (value.length === 2 && parseInt(value, 10) >= this.clientCurrentAge) {
            if (n === 0 || n === 1 || n === 2) {
                this.savings.tierPayloadList[n].endYear = this.clientBirthYear + parseInt(value, 10);
                if (this.savings['ownersList'].length > 1) {
                    this.savings.tierPayloadList[n].spouseEndAge = parseInt(this.savings.tierPayloadList[n].endYear, 10) - this.spouseBirthYear;
                }
                if ((n === 0 && this.secondTier) || (n === 1 && this.thirdTier)) {
                    const next = n + 1;
                    this.savings.tierPayloadList[next].startYear = parseInt(this.savings.tierPayloadList[n].endYear, 10) + 1;
                    this.savings.tierPayloadList[next].clientStartAge = parseInt(value, 10) + 1;
                    if (this.savings['ownersList'].length > 1) {
                        this.savings.tierPayloadList[next].spouseStartAge = parseInt(this.savings.tierPayloadList[n].spouseEndAge, 10) + 1;
                    }
                }
            } else if (n === 'tier1_startAge') {
                this.savings.tierPayloadList[0].startYear = this.clientBirthYear + parseInt(value, 10);
                if (this.savings['ownersList'].length > 1) {
                    this.savings.tierPayloadList[0].spouseStartAge = parseInt(this.savings.tierPayloadList[0].startYear, 10) - this.spouseBirthYear;
                }
            }
        }
    }

    changeEndYearAge(value, n: number) {
        if (this.linkedGoal !== null) {
            if (value.endOptionId === 1) {
                this.savings.tierPayloadList[n].endYear = this.linkedGoal.goalStartYear - 1;
                this.savings.tierPayloadList[n].clientEndAge = this.savings.tierPayloadList[n].endYear - this.clientBirthYear;
                if (this.savings['ownersList'].length > 1) {
                    this.savings.tierPayloadList[n].spouseEndAge = this.savings.tierPayloadList[n].endYear - this.spouseBirthYear;
                }
            } else if (value.endOptionId === 2) {
                this.savings.tierPayloadList[n].endYear = this.linkedGoal.goalEndYear ? this.linkedGoal.goalEndYear - 1 : this.savings.tierPayloadList[n].startYear + 1;
                this.savings.tierPayloadList[n].clientEndAge = this.savings.tierPayloadList[n].endYear - this.clientBirthYear;
                if (this.savings['ownersList'].length > 1) {
                    this.savings.tierPayloadList[n].spouseEndAge = this.savings.tierPayloadList[n].endYear - this.spouseBirthYear;
                }
            }
        }
        if (value.endOptionId === 4) {
            this.savings.tierPayloadList[n].endYear = this.savings.tierPayloadList[n].startYear;
            this.savings.tierPayloadList[n].clientEndAge = this.savings.tierPayloadList[n].clientStartAge;
            if (this.savings['ownersList'].length > 1) {
                this.savings.tierPayloadList[n].spouseEndAge = this.savings.tierPayloadList[n].spouseStartAge;
            }
        }

    }

    updateSavings() {
        this.saveDisable = true;
        this.savings.tierPayloadList.forEach(tier => {
            if (tier['endYearLinkType'] !== null) {
                tier['endYearLinkType'] = tier['endYearLinkType']['endOptionId'];
            }
            tier.endYear = parseInt(tier.endYear, 10);
            tier.startYear = parseInt(tier.startYear, 10);
        });
        const updatedSavings = {
            key: this.currentSavings.key,
            index: this.savings.useDefaultIndex ? parseFloat(this.savings.index) : this.defaultIndex,
            useDefaultIndex: this.savings.useDefaultIndex ? 0 : 1,
            linkedGoal: this.savings.linkedGoal === 0 ? null : this.savings.linkedGoal,
            frequency: this.savings.frequency.frequencyId,
            tierPayloadList: this.savings.tierPayloadList
        };
        this.translate.get([
            'SAVINGS.POPUP.SUCCESS',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'SAVINGS.POPUP.SUCCESS_START_YEAR_LESS_THAN_CURRENT_YEAR'

        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.planningServices.updateSavings(updatedSavings).toPromise().then(res => {
                if(this.startYear < this.currentYear){
                    Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'],i18text['SAVINGS.POPUP.SUCCESS_START_YEAR_LESS_THAN_CURRENT_YEAR'], 'success');
                }
                else
                    Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['SAVINGS.POPUP.SUCCESS'], 'success');
                this.dataSharing.changeMessage('refresh_savings_list');
                this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                this.profileService.getInvestmentData(this.clientId);
                this.saveDisable = false;
                this.back();
            }).catch(err => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                this.saveDisable = false;
            });
        });
    }

    back() {
        if (this.isSpecifiedAccount) {
            this.router.navigate(['/client', this.clientId, 'planning', 'assets-liabilities', this.accountId, 'savings']);
        } else if (this.isSpecifiedGoalSaving) {
            this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + this.goalId + '/savings']);
        } else if (this.isAllGoalSaving) {
            this.router.navigate(['/client/' + this.clientId + '/planning/goals/savings']);
        } else {
            this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities-savings']);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
