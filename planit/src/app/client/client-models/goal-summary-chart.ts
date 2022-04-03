export class GoalSummaryCharts { }

export let goalMapTimeline = {
    type: 'gantt',
    theme: 'light',
    period: 'YYYY',
    autoMargins: true,
    dataDateFormat: 'YYYY',
    responsive: {
        enabled: true,
        addDefaultRules: true,
        rules: [
            {
                maxWidth: 1199,
                overrides: {

                    categoryAxis: {
                        ignoreAxisWidth: false,
                        autoWrap: false,
                        gridPosition: 'middle',
                        labelsEnabled: true
                    },
                }
            },
            {

                maxWidth: 991,
                overrides: {
                    marginLeft: 100,
                    categoryAxis: {
                        ignoreAxisWidth: true,
                        autoWrap: true,
                        gridPosition: 'start',
                        labelsEnabled: true
                    },
                }
            },
            {

                maxWidth: 350,
                overrides: {
                    marginLeft: 20,
                    categoryAxis: {
                        ignoreAxisWidth: true,
                        autoWrap: true,
                        gridPosition: 'middle',
                        labelsEnabled: false
                    },
                }
            }
        ]
    },
    valueAxis: {
        type: 'date',
        dateFormats: [{ 'period': 'YYYY', 'format': 'YYYY' }],
        lineAlpha: 0,
        gridThickness: 0,
        position: 'top',
        boldLabels: true,
        minPeriod: 'YYYY',
        inside: false

    },
    categoryAxis: {
        gridThickness: 0,
        lineAlpha: 0,
        axisAlpha: 0,
        boldLabels: true,
        inside: false
    },
    graph: {
        fillAlphas: 1,
        lineAlpha: 1,
        lineColor: '#fff',
        balloonText: '<span style="font-weight: bold;">[[category]]</span><br/><b> Amount: [[task]]</b> <br/>Start: [[startBalloon]] <br/> End: [[endBalloon]]',
        // fixedColumnWidth: 20,
        dateFormat: 'YYYY',
        inside: false
    },
    rotate: true,
    categoryField: 'category',
    segmentsField: 'segments',
    colorField: 'color',
    startDateField: 'start',
    endDateField: 'end',
    chartCursor: {
        cursorColor: '#55bb76',
        valueBalloonsEnabled: false,
        cursorAlpha: 0,
        valueLineAlpha: 0,
        valueLineBalloonEnabled: true,
        valueLineEnabled: false,
        categoryBalloonEnabled: false
    }
};

export let goalDailyDollerChart = {
    type: 'serial',
    theme: 'light',
    legend: {
        position: 'bottom',
        useGraphSettings: true
    },
    valueAxes: [{
        stackType: 'regular',
        axisAlpha: 0.3,
        gridAlpha: 0
    }],
    graphs: [{
        balloonText: '<b>[[title]]</b><br><span style=\'font-size:14px\'>[[category]]: <b>[[value]]</b></span>',
        fillAlphas: 0.8,
        labelText: '[[value]]',
        lineAlpha: 0.3,
        title: 'Retirement Lifestyle',
        type: 'column',
        color: '#000000',
        valueField: 'europe'
    }, {
        balloonText: '<b>[[title]]</b><br><span style=\'font-size:14px\'>[[category]]: <b>[[value]]</b></span>',
        fillAlphas: 0.8,
        labelText: '[[value]]',
        lineAlpha: 0.3,
        title: 'Abdele\'s Education',
        type: 'column',
        color: '#000000',
        valueField: 'namerica'
    }, {
        balloonText: '<b>[[title]]</b><br><span style=\'font-size:14px\'>[[category]]: <b>[[value]]</b></span>',
        fillAlphas: 0.8,
        labelText: '[[value]]',
        lineAlpha: 0.3,
        title: 'Zak\' Education',
        type: 'column',
        color: '#000000',
        valueField: 'asia'
    }, {
        balloonText: '<b>[[title]]</b><br><span style=\'font-size:14px\'>[[category]]: <b>[[value]]</b></span>',
        fillAlphas: 0.8,
        labelText: '[[value]]',
        lineAlpha: 0.3,
        title: 'Home renovations',
        type: 'column',
        color: '#000000',
        valueField: 'lamerica'
    }],
    categoryField: 'year',
    categoryAxis: {
        gridPosition: 'start',
        axisAlpha: 0,
        gridAlpha: 0,
        position: 'left'
    }
};

export let goalList = [
    {
        clinum: 'CLI123',
        country: {
            1: 'Canada'
        },
        currentAge: 35,
        description: 'Jack\'s Retirement Goal',
        goalAmount: 20000,
        goalEndYear: 2050,
        goalStartYear: 2030,
        goalTier1Amount: 5000,
        goalTier1EndYear: 2035,
        goalTier1StartYear: 2030,
        goalTier2Amount: 7000,
        goalTier2EndYear: 2042,
        goalTier2StartYear: 2036,
        goalTier3Amount: 8000,
        goalTier3EndYear: 2050,
        goalTier3StartYear: 2043,
        goalType: 'Retirement Goal,Education Goal,Others',
        indexRate: 2,
        institution: {
            1: 'McGil l University'
        },
        isMarried: 'Married',
        key: 'GOAL123',
        linkedPortfolios: {
            1: 'Education',
            2: 'Retimement',
            3: 'Home maintanance'
        },
        needOnDeathAmount: 10000,
        needOnDeathPercent: 100,
        needOnDisabilityAmount: 5000,
        needOnDisabilityPercent: 80,
        ownedFor: 'Client',
        priorityCode: 1,
        residentTuition: false,
        roomAndBoard: false,
        spouseAge: 30,
        spouseName: 'Jane'
    },
    {
        clinum: 'CLI121',
        country: {
            1: 'Canada'
        },
        currentAge: 35,
        description: 'Abdele\'s Education',
        goalAmount: 45000,
        goalEndYear: 2040,
        goalStartYear: 2020,
        goalTier1Amount: 10000,
        goalTier1EndYear: 2025,
        goalTier1StartYear: 2020,
        goalTier2Amount: 15000,
        goalTier2EndYear: 2032,
        goalTier2StartYear: 2026,
        goalTier3Amount: 0,
        goalTier3EndYear: 0,
        goalTier3StartYear: 0,
        goalType: 'Retirement Goal,Education Goal,Others',
        indexRate: 2,
        institution: {
            1: 'McGil l University'
        },
        isMarried: 'Married',
        key: 'GOAL123',
        linkedPortfolios: {
            1: 'Education',
            2: 'Retimement',
            3: 'Home maintanance'
        },
        needOnDeathAmount: 10000,
        needOnDeathPercent: 100,
        needOnDisabilityAmount: 5000,
        needOnDisabilityPercent: 80,
        ownedFor: 'Client',
        priorityCode: 1,
        residentTuition: false,
        roomAndBoard: false,
        spouseAge: 30,
        spouseName: 'Jane'
    }
];


export let mortalityGraph = {
    type: 'serial',
    theme: 'light',
    marginRight: 8,
    marginTop: 7,
    zoomOutText: null,
    zoomable: false,
    dataProvider: [
        {
            age: 49,
            probability: 80
        },
        {
            age: 60,
            probability: 70
        },
        {
            age: 71,
            probability: 60
        },
        {
            age: 82,
            probability: 50
        },
        {
            age: 85,
            probability: 40
        },
        {
            age: 91,
            probability: 55
        },
        {
            age: 95,
            probability: 30
        },
        {
            age: 104,
            probability: 10
        },
    ],
    valueAxes: [{
        axisAlpha: 0.2,
        dashLength: 1,
        position: 'left',
        min: 0,
        maximum: 100,
        title: 'Chance of Survival',
    }],
    mouseWheelZoomEnabled: true,
    graphs: [{
        id: 'g1',
        balloonText: '[[category]]: [[value]]%',
        bulletAlpha: 0,
        hideBulletsCount: 50,
        title: 'red line',
        valueField: 'probability',
        useLineColorForBulletBorder: true,
        lineThickness: 2,
        lineColor: '#fa2',
        balloon: {
            drop: true,
            horizontalPadding: 0,
            verticalPadding: 0
        },
        type: 'smoothedLine',
    }],
    pathToImages: 'assets/amcharts/images/',
    chartScrollbar: {
        // autoGridCount: true,
        graph: 'g1',
        scrollbarHeight: 30,
        dragIcon: "dragIconRectSmall",
        dragIconHeight: 20,
        dragiconWidth: 20,
        enabled: true,
        selectedBackgroundColor: "#FFFFFF",
    },
    chartCursor: {
        limitToGraph: 'g1',
        zoomable: false,
        cursorAlpha: 1,
    },
    categoryField: 'age',
    categoryAxis: {
        axisColor: '#DADADA',
        dashLength: 1,
        minorGridEnabled: false,
        title: 'Age',
    }
};
