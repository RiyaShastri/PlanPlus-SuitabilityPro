import Swal from 'sweetalert2';
import { Location, getCurrencySymbol, CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlanningService, ClientProfileService, GoalService } from '../../../service';
import { Angulartics2 } from 'angulartics2';
import { AppState, getFamilyMemberPayload, getClientPayload } from '../../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { PageTitleService } from '../../../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { PERSON_RELATION } from '../../../../shared/constants';

@Component({
    selector: 'app-edit-revenue',
    templateUrl: './edit-revenue.component.html',
    styleUrls: ['./edit-revenue.component.css']
})
export class EditRevenueComponent implements OnInit, OnDestroy {
    public revenue = {};
    public clientId;
    public revenueId;
    public goalId;
    public goalsList;
    public owner = {};
    public currencies = [];
    public familyMembers;
    public ownerList = [];
    public indexPrChecked = false;
    public indexFrChecked = false;
    public revenueDescription;
    public revenuesList;
    public currentRevenue: any;
    public maximumBenefit = 0;
    public estimatedBenefit = 0;
    public calculatedPercent = 0;
    public calculationMethods = [
        { id: 1, description: 'Calculate Percentage' },
        { id: 2, description: 'Percentage' },
        { id: 3, description: 'Amount' },
        { id: 4, description: 'By Residency' }
    ];
    public endDateTypes = [];
    public startDateTypes = [];
    public residencyOptions = [];
    currencyMask = createNumberMask({
        prefix: '$'
    });
    percentMask2 = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
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
    govRevenueType = [];
    otherRevenueType = [];
    texableOption = [];
    clientAgeList = [];
    spouseAgeList = [];
    filterCalculationMethod = [];
    public clientData = {};
    accountList = [];
    allRevenueList = [];
    isCorrect = false;
    familyData = [];
    saveDisabled = false;
    defaultIndex = 0;
    accessRights = {};
    scenario: Scenario =  {id: '00', name: 'Current Scenario'};
    pord = 1;
    PERSON_RELATION = PERSON_RELATION ;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private router: Router,
        private _location: Location,
        private route: ActivatedRoute,
        private planningServices: PlanningService,
        private profileService: ClientProfileService,
        private angulartics2: Angulartics2,
        private goalService: GoalService,
        private store: Store<AppState>,
        private refreshDataService: RefreshDataService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        public translate: TranslateService,
    ) {

    }

    ngOnInit() {
        this.accessRightService.getAccess(['WEB42', 'DDINF', 'SAV01', 'SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow'),
                allowDecimal: true
            });
        });
        this.refreshDataService.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
            if(scenario){
                this.scenario = scenario;
            }
        });
        
        this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_REVENUE');
        this.angulartics2.eventTrack.next({ action: 'editRevenue' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.revenueId = params['revenueId'];
            this.goalId = params['goalId'];
            this.currencies = [];
            this.goalsList = [];
            this.revenue = {};
            this.residencyOptions = [];
            this.getDataOfRevenue();
        });
    }

    async getDataOfRevenue() {
        this.revenuesList = await this.planningServices.getRevenuesByRevnueId(this.revenueId, this.scenario.id).toPromise();
        this.currencies = await this.goalService.getAllCurrencyDetail().toPromise();
        this.goalsList = await this.goalService.getGoalsByClientId(this.clientId, 'goal_type', 'age', this.scenario.id).toPromise();
        await this.goalService.getGovermentPensionOptions(this.clientData['planningCountry']).toPromise().then(govPension => {
            if (govPension) {
                govPension.forEach(pension => {
                    this.govRevenueType.push({ id: pension.govtBenefitId, description: pension.govtBenefitDescription });
                });
            }
        });
        let url = '';
        if (this.goalId) {
            url = '/v30/revenue/' + this.clientId + '/revenues/' + this.goalId + '?viewBy=age';
            this.setDropdownData(url);
        } else {
            url = '/v30/revenue/client/' + this.clientId + '?sortBy=None&viewBy=age';
            this.setDropdownData(url);
        }
        await this.goalService.getOtherRevenueTypeOption().toPromise().then(revenues => {
            if (revenues) {
                this.otherRevenueType = revenues;
            }
        });
        await this.goalService.getOtherRevenueStartEndOption().toPromise().then(startEnd => {
            if (startEnd) {
                this.startDateTypes = startEnd[0];
                this.endDateTypes = startEnd[1];
                this.revenue['startDateType'] = this.startDateTypes.find(data => data.id === this.revenuesList['startOption']);
                this.revenue['endDateType'] = this.endDateTypes.find(data => data.id === this.revenuesList['endOption']);
            }
        }).catch();
        await this.goalService.getRevenueTexableOptions().toPromise().then(result => {
            if (result) {
                this.texableOption = result;
            }
        });
        if (this.revenuesList['revenueCategory'] === 10) {
            await this.goalService.getClientSpouseAgeList(this.clientId, this.revenuesList['govBenefits'][0].govtBenefitId).toPromise().then(response => {
                if (response.length === 2) {
                    this.clientAgeList = response[0].ageList;
                    this.spouseAgeList = response[1].ageList;
                } else {
                    this.clientAgeList = response[0].ageList;
                }
            });
        }
        await this.planningServices.getAccountSummaryByAccountType(this.clientId).toPromise().then(data => {
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
            if (this.accountList.length > 0) {
                this.revenue['linkAccount'] = this.accountList.find(acc => acc.id === this.revenuesList['account']);
            }
        });
        await this.getFamilyMembers();
        await this.getCurrentRevenue();
    }

    setDropdownData(url) {
        this.planningServices.getDropdownData(url).toPromise().then((data: any[]) => {
            if (data && this.revenueId) {
                this.allRevenueList = data;
                this.revenueDescription = this.allRevenueList.find(reven => reven.id === this.revenueId).description;
            }
        }).catch(error => {
            this.allRevenueList = [];
        });
    }

    async getFamilyMembers() {
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result.hasOwnProperty('familyMembers') && result['familyMembers'].length > 0) {
                this.familyMembers = result['familyMembers'];
                this.defaultIndex = this.familyMembers[0]['inflation'];
            }
        });
        await this.goalService.getClientDefaultData(this.clientId, this.scenario.id).toPromise().then(response => {
            if (response) {
                response.forEach(member => {
                    this.familyData[member.primaryKey] = member;
                });
                if (this.familyMembers.length > 0 && this.familyData) {
                    this.familyMembers.forEach(member => {
                        if (member.relation === PERSON_RELATION.CLIENT1 || member.relation === PERSON_RELATION.CLIENT2) {
                            member.birthYear = new Date(member.birthDate).getFullYear();
                            member.retireAge = this.familyData[member.id]['startAge'];
                            member.retireYear = member.birthYear + parseInt(member.retireAge, 10);
                            member.horizonAge = this.familyData[member.id]['endAge'];
                            member.horizonYear = member.birthYear + parseInt(member.horizonAge, 10);
                            this.ownerList[member.id] = member;
                            const relation = this.revenuesList['revOwner'] === 'Client' ? 1 : 2;
                            if (member.relation === relation) {
                                this.owner = member;
                                if (relation === 1) {
                                    this.revenue['startAgeList'] = this.clientAgeList.find(age => parseInt(age.age, 10) === Math.max(this.revenuesList['selectStartAge'],
                                        this.revenuesList['startAge']));
                                } else {
                                    this.revenue['startAgeList'] = this.spouseAgeList.find(age => parseInt(age.age, 10) === Math.max(this.revenuesList['selectStartAge'],
                                        this.revenuesList['startAge']));
                                }
                            }
                        }
                    }, this);
                }
            }
        });
    }

    async getCurrentRevenue() {
        if (this.revenuesList['revenueCategory'] === 10) {
            this.revenue['category'] = 'Government pension';
            this.revenue['calculationMethod'] = this.govRevenueType.find(rev => rev.id === parseInt(this.revenuesList['revenueType'], 10));
        } else {
            this.revenue['category'] = 'Other revenue';
            this.currentRevenue = this.otherRevenueType.find(rev => rev.id === parseInt(this.revenuesList['revenueType'], 10));
        }
        this.makeRevenueData();
    }

    makeRevenueData() {
        this.revenue['ownership'] = this.revenuesList['revOwner'] === 'Client' ? 1 : 2;
        this.revenue['description'] = this.revenuesList['description'];
        this.revenue['amount'] = this.revenuesList['amount'];
        this.revenue['currency'] = this.currencies.find(c => c.currencyCode.trim() === this.revenuesList['currencyCode'].trim());
        this.revenue['associatedGoal'] = this.goalsList.find(g => g.key === this.revenuesList['goalNum']);
        this.revenue['indexRatePr'] = this.revenuesList['indexPreStart'];
        this.revenue['indexRateFr'] = this.revenuesList['indexRate'];
        this.revenue['contibutionPeriod'] = this.revenuesList['contibutionPeriod'];
        this.revenue['currentIncome'] = this.revenuesList['currentIncome'];
        this.revenue['monthlyAmount'] = this.revenuesList['pensionAmount'];
        this.revenue['percentage'] = this.revenuesList['percent'];
        if (this.revenue['category'] === 'Government pension') {
            this.selectCalculationMathod();
            this.revenue['calculationMethod'] = this.calculationMethods.find(cm => cm.id === this.revenuesList['calculationMethod']);
            this.revenue['startYear'] = this.owner['birthYear'] + Math.max(this.revenuesList['selectStartAge'], this.revenuesList['startAge']);
            this.revenue['startAge'] = Math.max(this.revenuesList['selectStartAge'], this.revenuesList['startAge']);
            this.revenue['percentTax'] = this.revenuesList['percentTax'];
            if (this.revenue['category'] === 'Government pension' && this.revenuesList['revenueType'] === 'UKSPM') {
                this.revenue['percentage'] = this.revenuesList['eligible'];
            }
            if (this.revenue['calculationMethod'].id === 3) {
                this.calculateMaxAndEstimated(this.revenue['monthlyAmount'], this.revenue['calculationMethod'], this.revenue['startAgeList']);
            }
            if (this.revenue['calculationMethod'].id === 4) {
                this.calculationOption(this.revenue['calculationMethod']);
            }
            if (this.revenue['startAgeList'] && this.revenue['startAgeList'].amount &&
                (this.revenue['calculationMethod'].id === 1 || this.revenue['calculationMethod'].id === 2)) {
                this.calculatedPercent = this.revenuesList['percent'];
                this.maximumBenefit = this.revenue['startAgeList'].amount;
                this.estimatedBenefit = (this.maximumBenefit * this.calculatedPercent) / 100;
            }
        } else if (this.revenue['category'] === 'Other revenue') {
            this.revenue['modelVal'] = this.revenuesList['modelVal'];
            this.revenue['startYear'] = this.revenuesList['startYear'];
            this.revenue['startAge'] = this.revenuesList['startAge'];
            this.revenue['endYear'] = this.revenuesList['endYear'];
            this.revenue['endAge'] = this.revenuesList['endAge'];

            if (this.revenuesList['taxOption'] > 0) {
                this.revenue['taxablePr'] = this.texableOption.find(data => data.id === this.revenuesList['taxOption']);
                this.revenue['percentTax'] = this.revenuesList['percentTax'];
            }
            // check if Private Pension
            this.revenue['isPrivatePension'] = false;
            if (this.revenuesList['revenueType'] === "6") {
                this.revenue['isPrivatePension'] = true;
                this.revenue['percentOnDeath'] = this.revenuesList['percentOnDeath'];
                this.revenue['percentOnDisability'] = this.revenuesList['percentOnDisability'];
                this.revenue['percentOnMortality'] = this.revenuesList['percentOnMortality'];
                this.revenue['deathAmount'] = this.revenuesList['deathAmount'];
                this.revenue['disabilityAmount'] = this.revenuesList['disabilityAmount'];
                this.revenue['mortalityAmount'] = this.revenuesList['mortalityAmount'];

                if (this.revenue['deathAmount'] > 0 ||
                    this.revenue['disabilityAmount'] > 0 ||
                    this.revenue['mortalityAmount'] > 0) {
                    this.revenue['pord'] = 2;
                } else {
                    this.revenue['pord'] = 1;
                }
            }
            this.indexPrChecked = this.revenuesList['custIndexPrior'] === 1;
            this.indexFrChecked = this.revenuesList['custIndex'] === 1;
        }
    }

    selectCalculationMathod() {
        this.filterCalculationMethod = [];
        const data = Object.assign([], this.calculationMethods);
        if (this.revenuesList['govBenefits'][0].govtBenefitId === 'OAS') {
            this.filterCalculationMethod = data.slice(2, 4);
        } else if (this.revenuesList['govBenefits'][0].govtBenefitId === 'USSS' || this.revenuesList['govBenefits'][0].govtBenefitId === 'CPP1') {
            this.filterCalculationMethod = data.slice(0, 3);
        } else if (this.revenuesList['govBenefits'][0].govtBenefitId === 'UKSPM') {
            this.filterCalculationMethod = data.slice(1, 2);
        }
    }


    changeRevenue(id, description) {
        if (this.goalId) {
            this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + this.goalId + '/revenues/' + id + '/edit-revenue']);
        } else {
            this.router.navigate(['/client/' + this.clientId + '/planning/goals/revenues/' + id + '/edit-revenue']);
        }
        // this.getDataOfRevenue();
    }

    calculationOption(type) {
        if (type.id === 4) {
            this.goalService.getResidentOptions().toPromise().then(residency => {
                if (residency) {
                    this.residencyOptions = residency;
                    this.revenue['residency'] = this.residencyOptions.find(rev => rev.value === this.revenuesList['eligible']);
                    this.calculateMaxAndEstimated(this.revenue['residency'], this.revenue['calculationMethod'], this.revenue['startAgeList']);
                }
            });

        }
        if (type.id === 3) {
            this.maximumBenefit = this.revenue['startAgeList'].amount;
            this.estimatedBenefit = this.revenue['monthlyAmount'] * 12;
        }
    }

    calculateMaxAndEstimated(maximum, calculationMethod, startAge) {
        if (calculationMethod.id === 4) {
            this.maximumBenefit = startAge.amount;
            this.estimatedBenefit = (this.maximumBenefit * maximum.value) / 100;
            this.calculatedPercent = maximum.value;
        } else if (calculationMethod.id === 3) {
            this.maximumBenefit = startAge.amount;
            this.estimatedBenefit = maximum * 12;
        } else if (calculationMethod.id === 2) {
            this.maximumBenefit = startAge.amount;
            this.estimatedBenefit = (this.maximumBenefit * maximum) / 100;
        } else if (calculationMethod.id === 1) {
            this.maximumBenefit = startAge.amount;
            this.estimatedBenefit = (this.maximumBenefit * maximum) / 100;
        }
        if (!this.maximumBenefit || (this.estimatedBenefit <= this.maximumBenefit &&
            this.estimatedBenefit >= 0)) {
            this.isCorrect = true;
        } else {
            this.isCorrect = false;
        }
    }

    calculateAnnualIncome(event, amount, type, startAge) {
        if (event > 0 && amount !== '' && type !== '' && startAge !== '') {
            const obj = {
                'contributionPeriod': amount,
                'income': event,
                'program': type,
                'startAge': startAge.age
            };
            this.goalService.contributionCalculation(obj)
                .debounceTime(1000)
                .distinctUntilChanged()
                .toPromise().then(result => {
                    this.calculatedPercent = result;
                    this.maximumBenefit = startAge.amount;
                    this.estimatedBenefit = (this.maximumBenefit * this.calculatedPercent) / 100;
                    if (!this.maximumBenefit || (this.estimatedBenefit <= this.maximumBenefit &&
                        this.estimatedBenefit >= 0)) {
                        this.isCorrect = true;
                    } else {
                        this.isCorrect = false;
                    }
                });
        }
    }
    calculateContributionPeriod(event, amount, type, startAge) {
        if (event > 0 && amount !== '' && type !== '' && startAge !== '') {
            const obj = {
                'contributionPeriod': event,
                'income': amount,
                'program': type,
                'startAge': startAge.age
            };
            this.goalService.contributionCalculation(obj)
                .debounceTime(1000)
                .distinctUntilChanged()
                .toPromise().then(result => {
                    this.calculatedPercent = result;
                    this.maximumBenefit = startAge.amount;
                    this.estimatedBenefit = (this.maximumBenefit * this.calculatedPercent) / 100;
                    if (!this.maximumBenefit || (this.estimatedBenefit <= this.maximumBenefit &&
                        this.estimatedBenefit >= 0)) {
                        this.isCorrect = true;
                    } else {
                        this.isCorrect = false;
                    }
                });
        }
    }

    changeYear(value, opt, startAge?) {
        let mortalityAge = 0;
        let retireAge = 0;
        this.isCorrect = true;
        if (this.owner['relation'] === 1) {
            mortalityAge = this.familyMembers[0]['horizonAge'];
            retireAge = this.familyMembers[0]['retireAge'];

        }
        if (this.owner['relation'] === 2) {
            mortalityAge = this.familyMembers[1]['horizonAge'];
            retireAge = this.familyMembers[1]['retireAge'];
        }
        const goalEndAge: number = this.revenue['associatedGoal'].goalEndYear - this.owner['birthYear'];
        if (opt === 'start' && value.length > 1) {
            this.revenue['startYear'] = this.owner['birthYear'] + parseInt(value, 10);
            this.revenue['endYear'] = this.revenue['endAge'] + this.owner['birthYear'];

        } else if (opt === 'end' && value.length > 1) {
            this.revenue['endYear'] = this.owner['birthYear'] + parseInt(value, 10);
            this.revenue['startYear'] = this.revenue['startAge'] + this.owner['birthYear'];

        } else if (opt === 'startDropdown') {
            this.revenue['startYear'] = this.owner['birthYear'] + parseInt(value.age, 10);
            this.maximumBenefit = startAge.amount;
            this.isCorrect = true;
        } else {
            // assume it is okay
            this.isCorrect = true;
        }

        if (this.revenue['endDateType'] !== undefined && this.revenue['endDateType'].id === 3) {
            this.revenue['endYear'] = this.revenue['startYear'];
            this.revenue['endAge'] = this.revenue['startAge'];


        } if (this.revenue['endDateType'] !== undefined &&
            (this.revenue['startDateType'].id === 0) || this.revenue['startDateType'].id === 2) {
            //                if (this.revenue['endYear'] > this.owner['horizonYear'] || this.revenue['endYear'] < this.owner['retireYear']) {
            if (
                this.revenue['startAge'] >= retireAge
            ) {
                this.isCorrect = true;
            } else {
                this.isCorrect = false;
            }

        }
        if (this.revenue['endAge'] !== undefined) {
            if (this.revenue['endAge'] <= mortalityAge && this.revenue['startYear'] <= this.revenue['endYear']) {
                this.isCorrect = this.isCorrect && true;
            } else {
                this.isCorrect = false;
            }
        }
    }

    changeAge(value, opt) {
        let mortalityYear = 0;
        let retireYear = 0;
        let retireAge = 0;
        this.isCorrect = true;
        if (this.owner['relation'] === 1) {
            mortalityYear = this.familyMembers[0]['horizonYear'];
            retireYear = this.familyMembers[0]['retireYear'];
            retireAge = this.familyMembers[0]['retireAge'];

        }
        if (this.owner['relation'] === 2) {
            mortalityYear = this.familyMembers[1]['horizonYear'];
            retireYear = this.familyMembers[1]['retireYear'];
            retireAge = this.familyMembers[1]['retireAge'];
        }
        if (opt === 'start' && value.length === 4) {
            this.revenue['endAge'] = this.revenue['endYear'] - this.owner['birthYear'];
            this.revenue['startAge'] = parseInt(value, 10) - this.owner['birthYear'];

        } else if (opt === 'end' && value.length === 4) {
            this.revenue['endAge'] = parseInt(value, 10) - this.owner['birthYear'];
            this.revenue['startAge'] = this.revenue['startYear'] - this.owner['birthYear'];

        } else {
            // assume it is okay
            this.isCorrect = true;
        }

        this.checkCorrect(retireYear, mortalityYear, retireAge);
    }

    private checkCorrect(retireYear: number, mortalityYear: number, retireAge: number) {
        if (this.revenue['startDateType'] === 0) {
            this.revenue['startYear'] = retireYear;
            this.revenue['startAge'] = retireAge;
        }
        if (this.revenue['endDateType'] !== undefined && this.revenue['endDateType'].id === 3) {
            this.revenue['endYear'] = this.revenue['startYear'];
            this.revenue['endAge'] = this.revenue['startAge'];
        }

        if (this.revenue['endDateType'] !== undefined && this.revenue['startDateType'].id === 2) {
            if (this.revenue['startYear'] >= retireYear) {
                this.isCorrect = true;
            }
            else {
                this.isCorrect = false;
            }
        }
        if (this.revenue['endDateType'] !== undefined && this.revenue['startDateType'].id === 2 && (this.revenue['endDateType'].id === 0 || this.revenue['endDateType'].id === 2)) {
            if (this.revenue['startYear'] >= retireYear && this.revenue['startYear'] <= this.revenue['endYear']) {
                this.isCorrect = true;
            }
            else {
                this.isCorrect = false;
            }
        }

        if ((this.revenue['startDateType'] !== undefined) && (this.revenue['startDateType'].id === 1)) {
            if (this.revenue['startYear'] >= new Date().getFullYear() && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else
                this.isCorrect = false;
        }


        if (this.revenue['endDateType'] !== undefined && this.revenue['endDateType'].id === 1 && this.revenue['startDateType'].id != 2) {
            if (this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            } else
                this.isCorrect = false;
        }


        if (this.revenue['endDateType'] !== undefined && this.revenue['endDateType'].id === 4) {
            if (this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            } else
                this.isCorrect = false;
        }
        if ((this.revenue['startDateType'].id === 1) && (this.revenue['endDateType'].id === 1)) {
            if (this.revenue['startYear'] >= new Date().getFullYear() && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else
                this.isCorrect = false;
        }

        if (this.revenue['endDateType'] !== undefined && this.revenue['endDateType'].id === 1 && this.revenue['startDateType'].id === 2) {
            if (this.revenue['startYear'] >= retireYear && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else {
                this.isCorrect = false;
            }
        }

        if (this.revenue['endDateType'] !== undefined && this.revenue['endDateType'].id === 4 && this.revenue['startDateType'].id === 2) {
            if (this.revenue['startYear'] >= retireYear && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else {
                this.isCorrect = false;
            }
        }
        if ((this.revenue['startDateType'].id === 1) && (this.revenue['endDateType'].id === 4)) {
            if (this.revenue['startYear'] >= new Date().getFullYear() && this.revenue['endYear'] >= this.revenue['startYear']) {
                this.isCorrect = true;
            }
            else
                this.isCorrect = false;
        }

    }

    chageStartYearDrop(data) {
        if (this.revenue['category'] === 'Government pension') {
            this.revenue['startYear'] = this.owner['birthYear'] + parseInt(data.age, 10);
            this.revenue['startAge'] = data.age;
        }
    }

    updateRevenue() {
        this.saveDisabled = true;
        let start_age, start_year, end_year, end_age: number;
        const goalStartYear: number = parseInt(this.revenue['associatedGoal'].goalStartYear, 10);
        const goalStartAge: number = parseInt(this.revenue['associatedGoal'].tier1ClientStartAge, 10);
        const goalEndYear: number = parseInt(this.revenue['associatedGoal'].goalEndYear, 10);
        const goalEndAge: number = parseInt(this.revenue['associatedGoal'].goalEndYear, 10) - this.owner['birthYear'];
        const mortalityEndYear: number = this.owner['relation'] === 1 ? this.familyMembers[0]['horizonYear'] : this.familyMembers[1]['horizonYear'];
        const mortalityEndAge: number = this.owner['relation'] === 1 ? this.familyMembers[0]['horizonAge'] : this.familyMembers[1]['horizonAge'];

        if (this.revenue['category'] === 'Other revenue') {
            if (this.revenue['startDateType'].id === 0 && this.revenue['endDateType'].id !== 2) {

                if (this.owner['relation'] === 1) {
                    start_age = this.familyMembers[0]['retireAge'];
                    start_year = this.familyMembers[0]['retireYear'];
                }
                if (this.owner['relation'] === 2) {
                    start_age = this.familyMembers[1]['retireAge'];
                    start_year = this.familyMembers[1]['retireYear'];
                }

            } else if (this.revenue['startDateType'].id === 0 && this.revenue['endDateType'].id === 2) {

                if (this.owner['relation'] === 1) {
                    start_age = this.familyMembers[0]['retireAge'];
                    start_year = this.familyMembers[0]['retireYear'];
                }
                if (this.owner['relation'] === 2) {
                    start_age = this.familyMembers[1]['retireAge'];
                    start_year = this.familyMembers[1]['retireYear'];
                }
            } else if (this.revenue['startDateType'].id === 1 || this.revenue['startDateType'].id === 2) {
                start_year = this.revenue['startYear'];
                start_age = this.revenue['startAge'];
            }
            if (this.revenue['endDateType'].id === 0) {

                if (this.owner['relation'] === 1) {
                    end_age = this.familyMembers[0]['horizonAge'];
                    end_year = this.familyMembers[0]['horizonYear'];
                }
                if (this.owner['relation'] === 2) {
                    end_age = this.familyMembers[1]['horizonAge'];
                    end_year = this.familyMembers[1]['horizonYear'];
                }

            } else if (this.revenue['endDateType'].id === 1 || this.revenue['endDateType'].id === 4) {
                end_year = this.revenue['endYear'];
                end_age = this.revenue['endAge'];
            } else if (this.revenue['endDateType'].id === 3) {
                //                end_year = parseInt(this.owner['retireYear'], 10);
                end_year = goalStartYear;
                //                end_age = parseInt(this.owner['retireAge'], 10);
                end_age = goalStartAge;
            } else if (this.revenue['endDateType'].id === 2) {
                if (this.owner['relation'] === 1) {
                    end_age = this.familyMembers[0]['retireAge'];
                    end_year = this.familyMembers[0]['retireYear'];
                }
                if (this.owner['relation'] === 2) {
                    end_age = this.familyMembers[1]['retireAge'];
                    end_year = this.familyMembers[1]['retireYear'];
                }
            }
        }
        const updateObj = {
            primaryKey: this.revenueId,
            description: this.revenue['description'],
            goalNum: this.revenue['associatedGoal'].key,
            clinum: this.clientId,
            contibution: this.revenue['contibutionPeriod'],
            eligible: (this.revenue['category'] === 'Government pension' && this.revenuesList['govBenefits'][0].govtBenefitId === 'UKSPM') ? this.revenue['percentage'] :
                (this.revenue['category'] === 'Government pension' && this.revenue['calculationMethod'].id === 4) ? this.revenue['residency'].value : 100,
            amount: this.revenue['category'] === 'Other revenue' ? this.revenue['amount'] : this.estimatedBenefit,
            taxOption: this.revenue['category'] === 'Other revenue' ? this.revenue['taxablePr'].id : this.revenue['taxOption'],
            startYear: this.revenue['category'] === 'Government pension' ? this.revenue['startYear'] : start_year ? start_year : goalStartYear,
            startAge: this.revenue['category'] === 'Government pension' ? this.revenue['startAge'] : start_age ? start_age : goalStartAge,
            endYear: this.revenue['category'] === 'Government pension' ? mortalityEndYear : end_year,

            endAge: this.revenue['category'] === 'Government pension' ? mortalityEndAge : end_age,
            startOption: this.revenue['category'] === 'Other revenue' ? this.revenue['startDateType']['id'] : 0,
            endOption: this.revenue['category'] === 'Other revenue' ? this.revenue['endDateType']['id'] : 0,
            percent: (this.revenue['category'] === 'Government pension' && this.revenue['calculationMethod'].id) === 1 ? 100 :
                (this.revenue['category'] === 'Government pension' && this.revenue['calculationMethod'].id === 2) ? this.revenue['percentage'] : 0,
            pensionAmount: (this.revenue['category'] === 'Government pension' && this.revenue['calculationMethod'].id === 3) ? this.revenue['monthlyAmount'] : 0,
            currentIncome: this.revenue['currentIncome'] ? this.revenue['currentIncome'] : 0,
            selectStartAge: (this.revenue['category'] === 'Government pension') ? this.revenue['startAgeList'].age : '',
            contibutionPeriod: this.revenue['contibutionPeriod'] ? this.revenue['contibutionPeriod'] : 0,
            calculationMethod: this.revenue['category'] === 'Government pension' ? this.revenue['calculationMethod'].id : 0,
            revOwner: this.revenue['ownership'] === 1 ? 'Client' : 'Spouse',
            revenueCategory: this.revenuesList['revenueCategory'],
            revenueType: this.revenuesList['revenueType'],
            indexPreStart: (this.indexPrChecked) ? this.revenue['indexRatePr'] : this.defaultIndex,
            indexRate: (this.indexFrChecked) ? this.revenue['indexRateFr'] : this.defaultIndex,
            percentTax: this.revenue['percentTax'] ? this.revenue['percentTax'] : 0,
            account: this.revenue['category'] === 'Other revenue' && (this.revenuesList['revenueType'] === '11' || this.revenuesList['revenueType'] === '4') ?
                this.revenue['linkAccount'].id : '',
            currencyCode: this.revenue['currency'].currencyCode,
            modelVal: this.revenue['modelVal'] ? this.revenue['modelVal'] : '',
            custIndex: this.indexFrChecked ? 1 : 0,
            custIndexPrior: this.indexPrChecked ? 1 : 0,
            percentOnDeath: this.revenue['percentOnDeath'] ? this.revenue['percentOnDeath'] : 0,
            percentOnDisability: this.revenue['percentOnDisability'] ? this.revenue['percentOnDisability'] : 0,
            percentOnMortality: this.revenue['percentOnMortality'] ? this.revenue['percentOnMortality'] : 0,
            deathAmount: this.revenue['deathAmount'] ? this.revenue['deathAmount'] : 0,
            disabilityAmount: this.revenue['disabilityAmount'] ? this.revenue['disabilityAmount'] : 0,
            mortalityAmount: this.revenue['mortalityAmount'] ? this.revenue['mortalityAmount'] : 0,
        };
        this.goalService.updateRevenue(updateObj, this.scenario.id).toPromise().then(result => {
            this.translate.get(['REVENUES.POPUP.SUCCESS_UPDATE', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['REVENUES.POPUP.SUCCESS_UPDATE'], 'success');
            });
            this.back();
            this.saveDisabled = false;
        }).catch(errRespose => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errRespose.error.errorMessage, 'error');
            });
            this.saveDisabled = false;
        });
    }

    deleteRevenue() {
        this.translate.get([
            'DELETE.POPUP.REVENUE_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.REVENUE_DELETE',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.REVENUE_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES']
            }).then(result => {
                if (result.value) {
                    this.planningServices.deleteRevenue(this.revenueId).toPromise().then(async response => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.REVENUE_DELETE'], 'success');
                        if (this.goalId) {
                            this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + this.goalId + '/revenues']);
                        } else {
                            this.router.navigate(['./client', this.clientId, 'planning', 'goals', 'revenues']);
                        }
                    }).catch(errorResponse => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                    });
                }
            });
        });
    }


    back() {
        if (this.goalId) {
            this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + this.goalId + '/revenues']);
        } else {
            this.router.navigate(['./client', this.clientId, 'planning', 'goals', 'revenues']);
        }
    }

    checkValues(key) {
        const goalStartYear = this.revenue['associatedGoal'].goalStartYear;
        let retireYear = 0;
        let retireAge = 0;
        let mortalityYear = 0;
        let mortalityAge = 0;

        this.isCorrect = true;
        if (this.owner['relation'] === 1) {
            retireAge = this.familyMembers[0]['retireAge'];
            retireYear = this.familyMembers[0]['retireYear'];
            mortalityAge = this.familyMembers[0]['horizonAge'];
            mortalityYear = this.familyMembers[0]['horizonYear'];
        }
        if (this.owner['relation'] === 2) {
            retireAge = this.familyMembers[1]['retireAge'];
            retireYear = this.familyMembers[1]['retireYear'];
            mortalityAge = this.familyMembers[1]['horizonAge'];
            mortalityYear = this.familyMembers[1]['horizonYear'];
        }
        if (key === 'start') {
            if (this.revenue['startDateType'].id === 0) {
                this.revenue['startAge'] = retireAge;
                this.revenue['startYear'] = retireYear;


            } else {
                if (this.revenue['endDateType'] && this.revenue['endDateType'].id === 2) {
                    //                    if (this.revenue['startYear'] > (this.owner['retireYear'] - 1)) {
                    this.revenue['endAge'] = retireAge;
                    this.revenue['endYear'] = retireYear;
                }
            }
        } else if (key === 'end') {
            if (this.revenue['endDateType'].id === 2) {
                this.revenue['endAge'] = retireAge;
                this.revenue['endYear'] = retireYear;
            } else if (this.revenue['endDateType'].id === 3) {

                this.revenue['endAge'] = this.revenue['startAge'];
                this.revenue['endYear'] = this.revenue['startYear'];
            } else if (this.revenue['endDateType'].id === 0) {
                this.revenue['endAge'] = mortalityAge;
                this.revenue['endYear'] = mortalityYear;

            }
        } else {
            this.isCorrect = true;
        }
        if (this.revenue['endYear'] >= this.revenue['startYear']) {
            this.isCorrect = this.isCorrect && true;
        } else {
            this.isCorrect = false;
        }
        this.checkCorrect(retireYear, mortalityYear, retireAge);
    }

    enableSaveButton(){
        this.isCorrect = true;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }


}
