import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from '../../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { ClientProfileService } from '../../service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-risk-tolerance',
    templateUrl: './risk-tolerance.component.html',
    styleUrls: ['./risk-tolerance.component.css']
})

export class RiskToleranceComponent implements OnInit, OnDestroy {
    clientId: string;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private profileService: ClientProfileService
    ) {
        this.angulartics2.eventTrack.next({ action: 'riskToleranceList' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.RISK_TOLERANCE_LIST_TITLE');
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.profileService.getProgressIndicator(this.clientId);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
