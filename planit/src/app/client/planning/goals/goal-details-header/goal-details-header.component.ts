import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { getGoalPayload, AppState } from '../../../../shared/app.reducer';
import { GoalService } from '../../../service';
import {environment} from '../../../../../environments/environment';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-goal-details-header',
    templateUrl: './goal-details-header.component.html',
    styleUrls: ['./goal-details-header.component.css']
})
export class GoalDetailsHeaderComponent implements OnInit, OnDestroy {

    @Input() clientId;
    @Input() currentPage;
    @Input() goalId;
    @Input() scenarioType;
    @Input() plantracStatus?= 0;
    @Input() refreshedOn?= '';
    @Output() switchGoal = new EventEmitter();
    goals: any;
    goalDescription: string;
    scenario = [
        { id: 1, name: 'Retirement' },
        { id: 2, name: 'Other' }
    ];
    selectedScenario = this.scenario[0];
    today: number = Date.now();
    environment = {};
    accessRights = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private goalService: GoalService,
        private store: Store<AppState>,
        private accessRightService: AccessRightService
    ) {
        this.goalId = '1';
      this.environment = environment;
    }

    async ngOnInit() {
        this.goalService.getGoalsByClientId(this.clientId, 'goal_type' , 'age', this.scenarioType).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.goals = data;
                if (this.goals.length > 0) {
                    let filteredGoal = this.goals.find(g => g.key === this.goalId);
                    this.goalDescription = filteredGoal['description'];
                    }
                    
                }
                // this.goalDescription = this.goals[this.goals.findIndex(g => g.key === this.goalId)]['description'];
        });
        this.accessRightService.getAccess(['PLANTRAC', 'SAV01', 'MODGL', 'PEN01', 'CLI02']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res){ this.accessRights = res}});
    }

    sorting(event) { }

    changeGoal(goalId, description) {
        this.goalId = goalId;
        // this.goalDescription = this.goals[this.goals.findIndex(g => g.key === goalId)]['description'];
        this.goalDescription = description;
        this.switchGoal.emit(goalId);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
