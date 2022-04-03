import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-risk-capacity',
    templateUrl: './risk-capacity.component.html',
    styleUrls: ['./risk-capacity.component.css']
})
export class RiskCapacityComponent implements OnInit, OnDestroy {
    clientId;
    portfolioId;
    goalId;
    isEditableRoute;
    currentCashPercent;
    currentPage = 'analysis';
    isRiskCapacity = true;
    portfoliosLoaded = true;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioRiskCapacity' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });

        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
            this.goalId = params['goalId'];
        });
    }

    ngOnInit() { }
    switchPortfolio(emitedObject) {
        this.portfolioId = emitedObject['portfolioId'];
        this.goalId = emitedObject['goalId'];
        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'analysis', this.goalId]);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
