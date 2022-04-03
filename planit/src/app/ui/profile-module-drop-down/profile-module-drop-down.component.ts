import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ClientProfileService } from '../../client/service';
import { getClientProgressPayload, AppState, getIsClientProgressLoaded } from '../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { SetClientProgress } from '../../shared/app.actions';
import { NgxPermissionsService } from 'ngx-permissions';
import { environment } from '../../../environments/environment';
import { AccessRightService } from '../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-profile-module-drop-down',
    templateUrl: './profile-module-drop-down.component.html',
    styleUrls: ['./profile-module-drop-down.component.css']
})
export class ProfileModuleDropDownComponent implements OnInit, OnDestroy {
    progressSummary = {};
    @Input() public clientId: string;
    engagementRoute = [];
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private profileService: ClientProfileService,
        private ngxPermissionsService: NgxPermissionsService,
        private store: Store<AppState>,
        private accessRightService: AccessRightService
    ) { }

    ngOnInit() {
        const permissions = this.ngxPermissionsService.getPermissions();
        if (permissions.hasOwnProperty('ADVISOR')) {
            this.engagementRoute = ['/client', this.clientId, 'profile', 'engagement', 'summary'];
        } else if (permissions.hasOwnProperty('PROFILER')) {
            this.engagementRoute = ['/client', this.clientId, 'profile', 'engagement', 'service-level'];
        }
        this.store.select(getIsClientProgressLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.store.select(getClientProgressPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientProgress => (this.progressSummary = clientProgress));
            } else {
                this.profileService.getProfileSummary(this.clientId).toPromise().then(summaryData => {
                    this.progressSummary = summaryData;
                    this.store.dispatch(new SetClientProgress(summaryData));
                });
            }
        });

        this.accessRightService.getAccess(['ENG01', 'RISKTOLERCLIENT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.accessRights = res;
            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
