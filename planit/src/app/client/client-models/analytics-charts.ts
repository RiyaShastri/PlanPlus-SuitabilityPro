export class AnalyticsCharts {
}

export let suitabilityChartArray = {
  theme: 'none',
  type: 'gauge',
  responsive: {
    enabled: false
  },
  axes: [{
    axisAlpha: 0,
    radius: '90%',
    startAngle: -90,
    endAngle: 90,
    startValue: 0,
    endValue: 100,
    valueInterval: 100,
    labelOffset: 40,
    topText: 54,
    topTextFontSize: 36,
    topTextYOffset: 20,
    topTextBold: false,
    inside: false,
    tickThickness: 0,
    bands: [
      {
        color: '#f64',
        startValue: 0,
        endValue: 35,
        balloonText: '0-35 Not Suitable',
        innerRadius: '150%',
        radius: '100%',
      },
      {
        color: '#fc4',
        startValue: 35,
        endValue: 42,
        balloonText: '35-42 Marginally suitable',
        innerRadius: '150%',
        radius: '100%',
      },
      {
        color: '#ad5',
        startValue: 42,
        endValue: 45,
        balloonText: '42-45 Suitable',
        innerRadius: '150%',
        radius: '100%',
      }, {
        color: '#fc4',
        startValue: 45,
        endValue: 56,
        balloonText: '45-56 Marginally suitable',
        innerRadius: '150%',
        radius: '100%',
      },
      {
        color: '#f64',
        startValue: 56,
        endValue: 100,
        innerRadius: '150%',
        balloonText: '56-100 Not Suitable',
        radius: '100%',
      }]
  }],
  arrows: []
};


export let backTestChartArray = {
  theme: 'light',
  type: 'serial',
  marginRight: 17,
  autoMarginOffset: 20,
  marginTop: 20,
  valueAxes: [{
    id: 'v1',
    gridAlpha: 0,
    gridCount: 0,
    autoGridCount: false,
    axisAlpha: 0,
    labelsEnabled: false,
    guides: [{
      inside: true,
      lineAlpha: 1,
      lineThickness: 1,
      value: 22.7,
      lineColor: '#678'
    }],
  }],
  graphs: [{
    balloonText: '[[status]] [[value]]%  of the time',
    customBullet: 'assets/images/circle-white.png',
    bulletSize: 20,
    bulletField: 'bullet',
    bulletBorderAlpha: 1,
    bulletBorderThickness: 2,
    bulletBorderColor: '#999',
    lineThickness: 20,
    type: 'smoothedLine',
    useLineColorForBulletBorder: false,
    lineColorField: 'lineColor',
    valueField: 'visits',
    bulletColor: '#fff',
    hideBulletsCount: 50,
  }],
  chartCursor: {
    fullWidth: false,
    cursorAlpha: 0.05,
    valueLineEnabled: false,
    valueLineAlpha: 0,
    valueLineBalloonEnabled: false,
    categoryBalloonEnabled: false,
  },
  pathToImages: 'assets/amcharts/images/',
  categoryField: 'date',
  categoryAxis: {
    axisAlpha: 0,
    labelsEnabled: false,
    gridAlpha: 0,
  },
  chartScrollbar: {},
};


export let allocationChartArray = {
  type: 'pie',
  innerRadius: '65%',
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
  ],
  balloon: {
    offsetX: 0,
    offsetY: 0
  },
};
export let efficientFrontierCashArray = {
  type: 'xy',
  theme: 'light',
  legend: {
    maxColumns: 2,
    useGraphSettings: true,
    valueText: '',
    autoMargins: false
  },

  synchronizeGrid: true,
  valueAxes: [{
    axisColor: '#FF6600',
    axisThickness: 2,
    axisAlpha: 0,
    position: 'left',
    precision: 2,
    minimum: 0,
    title: 'Return',
    labelFunction: function (label) {
      return label + '%';
    }
  }, {
    axisColor: '#FF6600',
    axisThickness: 2,
    axisAlpha: 0,
    precision: 2,
    position: 'bottom',
    title: 'Risk',
    labelFunction: function (label) {
        return label + '%';
    }
  }],
  chartCursor: {
    valueLineAlpha: 0,
    enabled: false,
    oneBalloonOnly: true,
    valueLineBalloonEnabled: false,
    categoryBalloonEnabled: false,
  },
  graphs: [{
    balloonText: 'Return [[category]]% \n Risk [[efficientFrontier]]% ',
    valueAxis: 'v1',
    lineColor: '#bd6',
    bulletBorderThickness: 1,
    hideBulletsCount: 30,
    title: 'Efficient frontier',
    yField: 'efficientFrontier',
    xField: 'date',
    fillAlphas: 0,
  }, {
    balloonText: 'Return [[category]]% \n Risk [[inefficientFrontier]]% ',
    valueAxis: 'v1',
    lineColor: '#FC4',
    bulletBorderThickness: 1,
    hideBulletsCount: 30,
    title: 'Inefficient Frontier',
    yField: 'inefficientFrontier',
    xField: 'date',
    fillAlphas: 0
  }, {
    valueAxis: 'v1',
    balloonText: 'Return [[category]]% \n Risk [[targetPortfolios]]% ',
    lineColor: '#66CCEE',
    bullet: 'round',
    bulletBorderThickness: 1,
    hideBulletsCount: 30,
    title: 'Target portfolios',
    yField: 'targetPortfolios',
    xField: 'date',
    fillAlphas: 0,
    lineThickness: 0,
  }, {
    valueAxis: 'v1',
    balloonText: 'Return [[category]]% \n Risk [[analyzedPortfolio]]% ',
    lineColor: '#77aaff',
    bullet: 'round',
    bulletBorderThickness: 1,
    hideBulletsCount: 30,
    title: 'Analyzed portfolio',
    yField: 'analyzedPortfolio',
    xField: 'date',
    fillAlphas: 0,
    lineThickness: 0,
  }
  ],
  pathToImages: 'assets/amcharts/images/',
  dataProvider: [],
};

export let cashWedgeChartArray = {
  type: 'pie',
  innerRadius: '65%',
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
  allLabels: [
    {
      text: 'Required \n -$260k',
      align: 'center',
      bold: true,
      size: 14,
      color: '#345',
      y: 70,
      id: 'text1'
    },
    {
      text: 'Available \n $54k',
      align: 'center',
      bold: true,
      y: 110,
      color: '#345',
      size: 14,
      id: 'text2'
    }
  ],
  balloon: {
    offsetX: 0,
    offsetY: 0
  },
};
