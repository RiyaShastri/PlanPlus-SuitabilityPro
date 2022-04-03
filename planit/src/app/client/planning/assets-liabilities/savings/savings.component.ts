import { Store } from '@ngrx/store';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanningService, GoalService, ClientProfileService } from '../../../service';
import {
    AppState, getClientPayload,
} from '../../../../shared/app.reducer';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { GOAL_REVENUE_GRAPH_MAP, GOAL_REVENUE_QUERY_PARAM, GRAPH_TIER } from '../../../../shared/constants';
import { TranslateService } from '@ngx-translate/core';
import { chartColors } from '../../../client-models/chart-colors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';

@Component({
    selector: 'app-savings',
    templateUrl: './savings.component.html',
    styleUrls: ['./savings.component.css']
})

export class SavingsComponent implements OnInit, OnDestroy {
    clientId;
    allSavings = [];
    sortBy = [
        { id: 1, name: 'Account type', sortByText: 'ACCOUNTTYPE' },
        { id: 2, name: 'Portfolio', sortByText: 'PORTFOLIO' },
        { id: 3, name: 'Goals', sortByText: 'GOAL' }
    ];
    selectedSortBy = this.sortBy[0];
    viewBy = [
        { id: 1, name: 'Year' },
        { id: 2, name: 'Age' },
    ];
    selectedViewBy = this.viewBy[0];
    groupBy = [
        { id: 1, name: 'Goals' },
        { id: 2, name: 'None' },
    ];
    selectedGroupBy = this.groupBy[1];
    scenarioObject: Scenario[] = [];
    selectedScenario: Scenario = { id: '00', name: 'Current Scenario' };
    noSavings = true;
    graphTodayDoller = [];
    graphSavingListAmount = [];
    accessRights:any = {};
    graphSavingList = [];
    dataProviderList = [];
    GOAL_REVENUE_QUERY_PARAM = GOAL_REVENUE_QUERY_PARAM;
    selectedOption = this.GOAL_REVENUE_QUERY_PARAM.CURRENT;
    selectedDropdownOption;
    GOAL_REVENUE_GRAPH_MAP = GOAL_REVENUE_GRAPH_MAP;
    clientData = {};
    chartColors = chartColors;
    GRAPH_TIER = GRAPH_TIER;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private planningServices: PlanningService,
        private dataSharing: RefreshDataService,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private goalService: GoalService,
        private store: Store<AppState>,
        private translate: TranslateService,
        private clientProfile: ClientProfileService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.SAVINGS');
        this.angulartics2.eventTrack.next({ action: 'savingDetails' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    async ngOnInit() {
        this.accessRightService.getAccess(['SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

      
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
      
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            this.clientData = data;
        });
        this.translate.stream(['GRAPH.DROPDOWN.TIMELINE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.selectedDropdownOption = { id: GOAL_REVENUE_GRAPH_MAP.TIME_LINE_CHART, name: i18Text['GRAPH.DROPDOWN.TIMELINE'] };
        });
        this.getSavingsData();
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('refresh_savings_list')) {
                this.getSavingsData();
                this.dataSharing.changeMessage('default message');
            }
        });
    }

    async getSavingsData() {
        this.allSavings = [];
        this.noSavings = true;
        try {
            const response = await this.planningServices.getAllSavings(this.clientId, this.selectedSortBy.sortByText).toPromise();
            this.allSavings = await this.planningServices.processSavingsData(this.clientId, response);
            this.chartData();
            this.noSavings = false;
        } catch { }
    }

    async chartData() {
        if (this.selectedOption !== '') {
            await this.goalService.savingAllAccountGraph(this.clientId, this.selectedOption).toPromise().then(response => {
                if (response) {
                    this.graphTodayDoller = response;
                }
            }).catch(error => { });
        }
        this.graphSavingListAmount = [];
        this.graphSavingList = [];
        this.dataProviderList = [];
        this.allSavings.forEach((saving, index) => {
            const dataProvider = {
                category: (saving.description).trim() + ' (' + saving.linkedGoalDescription + ')',
                segments: []
            };
            saving.tierPayloadList.forEach((element, i) => {
                const dataProviderObj = {
                    end: element.endYear.toString(),
                    task: element.savingsAmount
                };
                let customLabel = '';
                dataProviderObj['start'] = element.startYear.toString();
                dataProviderObj['end'] = (element.endYear + 1).toString();
                dataProviderObj['startBalloon'] = element.startYear.toString();
                dataProviderObj['endBalloon'] = (element.endYear).toString();
                
                if (saving.tierPayloadList.length > 1) {
                    customLabel = this.GRAPH_TIER.TIER + ' ' + (i + 1);
                    dataProviderObj['color'] = this.chartColors[i];
                }
                dataProvider['segments'].push(dataProviderObj);
               
            });
            this.dataProviderList.push(JSON.parse(JSON.stringify(dataProvider)));
        });
        const max = Math.max.apply(Math, this.graphTodayDoller.map(function (o) { return o.endYear; }));
        const min = Math.min.apply(Math, this.graphTodayDoller.map(function (o) { return o.startYear; }));
        for (let i = min; i <= max; i++) {
            const varObj = {};
            varObj['year'] = i;
            this.graphTodayDoller.forEach((data, index) => {
                if ((i > data.startYear && i < data.endYear) || i === data.startYear || i === data.endYear) {
                    // varObj[data.description] = data.graphDataPayloadList[0].amount;
                    const desc = (data.description).trim();
                    const fetchData = data.graphDataPayloadList.find(x => parseInt(x.year, 10) === parseInt(i, 10));
                    const tierDescription = fetchData && fetchData['tierDescription'] ? fetchData['tierDescription'] : '';
                    varObj[desc + tierDescription] = data.graphDataPayloadList.find(x => parseInt(x.year, 10) === parseInt(i, 10))['amount'];
                } else {
                    const desc = (data.description).trim();
                    const fetchData = data.graphDataPayloadList.find(x => parseInt(x.year, 10) === parseInt(i, 10));
                    const tierDescription = fetchData && fetchData['tierDescription'] ? fetchData['tierDescription'] : '';
                    varObj[desc + tierDescription] = 0;
                }
            });
            this.graphSavingListAmount.push(varObj);
        }
    }

    displayViewBy(event) {
        this.selectedViewBy = event;
    }

    displayGroupBy(event) {
        this.selectedGroupBy = event;
        const index = this.sortBy.findIndex(x => x.name === 'Goals');
        if (this.selectedGroupBy.id === 1 && index !== -1) {
            this.sortBy.splice(index, 1);
        } else if (this.selectedGroupBy.id === 2 && index === -1) {
            this.sortBy.push({ id: 3, name: 'Goals', sortByText: 'GOAL' });
        }
    }

    savingMapChange(event) {
        if (event.id === this.GOAL_REVENUE_GRAPH_MAP.TODAY_DOLLAR) {
            this.selectedOption = this.GOAL_REVENUE_QUERY_PARAM.CURRENT;
            this.selectedDropdownOption = event;
            this.chartData();
        } else if (event.id === this.GOAL_REVENUE_GRAPH_MAP.FUTURE_DOLLAR) {
            this.selectedOption = this.GOAL_REVENUE_QUERY_PARAM.FUTURE;
            this.selectedDropdownOption = event;
            this.chartData();
        } else {
            this.selectedOption = '';
            this.selectedDropdownOption = event;
            this.chartData();
        }
    }

    sorting(event) {
        this.selectedSortBy = event;
        this.getSavingsData();
    }

    onSelectScenario(event) {
        this.selectedScenario = event;
        if(this.accessRights['SCENARIOACCESS']['accessLevel'] > 0){
            this.dataSharing.selectScenario(this.selectedScenario);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
