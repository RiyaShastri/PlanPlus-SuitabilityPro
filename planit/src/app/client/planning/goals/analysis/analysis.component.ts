import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleService } from '../../../../shared/page-title';
import { Store } from '@ngrx/store';
import { AppState, getGraphColours } from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { GoalService } from '../../../service';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { chartColors } from '../../../client-models';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit, OnDestroy {

    @Input() public isRiskCapacity = false;

    clientId;
    goalId = '';
    isDisplay = false;
    graphColours = chartColors.slice();
    accessRights = {};
    plannum = '';
    savingsList = [];
    planningData: any;
    currentCashFlowData = null;
    strategyCashFlowData = null;
    currentInvestmentData = null;
    strategyInvestmentData = null;
    currentCertaintyData = '';
    strategyCertaintyData = '';
    valueOfAdviceData = '';
    currentFavourableData = '';
    strategyFavourableData = '';
    currentVaR = '';
    strategyVaR = '';
    activeIndex = [-1];
    changer = 0;
    dataLoaded = {
        'planningAlternatives': true,
        'cashFlowAnalysis': true,
        'investmentCapital': true,
        'certaintyOutcome': true,
        'favourableAndUnfavourable': true,
        'valueAtRisk': true,
        'valueOfAdvice': true
    };
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private router: Router,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private goalsService: GoalService,
        private accessRightService: AccessRightService,
        private sharedService: RefreshDataService
    ) {
        this.angulartics2.eventTrack.next({ action: 'goalAnalysis' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.GOAL_ANALYSIS_TITLE');
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.goalId = param['goalId'];
        });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['CERTY', 'GOALHIGHLEVEL', 'GOALASSUMPT', 'GOALFAVUNFAV', 'GOALVAR', 'GOALVOA']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.accessRights = res;
            if (this.accessRights['GOALASSUMPT']['accessLevel'] <= 0 && this.accessRights['GOALASSUMPT']['menuId']) {
                this.goalsService.syncGoalStrategies(this.clientId, this.goalId)
                    .pipe(takeUntil(this.unsubscribe$)).subscribe();
            }
        });
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.length > 0) {
                this.graphColours = res;
            }
        });

        this.getSavingsForAnalysis(false);

        this.sharedService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('assumptions updated')) {
                this.currentCertaintyData = '';
                this.strategyCertaintyData = '';
                this.activeIndex = [-1];
            }
        });
        this.sharedService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('planning alternatives updated')) {
                this.getSavingsForAnalysis(true);
                this.sharedService.changeMessage('default message');
            }
        });
        this.goalsService.observerSync().pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            this.currentCertaintyData = '';
            this.strategyCertaintyData = '';
            this.valueOfAdviceData = '';
            this.currentFavourableData = '';
            this.strategyFavourableData = '';
            this.currentVaR = '';
            this.strategyVaR = '';
            this.activeIndex = [-1];
            this.planningData = null;
          for (const key in this.dataLoaded) {
            if (this.dataLoaded.hasOwnProperty(key)) {
              this.dataLoaded[key] = true;
            }
          }
        });
    }

    onTabOpen(event) {
        const activeTabId = event['originalEvent']['currentTarget']['lastElementChild']['id'];
        if (!this.activeIndex.includes(event.index)) {
            this.activeIndex.push(event.index);
            if (activeTabId === 'planningAlternatives') {
                this.getPlanningAlternativesData(activeTabId);
            } else if (activeTabId === 'cashFlowAnalysis' || activeTabId === 'investmentCapital') {
                this.getDataForCashFlowAndInvestment(activeTabId);
            } else if (activeTabId === 'certaintyOutcome') {
                this.getDataForCertaintyOfOutcome(activeTabId);
            } else if (activeTabId === 'favourableAndUnfavourable') {
                this.getDataForFavourableUnFavourable(activeTabId);
            } else if (activeTabId === 'valueAtRisk') {
                this.getDataForValueAtRisk(activeTabId);
            } else if (activeTabId === 'valueOfAdvice') {
                this.getDataForValueOfAdvice(activeTabId);
            }
        }
    }

    getSavingsForAnalysis(callPlanningAPI = false) {
        this.goalsService.getSavingsForPlanningAlternatives(this.goalId, 'strategy scenario').toPromise().then(res => {
            if (res && res.length > 0) {
                this.savingsList = res;
                this.plannum = res[0].plannum;
                if (callPlanningAPI === true) {
                    this.currentCashFlowData = null;
                    this.currentInvestmentData = null;
                    this.strategyCashFlowData = null;
                    this.strategyInvestmentData = null;
                    this.getPlanningAlternativesData('planningAlternatives');
                    this.getDataForCashFlowAndInvestment('cashFlowAnalysis', 'investmentCapital');
                }
            }
        }).catch(() => { });
    }

    getPlanningAlternativesData(activeTabId) {
        this.dataLoaded[activeTabId] = false;
        this.planningData = null;
        if (this.plannum) {
            this.goalsService.getPlanningAlternativeGraphs(this.clientId, this.goalId, this.plannum, [], 'strategy scenario').toPromise().then(response => {
                this.planningData = response;
                this.dataLoaded[activeTabId] = true;
            }).catch(() => {
                this.dataLoaded[activeTabId] = true;
            });
        } else {
            this.dataLoaded[activeTabId] = true;
        }
    }

    async getDataForCashFlowAndInvestment(activeTabId, anothertab?) {
        if (this.plannum && this.currentCashFlowData === null && this.currentInvestmentData === null && this.strategyCashFlowData === null && this.strategyInvestmentData === null) {
            this.dataLoaded[activeTabId] = false;
            if (anothertab) {
                this.dataLoaded[anothertab] = false;
            }

            await this.goalsService.getPlanningAlternativeGraphs(this.clientId, this.goalId, this.plannum, [], 'current scenario').toPromise().then(currentResponse => {
                this.currentCashFlowData = currentResponse['graphResult']['incomeGraph'][0];
                this.currentInvestmentData = currentResponse['graphResult']['capitalGraph'][0];
            }).catch(() => { });

            await this.goalsService.getPlanningAlternativeGraphs(this.clientId, this.goalId, this.plannum, [], 'strategy scenario').toPromise().then(strategyResponse => {
                this.strategyCashFlowData = strategyResponse['graphResult']['incomeGraph'][0];
                this.strategyInvestmentData = strategyResponse['graphResult']['capitalGraph'][0];
            }).catch(() => { });

            this.dataLoaded[activeTabId] = true;
            if (anothertab) {
                this.dataLoaded[anothertab] = true;
            }
        }
    }

    async getDataForCertaintyOfOutcome(activeTabId) {
        this.dataLoaded[activeTabId] = false;
        await this.goalsService.getCertaintyOfOutcome(this.goalId, 'current scenario').toPromise().then(res => {
            this.currentCertaintyData = res;
        }).catch(() => { });
        await this.goalsService.getCertaintyOfOutcome(this.goalId, 'strategy scenario').toPromise().then(res => {
            this.strategyCertaintyData = res;
        }).catch(() => { });
        this.dataLoaded[activeTabId] = true;
    }

    async getDataForFavourableUnFavourable(activeTabId) {
        this.dataLoaded[activeTabId] = false;
        await this.goalsService.getFavourableAnalysis(this.goalId, 'current scenario').toPromise().then(response => {
            this.currentFavourableData = response;
        }).catch(() => { });
        await this.goalsService.getFavourableAnalysis(this.goalId, 'strategy scenario').toPromise().then(response => {
            this.strategyFavourableData = response;
        }).catch(() => { });
        this.dataLoaded[activeTabId] = true;
    }

    async getDataForValueAtRisk(activeTabId) {
        this.dataLoaded[activeTabId] = false;
        await this.goalsService.getValueRisk(this.goalId, 'current scenario').toPromise().then(response => {
            this.currentVaR = response;
        }).catch(() => { });
        await this.goalsService.getValueRisk(this.goalId, 'strategy scenario').toPromise().then(response => {
            this.strategyVaR = response;
        }).catch(() => { });
        this.dataLoaded[activeTabId] = true;
    }

    getDataForValueOfAdvice(activeTabId) {
        this.dataLoaded[activeTabId] = false;
        this.goalsService.getGoalValueOfAdvice(this.goalId).toPromise().then(res => {
            this.dataLoaded[activeTabId] = true;
            this.valueOfAdviceData = res;
        }).catch(() => {
            this.dataLoaded[activeTabId] = true;
        });
    }

    changeGoal(goalId) {
        this.goalId = goalId;
        this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + this.goalId + '/analysis']);
        this.planningData = null;
        this.currentCashFlowData = null;
        this.strategyCashFlowData = null;
        this.currentInvestmentData = null;
        this.strategyInvestmentData = null;
        this.currentCertaintyData = '';
        this.strategyCertaintyData = '';
        this.valueOfAdviceData = '';
        this.currentFavourableData = '';
        this.strategyFavourableData = '';
        this.currentVaR = '';
        this.strategyVaR = '';
        this.activeIndex = [-1];
        this.getSavingsForAnalysis(false);
        for (const key in this.dataLoaded) {
            if (this.dataLoaded.hasOwnProperty(key)) {
                this.dataLoaded[key] = true;
            }
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
