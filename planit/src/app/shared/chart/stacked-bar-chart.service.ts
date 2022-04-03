import { Injectable } from '@angular/core';

@Injectable()
export class StackedBarChartService {

    constructor() { }
    public commonOption(dataProvider, graphs) {
        return {
            type: 'serial',
            theme: 'light',
            autoMarginOffset: 10,
            autoMargins: false,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            borderAlpha: 1,
            borderColor: '#FFFFFF',
            dataProvider: dataProvider,
            valueAxes: [{
                stackType: '100%',
                axisAlpha: 0,
                gridAlpha: 0,
                labelsEnabled: false
            }],
            graphs: graphs,
            rotate: true,
            categoryField: 'accounttype',
            categoryAxis: {
                gridPosition: 'start',
                axisAlpha: 0,
                gridAlpha: 0,
                position: 'left',
                labelsEnabled: false,
                ignoreAxisWidth: true
            },
            export: {
                enabled: true
            },
            responsive: {
                enabled: true
            }
        };
    }

}
