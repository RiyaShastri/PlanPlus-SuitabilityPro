import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../shared/animations';
import { Location } from '@angular/common';
import { mortalityGraph } from '../../../client-models/goal-summary-chart';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { Store } from '@ngrx/store';
import { AppState, getFamilyMemberPayload, getAllCountryFormatePayload, getClientPayload, getPlanAssumptPayload } from '../../../../shared/app.reducer';
import { AdvisorService } from '../../../../advisor/service/advisor.service';
import { GoalService } from '../../../service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PERSON_RELATION } from '../../../../shared/constants';

@Component({
    selector: 'app-retirement-assumption',
    templateUrl: './retirement-assumption.component.html',
    styleUrls: ['./retirement-assumption.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class RetirementAssumptionComponent implements OnInit, OnDestroy {
    mortalityChartData;
    model = <any>{};
    isClien2HorizonExpand = false;
    isClien1HorizonExpand = false;
    defaultRetirementAge;
    defaultMortalityAge;
    familyMembers = [];
    client1;
    client2;
    client1Age;
    client2Age;
    allCountryData = [];
    clientData = {};
    client1MortalityAgeList = [];
    client2MortalityAgeList = [];
    selectedCountry;
    selectedClient = {};
    closeButtonDisable = false;
    goal = {};
    currentGoal = {};
    goalId;
    clientId;
    returnUrl;
    client1PlanAssumpt = {};
    client2PlanAssumpt = {};
    dataLoaded;
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private _location: Location,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private goalService: GoalService,
        private translate: TranslateService,
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.RETIREMENT_ASSUMPTION');
        this.angulartics2.eventTrack.next({ action: 'retirementAssumption' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.returnUrl = params['returnUrl'];
        });
    }

    async ngOnInit() {
        let goalData = new Promise((resolve,reject) => {
            this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(async params => {
            this.goalId = params['goalId'];
            await this.setGoalData();
            resolve();
        });

    });
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.allCountryData = data;
            }
        });
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                this.familyMembers = data['familyMembers'];
                this.client1 = this.familyMembers.filter(x => x.relation === PERSON_RELATION.CLIENT1)[0];
                this.client2 = this.familyMembers.filter(x => x.relation === PERSON_RELATION.CLIENT2)[0];
            }
        });

        let sync = new Promise((resolve, reject) => {
            this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
                this.clientData = clientData;
                let currentYear = new Date().getFullYear();
                let currentMonth = new Date().getMonth() + 1;
                let client2Month = 0;
                let client1Month = parseInt(this.client1.birthDate.substring(5, 7));
                if (this.client2 !== undefined) {
                    client2Month = parseInt(this.client2.birthDate.substring(5, 7));
                }
                this.client1Age = currentYear - parseInt(this.client1.birthDate.substring(0, 4));
                if (this.client2 !== undefined) {
                    this.client2Age = currentYear - parseInt(this.client2.birthDate.substring(0, 4));
                }
                // note that the client1 month and client2 month are parsed from the string version of the date.
                // This means for a birthdate of 1975-07-21 the month value will be 7 while the current month is
                // being derived from a date object which uses 0 index for months.  So for July the month would
                // be 6.  So for our comparisons we need to adjust 1 or the other month values to get an accurate
                // condition.  I adjusted the current month above where its gotten from the current date.
                if (client1Month > currentMonth) {
                    this.client1Age = this.client1Age - 1;
                }
                if (client2Month > currentMonth) {
                    this.client2Age = this.client2Age - 1;
                }
                if (this.clientData && this.clientData['planningCountry']) {
                    this.getMortalityAgeList();
                    resolve();
                }
            });
        });

        await sync.then(result => {
            goalData.then(data =>{
                this.goalService.getPlanAssumpt(this.clientId,this.currentGoal['scenario']).toPromise().then(result => {
                    this.client1PlanAssumpt = result[0];
                    this.client2PlanAssumpt = result[1];
                    this.overrideByPlanAssumptData();
                });
            });
        });
    }

    overrideByPlanAssumptData() {
        if (this.client1PlanAssumpt !== undefined) {
            this.model.client1RetiredAge = this.client1PlanAssumpt['retirement'];
            this.model.client1HorizonAge = this.client1PlanAssumpt['mortality'];
        }
        if (this.client2PlanAssumpt !== undefined) {
            this.model.client2RetiredAge = this.client2PlanAssumpt['retirement'];
            this.model.client2HorizonAge = this.client2PlanAssumpt['mortality'];
        }
    }

    overrideByGoalData() {
        if (this.currentGoal) {
            //            if (this.currentGoal['tier1ClientStartAge'] !== undefined && this.currentGoal['tier1ClientStartAge'] !== null) {
            //                this.model.client1RetiredAge = this.currentGoal['tier1ClientStartAge'];
            //            }
            let client1birthYear = parseInt(this.client1.birthDate.substring(0, 4));
            let client2birthYear: number = 0;
            if (this.client2 !== undefined) {
                client2birthYear = this.client2.birthDate.substring(0, 4);
            }
            if (this.currentGoal['goalStartYear'] !== undefined && this.currentGoal['goalStartYear'] !== null) {
                let goalStartYear = parseInt(this.currentGoal['goalStartYear']);
                this.model.client1RetiredAge = goalStartYear - client1birthYear;
                this.model.client2RetiredAge = goalStartYear - client2birthYear;
            }
            if (this.currentGoal['goalEndYear'] !== undefined && this.currentGoal['goalEndYear'] !== undefined) {
                let goalEndYear = parseInt(this.currentGoal['goalEndYear']);
                this.model.client1HorizonAge = goalEndYear - client1birthYear;
                this.model.client2HorizonAge = goalEndYear - client2birthYear;
            }
        }
    }

    async getMortalityAgeList() {
        let gender2 = "";
        let age2 = 0;
        if (this.client2 !== undefined) {
            gender2 = this.client2.gender;
            age2 = this.client2Age;
        }

        await this.goalService.getMortalityGraphData(this.clientData['planningCountry'], this.client1.gender, gender2, this.client1Age, age2).toPromise().then(results => {
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
                //                this.overrideByGoalData();  // high priority from goal data
            }
        });
    }

    setDataProvider(retire?, mortality?, client?, isClient?) {
        const defaultMortality = mortality ? parseInt(mortality, 10) : this.defaultMortalityAge;
        let currentYear = new Date().getFullYear();
        // see above in the init method for why the month is getting 1 added to it.
        let currentMonth = new Date().getMonth() + 1;
        let clientMonth = parseInt(client.birthDate.substring(5, 7));
        let defaultAge = currentYear - parseInt(client.birthDate.substring(0, 4));
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

    async saveRetirementAssuption() {
        const obj = JSON.parse(JSON.stringify(this.goal));
        //        obj['goalType'] = obj['goalType'].goaltype;
        let startAge = parseInt(this.model.client1RetiredAge, 10);
        let birthYear = parseInt(this.clientData['birthDate'].substring(0, 4), 10);
        let finalStartAge: number = 0;
        let finalStartYear: number = 0;
        if (this.client2 !== undefined &&
            this.model.client2RetiredAge !== undefined &&
            parseInt(this.model.client2RetiredAge, 10) !== null) {
            let otherStartAge = parseInt(this.model.client2RetiredAge, 10);
            let otherBirthYear = parseInt(this.client2.birthDate.substring(0, 4), 10);
            if ((otherBirthYear + otherStartAge) < (birthYear + startAge)) {
                finalStartAge = otherStartAge;
                finalStartYear = otherBirthYear + otherStartAge;
            } else {
                finalStartAge = startAge;
                finalStartYear = birthYear + startAge;
            }
        } else {
            finalStartAge = startAge;
            finalStartYear = birthYear + startAge;
        }
        obj['tier1ClientStartAge'] = this.model.client1RetiredAge;
        if (this.client2 !== undefined) {
            obj['tier1SpouseStartAge'] = this.model.client2RetiredAge;
        }
        obj['goalTier1StartYear'] = finalStartYear;
        obj['goalStartYear'] = finalStartYear;
        let endAge = parseInt(this.model.client1HorizonAge, 10);
        let finalEndAge: number = 0;
        let finalEndYear: number = 0;
        if (this.client2 !== undefined &&
            this.model.client2HorizonAge !== undefined &&
            parseInt(this.model.client2HorizonAge) !== null) {
            let otherEndAge = parseInt(this.model.client2HorizonAge, 10);
            let otherBirthYear = parseInt(this.client2.birthDate.substring(0, 4), 10);
            if ((otherBirthYear + otherEndAge) > (birthYear + endAge)) {
                finalEndAge = otherEndAge;
                finalEndYear = otherBirthYear + otherEndAge;
            } else {
                finalEndAge = endAge;
                finalEndYear = birthYear + endAge;
            }
        } else {
            finalEndAge = endAge;
            finalEndYear = birthYear + endAge;
        }
        let clientFinalEndAge = this.model.client1HorizonAge;
        let spouseFinalEndAge: number = 0;
        if (this.client2 !== undefined) {
            spouseFinalEndAge = this.model.client2HorizonAge;
        }
        if (obj['tier3ClientEndAge'] != 0) {    // it is tier 3
            obj['tier3ClientEndAge'] = clientFinalEndAge;
            obj['goalTier3EndYear'] = finalEndYear;
            if (this.client2 !== undefined) {
                obj['tier3SpouseEndAge'] = spouseFinalEndAge;
            }
        } else if (obj['tier2ClientEndAge'] != 0) { // it is tier 2
            obj['tier2ClientEndAge'] = clientFinalEndAge;
            obj['goalTier2EndYear'] = finalEndYear;
            if (this.client2 !== undefined) {
                obj['tier2SpouseEndAge'] = spouseFinalEndAge;
            }
        } else if (obj['tier1ClientEndAge'] != 0) { // it is tier 1
            obj['tier1ClientEndAge'] = clientFinalEndAge;
            obj['goalTier1EndYear'] = finalEndYear;
            if (this.client2 !== undefined) {
                obj['tier1SpouseEndAge'] = spouseFinalEndAge;
            }
        }
        obj['goalEndYear'] = finalEndYear;
        await this.goalService.updateRetirementGoal(this.clientId, this.goalId, obj).toPromise().then(response => {
            this.translate.get(['EDIT_GOAL.POPUP.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                Swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['EDIT_GOAL.POPUP.SUCCESS'], 'success');
            });
        }).catch(errRespose => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errRespose.error.errorMessage, 'error');
            });
        });
        const planAssumptObj = {
            clientPersonKey: this.client1.id,
            spousePersonKey: (this.client2 != undefined) ? this.client2.id : null,
            clientRetirementAge: this.model.client1RetiredAge,
            spouseRetirementAge: (this.client2 != undefined) ? this.model.client2RetiredAge : 0,
            clientMortalityAge: this.model.client1HorizonAge,
            spouseMortalityAge: (this.client2 != undefined) ? this.model.client2HorizonAge : 0
        }
        await this.goalService.updatePlanAssumpt(this.clientId, planAssumptObj, this.goal['scenario']).toPromise().then(response => {

        }).catch(errResponse => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errResponse.error.errorMessage, 'error');
            });
        })
        //        this._location.back();
        this.router.navigateByUrl(this.returnUrl);
    }

    back() {
        this._location.back();
    }

    async setGoalData() {
        await this.goalService.getGoalByGoalId(this.goalId).toPromise().then(response => {
            if (response) {
                this.currentGoal = response;
                if (this.currentGoal) {
                    this.goal = {
                        ...this.currentGoal
                    };
                    this.overrideByPlanAssumptData();
                }
            }
        }).catch(errorResponse => {
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
