import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, GoalService, ClientProfileService } from '../../../service';
import { Angulartics2 } from 'angulartics2';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload, getFamilyMemberPayload } from '../../../../shared/app.reducer';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { PageTitleService } from '../../../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import { GOAL_REVENUE_GRAPH_MAP, GOAL_REVENUE_QUERY_PARAM } from '../../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'app-revenues',
    templateUrl: './revenues.component.html',
    styleUrls: ['./revenues.component.css']
})
export class RevenuesComponent implements OnInit, OnDestroy {
    GOAL_REVENUE_QUERY_PARAM = GOAL_REVENUE_QUERY_PARAM;
    public clientId;
    public goalId;
    public goals = [];
    public allRevenueData = [];
    public sortBy = [
        { id: 1, name: 'None' },
        { id: 2, name: 'Recipient' },
        { id: 3, name: 'Amount' },
    ];
    public selectedSortBy = this.sortBy[0];
    public viewBy = [
        { id: 1, name: 'Year', viewText: 'year' },
        { id: 2, name: 'Age', viewText: 'age' }
    ];
    public selectedViewBy = this.viewBy[0];
    public groupBy = [
        { id: 1, name: 'Goal' },
        { id: 2, name: 'None' },
    ];
    public selectedGroupBy = this.groupBy[0];
    scenarioObject : Scenario[] = [];
    selectedScenario : Scenario = {id:'00', name:'Current Scenario'};;
    public groupData;
    public groupValue;
    public dataProviderList = [];
    public goalList = [];
    public goalListAmount = [];
    public clientData = {};
    public familyData = {};
    showDropdown = true;
    revenueScenario;
    graphTodayDoller = [];
    selectedOption = this.GOAL_REVENUE_QUERY_PARAM.CURRENT;
    selectedDropdownOption;
    private unsubscribe$ = new Subject<void>();
    accessRights = {};
    entityYearByYearData = []
    entityYearByYearHeading = [];
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private planningService: PlanningService,
        private angulartics2: Angulartics2,
        private goalService: GoalService,
        private store: Store<AppState>,
        private refreshDataService: RefreshDataService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        public translate: TranslateService,
        private clientProfile: ClientProfileService,
        private modalService: NgbModal
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.REVENUES');
        this.angulartics2.eventTrack.next({ action: 'goalRevenues' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.clientId = param['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.goalId = param['goalId'];
            if(this.goalId){
                this.showDropdown = false;
            }
        });
    }

    async ngOnInit() {


        this.accessRightService.getAccess(['SCENARIOACCESS','SAV01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res) {
                    this.accessRights = res;
                }
            });


        await this.clientProfile.getClientScenarios(this.clientId).toPromise().then((result: any[]) => result.forEach(scenario => {
            this.scenarioObject.push({name : scenario.scenarioDescription, id: scenario.scenarioType})
            if(scenario.scenarioType == '00'){
                this.selectedScenario = {name : scenario.scenarioDescription, id: scenario.scenarioType};
            }
        }));

        this.refreshDataService.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
            if(scenario){
                const scenarioExist = this.scenarioObject.find(scenarioInList => scenarioInList.id === scenario.id);
                if(scenarioExist){
                    this.selectedScenario = scenario;
                }
            }
        });



        this.translate.stream(['GRAPH.DROPDOWN.TIMELINE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.selectedDropdownOption = { id: GOAL_REVENUE_GRAPH_MAP.TIME_LINE_CHART, name: i18Text['GRAPH.DROPDOWN.TIMELINE'] };
        });
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                data['familyMembers'].forEach(member => {
                    this.familyData[member.id] = member;
                }, this);
            }
        });
        await this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        await this.getRevenueData();
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('revenues_for_goal_added')) {
                this.getRevenueData();
                this.refreshDataService.changeMessage('default message');
            }
        });
    }

    async getRevenueData() {

        await this.goalService.getGoalsByClientId(this.clientId, this.selectedSortBy.name, 'age', this.selectedScenario.id).toPromise().then(response => {
            if (response) {
                response.forEach(goal => {
                    this.goals[goal.key] = {name: goal.description, allowEdit: goal.allowEdit};
                });
            }
        }).catch();
        if (this.goalId) {
            this.planningService.getRevenueByGoalId(this.clientId, this.goalId, 'age', this.selectedScenario.id).toPromise().then(res => {
                this.allRevenueData = res;
                if( this.allRevenueData.length > 0){
                    this.revenueScenario =  this.allRevenueData[0]['scenario'];
                    this.clientProfile.getClientScenarios(this.clientId).toPromise().then((result: any[]) => result.forEach(scenario => {
                        if(scenario.scenarioDescription == this.selectedScenario){
                            this.refreshDataService.selectScenario({name: scenario.scenarioDescription, id: scenario.scenarioType});
                        }
                    }));
                }else{
                    this.refreshDataService.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario =>{
                        if(scenario){
                            this.revenueScenario = scenario.name;
                        }
                    });
                }
                this.groupingData();
            });
        } else {
            this.planningService.getRevenuesByClientId(this.clientId, this.selectedSortBy.name, 'age', this.selectedScenario.id).toPromise().then(revenues => {
                this.allRevenueData = revenues;
                this.groupingData();
            });
        }
    }

    setYearByYear(entitynum){
      const entityRevenues = this.allRevenueData.filter(value => value.entitynum === entitynum);
      this.entityYearByYearHeading = [''];
      this.entityYearByYearData = [];
      let yearByYearTemp=[];
      entityRevenues.forEach(rev => {
        if(rev.yearByYear.length > 0) {
          this.entityYearByYearHeading.push(rev.description);
          yearByYearTemp.push(rev.yearByYear);
        }
      });
      if(yearByYearTemp.length > 0){
        for (let i = 0; i < yearByYearTemp[0].length; i++ ) {
          let yearByYearRow = [yearByYearTemp[0][i][0]];
          yearByYearTemp.forEach(val =>{yearByYearRow.push(val[i][1])});
          this.entityYearByYearData.push(yearByYearRow);
        }
      }

    }

  open(content) {
    this.modalService.open(content, {size: 'lg', windowClass:'revenue-modal'}).result.then((result) => {},(reason) => {});
  }

    async filterData() {
        await this.planningService.getRevenuesByClientId(this.clientId, this.selectedSortBy.name, 'age', this.selectedScenario.id).toPromise().then(revenues => {
            if (revenues) {
                this.allRevenueData = revenues;
                this.groupingData();
            }
        }).catch();
    }

    groupingData() {
        if (this.goalId) {
            const revenuesData = [];
            this.allRevenueData.forEach(revenue => {
                if (revenue.goalId === this.goalId) {
                    revenuesData.push(revenue);
                }
            });
            this.allRevenueData = revenuesData;
        }
        const groupData = {};
        const groupValues = [];
        this.allRevenueData.forEach(function (data) {
            // if (localStorage.getItem('revenueId') && localStorage.getItem('revenueId') === data.id) {
            //     localStorage.removeItem('revenueId');
            //     Swal('Deleted!', 'Revenue has been deleted successfully.', 'success');
            // }
            let groupByData;
            if (this.selectedGroupBy.name === 'None') {
                groupByData = this.selectedGroupBy.name;
            } else if (this.selectedGroupBy.name === 'Goal') {
                groupByData = data['goalId'];
            }
            if (!groupData.hasOwnProperty(groupByData)) {
                groupData[groupByData] = {
                    allData: []
                };
                groupValues.push(groupByData);
            }
            groupData[groupByData].allData.push(data);
        }, this);
        this.groupData = groupData;
        this.groupValue = groupValues;
        this.chartData();
    }

    async chartData() {
        this.goalListAmount = [];
        this.goalList = [];
        this.dataProviderList = [];
        if (this.selectedOption !== '') {
            await this.goalService.getRevenueGraphDataByClientId(this.clientId, this.selectedOption).toPromise().then(result => {
                if (result) {
                    this.graphTodayDoller = result;
                }
            }).catch(error => {});
        }
        this.groupValue.forEach(element => {
            this.groupData[element].allData.forEach((data, index) => {
                const dataObj = {
                    category: data.description,
                    segments: [{
                        start: (data.startYear === data.endYear) ? (data.startYear - 1).toString() : data.startYear.toString(),
                        end: data.endYear.toString(),
                        // start: data.startYear.toString(),
                        // end: data.endYear.toString(),
                        task: data.goalDescription
                    }]
                };
                this.goalList.push({
                    balloonText: data.description,
                    fillAlphas: 0.8,
                    lineAlpha: 0.3,
                    title: data.description,
                    type: 'column',
                    valueField: data.description ,
                });
                this.dataProviderList.push(JSON.parse(JSON.stringify(dataObj)));
            });
        });
        const max = Math.max.apply(Math, this.graphTodayDoller.map(function(o) { return o.endYear; }));
        const min = Math.min.apply(Math, this.graphTodayDoller.map(function(o) { return o.startYear; }));
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
            this.goalListAmount.push(varObj);
        }
    }

    changeGoal(goalId) {
        this.goalId = goalId;
        this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + goalId + '/revenues']);
        this.filterData();
    }

    displayViewBy(value) {
        this.selectedViewBy = value;
        // this.getRevenueData();
    }

    sorting(event) {
        this.selectedSortBy = event;
        this.filterData();
    }

    displayGroupBy(event) {
        this.selectedGroupBy = event;
        this.groupingData();
    }

    async onSelectScenario(event){
        this.selectedScenario = event;
        if(this.accessRights['SCENARIOACCESS']['accessLevel'] > 0){
            this.refreshDataService.selectScenario(this.selectedScenario);
        }
        await this.getRevenueData();
    }

    toggleActionMenu(id, index, indexValue) {
        if ($('#' + id + '_' + index + indexValue).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#' + id + '_' + index + indexValue).toggle();
        }
    }

    toggleGoalActionMenu(id, index) {
        if ($('#' + id + '_' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#' + id + '_' + index).toggle();
        }
    }

    deleteRevenue(data, index) {
        this.translate.get([
            'DELETE.POPUP.REVENUE_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.REVENUE_DELETE',
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
                    this.planningService.deleteRevenue(data.id).toPromise().then(response => {
                        Swal('success', i18MenuTexts['SWEET_ALERT.POPUP.REVENUE_DELETE'], 'success');
                        if (this.goalId) {
                            this.getRevenueData();
                        }
                        this.filterData();
                    }).catch(errorResponse => {
                        Swal('Oops...', errorResponse['error']['errorMessage'], 'error');
                    });
                }
            });
        });

    }



    revenueMapChange(event) {
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
