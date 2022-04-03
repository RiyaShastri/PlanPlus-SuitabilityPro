import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AppState, getEngagementPriority } from '../../../shared/app.reducer';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-priorities-tile',
    templateUrl: './priorities-tile.component.html',
    styleUrls: ['./priorities-tile.component.css']
})
export class PrioritiesTileComponent implements OnInit, OnDestroy {

    clientPriorities = [];
    isClientPrioritiesLoaded = false;
    @Input() public clientId;
    unsubscribe$;

    constructor(
        private store: Store<AppState>
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getEngagementPriority).subscribe(priorities => {
            this.isClientPrioritiesLoaded = true;
            this.clientPriorities = priorities;
        });
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
