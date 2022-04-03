import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { GoalService, PlanningService, PortfolioService, ClientProfileService } from '../../../service';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload, getGraphColours, getPortfolioPayload, getFamilyMemberPayload } from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { PageTitleService } from '../../../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { GOAL_REVENUE_GRAPH_MAP, GOAL_REVENUE_QUERY_PARAM } from '../../../../shared/constants';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { GOAL_TYPE,PERSON_RELATION } from '../../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-goals-summary',
    templateUrl: './goals-summary.component.html',
    styleUrls: ['./goals-summary.component.css']
})
export class GoalsSummaryComponent implements OnInit, OnDestroy {
    @ViewChild('multipleGoals') public multipleGoals: NgbTooltip;
    @ViewChild('truncatedGoal') public truncatedGoal: NgbTooltip;
    GOAL_REVENUE_QUERY_PARAM = GOAL_REVENUE_QUERY_PARAM;
    public clientId;
    public sortBy = [
        { id: 1, name: 'Goal type', sortByType: 'goal_type' },
    ];
    public selectedSortBy = this.sortBy[0];
    public viewBy = [
        { id: 1, name: 'Year' },
        { id: 2, name: 'Age' },
    ];
    public selectedViewBy = this.viewBy[0];
    public goalMap = [
        { id: 1, name: 'Timeline' },
        { id: 2, name: 'Graph - Today\'s dollars' },
        { id: 3, name: 'Graph - Future dollars' },
    ];
    public selectedgoalMap = this.goalMap[0];
    goalsList = [];
    dataProviderList = [];
    graphGoalList = [];
    graphGoalListAmount = [];
    clientData = {};
    allCurrencyList = [];
    currencyDescription;
    chartColors = [];
    allPortfolio = {};
    environment = {};
    allowEdit = true;
    graphTodayDoller = [];
    selectedOption = this.GOAL_REVENUE_QUERY_PARAM.CURRENT;
    selectedDropdownOption;
    accessRights = {};
    familyData = {};
    scenarioObject: Scenario[] = [];
    selectedScenario: Scenario = { id: '00', name: 'Current Scenario' };
    GOAL_TYPE = GOAL_TYPE;
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private goalService: GoalService,
        private dataSharing: RefreshDataService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        public translate: TranslateService,
        private accessRightService: AccessRightService,
        private portfolioService: PortfolioService,
        private clientProfile: ClientProfileService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.GOALS');
        this.angulartics2.eventTrack.next({ action: 'goalsListing' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.environment = environment;
    }

    async ngOnInit() {
        this.accessRightService.getAccess(['PLANTRAC', 'SAV01', 'CLI02', 'PEN01', 'MODGL', 'SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.accessRights = res;
            }
        });


        await this.clientProfile.getClientScenarios(this.clientId).toPromise().then((result: any[]) => result.forEach(scenario => {
            this.scenarioObject.push({ name: scenario.scenarioDescription, id: scenario.scenarioType })
            if (scenario.scenarioType == '00') {
                this.selectedScenario = { name: scenario.scenarioDescription, id: scenario.scenarioType };
            }
        }));

        this.dataSharing.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
            if(scenario){
                const scenarioExist = this.scenarioObject.find(scenarioInList => scenarioInList.id === scenario.id);
                if (scenarioExist) {
                    this.selectedScenario = scenario;
                }
            }
         });
        

        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                this.familyData = data;
            }
        });
        this.translate.stream(['GRAPH.DROPDOWN.TIMELINE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.selectedDropdownOption = { id: GOAL_REVENUE_GRAPH_MAP.TIME_LINE_CHART, name: i18Text['GRAPH.DROPDOWN.TIMELINE'] };
        });
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.chartColors = res['allGraphColours'];
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            if (this.clientData['currencyCode'] && this.clientData) {
                this.goalService.getAllCurrencyDetail().toPromise().then(currency => {
                    this.allCurrencyList = Object.assign([], currency);
                    if (this.allCurrencyList.length > 0 && this.clientData['currencyCode']) {
                        this.currencyDescription = this.allCurrencyList.find(curr => curr.currencyCode.trim() === this.clientData['currencyCode']);
                    }
                });
            }
        });

        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result.hasOwnProperty('portfolios')) {
                result.portfolios.forEach(portfolio => {
                    this.allPortfolio[portfolio.id] = portfolio.description;
                });
                this.getGoalList();
            }
        });
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('refresh_goals_list')) {
                this.getGoalList();
                this.dataSharing.changeMessage('default message');
            }
        });
     }


    async getGoalList() {
        if(this.accessRights['SCENARIOACCESS']['accessLevel'] > 0){
            this.dataSharing.selectScenario(this.selectedScenario);
        }
        this.goalsList = await <any>this.goalService.getGoalsByClientId(this.clientId, this.selectedSortBy['sortByType'], 'age', this.selectedScenario.id).toPromise();
        this.getGoalDetail();
        this.chartData();
    }

    getGoalDetail() {
        this.goalsList.forEach(element => {
            element['goalTiers'] = this.getTier(element);
            if (parseInt(element['goalType'], 10) === this.GOAL_TYPE.EDUCATION) {
                let birthDate;
                const personData = this.familyData['familyMembers'].find(x => x.id === element['personKey']);
                if (personData && personData['id']) {
                    birthDate = new Date(personData['birthDate']).getFullYear();
                } else {
                    birthDate = new Date(this.familyData['familyMembers'].find(x => x.relation === PERSON_RELATION.CLIENT1)['birthDate']).getFullYear();
                }
                element['tier1ClientEndAge'] = element['goalEndYear'] - birthDate;
                element['tier1ClientStartAge'] = element['goalStartYear'] - birthDate;
                element['tier1SpouseEndAge'] = 0;
                element['tier1SpouseStartAge'] = 0;
            }
        });
    }

    getTier(goal) {
        const goalDetails = [];
        const tires = [1, 2, 3];
        let birthDate;
        if (parseInt(goal['goalType'], 10) === this.GOAL_TYPE.EDUCATION) {
            const personData = this.familyData['familyMembers'].find(x => x.id === goal['personKey']);
            if (personData && personData['id']) {
                birthDate = new Date(personData['birthDate']).getFullYear();
            } else {
                birthDate = new Date(this.familyData['familyMembers'].find(x => x.relation === PERSON_RELATION.CLIENT1)['birthDate']).getFullYear();
            }
            tires.forEach(element => {
                if (goal['goalTier' + element + 'Amount'] > 0 && goal['goalTier' + element + 'StartYear'] > 0) {
                    goalDetails.push({
                        'amount': goal['goalTier' + element + 'Amount'],
                        'endYear': goal['goalTier' + element + 'EndYear'],
                        'startYear': goal['goalTier' + element + 'StartYear'],
                        'clientstartAge': goal['goalTier' + element + 'StartYear'] - birthDate,
                        'clientEndAge': goal['goalTier' + element + 'EndYear'] - birthDate,
                        'spousestartAge': 0,
                        'spouseEndAge': 0
                    });
                }
            });
            return goalDetails;
        } else {
            tires.forEach(element => {
                if (goal['goalTier' + element + 'Amount'] > 0 && goal['goalTier' + element + 'StartYear'] > 0) {
                    goalDetails.push({
                        'amount': goal['goalTier' + element + 'Amount'],
                        'endYear': goal['goalTier' + element + 'EndYear'],
                        'startYear': goal['goalTier' + element + 'StartYear'],
                        'clientstartAge': goal['tier' + element + 'ClientStartAge'],
                        'clientEndAge': goal['tier' + element + 'ClientEndAge'],
                        'spousestartAge': goal['tier' + element + 'SpouseStartAge'],
                        'spouseEndAge': goal['tier' + element + 'SpouseEndAge']
                    });
                }
            });
            return goalDetails;
        }
    }

    public changeAction(index: number) {
        if ($('#dropdownGoalAction' + index).is(':visible')) {
            $('.dropdown-goal-action').hide();
        } else {
            $('.dropdown-goal-action').hide();
            $('#dropdownGoalAction' + index).toggle();
        }
    }

    filteViewBy(event) {
        this.selectedViewBy = event;
        // this.getGoalList();
    }

    onSelectScenario(event) {
        this.selectedScenario = event;
        this.getGoalList();
    }

    sortingBy(event) {
        this.selectedSortBy = event;
        this.getGoalList();
    }

    async chartData() {
        if (this.selectedOption !== '') {
            await this.goalService.getGoalMapGraphData(this.clientId, this.selectedOption).toPromise().then(response => {
                if (response) {
                    this.graphTodayDoller = response;
                }
            }).catch(error => { });
        }
        this.graphGoalListAmount = [];
        this.graphGoalList = [];
        this.dataProviderList = [];
        this.goalsList.forEach(goal => {
            const dataProvider = {
                category: goal.description,
                segments: []
            };
            if (goal.goalTier1StartYear) {
                dataProvider['segments'].push({
                    start: (goal.goalTier1StartYear === goal.goalTier1EndYear) ? (goal.goalTier1StartYear - 1).toString() : goal.goalTier1StartYear.toString(),
                    end: goal.goalTier1EndYear.toString(),
                    task: goal.goalTier1Amount
                });
            }
            if (goal.goalTier2StartYear) {
                dataProvider['segments'].push({
                    start: (goal.goalTier2StartYear === goal.goalTier2EndYear) ? (goal.goalTier2StartYear - 1).toString() : goal.goalTier2StartYear.toString(),
                    end: goal.goalTier2EndYear.toString(),
                    task: goal.goalTier2Amount
                });
            }
            if (goal.goalTier3StartYear) {
                dataProvider['segments'].push({
                    start: (goal.goalTier3StartYear === goal.goalTier3EndYear) ? (goal.goalTier3StartYear - 1).toString() : goal.goalTier3StartYear.toString(),
                    end: goal.goalTier3EndYear.toString(),
                    task: goal.goalTier3Amount
                });
            }
            this.dataProviderList.push(JSON.parse(JSON.stringify(dataProvider)));
            this.graphGoalList.push({
                balloonText: goal.description,
                fillAlphas: 0.8,
                lineAlpha: 0.3,
                title: goal.description,
                type: 'column',
                valueField: goal.description,
            });
        });
        const max = Math.max.apply(Math, this.graphTodayDoller.map(function (o) { return o.endYear; }));
        const min = Math.min.apply(Math, this.graphTodayDoller.map(function (o) { return o.startYear; }));
        for (let i = min; i <= max; i++) {
            const varObj = {};
            varObj['year'] = i;
            this.graphTodayDoller.forEach((data, index) => {
                if ((i > data.startYear && i < data.endYear) || i === data.startYear || i === data.endYear) {
                    // varObj[data.description] = data.graphDataPayloadList[0].amount;
                    varObj[data.description] = data.graphDataPayloadList.find(x => parseInt(x.year, 10) === parseInt(i, 10))['amount'];
                } else {
                    varObj[data.description] = 0;
                }
            });
            this.graphGoalListAmount.push(varObj);
        }
    }
    delete(goalId) {
        this.translate.get([
            'DELETE.POPUP.GOAL_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.GOAL_DELETE',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.GOAL_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.goalService.deleteGoal(goalId).toPromise().then(res => {
                        this.dataSharing.changeMessage('refresh_goals_list');
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.GOAL_DELETE'], 'success');
                        this.goalService.getClientGoalPayload(this.clientId);
                        this.portfolioService.getClientPortfolioPayload(this.clientId);
                    }).catch(err => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    });

                }
            });
        });
    }

    goalMapChange(event) {
        if (event.id === 2) {
            this.selectedOption = this.GOAL_REVENUE_QUERY_PARAM.CURRENT;
            this.selectedDropdownOption = event;
            this.chartData();
        } else if (event.id === 3) {
            this.selectedOption = this.GOAL_REVENUE_QUERY_PARAM.FUTURE;
            this.selectedDropdownOption = event;
            this.chartData();
        } else {
            this.selectedOption = '';
            this.selectedDropdownOption = event;
            this.chartData();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

