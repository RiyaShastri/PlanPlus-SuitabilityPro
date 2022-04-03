import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService, GoalService } from '../../../service';
import { Store } from '@ngrx/store';
import {
    AppState,
    getClientPayload
} from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-rebalancing-summary',
    templateUrl: './rebalancing-summary.component.html',
    styleUrls: ['./rebalancing-summary.component.css']
})
export class RebalancingSummaryComponent implements OnInit, OnDestroy {
    clientId;
    currencies;
    selectedCurrency;
    investmentStrategy;
    portfolioTypes = [{
        id: 'ALLPORTFOLIO',
        name: 'All Portfolios'
    }];
    selectedPortfolio = this.portfolioTypes[0];
    totalCurrentAllocation;
    totalModelWeighting;
    totalYourWeighting;
    clientData = {};
    rebalancingSummaries = [
        {
            assetClass: 'Cash',
            currentAllocation: {
                amount: 25000,
                percent: 25.0
            },
            modelWeighting: {
                amount: 5000,
                percent: 5.0
            },
            yourWeighting: {
                amount: 20000,
                percent: 16
            }
        },
        {
            assetClass: 'Short-term fixed income',
            currentAllocation: {
                amount: 25000,
                percent: 25.0
            },
            modelWeighting: {
                amount: 5000,
                percent: 5.0
            },
            yourWeighting: {
                amount: 25000,
                percent: 20
            }
        },
        {
            assetClass: 'Canadian equities',
            currentAllocation: {
                amount: 25000,
                percent: 25.0
            },
            modelWeighting: {
                amount: 50000,
                percent: 50.0
            },
            yourWeighting: {
                amount: 50000,
                percent: 40
            }
        },
        {
            assetClass: 'International equities',
            currentAllocation: {
                amount: 25000,
                percent: 25.0
            },
            modelWeighting: {
                amount: 40000,
                percent: 40.0
            },
            yourWeighting: {
                amount: 30000,
                percent: 24
            }
        }
    ];
    private unsubscribe$ = new Subject<void>();
    constructor(
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private goalService: GoalService,
        private portfolioService: PortfolioService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioRebalancingSummary' });
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
            this.getTotalCurrentAllocation();
            this.getTotalModelWeighting();
            this.getTotalYourWeighting();
        }).catch(err => { });
    }

    getTotalCurrentAllocation() {
        this.totalCurrentAllocation = this.rebalancingSummaries.reduce((sum, reb) => sum + reb.currentAllocation.amount, 0);
    }

    getTotalModelWeighting() {
        this.totalModelWeighting = this.rebalancingSummaries.reduce((sum, reb) => sum + reb.modelWeighting.amount, 0);
    }

    getTotalYourWeighting() {
        this.totalYourWeighting = this.rebalancingSummaries.reduce((sum, reb) => sum + reb.yourWeighting.amount, 0);
    }

    getSelectedCurrency(currency) {
        this.selectedCurrency = currency;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
