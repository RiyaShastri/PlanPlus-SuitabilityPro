import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { Store } from '@ngrx/store';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { investmentCapitalChart } from '../../../../client-models/goal-analysis-charts';
@Component({
    selector: 'app-investment-capital-tile',
    templateUrl: './investment-capital-tile.component.html',
    styleUrls: ['./investment-capital-tile.component.css']
})
export class InvestmentCapitalTileComponent implements OnInit, OnDestroy {

    @Input() graphColours = [];
    @Input() currentData;
    @Input() strategyData;

    currency = '';
    noCurrentGraph = true;
    noStrategyGraph = true;
    currentDataProvider = [];
    strategyDataProvider = [];
    unsubscribe$: any;

    constructor(
        private amcharts: AmChartsService,
        private store: Store<AppState>,
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getClientPayload).subscribe(clientData => {
            if (clientData) {
                this.currency = getCurrencySymbol(clientData['currencyCode'], 'narrow');
            }
        });
        if (this.currentData && this.currentData.length > 0) {
            this.noCurrentGraph = false;
            this.makeInvestmentDataProvider(this.currentData, 'currentInvestmentDiv', this.currentDataProvider);
        }
        if (this.strategyData && this.strategyData.length > 0) {
            this.noStrategyGraph = false;
            setTimeout(() => {
                this.makeInvestmentDataProvider(this.strategyData, 'alternateInvestmentDiv', this.strategyDataProvider);
            }, 500);
        }
    }

    makeInvestmentDataProvider(capitalGraph, container, dataProvider) {
        const graphs = [];
        capitalGraph.forEach((element, index) => {
            const obj = {};
            let graph;
            obj['year'] = element['year'];
            element.accounts.forEach(account => {
                obj[account.description] = account.capital;
                graph = {
                    balloonText: account.description + ': ' + this.currency + '[[' + account.description + ']]',
                    fillAlphas: 1,
                    lineAlpha: 0,
                    gridAlpha: 0,
                    gridThickness: 0,
                    title: account.description,
                    valueField: account.description
                };
                if (index === 0) {
                    graphs.push(graph);
                }
            });
            dataProvider.push(obj);
        });

        const investmentGraphObj = JSON.parse(JSON.stringify(investmentCapitalChart));
        investmentGraphObj.colors = this.graphColours;
        investmentGraphObj.dataProvider = dataProvider;
        investmentGraphObj.graphs = graphs;
        setTimeout(() => {
            this.amcharts.makeChart(container, investmentGraphObj);
        }, 1000);
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
