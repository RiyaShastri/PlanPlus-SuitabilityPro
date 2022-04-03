import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { RefreshDataService } from '../../shared/refresh-data';
import { Store } from '@ngrx/store';
import { AppState, getAllCountryFormatePayload, getAdvisorPayload } from '../../shared/app.reducer';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-settings-header',
    templateUrl: './settings-header.component.html',
    styleUrls: ['./settings-header.component.css']
})
export class SettingsHeaderComponent implements OnInit, OnDestroy {

    @Input() currentPage;
    @Input() lastUpdatedDate ?= '';
    dateFormat = '';
    private unsubscribe$ = new Subject<void>();
    constructor(
        private refreshDataService: RefreshDataService,
        private store: Store<AppState>,
    ) { }

    ngOnInit() {
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('PJM_last_updated_data|')) {
                this.lastUpdatedDate = message.replace('PJM_last_updated_data|', '');
            }
            if (message.includes('IPS_last_updated_data|')) {
                this.lastUpdatedDate = message.replace('IPS_last_updated_data|', '');
            }
        });
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
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
