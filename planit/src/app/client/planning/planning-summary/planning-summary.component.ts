import { Store } from '@ngrx/store';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanningService } from '../../service';
import {
    AppState,
    getIsPlanningSummaryLoaded,
    getPlanningSummaryPayload,
    getAdvisorPayload
} from '../../../shared/app.reducer';
import { PageTitleService } from '../../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { AccessRightService } from '../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { UserAuthService } from '../../../auth/user-auth.service';

@Component({
    selector: 'app-planning-summary',
    templateUrl: './planning-summary.component.html',
    styleUrls: [
        '../../profile/summary/summary.component.css',
        './planning-summary.component.css',
    ]
})

export class PlanningSummaryComponent implements OnInit, OnDestroy {
    public clientId;
    public planningSummary: any = {};
    accessRights;
    planner: string;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private planningService: PlanningService,
        private pageTitleService: PageTitleService,
        private accessRightsService: AccessRightService,
        private authService: UserAuthService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'planningSummary' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_SUMMARY_TITLE');
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

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
        this.accessRightsService.getAccess(['CLI13_SP', 'EST01_SP', 'CLI05', 'CLI02', 'PEN01', 'POB01', 'ENTITY', 'MIGRATE']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { this.accessRights = res; });
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => this.planner = data['planner']);

    }

    handShake(clientId: string) {
        this.authService.handOffToPlanIt(this.planner, clientId).subscribe(x => window.location.href = x['ssoURL']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
