import { chartColors, chartColorsWhite } from './chart-colors';

export class GoalAnalysisCharts { }

export let highLevelCurrentChart = {
    type: 'pie',
    innerRadius: '80%',
    precision: 2,
    labelText: '',
    startRadius: '0%',
    hoverAlpha: 0.64,
    labelTickAlpha: 0,
    outlineAlpha: 0,
    startDuration: 0.8,
    autoMargins: false,
    marginLeft: 10,
    marginRight: 10,
    pullOutRadius: 0,
    startEffect: 'easeOutSine',
    titleField: 'allocationBreakdown',
    valueField: 'allocationPercent',
    accessibleTitle: '',
    theme: 'dark',
};

export let planningCashFlowChart = {
    type: 'serial',
    theme: 'light',
    marginRight: 30,
    legend: {
        equalWidths: false,
        periodValueText: '[[value.sum]]',
        position: 'bottom',
        valueAlign: 'left',
        valueWidth: 100
    },
    dataProvider: [],
    valueAxes: [{
        stackType: 'regular',
        gridAlpha: 0.07,
        position: 'left',
    }],
    graphs: [],
    colors: chartColors,
    plotAreaBorderAlpha: 0,
    marginTop: 10,
    marginLeft: 0,
    marginBottom: 0,
    chartCursor: {
        cursorAlpha: 0
    },
    categoryField: 'year',
    categoryAxis: {
        startOnAxis: true,
        axisColor: '#DADADA',
        gridThickness: 0,
        gridAlpha: 0
    }
};

export let planningInvestmentCapitalChart = {
    type: 'serial',
    theme: 'light',
    marginRight: 30,
    legend: {
        equalWidths: false,
        periodValueText: '[[value.sum]]',
        position: 'bottom',
        valueAlign: 'left',
        valueWidth: 100
    },
    dataProvider: [],
    valueAxes: [{
        stackType: 'regular',
        gridAlpha: 0.07,
        position: 'left',
    }],
    graphs: [],
    colors: chartColors,
    plotAreaBorderAlpha: 0,
    marginTop: 10,
    marginLeft: 0,
    marginBottom: 0,
    chartCursor: {
        cursorAlpha: 0
    },
    categoryField: 'year',
    categoryAxis: {
        startOnAxis: true,
        axisColor: '#DADADA',
        gridThickness: 0,
        gridAlpha: 0
    }
};

export let cashFlowChart = {
    type: 'serial',
    theme: 'light',
    marginRight: 30,
    legend: {
        equalWidths: false,
        periodValueText: '[[value.sum]]',
        position: 'bottom',
        valueAlign: 'left',
        valueWidth: 100
    },
    dataProvider: [],
    valueAxes: [{
        stackType: 'regular',
        gridAlpha: 0.07,
        position: 'left',
    }],
    graphs: [],
    colors: chartColors,
    plotAreaBorderAlpha: 0,
    marginTop: 10,
    marginLeft: 0,
    marginBottom: 0,
    chartCursor: {
        cursorAlpha: 0
    },
    categoryField: 'year',
    categoryAxis: {
        startOnAxis: true,
        axisColor: '#DADADA',
        gridThickness: 0,
        gridAlpha: 0
    }
};

export let investmentCapitalChart = {
    type: 'serial',
    theme: 'light',
    marginRight: 30,
    legend: {
        equalWidths: false,
        periodValueText: '[[value.sum]]',
        position: 'bottom',
        valueAlign: 'left',
        valueWidth: 100
    },
    dataProvider: [],
    valueAxes: [{
        stackType: 'regular',
        gridAlpha: 0.07,
        position: 'left',
    }],
    graphs: [],
    colors: chartColors,
    plotAreaBorderAlpha: 0,
    marginTop: 10,
    marginLeft: 0,
    marginBottom: 0,
    chartCursor: {
        cursorAlpha: 0
    },
    categoryField: 'year',
    categoryAxis: {
        startOnAxis: true,
        axisColor: '#DADADA',
        gridThickness: 0,
        gridAlpha: 0
    }
};

export let currentCertaintyChart = {
    type: 'serial',
    theme: 'dark',
    legend: {
        equalWidths: true,
        valueAlign: 'left',
        valueText: '',
        valueWidth: 100
    },
    colors: chartColorsWhite,
    dataProvider: [],
    valueAxes: [{
        stackType: 'none',
        gridAlpha: 0,
        position: 'left',
    }],
    graphs: [],
    plotAreaBorderAlpha: 0,
    marginLeft: 0,
    marginBottom: 0,
    chartCursor: {
        cursorAlpha: 1,
    },
    chartScrollbar: {
    },
    pathToImages: 'assets/amcharts/images/',
    categoryField: 'year',
    categoryAxis: {
        startOnAxis: true,
        axisColor: '#DADADA',
        gridThickness: 0,
        gridAlpha: 0
    }
};

export let strategyCertaintyChart = {
    type: 'serial',
    theme: 'dark',
    legend: {
        equalWidths: true,
        valueAlign: 'left',
        valueText: '',
        valueWidth: 100
    },
    colors: chartColorsWhite,
    dataProvider: [],
    valueAxes: [{
        stackType: 'none',
        gridAlpha: 0,
        position: 'left',
    }],
    graphs: [],
    plotAreaBorderAlpha: 0,
    marginLeft: 0,
    marginBottom: 0,
    chartCursor: {
        cursorAlpha: 1,
    },
    chartScrollbar: {
    },
    pathToImages: 'assets/amcharts/images/',
    categoryField: 'year',
    categoryAxis: {
        startOnAxis: true,
        axisColor: '#DADADA',
        gridThickness: 0,
        gridAlpha: 0
    }
};

export let favUnfavChart = {
    type: 'serial',
    theme: 'light',
    dataProvider: [],
    colors: chartColors,
    valueAxes: [{
        stackType: 'regular',
        axisAlpha: 0.3,
        gridAlpha: 0,
        unit: '$',
        unitPosition: 'left',
        fontSize: 10,
    }],
    graphs: [],
    categoryAxis: {
        gridPosition: 'start',
        axisAlpha: 0,
        gridAlpha: 0,
        labelsEnabled: false
    }
};

export let valueAtRiskGraph = {
    type: 'serial',
    theme: 'light',
    dataProvider: [],
    valueAxes: [{
        gridAlpha: 0.2,
        fillAlpha: 1,
        stackType: 'regular',
        labelFunction: function (number, label) {
            if (number === 0) {
                label = '$-';
            } else {
                label = '$(' + Math.abs(number).toLocaleString('en') + ')';
            }
            return label;
        }
    }],
    gridAboveGraphs: false,
    startDuration: 1,
    graphs: [],
    chartCursor: {
        categoryBalloonEnabled: false,
        cursorAlpha: 0,
        zoomable: false
    },
    categoryField: 'country',
    categoryAxis: {
        gridPosition: 'start',
        axisAlpha: 0,
        gridAlpha: 0
    },
    export: {
        enabled: true
    }
};

export let planTracCoO = {
    'type': 'serial',
    'theme': 'dark',
    'legend': {
        'equalWidths': true,
        'valueAlign': 'left',
        'valueText': '',
        'valueWidth': 100,
        // 'useGraphSettings': true,
    },
    'colors': [
        '#FFFFFF',
        '#FF6644',
        '#FFCC44',
        '#000000',
        '#AADD55',
        '#77AAFF',
        '#66CCEE',
        '#55DDAA',
        '#DDDD44',
        '#FFAA22',
        '#FF44AA',
        '#CC77FF',
        '#9999FF'
    ],
    'dataProvider': [{
        'probabilityValue0': 10000,
        'probabilityPercentage0': 12,
        'probabilityValue1': 10000,
        'probabilityPercentage1': 35,
        'probabilityValue2': 10000,
        'probabilityPercentage2': 35,
        'probabilityValue3': 10000,
        'probabilityPercentage3': 12,
        'probabilityValue4': 10000,
        'probabilityPercentage4': 3,
        'year': 2018,
        'expectedPercentage': 50,
        'expectedValue': 10000
    }, {
        'probabilityValue0': 11061,
        'probabilityPercentage0': 12,
        'probabilityValue1': 10806,
        'probabilityPercentage1': 35,
        'probabilityValue2': 10450,
        'probabilityPercentage2': 35,
        'probabilityValue3': 9967,
        'probabilityPercentage3': 12,
        'probabilityValue4': 9545,
        'probabilityPercentage4': 3,
        'year': 2019,
        'expectedPercentage': 50,
        'expectedValue': 10450
    }, {
        'probabilityValue0': 11836,
        'probabilityPercentage0': 12,
        'probabilityValue1': 11451,
        'probabilityPercentage1': 35,
        'probabilityValue2': 10920,
        'probabilityPercentage2': 35,
        'probabilityValue3': 10211,
        'probabilityPercentage3': 12,
        'probabilityValue4': 9605,
        'probabilityPercentage4': 3,
        'year': 2020,
        'expectedPercentage': 50,
        'expectedValue': 10920
    }, {
        'probabilityValue0': 12596,
        'probabilityPercentage0': 12,
        'probabilityValue1': 12096,
        'probabilityPercentage1': 35,
        'probabilityValue2': 11412,
        'probabilityPercentage2': 35,
        'probabilityValue3': 10509,
        'probabilityPercentage3': 12,
        'probabilityValue4': 9750,
        'probabilityPercentage4': 3,
        'year': 2021,
        'expectedPercentage': 50,
        'expectedValue': 11412
    }, {
        'probabilityValue0': 13367,
        'probabilityPercentage0': 12,
        'probabilityValue1': 12756,
        'probabilityPercentage1': 35,
        'probabilityValue2': 11925,
        'probabilityPercentage2': 35,
        'probabilityValue3': 10841,
        'probabilityPercentage3': 12,
        'probabilityValue4': 9941,
        'probabilityPercentage4': 3,
        'year': 2022,
        'expectedPercentage': 50,
        'expectedValue': 11925
    }, {
        'probabilityValue0': 1253,
        'probabilityPercentage0': 12,
        'probabilityValue1': 531,
        'probabilityPercentage1': 35,
        'probabilityValue2': 0,
        'probabilityPercentage2': 35,
        'probabilityValue3': 0,
        'probabilityPercentage3': 12,
        'probabilityValue4': 0,
        'probabilityPercentage4': 3,
        'year': 2023,
        'expectedPercentage': 50,
        'expectedValue': 0
    }],
    'valueAxes': [{
        'stackType': 'none',
        'gridAlpha': 0,
        'position': 'left'
    }],
    'graphs': [{
        'balloonText': '$[[probabilityValue0]] \n[[probabilityPercentage0]]% Probability',
        'fillAlphas': 1,
        'lineAlpha': 0,
        'title': '12% Probability',
        'valueField': 'probabilityValue0',
        'lineColor': '#77AAFF',
        'negativeLineColor': '#77AAFF'
    }, {
        'balloonText': '$[[probabilityValue1]] \n[[probabilityPercentage1]]% Probability',
        'fillAlphas': 1,
        'lineAlpha': 0,
        'title': '35% Probability',
        'valueField': 'probabilityValue1',
        'lineColor': '#AADD55',
        'negativeLineColor': '#AADD55'
    }, {
        'balloonText': '$[[probabilityValue2]] \n[[probabilityPercentage2]]% Probability',
        'fillAlphas': 1,
        'lineAlpha': 0,
        'title': '35% Probability',
        'valueField': 'probabilityValue2',
        'lineColor': '#FFCC44',
        'negativeLineColor': '#FFCC44'
    }, {
        'balloonText': '$[[probabilityValue3]] \n[[probabilityPercentage3]]% Probability',
        'fillAlphas': 1,
        'lineAlpha': 0,
        'title': '12% Probability',
        'valueField': 'probabilityValue3',
        'lineColor': '#FF6644',
        'negativeLineColor': '#FF6644'
    }, {
        'balloonText': '$[[probabilityValue4]] \n[[probabilityPercentage4]]% Probability',
        'fillAlphas': 1,
        'lineAlpha': 0,
        'title': '3% Probability',
        'valueField': 'probabilityValue4',
        'lineColor': '#F3F3F3',
        'negativeLineColor': '#F3F3F3'
    }, {
        'balloonText': 'Expected result(50/50)',
        'fillAlphas': 0,
        'lineAlpha': 1,
        'type': 'line',
        'title': '50% Probability',
        'valueField': 'expectedValue',
        'lineColor': '#000000',
        'negativeLineColor': '#000000'
    }, {
        'bullet': 'square',
        'bulletBorderAlpha': 1,
        'bulletBorderThickness': 1,
        'lineColor': '#595856',
        'type': 'line',
        'negativeLineColor': '#595856',
        'dashLengthField': 'dashLength',
        'legendValueText': '[[value]]',
        'title': 'Actual',
        'fillAlphas': 0,
        'lineAlpha': 1,
        'valueField': 'expectedValue'
    }],
    'plotAreaBorderAlpha': 0,
    'marginLeft': 0,
    'marginBottom': 0,
    'chartCursor': {
        'cursorAlpha': 1
    },
    'chartScrollbar': {

    },
    'pathToImages': 'assets/amcharts/images/',
    'categoryField': 'year',
    'categoryAxis': {
        'startOnAxis': true,
        'axisColor': '#DADADA',
        'gridThickness': 0,
        'gridAlpha': 0
    }
};

