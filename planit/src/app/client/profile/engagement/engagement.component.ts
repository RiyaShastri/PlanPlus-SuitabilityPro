import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfileService } from '../../service';
import { RefreshDataService } from '../../../shared/refresh-data';
import { AccessRightService } from '../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-engagement',
    templateUrl: './engagement.component.html',
    styleUrls: ['./engagement.component.css']
})
export class EngagementComponent implements OnInit, OnDestroy {
    isEditInputField;
    serviceLevelPage = false;
    clientId;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private profileService: ClientProfileService,
        private router: Router,
        private refreshData: RefreshDataService,
        private accessRightService: AccessRightService
    ) {
        router.events.pipe(takeUntil(this.unsubscribe$)).subscribe((serviceLevel) => {
            if (this.router.url.indexOf('/service-level') > -1) {
                this.serviceLevelPage = true;
            } else {
                this.serviceLevelPage = false;
            }
        });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.refreshData.editServiceLevel.pipe(takeUntil(this.unsubscribe$)).subscribe(edit => {
            this.isEditInputField = edit;
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['ENG01', 'CLTYP', 'CLIVALUES', 'HMOGL']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.accessRights = res;
            }
        });
    }

    editServicePage() {
        this.isEditInputField = !this.isEditInputField;
        this.refreshData.changeEdit(this.isEditInputField);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
