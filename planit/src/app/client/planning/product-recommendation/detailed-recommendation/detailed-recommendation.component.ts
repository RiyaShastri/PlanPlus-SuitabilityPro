import { Component, OnInit, OnDestroy } from '@angular/core';
import { Angulartics2 } from 'angulartics2';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { getCurrencySymbol } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-detailed-recommendation',
    templateUrl: './detailed-recommendation.component.html',
    styleUrls: ['./detailed-recommendation.component.css']
})
export class DetailedRecommendationComponent implements OnInit, OnDestroy {
    value = 5000;
    currencyMask = createNumberMask({
        prefix: '$'
    });
    clientData;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private angulartics2: Angulartics2,
        private store: Store<AppState>
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioDetailedRecommendation' });
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData) {
                this.currencyMask = createNumberMask({
                    prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
                });
            }
        });
    }

    currencyValue(val) {
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
