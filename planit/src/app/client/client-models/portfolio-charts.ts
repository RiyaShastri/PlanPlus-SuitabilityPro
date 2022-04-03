export class PortfolioCharts { }
export let pieChartArray = {
    type: 'pie',
    innerRadius: '65%',
    precision: 2,
    balloonText: '[[allocationBreakdown]] [[allocationPercent]]%',
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
    allLabels: [
        {
            text: 'Return 5.65%',
            align: 'center',
            bold: false,
            size: 14,
            color: '#345',
            y: 80,
            id: 'text1'
        },
        {
            text: 'Risk 11.00%',
            align: 'center',
            bold: false,
            y: 100,
            color: '#345',
            size: 14,
            id: 'text2'
        }
    ]
};
