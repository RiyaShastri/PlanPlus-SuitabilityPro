import { Component, OnInit, Input } from '@angular/core';
import { getCurrencySymbol, CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { AppState, getClientPayload, getGraphColours } from '../../../../../shared/app.reducer';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-value-advice-tile',
    templateUrl: './value-advice-tile.component.html',
    styleUrls: ['./value-advice-tile.component.css']
})
export class ValueAdviceTileComponent implements OnInit {

    @Input() graphColours = [];
    @Input() valueOfAdviceData = {};
    currency;
    clientData;
    noData = true;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private amcharts: AmChartsService,
        private cp: CurrencyPipe
    ) { }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
        });
        if (this.graphColours.length === 0) {
            this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                    this.graphColours = res['allGraphColours'];
                }
            });
        }

        const dataProvider = [];
        this.noData = false;
        if (this.valueOfAdviceData['valueOfAdviceItems'].length > 0) {
            this.valueOfAdviceData['valueOfAdviceItems'].forEach((element, index) => {
                element['color'] = this.graphColours[index];
                if (element.impactStr !== 'N/A') {
                    element['displayValue'] = this.cp.transform(element.impact, this.clientData['currencyCode'], 'symbol-narrow', '1.0-0');
                    dataProvider.push(element);
                }
            });
            setTimeout(() => {
                if (dataProvider.length > 0) {
                    this.drawChart(dataProvider);
                } else {
                    this.noData = true;
                }
            }, 200);
        } else {
            this.noData = true;
        }
    }

    drawChart(dataProvider) {
        const chartArray = {
            type: 'serial',
            theme: 'light',
            autoResize: true,
            dataProvider: dataProvider,
            valueAxes: [{
                gridAlpha: 0,
                dashLength: 0,
                tickLength: 0,
                axisThickness: 0,
                labelsEnabled: false
            }],
            startDuration: 1,
            graphs: [{
                showBalloon: true,
                balloonText: '[[category]]:' + '<b>[[displayValue]]</b>',
                fillAlphas: 1,
                lineAlpha: 0,
                type: 'column',
                valueField: 'impact',
                // labelText: '[[displayValue]]',
                fixedColumnWidth: 40,
                fillColorsField: 'color',
                colorField: 'color',
            }],
            //   chartCursor: {
            //     categoryBalloonEnabled: false,
            //     cursorAlpha: 0,
            //     zoomable: false
            //   },
            categoryField: 'description',
            categoryAxis: {
                gridAlpha: 0,
                tickLength: 0,
                axisThickness: 0,
                labelsEnabled: false
            }
        };
        this.amcharts.makeChart('chartDiv', chartArray);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
