import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlanningService, PortfolioService, GoalService } from '../../../service';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import * as $ from 'jquery';
import { Angulartics2 } from 'angulartics2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-investment-products',
    templateUrl: './investment-products.component.html',
    styleUrls: ['./investment-products.component.css']
})
export class InvestmentProductsComponent implements OnInit, OnDestroy {
    clientId;
    currencies;
    selectedCurrency;
    investmentStrategy;
    portfolioTypes = [{
        id: 'ALLPORTFOLIO',
        name: 'All Portfolios'
    }];
    selectedPortfolio = this.portfolioTypes[0];
    investmentProducts;
    totalCurrent;
    totalRecommended;
    clientData = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private planningServices: PlanningService,
        private goalService: GoalService,
        private portfolioService: PortfolioService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioInvestmentProduct' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.portfolioService.getListOfPortfolios(this.clientId).toPromise().then(res => {
            res.portfolios.forEach(p => {
                this.portfolioTypes.push({ id: p.id, name: p.description });
            });
        }).catch(err => { });
        this.goalService.getAllCurrencyDetail().toPromise().then(response => {
            const cadIndex = response.findIndex(r => r.isoCode === 'CAD');
            this.selectedCurrency = response[cadIndex];
            this.currencies = response;
            this.getInvestmentProducts();
        }).catch(err => { });
    }

    getInvestmentProducts() {
        this.planningServices.getInvestmentProducts(this.clientId, this.selectedPortfolio.id, this.selectedCurrency.isoCode)
            .toPromise().then(products => {
                this.investmentProducts = products;
                this.getTotalCurrent();
                this.getTotalRecommended();
            }).catch(err => {});
    }

    getSelectedCurrency(currency) {
        this.selectedCurrency = currency;
    }

    getTotalCurrent() {
        this.totalCurrent = this.investmentProducts.reduce((sum, account) => sum + account.totalAssets, 0);
    }

    getTotalRecommended() {
        this.totalRecommended = this.investmentProducts.reduce((sum, account) => sum + account.totalAssets, 0);

    }

    changeProductAction(index: number) {
        if ($('#dropdownProductAction' + index).is(':visible')) {
            $('.dropdown-product-action').hide();
        } else {
            $('.dropdown-product-action').hide();
            $('#dropdownProductAction' + index).toggle();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
