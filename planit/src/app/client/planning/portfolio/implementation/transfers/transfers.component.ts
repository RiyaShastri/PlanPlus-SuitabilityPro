import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../../shared/animations';
import { Location, getCurrencySymbol } from '@angular/common';
import * as $ from 'jquery';
import { Store } from '@ngrx/store';
import { AppState, getPortfolioPayload, getClientPayload } from '../../../../../shared/app.reducer';
import { ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-transfers',
    templateUrl: './transfers.component.html',
    styleUrls: ['./transfers.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class TransfersComponent implements OnInit, OnDestroy {
    public clientId;
    public portfolioId;
    currencyMask = createNumberMask({
        prefix: '$'
    });
    productModel = {
        'inKind': true
    };
    allSelected = false;
    portfolioDetailResponse;
    accountData;
    portfolioList = [];
    accountList = [];
    defaultPortfolio;
    totalTransferAmount;
    netAmount;
    productList = [
        {
            prodnum: 'PRODNUM1',
            prod_code: 'CIB480',
            prodsub: 'Non-Registered Investments'
        },
        {
            prodnum: 'PRODNUM1',
            prod_code: 'CAN_CLASS3',
            prodsub: 'fixed income'
        },
        {
            prodnum: 'PRODNUM1',
            prod_code: 'FID531',
            prodsub: 'Fidelity Canadian Large Cap Sr A'
        }
    ];
    public productData = [
        {
            id: '1',
            checked: false,
            productCode: 'CIB480',
            name: 'Non-Registerd Investments',
            amount: 10000,
            transferValue: 0,
            productName: 'PlanPlus Index product'
        },
        {
            id: '2',
            checked: false,
            productCode: 'CAN_CLASS3',
            name: 'fixed income',
            amount: 16000,
            transferValue: 0,
            productName: 'CIBC Assets manegement Inc'
        },
        {
            id: '3',
            checked: false,
            productCode: 'FID531',
            name: 'Fidelity Canadian Large Cap Sr A',
            amount: 5000,
            transferValue: 0,
            productName: 'RBC Global Asset Management Inc'
        },
    ];
    clientData = {};
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioTransferSidePanel' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.portfolioId = this.route.parent.snapshot.params['portfolioId'];
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        this.getPortfolioById();
        this.netAmount = 400000;
    }

    getPortfolioById() {
        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result.hasOwnProperty('portfolios') && result['portfolios'].length > 0 && (result.hasOwnProperty('clientId') && result['clientId'] === this.clientId)) {
                const portfolioData = result['portfolios'];
                const portfolioIndex = result['idMapping'][this.portfolioId];
                this.portfolioDetailResponse = portfolioData[portfolioIndex];
                if (portfolioIndex === -1 || portfolioIndex === undefined) {
                    return;
                }
                if (portfolioData) {
                    portfolioData.forEach(element => {
                        this.portfolioList.push({ id: element.id, description: element.description });
                    });
                }
            }
            this.accountData = this.portfolioDetailResponse.accountPayloads[0];
            this.accountList.push({ id: this.accountData.id, description: this.accountData.description });
        });
    }

    checkedSelect(event, data) {
        if (event === true) {
            data.checked = true;
            if (data.checked === true) {
                for (const element of this.productData) {
                    if (element.checked === false) {
                        this.allSelected = false;
                        break;
                    } else {
                        this.allSelected = true;
                    }
                }
            }
        } else {
            data.checked = false;
            this.allSelected = false;
        }
    }

    back() {
        this._location.back();
    }

    selectAll(event) {
        if (event === true) {
            this.productData.forEach(element => {
                if (event === true) {
                    element.checked = true;
                } else {
                    element.checked = false;
                }
            });
        } else {
            this.allSelected = false;
            this.productData.forEach(element => {
                element.checked = false;
            });
        }
    }

    totalTransfer(value?) {
        this.totalTransferAmount = 0;
        this.productData.forEach(element => {
            this.totalTransferAmount += element.transferValue;
        });
        this.netAmount = this.netAmount - this.totalTransferAmount;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
