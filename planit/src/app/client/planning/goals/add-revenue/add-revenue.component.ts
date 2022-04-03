import { Location, getCurrencySymbol } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { slideInOutAnimation } from '../../../../shared/animations';
import { GoalService, PlanningService } from '../../../service';
import { AppState, getFamilyMemberPayload, getClientPayload } from '../../../../shared/app.reducer';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import swal from 'sweetalert2';
import { Angulartics2 } from 'angulartics2';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { PageTitleService } from '../../../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { PERSON_RELATION } from '../../../../shared/constants';


@Component({
    selector: 'app-add-revenue',
    templateUrl: './add-revenue.component.html',
    styleUrls: ['./add-revenue.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddRevenueComponent implements OnInit, OnDestroy {
    public clientId;
    public ellipsesGoalId;
    public parentGoalId;
    public fixedGoal = false;
    public familyMembers;
    public goalsList = [];
    public ownerLists = {};
    public revenueTypes = [];
    public calculationMethods = [
        { id: 1, description: 'Calculate Percentage' },
        { id: 2, description: 'Percentage' },
        { id: 3, description: 'Amount' },
        { id: 4, description: 'By Residency' }
    ];
    public startLinkTypes = [];
    public endLinkTypes = [];
    public residencyOptions = [];
    currencyMask = createNumberMask({
        prefix: '$'
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    percentMask1 = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 1
    });
    maximumBenefit = 0;
    estimatedBenefit = 0;
    calculatedPercent = 0;
    revenue = {};
    filterCalculationMethod = [];
    clientData = {};
    isGovermentPension = true;
    govRevenueType = [];
    otherRevenueType = [];
    clientAgeList = [];
    spouseAgeList = [];
    maxAge = 0;
    residencyPercentage = 0;
    accountList = [];
    owner: string;
    selectedScenario: Scenario = {id: '00', name: 'Current Scenario'};
    familyData = [];
    isCorrect = false;
    isFamilyMembersLoaded = false;
    isDisplayError = false;
    saveButtonDisable = false;
    accessRights:any = {};
    closeButtonDisable = false;
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private router: Router,
        private _location: Location,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private goalService: GoalService,
        private planningService: PlanningService,
        private angulartics2: Angulartics2,
        private refreshDataService: RefreshDataService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private translate: TranslateService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_REVENUE');
        this.angulartics2.eventTrack.next({ action: 'addRevenue' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.ellipsesGoalId = params['goalId'];
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.parentGoalId = params['goalId'];
        });
    }

    async ngOnInit() {
        this.accessRightService.getAccess(['SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

        this.refreshDataService.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
            if(scenario){
                this.selectedScenario = scenario;
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        await this.goalService.getGoalsByClientId(this.clientId, 'goal_type', 'age', this.selectedScenario.id).toPromise().then(result => {
            this.goalsList = result;
        }).catch(err => { });
        if (this.clientData && this.clientData['planningCountry']) {
            await this.goalService.getGovermentPensionOptions(this.clientData['planningCountry']).toPromise().then(govPension => {
                if (govPension) {
                    // this.isGovermentPension = true;
                    govPension.forEach(pension => {
                        this.govRevenueType.push({ id: pension.govtBenefitId, description: pension.govtBenefitDescription });
                    });
                }
            });
        }
        await this.goalService.getOtherRevenueTypeOption().toPromise().then(revenues => {
            if (revenues) {
                this.otherRevenueType = revenues;
            }
        });
        if (this.parentGoalId) {
            this.revenue['associatedGoal'] = this.goalsList.find(g => g.key === this.parentGoalId);
            this.fixedGoal = true;
        } else {
            if (this.ellipsesGoalId) {
                this.revenue['associatedGoal'] = this.goalsList.find(g => g.key === this.ellipsesGoalId);
            } else if (this.goalsList.length > 1) {
                this.goalsList.forEach(goal => {
                    if (goal.goalType === 2) {
                        this.revenue['associatedGoal'] = goal;
                    } else {
                        this.revenue['associatedGoal'] = this.goalsList[0];
                    }
                });
            }
            if (this.goalsList.length === 1) {
                this.revenue['associatedGoal'] = this.goalsList[0];
            }
        }
        await this.planningService.getAccountSummaryByAccountType(this.clientId).toPromise().then(data => {
            if (data && data.accounts) {
                data.accounts.forEach(account => {
                    if (account.investmentAccount) {
                        account.investmentAccount.forEach(acc => {
                            this.accountList.push({ id: acc.id, description: acc.description });
                        });
                    } else {
                        account.nonInvestmentAccount.forEach(acc => {
                            this.accountList.push({ id: acc.id, description: acc.description });
                        });
                    }
                });
            }
        }).catch(error => {
        });
        this.getFamilyMembers();
    }

    async getFamilyMembers() {
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result.hasOwnProperty('familyMembers') && result['familyMembers'].length > 0) {
                this.familyMembers = result['familyMembers'];
            }
        });
        await this.goalService.getClientDefaultData(this.clientId).toPromise().then(response => {
            if (response && this.familyMembers.length > 0) {
                this.familyMembers.forEach(member => {
                    if (member.relation === PERSON_RELATION.CLIENT1 || member.relation === PERSON_RELATION.CLIENT2) {
                        const familyData = response.find(x => x.primaryKey === member.id);
                        member.birthYear = new Date(member.birthDate).getFullYear();
                        // member.retireAge = this.familyData[member.id]['startAge'];
                        member.retireAge = familyData['startAge'];
                        member.retireYear = member.birthYear + parseInt(member.retireAge, 10);
                        // member.horizonAge = this.familyData[member.id]['endAge'];
                        member.horizonAge = familyData['endAge'];
                        member.horizonYear = member.birthYear + parseInt(member.horizonAge, 10);
                        this.ownerLists[member.id] = member;
                        member.govBenefits = familyData['govBenefits'];
                    }
                });

                for (let i = 0; i < this.familyMembers.length; i++) {
                    const element = this.familyMembers[i];
                    if ((element.relation === PERSON_RELATION.CLIENT1 || element.relation === PERSON_RELATION.CLIENT2) && this.govRevenueType.length > element.govBenefits.length) {
                        this.isGovermentPension = false;
                        break;
                    }
                }
            }
            this.isFamilyMembersLoaded = true;
        });
    }

    back() {
        this._location.back();
    }

    changeYear(value, opt) {

        const startLinkType = (this.revenue['startLinkType']) ? this.revenue['startLinkType'] : {};
        const endLinkType = (this.revenue['endLinkType']) ? this.revenue['endLinkType'] : {};
        let mortalityAge = 0;
        let retireAge = 0;
        this.isCorrect = true;
        if(this.owner === 'Client'){
            mortalityAge = this.familyMembers[0]['horizonAge'];
            retireAge = this.familyMembers[0]['retireAge'];

        }
        if(this.owner === 'Spouse'){
            mortalityAge = this.familyMembers[1]['horizonAge'];
            retireAge = this.familyMembers[1]['retireAge'];
        }
        if (opt === 'start' && value && value.length > 1) {
            this.revenue['startYear'] = this.ownerLists[this.revenue['ownership']].birthYear + parseInt(value, 10);
            this.revenue['endYear'] = this.revenue['endAge'] + this.ownerLists[this.revenue['ownership']].birthYear;

        } else if (opt === 'end' && value && value.length > 1) {
            this.revenue['endYear'] = this.ownerLists[this.revenue['ownership']].birthYear + parseInt(value, 10);
            this.revenue['startYear'] = this.revenue['otherStartAge'] + this.owner['birthYear'];

        } else if (opt === 'startDropdown') {
            this.revenue['startYear'] = this.ownerLists[this.revenue['ownership']].birthYear + parseInt(value.description, 10);
        } else {
            this.isCorrect = true;
        }

        if (this.revenue['endLinkType'] !== undefined && this.revenue['endLinkType'].id === 3) {
            this.revenue['endYear'] = this.revenue['startYear'];
            this.revenue['endAge'] = this.revenue['otherStartAge'];


        } if (this.revenue['endLinkType'] !== undefined &&
            (this.revenue['startLinkType'].id === 1) || this.revenue['startLinkType'].id === 2) {
            //                if (this.revenue['endYear'] > this.owner['horizonYear'] || this.revenue['endYear'] < this.owner['retireYear']) {
            if (
                this.revenue['otherStartAge'] >= retireAge
            ) {
                this.isCorrect = true;
            } else {
                this.isCorrect = false;
            }

        }
        if (this.revenue['endAge'] <= mortalityAge && this.revenue['startYear'] <= this.revenue['endYear']) {
            this.isCorrect = this.isCorrect && true;
        } else {
            this.isCorrect = false;
        }
    }

    changeAge(value, opt) {
        const startLinkType = (this.revenue['startLinkType']) ? this.revenue['startLinkType'] : {};
        const endLinkType = (this.revenue['endLinkType']) ? this.revenue['endLinkType'] : {};
        let mortalityYear = 0;
        let retireYear = 0;
        let retireAge = 0;
        this.isCorrect = true;
        if(this.owner === 'Client'){
            mortalityYear = this.familyMembers[0]['horizonYear'];
            retireYear = this.familyMembers[0]['retireYear'];
            retireAge  = this.familyMembers[0]['retireAge']; 
        }
        if(this.owner === 'Spouse'){
            mortalityYear = this.familyMembers[1]['horizonYear'];
            retireYear = this.familyMembers[1]['retireYear'];
            retireAge  = this.familyMembers[1]['retireAge']; 
        }
        if (opt === 'start' && value && value.length === 4) {
            this.revenue['otherStartAge'] = parseInt(value, 10) - this.ownerLists[this.revenue['ownership']].birthYear;
            this.revenue['endAge'] = this.revenue['endYear'] - this.ownerLists[this.revenue['ownership']].birthYear;
            if(isNaN(this.revenue['endAge'])){
                this.revenue['endAge'] = '';
            }

        } else if (opt === 'end' && value && value.length === 4) {
            this.revenue['endAge'] = parseInt(value, 10) - this.ownerLists[this.revenue['ownership']].birthYear;
            this.revenue['otherStartAge'] = this.revenue['startYear'] - this.ownerLists[this.revenue['ownership']].birthYear;
        }
        this.checkCorrect(retireYear, mortalityYear, retireAge);
    }
    private checkCorrect(retireYear: number, mortalityYear: number ,retireAge :number) {
        if (this.revenue['startLinkType'] === 0) {
            this.revenue['startYear'] = retireYear;
            this.revenue['otherStartAge'] = retireAge;
        }
        if (this.revenue['endLinkType'] !== undefined && this.revenue['endLinkType'].id === 3) {
            this.revenue['endYear'] = this.revenue['startYear'];
            this.revenue['endAge'] = this.revenue['otherStartAge'];
        }
        if (this.revenue['endLinkType'] !== undefined && this.revenue['startLinkType'].id === 2) {
            if (this.revenue['startYear'] >= retireYear) {
                this.isCorrect = true;
            }
            else {
                this.isCorrect = false;
            }
        }
        if (this.revenue['endLinkType'] !== undefined && this.revenue['startLinkType'].id === 2 && (this.revenue['endLinkType'].id === 0 || this.revenue['endLinkType'].id === 2)) {
            if (this.revenue['startYear'] >= retireYear && this.revenue['startYear'] <= this.revenue['endYear']) {
                this.isCorrect = true;
            }
            else {
                this.isCorrect = false;
            }
        }

        if ((this.revenue['startLinkType'] !== undefined) && (this.revenue['startLinkType'].id === 1)) {
            if (this.revenue['startYear'] >= new Date().getFullYear() && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else
                this.isCorrect = false;
        }

        if (this.revenue['endLinkType'] !== undefined && this.revenue['endLinkType'].id === 1 &&  this.revenue['startLinkType'].id != 2) {
            if (this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            } else
                this.isCorrect = false;
        }

        if (this.revenue['endLinkType'] !== undefined && this.revenue['endLinkType'].id === 4 ) {
            if (this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            } else
                this.isCorrect = false;
        }
        if ((this.revenue['startLinkType'].id === 1) && (this.revenue['endLinkType'].id === 1)) {
            if (this.revenue['startYear'] >= new Date().getFullYear() && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else
                this.isCorrect = false;
        }

        if (this.revenue['endLinkType'] !== undefined && this.revenue['endLinkType'].id === 1 && this.revenue['startLinkType'].id === 2) {
            if (this.revenue['startYear'] >= retireYear && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else {
                this.isCorrect = false;
            }
        }

        if ( this.revenue['endLinkType'] !== undefined && this.revenue['endLinkType'].id === 4 &&  this.revenue['startLinkType'].id === 2) {
            if (this.revenue['startYear'] >= retireYear && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else {
                this.isCorrect = false;
            }
        }
        if ((this.revenue['startLinkType'].id === 1) && (this.revenue['endLinkType'].id === 4)) {
            if (this.revenue['startYear'] >= new Date().getFullYear() && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else
                this.isCorrect = false;
        }
    }


    selectCalculationMathod(revenue) {
        this.filterCalculationMethod = [];
        const data = Object.assign([], this.calculationMethods);
        if (revenue.id === 'OAS') {
            this.filterCalculationMethod = data.slice(2, 4);
        } else if (revenue.id === 'USSS' || revenue.id === 'CPP1') {
            this.filterCalculationMethod = data.slice(0, 3);
        } else if (revenue.id === 'UKSPM') {
            this.filterCalculationMethod = data.slice(1, 2);
        }
        if (parseInt(this.revenue['category'], 10) === 0) {
            this.goalService.getClientSpouseAgeList(this.clientId, revenue.id).toPromise().then(response => {
                this.maxAge = response[0].maxAge;
                if(response.length > 1){
                    this.clientAgeList = response[0].ageList;
                    this.spouseAgeList = response[1].ageList;
                }else{
                this.clientAgeList = response[0].ageList;
            }
             if (this.owner === 'Client') {
               this.revenue['govStartAge'] = this.clientAgeList[0];
             } else {
               this.revenue['govStartAge'] = this.spouseAgeList[0];
             }
            });
        }
    }

    selectedCategory(category) {
        if (parseInt(category, 10) === 1) {
            this.revenueTypes = Object.assign([], this.otherRevenueType);
            if (this.startLinkTypes.length === 0 && this.endLinkTypes.length === 0) {
                this.goalService.getOtherRevenueStartEndOption().toPromise().then(startEnd => {
                    if (startEnd) {
                        this.startLinkTypes = startEnd[0];
                        this.endLinkTypes = startEnd[1];
                    }
                }).catch();
            }
        } else if (parseInt(category, 10) === 0) {
            this.revenueTypes = Object.assign([], this.govRevenueType);
        }
    }

    selectAgeDropdown(member) {
        if (member === 1) {
            this.owner = 'Client';
        } else {
            this.owner = 'Spouse';
        }
    }

    calculationOption(event, type) {
        if (type.id === 4) {
            if (this.residencyOptions.length < 1) {
                this.goalService.getResidentOptions().toPromise().then(residency => {
                    if (residency) {
                        this.residencyOptions = residency;
                    }
                });
            }
        }
        this.maximumBenefit = 0;
        this.estimatedBenefit = 0;
        this.revenue['monthlyAmount'] = 0;
        this.revenue['percentage'] = 0;
        this.revenue['currentAnnualIncome'] = 0;
        this.revenue['startAgeList'] = '';
    }

    changeGovStartAge(event, calculateMethod, govStartAge, yearlyAmount, monthlyAmount, percentage, revenueType, contributionPeriod, residency) {
        if (calculateMethod.id === 1) {
            this.calculateContributionPeriod(contributionPeriod, yearlyAmount, revenueType, govStartAge);
        } else if (calculateMethod.id === 2) {
            this.calculateMaxAndEstimated(event, percentage, calculateMethod, govStartAge);
        } else if (calculateMethod.id === 3) {
            this.calculateMaxAndEstimated(event, monthlyAmount, calculateMethod, govStartAge);
        } else if (calculateMethod.id === 4) {
            this.calculateMaxAndEstimated(event, residency, calculateMethod, govStartAge);
        }
    }

    calculateMaxAndEstimated(event, maximum, calculationMethod, startAge) {
        if (calculationMethod.id === 4) {
            this.maximumBenefit = startAge.amount;
            this.estimatedBenefit = (this.maximumBenefit * maximum.value) / 100;
            this.residencyPercentage = maximum.value;
        } else if (calculationMethod.id === 3) {
            this.maximumBenefit = startAge.amount;
            this.estimatedBenefit = maximum * 12;
        } else if (calculationMethod.id === 2) {
            this.maximumBenefit = startAge.amount;
            this.estimatedBenefit = (this.maximumBenefit * maximum) / 100;
        } else if (calculationMethod.id === 1) {
            this.maximumBenefit = startAge.amount;
            this.estimatedBenefit = (this.maximumBenefit / maximum) * 100;
        }

        if (this.estimatedBenefit <= this.maximumBenefit &&
            this.estimatedBenefit >= 0) {
            this.isCorrect = true;
        } else {
            this.isCorrect = false;
        }
        if(startAge.age > this.maxAge && startAge.amount == 0)
        {
            this.isCorrect = true;
        }
    }

    setIsCorrect(){
        this.isCorrect = true;
    }

    calculateContributionPeriod(event, amount, type, startAge) {
        if (event.length > 0 && event.length < 4 && amount !== '' && type !== '' && startAge !== '') {
            const obj = {
                'contributionPeriod': event,
                'income': amount,
                'program': type.id,
                'startAge': startAge.age
            };
            this.goalService.contributionCalculation(obj)
                .debounceTime(1000)
                .distinctUntilChanged()
                .toPromise().then(result => {
                    this.calculatedPercent = result;
                    this.maximumBenefit = startAge.amount;
                    this.estimatedBenefit = (this.maximumBenefit * this.calculatedPercent) / 100;
                });
        }
    }

    addRevenue(opt) {
        if (!this.revenue['associatedGoal']) {
            this.translate.get([
                'REVENUES.POPUP.ALERT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal('', i18text['REVENUES.POPUP.ALERT'], 'warning');
            });
            return;
        }
        let goalStartYear: number = parseInt(this.revenue['associatedGoal'].goalStartYear, 10);
        let goalStartAge: number = this.revenue['associatedGoal'].goalStartYear - this.ownerLists[this.revenue['ownership']].birthYear;
        let goalEndYear: number = parseInt(this.revenue['associatedGoal'].goalEndYear, 10);
        let goalEndAge: number = this.revenue['associatedGoal'].goalEndYear - this.ownerLists[this.revenue['ownership']].birthYear;
        let start_age, start_year, end_year, end_age;
        const mortalityEndYear: number =this.owner === 'Client' ? this.familyMembers[0]['horizonYear'] : this.familyMembers[1]['horizonYear'];
        const mortalityEndAge: number =this.owner === 'Client' ? this.familyMembers[0]['horizonAge'] : this.familyMembers[1]['horizonAge'];

        if (parseInt(this.revenue['category'], 10) === 1) {
            if (this.revenue['startLinkType'].id === 0 && this.revenue['endLinkType'].id !== 2) {
                //start_age = goalStartAge;
                //start_year = goalStartYear;
                if(this.owner === 'Client'){
                    start_age =  this.familyMembers[0]['retireAge'];
                    start_year = this.familyMembers[0]['retireYear'];
                }
                if(this.owner === 'Spouse'){
                    start_age =  this.familyMembers[1]['retireAge'];
                    start_year = this.familyMembers[1]['retireYear'];
                }
            } else if (this.revenue['startLinkType'].id === 0 && this.revenue['endLinkType'].id === 2) {
                //start_year = goalStartYear;
                //start_age = goalStartAge;
                if(this.owner === 'Client'){
                    start_age =  this.familyMembers[0]['retireAge'];
                    start_year = this.familyMembers[0]['retireYear'];
                }
                if(this.owner === 'Spouse'){
                    start_age =  this.familyMembers[1]['retireAge'];
                    start_year = this.familyMembers[1]['retireYear'];
                }
            } else if (this.revenue['startLinkType'].id === 1 || this.revenue['startLinkType'].id === 2) {
                start_year = this.revenue['startYear'];
                start_age = this.revenue['otherStartAge'];
            }
            if (this.revenue['endLinkType'].id === 0) {
               // end_year = goalEndYear;
                // end_age = goalEndAge;
                if(this.owner === 'Client'){
                    end_age =  this.familyMembers[0]['horizonAge'];
                    end_year = this.familyMembers[0]['horizonYear'];
                }
                if(this.owner === 'Spouse'){
                    end_age =  this.familyMembers[1]['horizonAge'];
                    end_year = this.familyMembers[1]['horizonYear'];
                }
            } else if (this.revenue['endLinkType'].id === 1 || this.revenue['endLinkType'].id === 4 || this.revenue['endLinkType'].id === 3) {
                end_year = this.revenue['endYear'];
                end_age = this.revenue['endAge'];
            } 
            /* else if (this.revenue['endLinkType'].id === 3) {
                //                end_year = parseInt(this.ownerLists[this.revenue['ownership']].retireYear, 10);
                end_year = goalStartYear;
                //                end_age = parseInt(this.ownerLists[this.revenue['ownership']].retireAge, 10);
                end_age = goalStartAge;
            } */
            else if (this.revenue['endLinkType'].id === 2) {
                //end_year = goalStartYear - 1;
                //end_age = goalStartAge - 1;
                if(this.owner === 'Client'){
                    end_age =  this.familyMembers[0]['retireAge'];
                    end_year = this.familyMembers[0]['retireYear'];
                }
                if(this.owner === 'Spouse'){
                    end_age =  this.familyMembers[1]['retireAge'];
                    end_year = this.familyMembers[1]['retireYear'];
                }
            }
        }
        const addRevenue = {
            goalNum: this.revenue['associatedGoal'].key,
            clinum: this.clientId,
            revenueCategory: parseInt(this.revenue['category'], 10) === 0 ? 10 : 1,
            revenueType: this.revenue['type'].id,
            revOwner: this.owner,
            description: this.revenue['description'],
            calculationMethod: parseInt(this.revenue['category'], 10) === 0 ? this.revenue['calculationMethod'].id : 0,
            contibutionPeriod: this.revenue['contributoryPeriod'] ? this.revenue['contributoryPeriod'] : 0,
            selectStartAge: parseInt(this.revenue['category'], 10) === 0 ? this.revenue['govStartAge'].age : '',
            currentIncome: this.revenue['currentAnnualIncome'] ? this.revenue['currentAnnualIncome'] : 0,
            pensionAmount: (parseInt(this.revenue['category'], 10) === 0 && this.revenue['calculationMethod'].id === 3) ? this.revenue['monthlyAmount'] : 0,
            percent: (parseInt(this.revenue['category'], 10) === 0 && this.revenue['calculationMethod'].id) === 1 ? this.calculatedPercent :
                (parseInt(this.revenue['category'], 10) === 0 && this.revenue['calculationMethod'].id === 2) ? this.revenue['percentage'] : 0,
            startOption: parseInt(this.revenue['category'], 10) === 1 ? this.revenue['startLinkType'].id : 0,
            endOption: parseInt(this.revenue['category'], 10) === 1 ? this.revenue['endLinkType'].id : 0,
            //            startYear: start_year ? start_year : parseInt(this.ownerLists[this.revenue['ownership']].retireYear, 10),
            startYear: start_year ? start_year : goalStartYear,
            startAge: start_age,
            //            endYear: end_year ? end_year : parseInt(this.ownerLists[this.revenue['ownership']].horizonYear, 10),
            //endYear: end_year ? end_year : goalEndYear,
            endYear: parseInt(this.revenue['category'], 10) === 0 ? mortalityEndYear : end_year,
            endAge: parseInt(this.revenue['category'], 10) === 0 ? mortalityEndAge : end_age ,

            //endAge: end_age,
            eligible: (parseInt(this.revenue['category'], 10) === 0 && this.revenue['type'].id === 'UKSPM') ? this.revenue['percentage'] :
                (parseInt(this.revenue['category'], 10) === 0 && this.revenue['calculationMethod'].id === 4) ? this.residencyPercentage : 100,
            amount: parseInt(this.revenue['category'], 10) === 1 ? this.revenue['amountPerYear'] : this.estimatedBenefit,
            account: parseInt(this.revenue['category'], 10) === 1 && (this.revenue['type'].id === 4 || this.revenue['type'].id === 11) ?
                this.revenue['linkAccount'].id : '',
            taxOption: 1,
            modelVal: parseInt(this.revenue['category'], 10) === 1 && (this.revenue['type'].id === 6) ? this.revenue['modelVal'] : ''
        };
        this.goalService.addRevenue(addRevenue,this.selectedScenario.id).toPromise().then(async response => {
            this.translate.get([
                'REVENUES.POPUP.SUCCESS'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal('Success', i18text['REVENUES.POPUP.SUCCESS'], 'success');
            });
            this.saveButtonDisable = false;
            this.refreshDataService.changeMessage('revenues_for_goal_added');
            if (opt === 1) {
                this.back();
            } else if (opt === 2) {
                if (this.parentGoalId || this.ellipsesGoalId) {
                    let goalId;
                    if (this.parentGoalId && this.ellipsesGoalId) {
                        goalId = this.parentGoalId;
                    } else if (this.parentGoalId) {
                        goalId = this.parentGoalId;
                    } else {
                        goalId = this.ellipsesGoalId;
                    }
                    if (goalId) {
                        this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + goalId + '/revenues/' + response['primaryKey'] + '/edit-revenue']);
                    }
                } else {
                    this.router.navigate(['/client/' + this.clientId + '/planning/goals/revenues/' + response['primaryKey'] + '/edit-revenue']);
                }
            }
        }).catch(errorResponse => {
            this.saveButtonDisable = false;
            swal('Oops...', errorResponse['error']['errorMessage'], 'error');
        });
    }

    checkValues(key) {
        let retireYear = 0;
        let retireAge = 0;
        let mortalityYear = 0;
        let mortalityAge = 0;

        this.isCorrect = true;
        if(this.owner ==='Client'){
            retireAge =  this.familyMembers[0]['retireAge'];
            retireYear =  this.familyMembers[0]['retireYear'];
            mortalityAge =  this.familyMembers[0]['horizonAge'];
            mortalityYear =  this.familyMembers[0]['horizonYear'];
        }
        if(this.owner === 'Spouse'){
            retireAge =   this.familyMembers[1]['retireAge'];
            retireYear=  this.familyMembers[1]['retireYear'];
            mortalityAge =  this.familyMembers[1]['horizonAge'];
            mortalityYear =  this.familyMembers[1]['horizonYear'];
        }
        if (key === 'start') {
            if (this.revenue['startLinkType'].id === 0) {
                this.revenue['otherStartAge'] =  retireAge;
                this.revenue['startYear'] =  retireYear;


        } else {
            if (this.revenue['endLinkType'] && this.revenue['endLinkType'].id === 2) {
                //                    if (this.revenue['startYear'] > (this.owner['retireYear'] - 1)) {
                    this.revenue['endAge'] =  retireAge;
                this.revenue['endYear'] =  retireYear;
            }
        }
        } else if (key === 'end') {
            if (this.revenue['endLinkType'].id === 2) {
                this.revenue['endAge'] =  retireAge;
                this.revenue['endYear'] =  retireYear;
    } else if (this.revenue['endLinkType'].id === 3 ) {

        this.revenue['endAge'] =  this.revenue['startAge'];
        this.revenue['endYear'] =  this.revenue['startYear'];
        }else if(this.revenue['endLinkType'].id === 0) {
            this.revenue['endAge'] =  mortalityAge;
            this.revenue['endYear'] =  mortalityYear;

    }
        } else {
            // should be ok
            this.isCorrect = true;
        }
        if (this.revenue['endYear'] >= this.revenue['startYear']) {
            this.isCorrect = this.isCorrect && true;
        } else {
            this.isCorrect = false;
        }
        this.checkCorrect(retireYear, mortalityYear,retireAge);
    }

    checkOwnerForGoverment() {
        if (this.revenue['ownership'] && this.revenue['type']) {
            const data = this.familyMembers.find(x => x.id === this.revenue['ownership']);
            if (data && data.govBenefits.length > 0) {
                for (const element of data.govBenefits) {
                    if (this.revenue['type'].id === element.govtBenefitId) {
                        this.isDisplayError = true;
                        break;
                    } else {
                        this.isDisplayError = false;
                    }
                }
            } else {
                this.isDisplayError = false;
            }
        }
        this.maximumBenefit = 0;
        this.estimatedBenefit = 0;
        this.revenue['monthlyAmount'] = 0;
        this.revenue['percentage'] = 0;
        this.revenue['startAgeList'] = '';
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
