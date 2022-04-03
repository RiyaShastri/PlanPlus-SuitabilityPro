import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, getEngagementValue } from '../../../shared/app.reducer';

@Component({
    selector: 'app-values-tile',
    templateUrl: './values-tile.component.html',
    styleUrls: ['../../profile/engagement/engagement-summary/engagement-summary.component.css', './values-tile.component.css']
})
export class ValuesTileComponent implements OnInit, OnDestroy {

    engagementSummary = [];
    isEngagementSummaryLoaded = false;
    @Input() public clientId;
    unsubscribe$;

    constructor(
        private store: Store<AppState>
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getEngagementValue).subscribe(engagementSummary => {
            this.engagementSummary = engagementSummary;
            this.isEngagementSummaryLoaded = true;
        });
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
