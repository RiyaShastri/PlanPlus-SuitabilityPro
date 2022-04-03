import { Component, OnInit, Input, AfterContentInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';

@Component({
    selector: 'app-gantt-chart',
    templateUrl: './gantt-chart.component.html',
    styleUrls: ['./gantt-chart.component.css']
})
export class GanttChartComponent implements OnInit, AfterContentInit, OnChanges, OnDestroy {
    ganttChart;
    @Input() dataSet: Array<object> = [];
    @Input() uniqeId = '';
    public goalMapTimeline = {
        'type': 'gantt',
        'theme': 'light',
        'marginTop': 10,
        'marginBottom': 0,
        'columnWidth': 0.99,
        'removeGuide': true,
        'valueAxis': {
            'type': 'date',
            'axisAlpha': 0,
            'labelsEnabled': false
        },
        'categoryAxis': {
            'axisAlpha': 0,
            'gridAlpha': 0,
        },
        'graph': {
            'fillAlphas': 1,
            'balloonText': '<b>[[task]]' + ':' + '[[low]]' + '- ' + '[[high]]</b>'
        },
        'rotate': true,
        'categoryField': 'category',
        'segmentsField': 'segments',
        'colorField': 'color',
        'startDate': '2015-01-01',
        'startField': 'start',
        'endField': 'end',
        'durationField': 'duration',
        'dataProvider': []
    };

    constructor(private AmCharts: AmChartsService) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataSet']) {
            this.loadChart(this.dataSet, this.uniqeId);
        }
    }

    ngOnInit() { }

    ngAfterContentInit() {
        this.loadChart(this.dataSet, this.uniqeId);
    }


    public loadChart(data, id) {
        const mapDataprovider = {
            ...this.goalMapTimeline,
            'dataProvider': data
        };

        setTimeout(() => {
            this.ganttChart = this.AmCharts.makeChart(id, mapDataprovider);
        }, 100);

    }
    ngOnDestroy(): void {
        if (this.ganttChart) {
            this.AmCharts.destroyChart(this.ganttChart);
        }
    }
}
