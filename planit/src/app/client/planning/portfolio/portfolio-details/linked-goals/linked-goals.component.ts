import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { StackedBarChartService } from '../../../../../shared/chart/stacked-bar-chart.service';
import { Store } from '@ngrx/store';
import {
    AppState,
    getClientPayload,
    getGraphColours
} from '../../../../../shared/app.reducer';
import Swal from 'sweetalert2';
import { GoalService, PortfolioService } from '../../../../service';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';
import { getCurrencySymbol } from '@angular/common';
import { chartColors } from '../../../../client-models';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../../shared/access-rights.service';

@Component({
    selector: 'app-linked-goals',
    templateUrl: './linked-goals.component.html',
    styleUrls: ['./linked-goals.component.css']
})
export class LinkedGoalsComponent implements OnInit, OnChanges, OnDestroy {
    @Input() clientId;
    @Input() portfolioId;
    @Input() isEditableRoute;
    @Input() goalResponse;

    dataProvider = [{
        accounttype: 1
    }];
    graphsData = [];
    chartColor = chartColors.slice();
    clientData = {};
    totalAssets = 0;
    totalAllocated = 0;
    allocatedPercent = 0;
    linkedGoals = null;
    currency;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private store: Store<AppState>,
        private AmCharts: AmChartsService,
        private stackedBarChart: StackedBarChartService,
        private goalService: GoalService,
        private dataSharing: RefreshDataService,
        private portfolioService: PortfolioService,
        public accessRightService: AccessRightService,
        public translate: TranslateService
    ) { }

    ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.chartColor = res['allGraphColours'];
            }
        });
        this.accessRightService.getAccess(['SAV01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
        });
    }

    getLinkedGoalsDetails() {
        this.linkedGoals = {};
        this.portfolioService.getLinkedGoalsOfPortfolios(this.clientId).toPromise().then(res => {
            const portfolio = res.find(p => p.portfolioId === this.portfolioId);
            this.totalAssets = portfolio['total'];
            if (portfolio['linkedGoalToPortfolioPayloadList']) {
                this.totalAllocated = portfolio['total'] - portfolio['totalUnallocated'];
                if (this.totalAssets === 0) {
                    this.allocatedPercent = 0;
                } else {
                    this.allocatedPercent = this.totalAllocated / this.totalAssets;
                }
                portfolio['linkedGoalToPortfolioPayloadList'].forEach(goal => {
                    if (goal.type === 'amount') {
                        this.linkedGoals[goal.keyobjnum] = goal.value;
                    } else if (goal.type === 'percentage') {
                        const amount = (goal.value * portfolio['total']) / 100;
                        this.linkedGoals[goal.keyobjnum] = amount;
                    }
                });
                if (this.goalResponse && this.linkedGoals) {
                    this.goalResponse.forEach(goal => {
                        goal['from_to'] = goal['startYear'] + '-' + goal['endYear'];
                        if (this.linkedGoals.hasOwnProperty(goal.id)) {
                            goal['allocatedAmount'] = this.linkedGoals[goal.id];
                        }
                    });
                    this.investorsProgressChart(this.goalResponse);
                }
            }
        });
    }

    ngOnChanges(changes) {
        if (changes && changes.hasOwnProperty('goalResponse')) {
            this.linkedGoals = null;
            this.totalAssets = 0;
            this.totalAllocated = 0;
            this.allocatedPercent = 0;
            this.graphsData = [];
            this.getLinkedGoalsDetails();
        }
    }

    investorsProgressChart(response) {
        response.forEach((res, index) => {
            const key = res.description;
            this.dataProvider[0][key] = res['allocatedAmount'];
            this.graphsData.push({
                balloonText: '<span>[[title]]: <b>' + this.currency + '[[value]]</b></span>',
                fillAlphas: 1,
                fillColors: this.chartColor[index],
                lineColor: '#FFFFFF',
                title: res.description,
                type: 'column',
                color: '#000000',
                valueField: res.description,
                fixedColumnWidth: 11
            });
        });
        setTimeout(() => {
            this.AmCharts.makeChart(
                'linkedGoalChart',
                this.stackedBarChart.commonOption(this.dataProvider, this.graphsData)
            );
        }, 100);
    }

    getGoalTotal(): number {
        return this.goalResponse.reduce((sum, item) => sum + item.amountPerYear, 0);
    }

    changeAction(index: number) {
        if ($('#dropdownGoalAction' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#dropdownGoalAction' + index).toggle();
        }
    }

    delete(goalId) {
        this.translate.get([
            'DELETE.POPUP.GOAL_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.GOAL_DELETE',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.GOAL_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.goalService.deleteGoal(goalId).toPromise().then(res => {
                        this.dataSharing.changeMessage('refresh_goals_list');
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.GOAL_DELETE'], 'success');
                        this.goalService.getClientGoalPayload(this.clientId);
                        this.portfolioService.getClientPortfolioPayload(this.clientId);
                    }).catch(err => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
