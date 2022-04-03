import { Store } from '@ngrx/store';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PlanningService } from '../../client/service/planning.service';
import {
    AppState,
    getIsPlanningSummaryLoaded,
    getPlanningSummaryPayload
} from '../../shared/app.reducer';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../shared/access-rights.service';


@Component({
    selector: 'app-planning-module-drop-down',
    templateUrl: './planning-module-drop-down.component.html',
    styleUrls: ['./planning-module-drop-down.component.css']
})
export class PlanningModuleDropDownComponent implements OnInit, OnDestroy {
    @Input() public clientId: string;
    public planningSummary;
    private unsubscribe$ = new Subject<void>();
    accessRights;

    constructor(
        private store: Store<AppState>,
        private planningService: PlanningService,
        private accessRightsService: AccessRightService
    ) { }

    ngOnInit() {
        this.store.select(getIsPlanningSummaryLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.store
                    .select(getPlanningSummaryPayload)
                    .pipe(takeUntil(this.unsubscribe$)).subscribe(clientProgress => (this.planningSummary = clientProgress));
            } else {
                this.planningService.getClientPlanningSummary(this.clientId);
            }
        });
        this.accessRightsService.getAccess(['CLI13_SP', 'EST01_SP', 'CLI05', 'CLI02', 'PEN01', 'POB01', 'ENTITY']).subscribe(res => { this.accessRights = res; });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
