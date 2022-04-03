import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanningService, ClientProfileService } from '../../../service';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';

@Component({
    selector: 'app-all-savings',
    templateUrl: './all-savings.component.html',
    styleUrls: ['./all-savings.component.css']
})
export class AllSavingsComponent implements OnInit, OnDestroy {

    clientId;
    allSavings = [];
    sortBy = [
        { id: 1, name: 'Account type', sortByText: 'ACCOUNTTYPE' },
        { id: 2, name: 'Portfolio', sortByText: 'PORTFOLIO' },
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
    selectedGroupBy = this.groupBy[0];
    scenarioObject : Scenario[] = [];
    selectedScenario : Scenario = {id:'00', name:'Current Scenario'};
    noSavings = true;
    private unsubscribe$ = new Subject<void>();
    accessRights:any = {};

    constructor(
        private route: ActivatedRoute,
        private planningServices: PlanningService,
        private dataSharing: RefreshDataService,
        private angulartics2: Angulartics2,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private clientProfile: ClientProfileService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.SAVINGS');
        this.angulartics2.eventTrack.next({ action: 'goalAllSavings' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    async ngOnInit() {
        this.accessRightService.getAccess(['SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

        await this.clientProfile.getClientScenarios(this.clientId).toPromise().then((result: any[]) => result.forEach(scenario => {
            this.scenarioObject.push({name : scenario.scenarioDescription, id: scenario.scenarioType})
            if(scenario.scenarioType == '00'){
                this.selectedScenario = {name : scenario.scenarioDescription, id: scenario.scenarioType};
            }
        }));

        this.dataSharing.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
            if(scenario){
                const scenarioExist = this.scenarioObject.find(scenarioInList => scenarioInList.id === scenario.id);
                if(scenarioExist){
                    this.selectedScenario = scenario;
                }
            }
            
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

        if(this.accessRights['SCENARIOACCESS']['accessLevel'] > 0){
            this.dataSharing.selectScenario(this.selectedScenario);
        }
        this.allSavings = [];
        this.noSavings = true;
        try {
            const response = await this.planningServices.getAllSavings(this.clientId, this.selectedSortBy.sortByText, this.selectedScenario.id).toPromise();
            this.allSavings = await this.planningServices.processSavingsData(this.clientId, response);
            this.noSavings = false;
        } catch {}

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

    onSelectScenario(event){
        this.selectedScenario = event;
        this.getSavingsData();
    }

    sorting(event) {
        this.selectedSortBy = event;
        this.getSavingsData();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
