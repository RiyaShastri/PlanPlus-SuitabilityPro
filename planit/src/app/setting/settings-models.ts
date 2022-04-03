export const allocationsData = {
    'currentSummary': {
        'rateOfReturn': 0.0,
        'risk': 0.0,
        'sharpeRatio': 0.0,
        'fees': 0.0,
        'incomeDistribution': [
            {
                'id': 'Interest',
                'percent': 29.149960827687917,
                'displayOrder': 0
            },
            {
                'id': 'Dividend',
                'percent': 15.712982165076733,
                'displayOrder': 1
            },
            {
                'id': 'Deferred capital gains',
                'percent': 55.137057007235356,
                'displayOrder': 2
            },
            {
                'id': 'Realized capital gains',
                'percent': 0.0,
                'displayOrder': 3
            },
            {
                'id': 'Non-taxable',
                'percent': 0.0,
                'displayOrder': 4
            }
        ]
    },
    'implementedSummary': null,
    'targetSummary': {
        'rateOfReturn': 0.0,
        'risk': 0.0,
        'sharpeRatio': 0.0,
        'fees': 0.0,
        'incomeDistribution': [
            {
                'id': 'Interest',
                'percent': 29.149960827687917,
                'displayOrder': 0
            },
            {
                'id': 'Dividend',
                'percent': 15.712982165076733,
                'displayOrder': 1
            },
            {
                'id': 'Deferred capital gains',
                'percent': 55.137057007235356,
                'displayOrder': 2
            },
            {
                'id': 'Realized capital gains',
                'percent': 0.0,
                'displayOrder': 3
            },
            {
                'id': 'Non-taxable',
                'percent': 0.0,
                'displayOrder': 4
            }
        ]
    },
    'warnings': null,
    'rollup': 0,
    'totalCurrentAmount': 100000.0000,
    'totalCurrentPercent': 100,
    'curCode': 'CAD'
};


export const StackBarChart = {
    'type': 'serial',
    'theme': 'light',
    'marginTop': -30,
    'marginBottom': 0,
    'rotate': true,
    'categoryField': 'year',
    'columnWidth': 0.9,
    legend: {
        valueText: '',
        position: 'top'
    },
    'categoryAxis': {
        'gridPosition': 'start',
        'axisAlpha': 0,
        'gridAlpha': 0,
        'position': 'left',
        'labelFrequency': 10
    },
    'startDuration': 1,
    'dataProvider': [{
        'year': '',
        'allIncome': 24,
        'income': 10,
        'incomeAndGrowth': 10,
        'balanced': 10,
        'growthAndIncome': 10,
        'growth': 10,
        'allEquity': 26
    }],
    'valueAxes': [{
        'stackType': '100%',
        'gridAlpha': 0,
        'axisAlpha': 1,
        'minimum': 0,
        'maximum': 100,
        'autoGridCount': false,
        'gridCount': 100,
    }],
    'graphs': [{
        'newStack': true, // maim key term to display label.
        'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b>[[value]]</b></span>',
        // 'labelText': '[[value]]',
        'fillColors': '#77a9ff',
        'labelPosition': 'inside',
        'color': '#000000',
        'fillAlphas': 0.8,
        'lineAlpha': 0.2,
        'title': 'All income',
        'type': 'column',
        'valueField': 'allIncome'
    }, {
        'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b>[[value]]</b></span>',
        'fillAlphas': 0.8,
        // 'labelText': '[[value]]',
        'fillColors': '#6acceb',
        'labelPosition': 'inside',
        'lineAlpha': 0.2,
        'title': 'Income',
        'type': 'column',
        'color': '#000000',
        'valueField': 'income'
    }, {
        'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b>[[value]]</b></span>',
        'fillAlphas': 0.8,
        // 'labelText': '[[value]]',
        'fillColors': '#dfdcdf',
        'labelPosition': 'inside',
        'lineAlpha': 0.2,
        'title': 'Income and growth',
        'type': 'column',
        'color': '#000000',
        'valueField': 'incomeAndGrowth'
    }, {
        'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b>[[value]]</b></span>',
        'fillAlphas': 0.8,
        // 'labelText': '[[value]]',
        'fillColors': '#dedf44',
        'labelPosition': 'inside',
        'lineAlpha': 0.2,
        'title': 'Balanced',
        'type': 'column',
        'color': '#000000',
        'valueField': 'balanced'
    }, {
        'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b>[[value]]</b></span>',
        'fillAlphas': 0.8,
        // 'labelText': '[[value]]',
        'fillColors': '#58e0ab',
        'labelPosition': 'inside',
        'lineAlpha': 0.2,
        'title': 'Growth and Income',
        'type': 'column',
        'color': '#000000',
        'valueField': 'growthAndIncome'
    }, {
        'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b>[[value]]</b></span>',
        'fillAlphas': 0.8,
        // 'labelText': '[[value]]',
        'fillColors': '#ff44a7',
        'labelPosition': 'inside',
        'lineAlpha': 0.2,
        'title': 'Growth',
        'type': 'column',
        'color': '#000000',
        'valueField': 'growth'
    }, {
        'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b>[[value]]</b></span>',
        'fillAlphas': 0.8,
        // 'labelText': '[[value]]',
        'fillColors': '#c97aff',
        'labelPosition': 'inside',
        'lineAlpha': 0.2,
        'title': 'All Equity',
        'type': 'column',
        'color': '#000000',
        'valueField': 'allEquity'
    }],
};

export const RatesOfReturn = {
    'methodology': 'real',
    'ratesToApply': 'default',
    'inflation': {
        'type': 'default',
        'defRate': 2,
        'custRate': 3,
    },
    'corporateDefined': {
        'methodology': 'nominal',
        'ratesToApply': 'default',
        'infaltion': null,
    },
    'assetClasses': [
        {
            'id': 0,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Cash',
            'classDescription': 'FTSE TMX Canada 91 Day Tbill',
            'defaultSTDEV': 2.19,
            'customSTDEV': 0.19,
            'defaultReal': 0.19,
            'customReal': 0.19,
            'defNominalFwd': 2.19,
            'custNominalFwd': 2.69,
            'realAdjustment': 0,
            'nominalAdujstment': 0.5,
            'notes': 'Cash: Return reduced by 1.5%.'
        },
        {
            'id': 1,
            'isChildOf': 3,
            'isIncluded': true,
            'name': 'Short term fixed income',
            'classDescription': 'FTSE TMX Canada Short Term Bond Index',
            'defaultSTDEV': 3.38,
            'customSTDEV': 1.38,
            'defaultReal': 1.38,
            'customReal': 1.88,
            'defNominalFwd': 3.38,
            'custNominalFwd': 3.38,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': 'Short Term Fixed: Return Data from 1996, we are using Fixed Income reduced by 1.5%'
        },
        {
            'id': 2,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Fixed income',
            'classDescription': 'FTSE TMX Canada Universe Bond Index',
            'defaultSTDEV': 4.89,
            'customSTDEV': 2.89,
            'defaultReal': 2.89,
            'customReal': 3.39,
            'defNominalFwd': 4.89,
            'custNominalFwd': 4.89,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': '',
        },
        {
            'id': 3,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Fixed income',
            'classDescription': 'S&P/TSX Total Return Index',
            'defaultSTDEV': 4.89,
            'customSTDEV': 2.89,
            'defaultReal': 2.89,
            'customReal': 3.39,
            'defNominalFwd': 4.89,
            'custNominalFwd': 4.89,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': '',
        },
        {
            'id': 4,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Fixed income',
            'classDescription': 'S&P/TSX Small Cap Total Return Index',
            'defaultSTDEV': 4.89,
            'customSTDEV': 2.89,
            'defaultReal': 2.89,
            'customReal': 3.39,
            'defNominalFwd': 4.89,
            'custNominalFwd': 4.89,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': '',
        },
        {
            'id': 5,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Fixed income',
            'classDescription': 'S&P 500 Total Return Index(C$)',
            'defaultSTDEV': 4.89,
            'customSTDEV': 2.89,
            'defaultReal': 2.89,
            'customReal': 3.39,
            'defNominalFwd': 4.89,
            'custNominalFwd': 4.89,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': '',
        },
        {
            'id': 6,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Fixed income',
            'classDescription': 'Russell 2000 US Small CAp Index(C$)',
            'defaultSTDEV': 4.89,
            'customSTDEV': 2.89,
            'defaultReal': 2.89,
            'customReal': 3.39,
            'defNominalFwd': 4.89,
            'custNominalFwd': 4.89,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': '',
        },
        {
            'id': 7,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Fixed income',
            'classDescription': 'MSCI EAFE Total Return Index (C$)',
            'defaultSTDEV': 4.89,
            'customSTDEV': 2.89,
            'defaultReal': 2.89,
            'customReal': 3.39,
            'defNominalFwd': 4.89,
            'custNominalFwd': 4.89,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': '',
        },
        {
            'id': 8,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Fixed income',
            'classDescription': 'MSCI Emerging Market Index(C$)',
            'defaultSTDEV': 4.89,
            'customSTDEV': 2.89,
            'defaultReal': 2.89,
            'customReal': 3.39,
            'defNominalFwd': 4.89,
            'custNominalFwd': 4.89,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': '',
        },
        {
            'id': 9,
            'isChildOf': 0,
            'isIncluded': true,
            'name': 'Fixed income',
            'classDescription': 'S&P/TSX Real Estate Index',
            'defaultSTDEV': 4.89,
            'customSTDEV': 2.89,
            'defaultReal': 2.89,
            'customReal': 3.39,
            'defNominalFwd': 4.89,
            'custNominalFwd': 4.89,
            'realAdjustment': 0.5,
            'nominalAdujstment': 0,
            'notes': '',
        },
    ]
};



export const incomeDistribution = {
    'distribution_to_apply': 'Default',
    'last_reviewed_ID': '2018.09.12',
    'ID_acceptance': true,
    'income_distribution': []
};

export const timeHorizonDropdownValues = [
    { value: 0, name: 'Less than 1 year', displayText: '0' },
    { value: 1, name: '1 year', displayText: '1' },
    { value: 2, name: '2 years', displayText: '2' },
    { value: 3, name: '3 years', displayText: '3' },
    { value: 4, name: '4 years', displayText: '4' },
    { value: 5, name: '5 years', displayText: '5' },
    { value: 6, name: '6 years', displayText: '6' },
    { value: 7, name: '7 years', displayText: '7' },
    { value: 8, name: '8 years', displayText: '8' },
    { value: 9, name: '9 years', displayText: '9' },
    { value: 10, name: '10 years', displayText: '10' },
    { value: 11, name: '11 years', displayText: '11' },
    { value: 12, name: '12 years', displayText: '12' },
    { value: 13, name: '13 years', displayText: '13' },
    { value: 14, name: '14 years', displayText: '14' },
    { value: 15, name: '15 years', displayText: '15' },
    { value: 16, name: '16 years', displayText: '16' },
    { value: 17, name: '17 years', displayText: '17' },
    { value: 18, name: '18 years', displayText: '18' },
    { value: 19, name: '19 years', displayText: '19' },
    { value: 20, name: '20 years', displayText: '20' },
    { value: 51, name: 'Unknown', displayText: 'Unknown' },
    { value: 999, name: 'More than 20 years', displayText: '20+' }
];

const solutionObj = {
    calculatedGrowth: 0,
    appliedGrowth: 0,
    overrideAppliedGrowth: false,
    customRange: false,
    okayLow: 0,
    okayHigh: 0,
    marginalLow: 0,
    marginalHigh: 0,
    assetAllocations: [],
    rateOfReturn: 0,
    risk: 0,
    currencyAllocations: []
};

export const SOLUTION_DETAILS_PAYLOAD = {
    solutionName: '',
    solutionFamilyId: '',
    solutionUrl: '',
    lastUpdated: null,
    lastReviewed: null,
    mappedSolution: false,
    profiler: {
        ...solutionObj
    },
    protracker: {
        ...solutionObj,
        products: [],
        solutionType: 1,
    }
};
