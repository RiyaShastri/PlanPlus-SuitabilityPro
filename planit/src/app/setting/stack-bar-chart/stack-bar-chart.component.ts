import { Component, OnInit } from '@angular/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { StackBarChart } from '../settings-models';

@Component({
    selector: 'app-stack-bar-chart',
    templateUrl: './stack-bar-chart.component.html',
    styleUrls: ['./stack-bar-chart.component.css']
})
export class StackBarChartComponent implements OnInit {

    sliderValue;

    constructor(private AmCharts: AmChartsService) { }

    ngOnInit() {
        this.AmCharts.makeChart('chartdiv', StackBarChart);
        setTimeout(() => {
            this.changeSliderCSS();
        }, 300);
    }

    changeSliderCSS() {

        const sliderValue = [{
            name: 'All income',
            colour: '#79a8ff',
            percent: 24
        }, {
            name: 'Income',
            colour: '#69cbe9',
            percent: 10
        }, {
            name: 'Income and growth',
            colour: '#dddddd',
            percent: 10
        }, {
            name: 'Balanced',
            colour: '#dede46',
            percent: 10
        }, {
            name: 'Growth and Income',
            colour: '#56deac',
            percent: 10
        }, {
            name: 'Growth',
            colour: '#ff44a7',
            percent: 10
        }, {
            name: 'All Equity',
            colour: '#c779fe',
            percent: 26
        }];
        this.sliderValue = sliderValue;
        const ngcontent = '_ngcontent-c14';

        $('.irs:first').find('.irs').find('.irs-line').remove();
        let addDynamicBlock = '<div ' + ngcontent + ' class="slider-main">';
        sliderValue.forEach(val => {
            addDynamicBlock = addDynamicBlock + '<div ' + ngcontent + ' style="width: ' + val.percent + '%;background: ' + val.colour + ';"></div>';
        });
        addDynamicBlock = addDynamicBlock + '</div>';
        $('.irs:first').find('.irs').prepend(addDynamicBlock);
        // $('.irs-slider').empty().prepend(this.fromPoint.toString());
        $('.irs-slider').empty().prepend('0');
        $('.irs-grid').css({ 'border-top': '2px solid #c5c5c5' });
        $('.p-slider .irs-grid-text').css({ 'margin-bottom': '25px' });
        setTimeout(() => {
            $('.irs-with-grid .irs-grid').css({ 'width': '100%', 'left': '0' });
        }, 100);

    }

}
