import { AmChartsService } from '@amcharts/amcharts3-angular';
import { riskScoreBadge } from '../../../../client-models/risk-group';
import { PortfolioService } from '../../../../service/index';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { StackedBarChartService } from '../../../../../shared/chart/stacked-bar-chart.service';
import { Store } from '@ngrx/store';
import {
    AppState,
    getClientPayload
} from '../../../../../shared/app.reducer';
import { getCurrencySymbol } from '@angular/common';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
@Component({
    selector: 'app-investor',
    templateUrl: './investor.component.html',
    styleUrls: ['./investor.component.css']
})
export class InvestorComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public clientId;
    @Input() public portfolioId;
    @Input() public isEditableRoute;
    @Input() public portfolioDetailResponse;
    @Output() public decisionMakerChanged = new EventEmitter();
    @Output() public investmentChanged = new EventEmitter();
    decisionMaker = '';
    totalInvested = null;
    familyMembers;
    allowAddInvestors = false;
    chartColor = ['#3b6cb8', '#779afc', '#779afc', '#CCDDAA'];
    currencyMask = createNumberMask({
        prefix: '$'
    });
    clientData = {};
    selectDecisionMaker = true;
    investorWithScore = 0;
    unsubscribe$: any;
    constructor(
        private store: Store<AppState>,
        private AmCharts: AmChartsService,
        private portfolioService: PortfolioService,
        private stackedBarChart: StackedBarChartService
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getClientPayload).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        if (this.portfolioDetailResponse['ownership'].length > 0) {
            this.decisionMaker = this.portfolioDetailResponse['decisionMaker']['decisionMaker'] ? this.portfolioDetailResponse['decisionMaker']['personalDetails']['id'] : '';

            let decisionMaker;
            if (this.portfolioDetailResponse['ownership'].length > 1) {
                this.portfolioDetailResponse['ownership'].forEach(investor => {
                    if (investor.riskScore) {
                        decisionMaker = investor.personalDetails.id;
                        this.investorWithScore++;
                    }
                });
                if (this.investorWithScore === 1) {
                    this.decisionMaker = decisionMaker;
                    this.selectDecisionMaker = false;
                }
            }
            this.decisionMakerChanged.emit(this.decisionMaker);
        }
        this.portfolioService.getInvestorsList(this.clientId, this.portfolioId).toPromise().then(response => {
            this.allowAddInvestors = (response.length > 0) ? true : false;
        }).catch(error => {
        });
    }

    ngOnChanges(changes) {
        if (changes.portfolioId || changes.portfolioDetailResponse) {
            this.portfolioService.getInvestorsList(this.clientId, this.portfolioId).toPromise().then(response => {
                this.allowAddInvestors = (response.length > 0) ? true : false;
            }).catch(error => { });
        }
        if (changes.portfolioDetailResponse && this.portfolioDetailResponse['ownership'].length > 0) {
            if (!this.portfolioDetailResponse['decisionMaker']) {
                this.decisionMaker = this.portfolioDetailResponse['ownership'][0]['personalDetails']['id'];
            }
            let decisionMaker;
            this.investorWithScore = 0;
            this.selectDecisionMaker = true;
            this.decisionMaker = this.portfolioDetailResponse['decisionMaker']['decisionMaker'] ? this.portfolioDetailResponse['decisionMaker']['personalDetails']['id'] : '';
            if (this.portfolioDetailResponse['ownership'].length > 1) {
                this.portfolioDetailResponse['ownership'].forEach(investor => {
                    if (investor.riskScore) {
                        decisionMaker = investor.personalDetails.id;
                        this.investorWithScore++;
                    }
                });
                if (this.investorWithScore === 1) {
                    this.decisionMaker = decisionMaker;
                    this.selectDecisionMaker = false;
                }
            }
            this.decisionMakerChanged.emit(this.decisionMaker);
            this.investorsProgressChart(changes.portfolioDetailResponse.currentValue.ownership);
            this.totalInvested = changes.portfolioDetailResponse.currentValue.ownership.reduce((sum, investor) => sum + investor.invested, 0);
            this.changeTotalInvestment(this.totalInvested);
        } else {
            this.totalInvested = null;
            this.investorsProgressChart([]);
        }
    }

    getRiskBadge(score) {
        return riskScoreBadge(score).label;
    }

    changeDecisionMaker(event) {
        this.decisionMakerChanged.emit(event);
    }

    changeTotalInvestment(data) {
        this.investmentChanged.emit(data);
    }

    private investorsProgressChart(response) {
        const graphsData = [];
        const dataProvider = [{
            accounttype: 1
        }];
        response.forEach((res, index) => {
            const key = res.personalDetails.id.toLowerCase();
            dataProvider[0][key] = res.percent;
            graphsData.push({
                balloonText: '[[title]]: <b>[[value]]%</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[index],
                lineColor: '#FFFFFF',
                title: res.personalDetails.firstName,
                type: 'column',
                color: '#000000',
                valueField: res.personalDetails.id.toLowerCase(),
                fixedColumnWidth: 11
            });
        });
        setTimeout(() => {
            this.AmCharts.makeChart(
                'investorChart',
                this.stackedBarChart.commonOption(dataProvider, graphsData)
            );
        }, 100);
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
