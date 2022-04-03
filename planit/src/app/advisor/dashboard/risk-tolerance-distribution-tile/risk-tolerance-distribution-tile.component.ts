import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AmChartsService, } from '@amcharts/amcharts3-angular';
import { AdvisorService } from '../../service/advisor.service';
import { TimePeriodList } from '../../advisor-models/common-model';
import * as $ from 'jquery';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-risk-tolerance-distribution-tile',
    templateUrl: './risk-tolerance-distribution-tile.component.html',
    styleUrls: ['./risk-tolerance-distribution-tile.component.css']
})
export class RiskToleranceDistributionTileComponent implements OnInit {
    chart;
    chartData = [];
    timePeriodList = TimePeriodList;
    riskGroups;
    selectedtimePeriod;
    selectedRiskGroup;
    behaviouralRiskToleranceData = [];
    totalSent = 0;
    totalCompleted = 0;
    totalAdjusted = 0;
    @ViewChild('widgetParentDiv') parentDiv: ElementRef;
    constructor(
        private AmCharts: AmChartsService,
        private advisorService: AdvisorService
    ) { }

    ngOnInit() {
        this.riskGroups = [
            { name: '5 risk groups', id: 'FM10S30', shortid: 'FM10', groupSize: 5 },
            { name: '7 risk groups', id: 'FM25V30', shortid: 'FM25', groupSize: 7 }
        ];
        this.selectedtimePeriod = { name: '6 months', id: 6 };
        this.behaviouralRiskToleranceData = [];
        this.selectedRiskGroup = this.riskGroups[0];    // get data for 5 risk groups
        this.getBehaviouralRiskTolerance(this.selectedRiskGroup.id, this.selectedtimePeriod.id);
        this.selectedRiskGroup = this.riskGroups[1];    // get data for 7 risk groups
        this.getBehaviouralRiskTolerance(this.selectedRiskGroup.id, this.selectedtimePeriod.id);
        this.selectedRiskGroup = this.riskGroups[0];    // always reset to the 5 risk groups for display purpose
    }
    @HostListener('window:resize') onResize() {
        // guard against resize before view is rendered
        if (this.parentDiv) {
            if ($(window).width() < 976) {
                $('#chartdiv1').css('width', ($('#advisor_dashboard').width() - 55));
            } else {
                $('#chartdiv1').css('width', ($('#advisor_dashboard').width() - (($('#advisor_dashboard').width() * 50) / 100) - 55));
            }
        }
    }

    getBehaviouralRiskTolerance(ristGroup, period) {
        this.advisorService.getBehaviouralRiskTolerance(ristGroup, period).toPromise().then(data => {
            this.addOrUpdateBehaviouralRiskToleranceData(ristGroup, data);
            setTimeout(() => {
                this.draChart();
            }, 100);
        }).catch(err => {});
    }
    getFilterByTimePeriod(event) {
        this.selectedtimePeriod = event;
        // since the counts below the chart are for all risk groups if they change the
        // time period we need to update all risk groups where changing the risk group
        // dropdown we can get away with only updating the selected risk group.
        this.getBehaviouralRiskTolerance(this.riskGroups[0].id, this.selectedtimePeriod.id);
        this.getBehaviouralRiskTolerance(this.riskGroups[1].id, this.selectedtimePeriod.id);
    }
    getFilterByRiskGroup(event) {
        this.selectedRiskGroup = event;
        this.getBehaviouralRiskTolerance(this.selectedRiskGroup.id, this.selectedtimePeriod.id);
    }
    draChart() {
        this.chartData = [];
        if (this.behaviouralRiskToleranceData !== null && this.behaviouralRiskToleranceData !== undefined && this.behaviouralRiskToleranceData.length > 0) {
            for (let i = 0; i < this.selectedRiskGroup.groupSize; i++) {
                if (this.behaviouralRiskToleranceData.find(item => item.id === this.selectedRiskGroup.id)) {
                    this.chartData.push({
                        value: this.behaviouralRiskToleranceData.find(item => item.id === this.selectedRiskGroup.id).value.riskGroupNumbers[this.selectedRiskGroup.shortid + '-G' + (i + 1)],
                        group: (i + 1)
                    });
                }
            }
        }
        this.chart = this.AmCharts.makeChart('chartdiv1', {
            'type': 'serial',
            'theme': 'light',
            'dataProvider': this.chartData,
            'valueAxes': [{
                'axisAlpha': 0,
                'lineColor': '000',
                'gridThickness': 0,
                'axisThickness': 1,
                'gridCount': 20,
                'minimum': 0,
                'strictMinMax': true,
                'precision': 0
            }],
            'graphs': [{
                'bulletSize': 7,
                'customBullet': '',
                'bullet': 'round',
                'id': 'g1',
                'bulletBorderAlpha': 1,
                'bulletColor': '#FFFFFF',
                'lineThickness': 2,
                'valueField': 'value',
                'useLineColorForBulletBorder': true,
                // tslint:disable-next-line:max-line-length
                'balloonText': '<div style="margin:10px; text-align:left;"><span style="font-size:13px">Risk Group :[[category]]</span><br><span style="font-size:18px">Value:[[value]]</span>',
            }],
            'marginTop': 5,
            'chartCursor': {
                'graphBulletSize': 1.5,
                'zoomable': false,
                'cursorAlpha': 0,
                'valueLineBalloonEnabled': true,
                'valueLineAlpha': 0
            },
            'autoMargins': true,
            'categoryField': 'group',
            'categoryAxis': {
                'lineAlpha': 1,
                'fillAlpha': 1,
                'lineLength': 0,
                'inside': false,
                'labelRotation': 0,
                'title': 'RISK GROUP',
            },
            'responsive': {
                'enabled': false,
                'rules': [
                    {
                        'maxWidth': 597,
                        'overrides': {
                            'graphs': [
                                {
                                    'fixedColumnWidth': 40
                                }
                            ],
                        }
                    },
                    {
                        'maxWidth': 493,
                        'overrides': {
                            'graphs': [
                                {
                                    'fixedColumnWidth': 30
                                }
                            ],
                        }
                    },
                    {
                        'maxWidth': 200,
                        'overrides': {
                            'graphs': [
                                {
                                    'fixedColumnWidth': 20
                                }
                            ],
                        }
                    }
                ]
            }
        });
    }
    addOrUpdateBehaviouralRiskToleranceData(ristGroup, newItem) {
        let isUpdated = false;
        for (let i = 0; i < this.behaviouralRiskToleranceData.length; i++) {
            if (this.behaviouralRiskToleranceData[i].id === ristGroup) {
                this.behaviouralRiskToleranceData[i].value = newItem;
                isUpdated = true;
                break;
            }
        }
        if (!isUpdated) {
            this.behaviouralRiskToleranceData.push({ id: ristGroup, value: newItem });
        }
        this.totalSent = 0;
        this.totalCompleted = 0;
        this.totalAdjusted = 0;
        for (let j = 0; j < this.behaviouralRiskToleranceData.length; j++) {
            this.totalSent += this.behaviouralRiskToleranceData[j].value.sent;
            this.totalCompleted += this.behaviouralRiskToleranceData[j].value.completed;
            this.totalAdjusted += this.behaviouralRiskToleranceData[j].value.adjusted;
        }
    }
}
