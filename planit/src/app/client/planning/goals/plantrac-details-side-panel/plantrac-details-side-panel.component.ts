import { Component, OnInit, EventEmitter, Output, Input, OnDestroy } from '@angular/core';

import { slideInOutAnimation } from '../../../../shared/animations';
import { Angulartics2 } from 'angulartics2';
import { GoalService } from '../../../service';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import { getCurrencySymbol } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { PLANTRAC_TIME_PERIODS, PLANTRAC_VIEW_BY_OPTIONS, PERSON_RELATION } from '../../../../shared/constants';

@Component({
    selector: 'app-plantrac-details-side-panel',
    templateUrl: './plantrac-details-side-panel.component.html',
    styleUrls: ['./plantrac-details-side-panel.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class PlantracDetailsSidePanelComponent implements OnInit, OnDestroy {
    @Input() goalId = '';
    @Input() filter = '';
    @Input() viewBy = PLANTRAC_VIEW_BY_OPTIONS.TYPE;
    @Input() timePeriodOptions = [];
    @Input() defaultTimePeriod = {};
    @Output() closePanelEvent = new EventEmitter();

    selectedTimePeriod = {};
    planTracDetails = [];
    clientData;
    currency = '$';
    ownerList: any;
    plantracViewByOptions = PLANTRAC_VIEW_BY_OPTIONS;
    unsubscribe$: any;
    PERSON_RELATION = PERSON_RELATION;
    constructor(
        private angulartics2: Angulartics2,
        private goalService: GoalService,
        private store: Store<AppState>,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'planTracDetailSidepanel' });
    }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getClientPayload).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
        });
        this.selectedTimePeriod = this.defaultTimePeriod;
        this.getPlanTracDetails();
    }

    getPlanTracDetails() {
        this.goalService.getPlanTracSavingsDetails(this.goalId, this.filter, this.selectedTimePeriod['id'], this.viewBy).toPromise().then(async res => {
            if (this.viewBy === PLANTRAC_VIEW_BY_OPTIONS.ACCOUNT) {
                this.planTracDetails = await [res];
                if (this.planTracDetails[0]['savingsWithdrawalsAnalysis']['savings']['planTracSavings']
                    && this.planTracDetails[0]['savingsWithdrawalsAnalysis']['savings']['planTracSavings'].length > 0) {
                    this.ownerList = this.planTracDetails[0]['savingsWithdrawalsAnalysis']['savings']['planTracSavings'][0]['ownerDetails'];
                }
            } else {
                this.planTracDetails = await res;
                this.ownerList = [];
                this.planTracDetails.forEach(item => {
                    if (item['savingsWithdrawalsAnalysis']['savings']['planTracSavings'] && item['savingsWithdrawalsAnalysis']['savings']['planTracSavings'].length > 0) {
                        const list = item['savingsWithdrawalsAnalysis']['savings']['planTracSavings'][0]['ownerDetails'];
                        this.ownerList[item['accountId']] = list;
                    }
                });
            }
        });
    }

    changeTimePeriod(value) {
        this.selectedTimePeriod = value;
        this.getPlanTracDetails();
    }

    closePanel() {
        this.closePanelEvent.emit();
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
