import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { favUnfavChart } from '../../../../client-models/goal-analysis-charts';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { getCurrencySymbol } from '@angular/common';
import { AccessRightService } from '../../../../../shared/access-rights.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService } from '../../../../service';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-fevourable-unfavourable-tile',
    templateUrl: './fevourable-unfavourable-tile.component.html',
    styleUrls: ['./fevourable-unfavourable-tile.component.css']
})
export class FevourableUnfavourableTileComponent implements OnInit, OnDestroy {

    @Input() graphColours = [];
    @Input() currentFavourableData = [];
    @Input() strategyFavourableData = [];
    currencyPrefix = '$';
    currencyMask = createNumberMask({
        prefix: this.currencyPrefix
    });
    portfolioId;
    dataProvider = {};
    strategyDataProvider = {};
    graphs = [];
    strategyGraphs = [];
    titles = [];
    chartColors = [];
    strategyTitles = [];
    noData = false;
    noStrategyData = false;
    clientData = {};
    balloontextSum = [];
    strategyBalloontextSum = [];
    hasSolution = false;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private amcharts: AmChartsService,
        private route: ActivatedRoute,
        private accessRightService: AccessRightService,
        private portfolioService: PortfolioService,
        private store: Store<AppState>,
    ) { 
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.portfolioId = param['portfolioId'];
        });
        
        this.checkForSolution();
    }

    ngOnInit() {
        this.accessRightService.getAccess(['CURRSCENARIO','PORTANALYSIS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyPrefix = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
                this.currencyMask = createNumberMask({
                    prefix: this.currencyPrefix,
            });
        });
        // legend and legend color are fixed

        this.titles = ['GOALS.FAV_UNFAV.PENSION', 'GOALS.FAV_UNFAV.CAPITAL', 'GOALS.FAV_UNFAV.UNFAV', 'GOALS.FAV_UNFAV.FAV'];

        this.chartColors = ['#77AAFF', '#66CCEE', '#55DDAA', '#AADD55'];

        if (this.currentFavourableData.length > 0) {
            let allZero = true;
            let chartCurColors: string[] = [];
            // Sorting by to field
            this.currentFavourableData.sort((val1, val2) => {
                return val1.to - val2.to;
            });
            // need to assign the color to the correct name. Because of sorting by to field, now the order is not same
            for (let _i = 0; _i < this.currentFavourableData.length; _i++) {
                chartCurColors[_i] = this.getColor(this.currentFavourableData[_i]['id']);
            }

            this.currentFavourableData.forEach(element => {
                if (element.to !== 0) {
                    allZero = false;
                }
                this.balloontextSum['sum'] = element.to;
                this.dataProvider[element.name] = element.to - element.from;
                // this.titles.push(element.name);

                this.graphs.push({
                    balloonText: '[[title]]' + ' ' + this.currencyPrefix + this.balloontextSum['sum'],
                    fillAlphas: 0.8,
                    lineAlpha: 0.3,
                    title: element.name,
                    type: 'column',
                    valueField: element.name,
                    fixedColumnWidth: 100
                });

            }, this);

            if (allZero) {
                this.noData = true;
            }

            if (this.dataProvider && this.graphs && !allZero) {
                this.drawChart(this.dataProvider, this.graphs, 'currentFevUnfevDiv', favUnfavChart, chartCurColors);
            }
        } else {
            this.noData = true;
        }

        if (this.strategyFavourableData.length > 0) {
            let allZero = true;
            let chartStgColors = [];

            // sort the value by to field
            this.strategyFavourableData.sort((val1, val2) => {
                return val1.to - val2.to;
            });
            for (let _i = 0; _i < this.strategyFavourableData.length; _i++) {
                chartStgColors[_i] = this.getColor(this.strategyFavourableData[_i]['id']); // set color based on legend color
            }
            this.strategyFavourableData.forEach(element => {
                if (element.to !== 0) {
                    allZero = false;
                }
                this.strategyBalloontextSum['sum'] = element.to;
                this.strategyDataProvider[element.name] = element.to - element.from;
                this.strategyTitles.push(element.name);

                this.strategyGraphs.push({
                    balloonText: '[[title]]' + ' ' + this.currencyPrefix + this.strategyBalloontextSum['sum'],
                    fillAlphas: 0.8,
                    lineAlpha: 0.3,
                    title: element.name,
                    type: 'column',
                    valueField: element.name,
                    fixedColumnWidth: 100
                });

            }, this);
            if (allZero) {
                this.noStrategyData = true;
            }

            if (this.strategyDataProvider && this.strategyGraphs && !allZero) {
                setTimeout(() => {
                    this.drawChart(this.strategyDataProvider, this.strategyGraphs, 'alternativeFevUnfevDiv', favUnfavChart, chartStgColors); // pass chart color
                }, 300);
            }
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

    getColor(type: String) {
        if (type === 'PENSION') {
            return '#77AAFF';
        } else if (type === 'CAPITAL') {
            return '#66CCEE';
        } else if (type === 'UNFAV') {
            return '#55DDAA';
        } else if (type === 'FAV') {
            return '#AADD55';
        }
    }

    drawChart(dataProvider, graphs, id, obj, chartColors) {
        const favUnFavObj = {
            ...obj,
            colors: chartColors,
            dataProvider: [dataProvider],
            graphs: graphs,
            valueAxes: [{
                stackType: 'regular',
                axisAlpha: 0.3,
                gridAlpha: 0,
                unit: this.currencyPrefix,
                unitPosition: 'left',
                fontSize: 10,
            }],
        };
        setTimeout(() => {
            this.amcharts.makeChart(id, favUnFavObj);
        }, 1000);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
