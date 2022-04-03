import { Component, OnInit, OnDestroy } from '@angular/core';
import { RefreshDataService } from '../../shared/refresh-data';
import { AccessRightService } from '../../shared/access-rights.service';
import { Store } from '@ngrx/store';
import { AppState, getAllCountryFormatePayload, getAdvisorPayload } from '../../shared/app.reducer';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-cma',
    templateUrl: './cma.component.html',
    styleUrls: ['./cma.component.css']
})
export class CmaComponent implements OnInit, OnDestroy {
    public today = new Date();
    public lastReviewedDate = '';
    accessRights = {};
    dateFormat = '';
    private unsubscribe$ = new Subject<void>();
    constructor(
        private refreshDataService: RefreshDataService,
        private accessRightService: AccessRightService,
        private store: Store<AppState>,

    ) { }

    ngOnInit() {
        this.accessRightService.getAccess(['CMAROR', 'CMAINCDIST']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                const formatsByCountry = data;
                this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                    if (res) {
                        this.dateFormat = formatsByCountry[res['country']]['dateFormate'];
                    }
                });
            }
        });
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('lastReviewedDate|')) {
                const lastReviewedDate = message.replace('lastReviewedDate|', '');
                if (lastReviewedDate && lastReviewedDate !== undefined || lastReviewedDate !== null || lastReviewedDate !== '') {
                    this.lastReviewedDate = lastReviewedDate;
                } else {
                    this.lastReviewedDate = 'N/A';
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
