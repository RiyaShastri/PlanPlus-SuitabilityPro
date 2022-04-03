import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService } from '../../../service/planning.service';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { ClientProfileService } from '../../../service';

@Component({
    selector: 'app-savings-individual',
    templateUrl: './savings-individual.component.html',
    styleUrls: ['./savings-individual.component.css']
})
export class SavingsIndividualComponent implements OnInit, OnDestroy {
    clientId;
    goalId;
    allSavings = [];
    viewBy = [
        { id: 1, name: 'Year' },
        { id: 2, name: 'Age' },
    ];
    selectedViewBy = this.viewBy[0];
    selectedGroupBy = { id: 1, name: 'Goals' };
    noSavings = true;
    accessRights = {};
    selectedScenario: Scenario = {id: '00', name: 'Current Scenario'};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private planningServices: PlanningService,
        private dataSharing: RefreshDataService,
        private angulartics2: Angulartics2,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private clientProfile: ClientProfileService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.SAVING_DETAIL');
        this.angulartics2.eventTrack.next({ action: 'goalIndividualSavings' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.goalId = this.route.snapshot.params['goalId'];
    }

    ngOnInit() {
        this.accessRightService.getAccess(['SAV01', 'SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

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
            const response = await this.planningServices.getSavingsByGoalId(this.goalId).toPromise();

            if(response.length > 0){
                this.selectedScenario = response[0]['scenario'];
                await this.clientProfile.getClientScenarios(this.clientId).toPromise().then((result: any[]) => result.forEach(scenario => {
                    if(scenario.scenarioDescription == this.selectedScenario){
                        this.dataSharing.selectScenario({name: scenario.scenarioDescription, id: scenario.scenarioType});
                    }
                }));
            }else{
                this.dataSharing.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario =>{
                    if(scenario){
                        this.selectedScenario = scenario;
                    }
                });
            }
            

            this.allSavings = await this.planningServices.processSavingsData(this.clientId, response);
            this.noSavings = false;
        } catch { }
    }

    changeGoal(goalId) {
        this.goalId = goalId;
        this.router.navigate(['/client/' + this.clientId + '/planning/goals/' + goalId + '/savings']);
        this.getSavingsData();
    }

    displayViewBy(event) {
        this.selectedViewBy = event;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }


}
