import { Location, getCurrencySymbol } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../../shared/animations';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

@Component({
    selector: 'app-apply-model',
    templateUrl: './apply-model.component.html',
    styleUrls: ['./apply-model.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class ApplyModelComponent implements OnInit, OnDestroy {
    closeButtonDisable = false;
    currencyMask = createNumberMask({
        prefix: '$'
    });
    portfolioModels = [
        { id: 1, description: 'All Income' },
        { id: 2, description: 'Income' },
        { id: 3, description: 'Income and Growth' },
        { id: 4, description: 'Balanced' },
        { id: 5, description: 'Growth and Income' },
        { id: 6, description: 'Growth' },
        { id: 7, description: 'All Equity' },
        { id: 8, description: 'Current' },
        { id: 9, description: 'Custom' }
    ];
    accountModel = {
        amount: '',
        chooseModel: this.portfolioModels[0]
    };
    clientData;
    unsubscribe$: any;
    constructor(
        private _location: Location,
        private store: Store<AppState>,
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getClientPayload).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
    }

    back() {
        this._location.back();
    }

    applyModel() {
        this._location.back();
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }
}
