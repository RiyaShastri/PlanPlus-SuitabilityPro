import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientProfileService } from '../../service';
import { ActivatedRoute } from '@angular/router';
import { getIsClientProgressLoaded, getClientProgressPayload, AppState } from '../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { NgxPermissionsService } from 'ngx-permissions';
import { environment } from '../../../../environments/environment';
import { PageTitleService } from '../../../shared/page-title';
import { AccessRightService } from '../../../shared/access-rights.service';
import { Angulartics2 } from 'angulartics2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit, OnDestroy {
    clientId;
    progressSummary = {};
    engagementRoute = [];
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private profileService: ClientProfileService,
        private ngxPermissionsService: NgxPermissionsService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'profileSummary' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PROFILE_SUMMARY_TITLE');
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['ENG01', 'RISKTOLERCLIENT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res){ this.accessRights = res; }});
        const permissions = this.ngxPermissionsService.getPermissions();
        if (permissions.hasOwnProperty('ADVISOR')) {
            this.engagementRoute = ['/client', this.clientId, 'profile', 'engagement', 'summary'];
        } else if (permissions.hasOwnProperty('PROFILER')) {
            this.engagementRoute = ['/client', this.clientId, 'profile', 'engagement', 'service-level'];
        }
        this.store.select(getIsClientProgressLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.store.select(getClientProgressPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientProgress => {
                    this.progressSummary = clientProgress;
                });
            } else {
                this.profileService.getClientProfileSummary(this.clientId);
            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
