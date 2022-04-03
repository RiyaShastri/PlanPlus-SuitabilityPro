import { Component, OnInit } from '@angular/core';
import { AdvisorService } from '../../service/advisor.service';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import * as $ from 'jquery';
import { TimePeriodList } from '../../advisor-models/common-model';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
    selector: 'app-workflow-tile',
    templateUrl: './workflow-tile.component.html',
    styleUrls: ['./workflow-tile.component.css']
})
export class WorkflowTileComponent implements OnInit {
    currentChart: any;
    currentTotal: any;
    workflowSummary;
    selectedtimePeriod;
    timePeriodList = TimePeriodList;
    allLabel;
    chartInnerLabel = 'goals';
    currentChartData: {
        category: string;
        'column-1': number;
        per?: number;
    }[] = [];
    chartColours = ['#9999FF', '#CC77FF', '#CCDDEE', '#66CCEE', '#77AAFF'];
    constructor(
        private advisorService: AdvisorService,
        private ngxPermissionsService: NgxPermissionsService,
        private AmCharts: AmChartsService
    ) {}

    ngOnInit() {
        const permissions = this.ngxPermissionsService.getPermissions();
        if (permissions.hasOwnProperty('PROFILER')) {
            this.chartInnerLabel = 'portfolios';
        } else {
            this.chartInnerLabel = 'goals';
        }
        this.selectedtimePeriod = { name: '6 months', id: 6 };
        this.getWorkflow(this.selectedtimePeriod.id);
    }

    getFilterWorkflow(selectedTimePeriod) {
        this.getWorkflow(selectedTimePeriod.id);
    }

    getWorkflow(timePeriod) {
        this.advisorService.getWorkflowDetails(timePeriod).toPromise().then(res => {
            this.workflowSummary = res;
            setTimeout(() => {
                this.fillGraph();
            }, 500);
        }).catch(err => { });
    }

    fillGraph() {
        this.allLabel = [];
        this.currentChartData = [];
        if (this.workflowSummary) {
            this.currentChartData =
                [{
                    category: 'In Progress',
                    'column-1': this.workflowSummary.inProgress
                },
                {
                    category: 'Under Review',
                    'column-1': this.workflowSummary.underReview
                },
                {
                    category: 'Completed',
                    'column-1': this.workflowSummary.completed
                },
                {
                    category: 'Shared',
                    'column-1': this.workflowSummary.shared
                },
                {
                    category: 'Monitoring ',
                    'column-1': this.workflowSummary.monitoring
                }];
            this.currentTotal = this.workflowSummary.totalGoals;
            this.allLabel = [
                {
                    text: this.currentTotal,
                    align: 'center',
                    bold: false,
                    size: 22,
                    y: 60,
                    id: 'text1'
                },
                {
                    text: 'Total',
                    align: 'center',
                    bold: false,
                    y: 40,
                    color: '#aabbcc',
                    size: 16,
                    id: 'text2'
                },
                {
                    text: this.chartInnerLabel,
                    align: 'center',
                    bold: false,
                    y: 90,
                    color: '#aabbcc',
                    size: 14,
                    id: 'text3'
                }
            ];

        }
        this.currentChart = this.AmCharts.makeChart('chartWorkFlow', {
            type: 'pie',
            innerRadius: '87%',
            precision: 0,
            balloonText: '[[category]]' + ': ' + '[[value]]',
            labelText: '',
            startRadius: '50%',
            colors: this.chartColours,
            gradientRatio: [],
            hoverAlpha: 0.64,
            labelTickAlpha: 0,
            outlineAlpha: 0,
            startDuration: 0.8,
            autoMargins: false,
            marginTop: 1,
            marginBottom: 40,
            marginLeft: 0,
            marginRight: 0,
            pullOutRadius: 0,
            startEffect: 'easeOutSine',
            titleField: 'category',
            valueField: 'column-1',
            accessibleTitle: '',
            theme: 'dark',
            listeners: [
                {
                    event: 'rendered',
                    method: this.handleRendered
                }
            ],
            allLabels: this.allLabel,
            balloon: {
                offsetX: 0,
                offsetY: 0
            },
            titles: [],
            dataProvider: this.currentChartData
        });
    }

    handleRendered() {
        $('[font-family]').removeAttr('font-family');
    }

}
