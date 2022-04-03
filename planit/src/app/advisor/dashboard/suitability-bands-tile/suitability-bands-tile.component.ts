import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import * as $ from 'jquery';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import {
    AppState,
    getAdvisorPayload,
    getGraphColours
} from '../../../shared/app.reducer';
import { PlanningService } from '../../../client/service';
import { AdvisorService } from '../../service/advisor.service';

@Component({
    selector: 'app-suitability-bands-tile',
    templateUrl: './suitability-bands-tile.component.html',
    styleUrls: ['./suitability-bands-tile.component.css']
})

export class SuitabilityBandsTileComponent implements OnInit, OnDestroy {
    public suitabilities = [];
    suitabilityLoaded = false;
    advisorCurrencyCode = '';
    private highestValue = 0;
    private lowestValue = 0;
    chartColours = ['#9999ff', '#BBDD66', '#66ccee'];
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private AmCharts: AmChartsService,
        private advisorService: AdvisorService,
        private planningService: PlanningService
    ) {

        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisorDetails => {
            this.advisorCurrencyCode = advisorDetails['currencyCode'];
        });
    }

    ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.chartColours = res['allGraphColours'];
            }
        });

        this.advisorService.getAdvisorSuitabilitySummaryPayload('CAD').toPromise().then(data => {
            this.suitabilityLoaded = true;
            this.suitabilities = data;
            this.lowestValue = data[0].numberOfPortfolios;
            data.forEach(e => {
                this.highestValue = e.numberOfPortfolios > this.highestValue ? e.numberOfPortfolios : this.highestValue;
                this.lowestValue = e.numberOfPortfolios < this.lowestValue ? e.numberOfPortfolios : this.lowestValue;
            });
            this.highestValue = Math.round(this.highestValue);
            this.highestValue = this.highestValue < 4 ? 4 : this.highestValue;

            // tslint:disable-next-line: triple-equals
            if (this.highestValue % 4 != 0) {
            this.highestValue = this.highestValue + (4 - this.highestValue % 4);
            }

            this.suitabilityChart(data);
        }).catch(errorResponse => {
            this.suitabilityLoaded = true;
            this.suitabilities = [];
        });
    }

    @HostListener('window:resize') onResize() {
        const advisorWidth = $('#advisor_dashboard').width();
        $('#columnChartDiv').css('width', (advisorWidth - ((advisorWidth * 10) / 100)));
        $('#respColumnChartDiv1').css('width', (advisorWidth - ((advisorWidth * 15) / 100)));
        $('#respColumnChartDiv2').css('width', (advisorWidth - ((advisorWidth * 15) / 100)));
        for (let i = 0; i < this.suitabilities.length; i++) {
            $('#resp2ColumnChartDiv' + (i + 1)).css('width', (advisorWidth - 8 - ((advisorWidth * 15) / 100)));
            $('#res2PieChartDivv' + (i + 1)).css('width', (advisorWidth - 8 - ((advisorWidth * 15) / 100)));
            $('#res2PieChartDiv' + (i + 1)).css('margin-left', (1 + (advisorWidth - 400) / 400) * 15);
        }
    }

    private suitabilityChart(data) {
        this.AmCharts.makeChart('columnChartDiv', this.makeColumnOptions(this.setSuitabilityProvider(data, false, false)));
        this.AmCharts.makeChart('respColumnChartDiv1', this.makeColumnOptions(this.setSuitabilityProvider(data.slice(0, 4), true, false, 0)));
        this.AmCharts.makeChart('respColumnChartDiv2', this.makeColumnOptions(this.setSuitabilityProvider(data.slice(4, 7), true, false, 4)));
        for (let i = 0; i < this.suitabilities.length; i++) {
            this.AmCharts.makeChart('resp2ColumnChartDiv' + (i + 1), this.makeColumnOptions(this.setSuitabilityProvider(data.slice(i, i + 1), true, true, i)), 1);
        }

    }

    private setSuitabilityProvider(suitabilities: any[], isResponsive: boolean, isSingleColumn: boolean, indexStart?: number): any {
        const dataProvider = [];
        suitabilities.forEach((suitability, index) => {
            dataProvider.push(
                {
                    Portfolios: suitability.portTypeDesc,
                    assetValue: suitability.numberOfPortfolios,
                    color: '#77aaff'
                }
            );
            if (isResponsive) {
                this.makePieChartOption('resPieChartDiv' + (index + indexStart + 1), suitability);
            } else {
                this.makePieChartOption('pieChartDiv' + (index + 1), suitability);
            }
            if (isSingleColumn) {
                this.makePieChartOption('res2PieChartDiv' + (index + indexStart + 1), suitability);
            }
        });
        return dataProvider;
    }

    private makePieChartOption(id: string, data: any) {
        this.AmCharts.makeChart(id, {
            type: 'pie',
            innerRadius: '80%',
            precision: 2,
            balloonText: '[[title]]: [[value]]%',
            outlineThickness: 3,
            outlineColor: '#FFFFFF',
            labelText: '',
            startRadius: '50%',
            colors: this.chartColours,
            gradientRatio: [],
            hoverAlpha: 0.64,
            labelTickAlpha: 0,
            outlineAlpha: 1,
            startDuration: 0.8,
            autoMargins: false,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 10,
            marginRight: 10,
            pullOutRadius: 0,
            startEffect: 'easeOutSine',
            titleField: 'category',
            valueField: 'column-1',
            accessibleTitle: '',
            theme: 'dark',
            listeners: [
                {
                    event: 'rendered',
                    method: this.handleRendered
                }
            ],
            allLabels: [
                {
                    text: 'Portfolios',
                    align: 'center',
                    bold: false,
                    size: 15,
                    y: 110,
                    color: '#789',
                    id: 'text4'
                },
                {
                    text: data.numberOfPortfolios,
                    align: 'center',
                    bold: false,
                    size: 15,
                    y: 90,
                    color: '#789',
                    id: 'text3'
                },
                {
                    text: this.planningService.transformCurrency(this.advisorCurrencyCode,  data.totalAssetValue, 2) ,
                    // text:
                    //     new CurrencyPipe(this.locale).transform(
                    //         data.totalAssetValue > 1000 ? (data.totalAssetValue / 1000) : data.totalAssetValue,
                    //         'CAD',
                    //         'symbol-narrow',
                    //         '0.0-2'
                    //     ) + 'K',
                    align: 'center',
                    bold: true,
                    size: 16,
                    y: 70,
                    color: '#000000',
                    id: 'text2'
                },
                {
                    text: 'Total',
                    align: 'center',
                    bold: false,
                    y: 45,
                    color: '#789',
                    size: 15,
                    id: 'text1'
                }
            ],
            balloon: {
                offsetX: 0,
                offsetY: 0
            },
            titles: [],
            dataProvider: [
                {
                    'category': 'Cash',
                    'column-1': data.allocation['CASH']
                },
                {
                    'category': 'Fixed Income',
                    'column-1': data.allocation['FIXED_INCOME']
                },
                {
                    'category': 'Equity',
                    'column-1': data.allocation['EQUITY']
                }
            ],
            responsive: {
                enabled: true,
                addDefaultRules: false,
                rules: [
                    {
                        minWidth: 1194,
                        overrides: {
                            allLabels: [
                                {
                                    size: 13,
                                    id: 'text4'
                                },
                                {
                                    size: 13,
                                    id: 'text3'
                                },
                                {
                                    size: 14,
                                    id: 'text2'
                                },
                                {
                                    size: 13,
                                    id: 'text1'
                                }
                            ],
                            marginLeft: 10,
                            marginRight: 10
                        }
                    },
                    {
                        maxWidth: 1024,
                        overrides: {
                            marginLeft: 5,
                            marginRight: 5
                        }
                    }
                ]
            }
        }, 1);
    }

    private makeColumnOptions(dataProvider: any): any {
        return {
            'type': 'serial',
            'theme': 'light',
            'autoMarginOffset': 30,
            'dataProvider': dataProvider,
            'valueAxes': [{
                'gridColor': '#789',
                'gridPosition': 'start',
                'gridAlpha': 0,
                'dashLength': 0,
                'tickLength': 0,
                'color': '#789',
                'titleColor': '#989898',
                'axisThickness': 0,
                'gridThickness': 0,
                minimum: 0,
                maximum: this.highestValue,
                labelsEnabled: false,
                guides: [{
                    value: 0,
                    label: '0',
                    tickLength: 5,
                    lineAlpha: .15
                  }, {
                    value: Math.floor(this.highestValue * 1 / 4),
                    label: Math.floor(this.highestValue * 1 / 4),
                    tickLength: 5,
                    lineAlpha: .15
                  }, {
                    value: Math.floor(this.highestValue * 1 / 2),
                    label: Math.floor(this.highestValue * 1 / 2),
                    tickLength: 5,
                    lineAlpha: .15
                  }, {
                    value: Math.floor(this.highestValue * 3 / 4),
                    label: Math.floor(this.highestValue * 3 / 4),
                    tickLength: 5,
                    lineAlpha: .15
                  }, {
                    value: this.highestValue,
                    label: this.highestValue,
                    tickLength: 5,
                    lineAlpha: .15
                  },

                ]
              }
            ],
            'categoryAxis': {
                'gridColor': '#789',
                'gridPosition': 'start',
                'gridAlpha': 1,
                'tickLength': 0,
                'color': '#789'
            },
            'gridAboveGraphs': true,
            'startDuration': 1,
            'graphs': [
                {
                    'balloonText': '[[category]]: <b>[[value]]</b>',
                    'fillColorsField': 'color',
                    'fillAlphas': 1,
                    'lineAlpha': 0.2,
                    'type': 'column',
                    'fixedColumnWidth': 70,
                    'valueField': 'assetValue'
                }
            ],
            'chartCursor': {
                'categoryBalloonEnabled': false,
                'cursorAlpha': 0,
                'zoomable': false
            },
            'categoryField': 'Portfolios',
            'export': {
                'enabled': true
            },
            'titles': [
                {
                    'size': 15,
                    'color': '#556677',
                    'text': 'Distribution of selected suitability bands'
                }
            ],
            'allLabels': [
                {
                    'text': '# Portfolios',
                    'rotation': 270,
                    'x': '10',
                    'y': '40%',
                    'width': '50%',
                    'size': 16,
                    'bold': false,
                    'align': 'right'
                }
            ],
            'responsive': {
                'enabled': true,
                'addDefaultRules': false,
                'rules': [
                    {
                        'maxWidth': 1194,
                        'overrides': {
                            'graphs': [
                                {
                                    'fixedColumnWidth': 50
                                }
                            ],
                        }
                    },
                    {
                        'maxWidth': 625,
                        'overrides': {
                            'graphs': [
                                {
                                    'fixedColumnWidth': 100
                                }
                            ],
                            'categoryAxis': {
                                'labelRotation': 0
                            },
                        }
                    }
                ]
            }
        };
    }

    private handleRendered() {
        $('[font-family]').removeAttr('font-family');
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
