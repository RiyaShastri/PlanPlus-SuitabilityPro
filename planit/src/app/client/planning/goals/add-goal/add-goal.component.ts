import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { PlanningService, GoalService } from '../../../service';
import { slideInOutAnimation } from '../../../../shared/animations';
import { mortalityGraph } from '../../../client-models/goal-summary-chart';
import { AppState, getFamilyMemberPayload, getClientPayload, getGoalPayload, getAllCountryFormatePayload } from '../../../../shared/app.reducer';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import { GOAL_TYPE, PERSON_RELATION } from '../../../../shared/constants';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';

@Component({
    selector: 'app-add-goal',
    templateUrl: './add-goal.component.html',
    styleUrls: ['./add-goal.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddGoalComponent implements OnInit, OnDestroy {
    model: any = {};
    clientId: string;
    familyMembers;
    educationPersonList = [];
    goalId;
    client1;
    client2;
    client1Age;
    client2Age;
    yearsList = [];
    currenciesList;
    isClien1HorizonExpand = false;
    isClien2HorizonExpand = false;
    mortalityChartData;
    currencyMask = createNumberMask({
        prefix: '$'
    });
    defaultRetirementAge;
    defaultMortalityAge;
    goalsList;
    retirementGoalExist = false;
    clientData = {};
    saveDisable = false;
    client1MortalityAgeList = [];
    client2MortalityAgeList = [];
    allCountryData: any;
    selectedCountry;
    selectedClient = {};
    accessRights:any = {};
    institutionAmount = 0;
    GOAL_TYPE = GOAL_TYPE;
    PERSON_RELATION = PERSON_RELATION;
    defaultCurrency = '';
    scenario: Scenario = {id: '00', name: 'Current Scenario'};;
    @ViewChild('f') public form: NgForm;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private planningService: PlanningService,
        private dataSharing: RefreshDataService,
        private goalService: GoalService,
        private angulartics2: Angulartics2,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private translate: TranslateService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_GOAL');
        this.angulartics2.eventTrack.next({ action: 'addGoal' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });

        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('add_goal_education_institution_added|')) {
                const model = JSON.parse(message.replace('add_goal_education_institution_added|', ''));
                this.model = model;
                this.educationPersonList = model.educationPersonList;
                if (this.model['cost']) {
                    this.model.amountPerYear = Math.round(this.model['cost']);
                }
            }
        });
    }

    async ngOnInit() {
        this.accessRightService.getAccess(['SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

        
        this.dataSharing.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
            if(scenario){
                this.scenario = scenario;
            }
            
        });
        
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.allCountryData = data;
            }
        });
        const year = new Date().getUTCFullYear();
        for (let i = 0; i < 100; i++) {
            this.yearsList.push({
                id: year + i,
                value: year + i
            });
        }
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
            this.setClientData();
        });
        this.store.select(getGoalPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.goalsList = data;
                this.goalsList.forEach(goal => {
                    if (goal.goalType === 2 || goal.goalType === '2') {
                        // reference: https://bitbucket.org/planplus/suitabilitypro-ui/commits/b3b953a3769f14b2ef45b370b60ed8ee71f67e58
                        this.retirementGoalExist = true;
                    }
                });
            } else {
                this.goalService.getClientGoalPayload(this.clientId);
            }
        });
    }

    private async setClientData() {
        if (this.clientData && this.clientData['planningCountry'] && this.allCountryData) {
            const currentYear = new Date().getUTCFullYear();
            const currentMonth = new Date().getUTCMonth() + 1;
            if (this.client1) {
                const client1Month = parseInt(this.client1.birthDate.substring(5, 7), 10);
                this.client1Age = currentYear - parseInt(this.client1.birthDate.substring(0, 4), 10);
                if (client1Month > currentMonth) {
                    this.client1Age = this.client1Age - 1;
                }
            }
            if (this.client2) {
                const client2Month = parseInt(this.client2.birthDate.substring(5, 7), 10);
                this.client2Age = currentYear - parseInt(this.client2.birthDate.substring(0, 4), 10);
                if (client2Month > currentMonth) {
                    this.client2Age = this.client2Age - 1;
                }
            }
            this.defaultCurrency = this.allCountryData[this.clientData['planningCountry']]['currencyCode'];
            await this.getDefaultValues();
        }
    }

    async getDefaultValues() {
        await this.goalService.getMortalityGraphData(this.clientData['planningCountry'], this.client1 ? this.client1.gender : 'M',
            this.client2 ? this.client2.gender : 'F', this.client1Age, this.client2Age).toPromise().then(results => {
                if (results) {
                    this.client1MortalityAgeList = results[0];
                    this.client2MortalityAgeList = results[1];
                    this.defaultRetirementAge = this.allCountryData[this.clientData['planningCountry']]['retireAge'];
                    this.defaultMortalityAge = this.allCountryData[this.clientData['planningCountry']]['mortalityAge'];
                    this.selectedCountry = this.allCountryData[this.clientData['planningCountry']]['country'];
                    this.model.client1RetiredAge = this.defaultRetirementAge;
                    this.model.client2RetiredAge = this.defaultRetirementAge;
                    this.model.client1HorizonAge = this.defaultMortalityAge;
                    this.model.client2HorizonAge = this.defaultMortalityAge;
                }
            });
    }

    getCurrency() {
        this.goalService.getAllCurrencyDetail().toPromise().then(result => {
            this.currenciesList = result;
            if (this.defaultCurrency !== '' && this.defaultCurrency !== null) {
                this.model.currency = this.currenciesList.find(currency => currency.isoCode === this.defaultCurrency);
            }
        }).catch(errorResponse => { });
    }

    getFamilyMembers(goalType) {
        this.client1 = null;
        this.client2 = null;
        this.model.amountPerYear = null;
        this.model.person = {};
        this.model.goalDescription = '';
        this.model.startAge = null;
        this.model.endAge = null;
        this.model.selectedstartYear = null;
        this.model.selectedendYear = null;
        if (this.clientId != null) {
            this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(async data => {
                if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                    this.familyMembers = data['familyMembers'];
                    this.client1 = this.familyMembers.filter(x => x.relation === PERSON_RELATION.CLIENT1)[0];
                    this.client2 = this.familyMembers.filter(x => x.relation === PERSON_RELATION.CLIENT2)[0];
                    await this.setClientData();
                    if (goalType === this.GOAL_TYPE.RETIREMENT) {
                        this.calculateStartEnd();
                    } else if (goalType === this.GOAL_TYPE.EDUCATION) {
                        this.educationPersonList = [];
                        if (this.familyMembers.length > 1) {
                            let children = [];
                            children = this.familyMembers.filter(x => x.relation === 4 || x.relation === 5);
                            if (children.length > 0) {
                                children.forEach(child => {
                                    this.educationPersonList.push(child);
                                });
                            }

                            let grandchildren = [];
                            grandchildren = this.familyMembers.filter(x => x.relation === 10 || x.relation === 11);
                            if (grandchildren.length > 0) {
                                grandchildren.forEach(child => {
                                    this.educationPersonList.push(child);
                                });
                            }

                            this.educationPersonList.push(this.client1);
                            if (this.client2) {
                                this.educationPersonList.push(this.client2);
                            }

                            let others = [];
                            others = this.familyMembers.filter(x => x.relation === 6 || x.relation === 7 || x.relation === 8 || x.relation === 9 || x.relation === 3);
                            if (others.length > 0) {
                                others.forEach(person => {
                                    this.educationPersonList.push(person);
                                });
                            }
                            this.educationPersonList.push({ id: 0, firstName: 'Other', birthDate: '' });
                        } else {
                            this.educationPersonList.push(this.familyMembers.filter(x => x.relation === 1)[0]);
                            this.educationPersonList.push({ id: 0, firstName: 'Other', birthDate: '' });
                        }
                    }
                }
            });
        }
        if (goalType === 0) {
            this.getCurrency();
        }
    }

    calculateStartEnd() {
        const client1StartYear = parseInt(this.model.client1RetiredAge, 10) > this.client1.age ?
            new Date(this.client1.birthDate).getUTCFullYear() + parseInt(this.model.client1RetiredAge, 10) : new Date().getUTCFullYear();
        const client1EndYear = new Date(this.client1.birthDate).getUTCFullYear() + parseInt(this.model.client1HorizonAge, 10);
        if (this.model.client1RetiredAge < this.client1.age) {
            this.model.client1RetiredAge = this.client1.age;
        }
        let client2StartYear = 0;
        let client2EndYear = 0;
        if (this.client2) {
            client2StartYear = parseInt(this.model.client2RetiredAge, 10) > this.client2.age ?
                new Date(this.client2.birthDate).getUTCFullYear() + parseInt(this.model.client2RetiredAge, 10) : new Date().getUTCFullYear();
            client2EndYear = new Date(this.client2.birthDate).getUTCFullYear() + parseInt(this.model.client2HorizonAge, 10);
            if (this.model.client2RetiredAge < this.client2.age) {
                this.model.client2RetiredAge = this.client2.age;
            }
        }
        this.model.startYear = (this.client2 && client1StartYear > client2StartYear) ? client2StartYear : client1StartYear;
        this.model.endYear = (this.client2 && client1EndYear < client2EndYear) ? client2EndYear : client1EndYear;
        this.model.startAge = (this.client2 && client1StartYear > client2StartYear) ? this.model.client2RetiredAge : this.model.client1RetiredAge;
        this.model.endAge = (this.client2 && client1EndYear < client2EndYear) ? this.model.client2HorizonAge : this.model.client1HorizonAge;
    }

    back() {
        this.router.navigate(['/client', this.clientId, 'planning', 'goals', 'summary']);
        this.dataSharing.changeMessage('default message');
    }

    addDescription() {
        this.translate.get(['ADD_GOALS.EDUCATION']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.model.goalDescription = this.model.person.firstName + '\'s ' + i18text['ADD_GOALS.EDUCATION'];
        });
        this.model.startAge = '';
        this.model.endAge = '';
        this.model.selectedstartYear = '';
        this.model.selectedendYear = '';
        if (this.model.person.birthDate) {
            let defEducationStartAge = 0;
            if (this.model.person.gender === 'M') {
                defEducationStartAge = this.allCountryData[this.clientData['planningCountry']]['eduMaleAge'];
            } else if (this.model.person.gender === 'F') {
                defEducationStartAge = this.allCountryData[this.clientData['planningCountry']]['eduFemaleAge'];
            }
            const startYear = new Date(this.model.person.birthDate).getUTCFullYear() + defEducationStartAge;
            const endYear = startYear + 3;
            // tslint:disable-next-line:triple-equals
            this.model.selectedstartYear = this.yearsList.find(option => option.value == startYear);
            if (this.model.selectedstartYear) {
                this.model.startAge = defEducationStartAge;
                // tslint:disable-next-line:triple-equals
                this.model.selectedendYear = this.yearsList.find(option => option.value == endYear);
                if (this.model.selectedendYear) {
                    this.model.endAge = defEducationStartAge + 3;
                }
            }
        }
    }

    calculateStartAge() {
        if (this.model.goalType != this.GOAL_TYPE.OTHER) {
            if (this.model.person.birthDate) {
                this.model.startAge = this.model.selectedstartYear.value - new Date(this.model.person.birthDate).getUTCFullYear();
            }
        }
    }

    calculateEndAge() {
        if (this.model.goalType != this.GOAL_TYPE.OTHER) {
            if (this.model.person.birthDate) {
                this.model.endAge = this.model.selectedendYear.value - new Date(this.model.person.birthDate).getUTCFullYear();
            }
        }
    }

    saveGoal(type) {
        let obj = {};
        this.translate.get(['SSID_LABELS.OBJECTIV002']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            obj = {
                amountPerYear: this.model.amountPerYear,
                description: this.model.goalType == this.GOAL_TYPE.RETIREMENT ? text['SSID_LABELS.OBJECTIV002'] : this.model.goalDescription,
                clientRetirementAge: parseInt(this.model.client1RetiredAge, 10),
                spouseRetirementAge: parseInt(this.model.client2RetiredAge, 10),
                clientMortalityAge: parseInt(this.model.client1HorizonAge, 10),
                spouseMortalityAge: parseInt(this.model.client2HorizonAge, 10),
                goalEndYear: this.model.goalType == this.GOAL_TYPE.RETIREMENT ? this.model.endYear : this.model.selectedendYear.id,
                goalStartYear: this.model.goalType == this.GOAL_TYPE.RETIREMENT ? this.model.startYear : this.model.selectedstartYear.id,
                startOption: this.model.goalType == this.GOAL_TYPE.RETIREMENT ? 0 : 1,
                endOption: this.model.goalType == this.GOAL_TYPE.RETIREMENT ? 0 : 1,
                goalType: this.model.goalType,
                personKey: this.model.goalType == this.GOAL_TYPE.EDUCATION ? this.model.person.id : null,
                curCode: this.model.currency ? this.model.currency.isoCode : '',
                ownedBy: 'Joint'
            };
            this.goalService.addGoal(this.clientId, obj, this.scenario.id).toPromise().then(res => {
                this.form.reset();
                this.saveDisable = false;
                this.translate.get(['ADD_GOALS.POPUP.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['ADD_GOALS.POPUP.SUCCESS'], 'success');
                });
                this.goalService.getClientGoalPayload(this.clientId);
                this.dataSharing.changeMessage('refresh_goals_list');
                if (type === 1) {
                    this.back();
                } else {
                    this.router.navigate(['/client', this.clientId, 'planning', 'goals', res.primaryKey, 'edit-goal']);
                }
            }).catch(err => {
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
                this.saveDisable = false;
                this.back();
            });
        });
    }

    redirectToEducationRetirement() {
        this.model['educationPersonList'] = this.educationPersonList;
        this.dataSharing.changeMessage('education_added|' + JSON.stringify(this.model));
        this.router.navigate(['/client', this.clientId, 'planning', 'goals', 'summary', 'education-institution']);
    }

    setDataProvider(retire?, mortality?, client?, isClient?) {
        const currentYear = new Date().getUTCFullYear();
        const currentMonth = new Date().getUTCMonth() + 1;
        const clientMonth = parseInt(client.birthDate.substring(5, 7), 10);
        let defaultAge = currentYear - parseInt(client.birthDate.substring(0, 4), 10);
        if (clientMonth > currentMonth) {
            defaultAge = defaultAge - 1;
        }
        let ageList = [];
        if (client && defaultAge <= parseInt(mortality, 10)) {
            this.selectedClient['client'] = client;
            this.selectedClient['retire'] = defaultAge;
            if (isClient) {
                ageList = this.client1MortalityAgeList;
                this.mortalityChartData = {
                    ...mortalityGraph,
                    dataProvider: ageList
                };
            } else {
                ageList = this.client2MortalityAgeList;
                this.mortalityChartData = {
                    ...mortalityGraph,
                    dataProvider: ageList
                };
            }
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
