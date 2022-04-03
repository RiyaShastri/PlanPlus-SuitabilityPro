import { Component, OnInit, Input } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { getClientPayload, AppState } from '../../../../../shared/app.reducer';
import { cashFlowChart } from '../../../../client-models/goal-analysis-charts';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-cash-flow-tile',
    templateUrl: './cash-flow-tile.component.html',
    styleUrls: ['./cash-flow-tile.component.css']
})
export class CashFlowTileComponent implements OnInit {

    @Input() graphColours = [];
    @Input() currentData;
    @Input() strategyData;

    currency = '';
    currentDataProvider = [];
    strategyDataProvider = [];
    noCurrentGraph = true;
    noStrategyGraph = true;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private amcharts: AmChartsService,
        private store: Store<AppState>,
        public translate: TranslateService,
    ) { }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData) {
                this.currency = getCurrencySymbol(clientData['currencyCode'], 'narrow');
            }
        });
        if (this.currentData && this.currentData.length > 0) {
            this.noCurrentGraph = false;
            this.makeCashFlowDataProvider(this.currentData, 'currentCashFlowDiv', this.currentDataProvider);
        }
        if (this.strategyData && this.strategyData.length > 0) {
            this.noStrategyGraph = false;
            setTimeout(() => {
                this.makeCashFlowDataProvider(this.strategyData, 'alternativeCashFlowDiv', this.strategyDataProvider);
            }, 500);
        }
    }

    makeCashFlowDataProvider(cashFlow, container, dataProvider) {
        const graphs = [];
        cashFlow.forEach((element, index) => {
            const obj = {};
            let graph;
            obj['year'] = element['year'];

            obj[element.goalName] = element.fundedAmt;
            obj['shortfall'] = element.shortfall;
            graph = {
                balloonText: element.goalName + ': ' + this.currency + '[[' + element.goalName + ']]',
                fillAlphas: 1,
                lineAlpha: 0,
                gridAlpha: 0,
                gridThickness: 0,
                title: element.goalName,
                valueField: element.goalName
            };
            if (index === 0) {
                graphs.push(graph);
            }
            dataProvider.push(obj);
        });
        this.translate.get([
            'GOAL.ANALYSIS.LABEL.SHORTFALL_TO_ACHIEVE_OBJECTIVES',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            graphs.push({
                balloonText: text['GOAL.ANALYSIS.LABEL.SHORTFALL_TO_ACHIEVE_OBJECTIVES'] + ': ' + this.currency + '[[shortfall]]',
                fillAlphas: 1,
                lineAlpha: 0,
                title: text['GOAL.ANALYSIS.LABEL.SHORTFALL_TO_ACHIEVE_OBJECTIVES'],
                valueField: 'shortfall'
            });
        });

        const cashFlowGraphObj = JSON.parse(JSON.stringify(cashFlowChart));
        cashFlowGraphObj.colors = this.graphColours;
        cashFlowGraphObj.dataProvider = dataProvider;
        cashFlowGraphObj.graphs = graphs;

        setTimeout(() => {
            this.amcharts.makeChart(container, cashFlowGraphObj);
        }, 1000);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
