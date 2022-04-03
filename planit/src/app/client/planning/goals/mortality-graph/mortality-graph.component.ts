import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AmChartsService, AmChart } from '../../../../../../node_modules/@amcharts/amcharts3-angular';
@Component({
    selector: 'app-mortality-graph',

    templateUrl: './mortality-graph.component.html',
    styleUrls: ['./mortality-graph.component.css']
})
export class MortalityGraphComponent implements OnInit, OnChanges {
    @Input() chartData;
    @Input() selectedClient ?= '';
    @Input() country ?= '';
    isData = true;
    constructor(
        private amcharts: AmChartsService
    ) { }

    ngOnInit() {
        this.drawGraph();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.drawGraph();
    }

    drawGraph() {
        if  (this.chartData['dataProvider'].length > 0) {
            setTimeout(() => {
                this.amcharts.makeChart('mortalityGraphDiv', JSON.parse(JSON.stringify(this.chartData)));
            }, 100);
        } else {
            this.isData = false;
        }
    }
}
