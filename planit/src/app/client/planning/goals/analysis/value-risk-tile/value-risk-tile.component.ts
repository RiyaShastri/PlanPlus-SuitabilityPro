import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { valueAtRiskGraph } from '../../../../client-models';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { getCurrencySymbol } from '@angular/common';
import { AccessRightService } from '../../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { PortfolioService } from '../../../../service';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-value-risk-tile',
    templateUrl: './value-risk-tile.component.html',
    styleUrls: ['./value-risk-tile.component.css']
})
export class ValueRiskTileComponent implements OnInit, OnDestroy {

    @Input() graphColours = [];
    @Input() currentVaR = [];
    @Input() strategyVaR = [];
    currency;
    portfolioId;
    goalId;
    dataProvider = [];
    strategyDataProvider = [];
    noData = false;
    noStrategyData = false;
    clientData = {};
    accessRights = {};
    hasSolution = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private accessRightService: AccessRightService,
        private amcharts: AmChartsService,
        private portfolioService: PortfolioService,
        private store: Store<AppState>
    ) {
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.portfolioId = param['portfolioId'];
        });
       this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
        });
        this.checkForSolution();
    }

    async ngOnInit() {
        this.accessRightService.getAccess(['CURRSCENARIO','PORTANALYSIS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res } });
        if (this.currentVaR.length > 0) {
            this.currentVaR.forEach(riskValue => {
                this.dataProvider.push({ year: riskValue.year, riskValue: -riskValue.valueAtRisk.toFixed(2) });
            });
            this.drawChart(this.dataProvider, 'currentVaRDiv');
        } else {
            this.noData = true;
        }
        if (this.strategyVaR.length > 0) {
            this.strategyVaR.forEach(riskValue => {
                this.strategyDataProvider.push({ year: riskValue.year, riskValue: -riskValue.valueAtRisk.toFixed(2) });
            });
            setTimeout(() => {
                this.drawChart(this.strategyDataProvider, 'strategyVaRDiv');
            }, 1000);
        } else {
            this.noStrategyData = true;
        }
    }

    checkForSolution() {
        this.portfolioService.getRecommendedSolution(this.portfolioId).toPromise().then(data => {
            const implementedSolutions = <any>data;
            if (implementedSolutions.length > 0) {
                this.hasSolution = true;
            }
        }).catch(errorResponse => { });
    }

    drawChart(dataProvider, id) {
        const currency = this.currency;
        const valueAtRiskObj = JSON.parse(JSON.stringify(valueAtRiskGraph));
        valueAtRiskObj.categoryField = 'year';
        valueAtRiskObj.dataProvider = dataProvider;
        valueAtRiskObj.valueAxes = [{
            gridAlpha: 0.2,
            fillAlpha: 1,
            stackType: 'regular',
            labelFunction: function (number, label) {
                if (number === 0) {
                    label = currency + '-';
                } else {
                    label = currency + Math.abs(number).toLocaleString('en');
                }
                return label;
            }
        }];
        valueAtRiskObj.graphs = [{
            balloonText: '[[category]] : ' + this.currency + '[[value]]',
            fillAlphas: 1,
            title: 'Value at risk (VaR)',
            type: 'column',
            valueField: 'riskValue',
        }];

        setTimeout(() => {
            this.amcharts.makeChart(id, valueAtRiskObj);
        }, 1000);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
