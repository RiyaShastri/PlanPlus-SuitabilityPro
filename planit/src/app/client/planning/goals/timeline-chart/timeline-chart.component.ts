import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange, OnDestroy } from '@angular/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { goalMapTimeline, goalDailyDollerChart } from '../../../client-models/goal-summary-chart';
import { TranslateService } from '@ngx-translate/core';
import { GOAL_REVENUE_GRAPH_MAP } from '../../../../shared/constants';
import { GoalService } from '../../../service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-timeline-chart',
    templateUrl: './timeline-chart.component.html',
    styleUrls: ['./timeline-chart.component.css']
})
export class TimelineChartComponent implements OnInit, OnChanges, OnDestroy {
    @Input() clientData;
    @Input() titleName;
    @Input() dataProviderList;
    @Input() goalList;
    @Input() goalListAmount;
    @Output() OnSelect = new EventEmitter();
    @Input() selectedDropdownOption;
    public goalMap;
    mapDataprovider;
    goalDailyDollerList;
    goalDailyDollerAmountList;
    GOAL_REVENUE_GRAPH_MAP = GOAL_REVENUE_GRAPH_MAP;
    clientId;
    allCurrencyList = [];
    selectedCountryCurrency;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private amcharts: AmChartsService,
        private translate: TranslateService,
        private goalService: GoalService,
        private router: ActivatedRoute
    ) {
        this.router.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    async ngOnInit() {
        await this.goalService.getAllCurrencyDetail().toPromise().then(result => {
            this.allCurrencyList = result;
            this.selectedCountryCurrency = this.allCurrencyList.find(curr => curr.currencyCode.trim() === this.clientData['currencyCode']);
        }).catch(errorResponse => {
            this.allCurrencyList = [];
        });
        this.translate.stream([
            'GRAPH.DROPDOWN.TIMELINE',
            'GRAPH.DROPDOWN.TODAY_DOLLER',
            'GRAPH.DROPDOWN.FUTURE_DOLLER',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.goalMap = [
                { id: GOAL_REVENUE_GRAPH_MAP.TIME_LINE_CHART, name: i18Text['GRAPH.DROPDOWN.TIMELINE'] },
                { id: GOAL_REVENUE_GRAPH_MAP.TODAY_DOLLAR, name: i18Text['GRAPH.DROPDOWN.TODAY_DOLLER'] + ' ' + (this.selectedCountryCurrency['description']).toLowerCase() },
                { id: GOAL_REVENUE_GRAPH_MAP.FUTURE_DOLLAR, name: i18Text['GRAPH.DROPDOWN.FUTURE_DOLLER'] + ' ' + (this.selectedCountryCurrency['description']).toLowerCase() }
            ];
        });
        // this.mapGrapgData();
        // this.mapDataprovider = {
        //     ...goalMapTimeline,
        //     'dataProvider': this.dataProviderList
        // };
        // this.goalDailyDollerList = {
        //     ...goalDailyDollerChart,
        //     'graphs': this.goalList,
        //     'dataProvider': this.goalListAmount
        // };
        // setTimeout(() => {
        //     this.drawChart();
        // }, 200);
    }

    mapGrapgData() {
        this.mapDataprovider = {
            ...goalMapTimeline,
            'dataProvider': this.dataProviderList
        };
        this.goalDailyDollerList = {
            ...goalDailyDollerChart,
            'graphs': this.goalList,
            'dataProvider': JSON.parse(JSON.stringify(this.goalListAmount))
        };
        setTimeout(() => {
            this.drawChart();
        }, 200);
    }

    drawChart() {
        // this.amcharts.makeChart('goalMapTimeLineDiv', JSON.parse(JSON.stringify(this.mapDataprovider)));
        setTimeout(() => {
            if (this.selectedDropdownOption['id'] === this.GOAL_REVENUE_GRAPH_MAP.TIME_LINE_CHART) {
                this.amcharts.makeChart('goalMapTimeLineDiv', this.mapDataprovider);
            } else if (this.selectedDropdownOption['id'] === this.GOAL_REVENUE_GRAPH_MAP.TODAY_DOLLAR) {
                this.amcharts.makeChart('goalMapDailyDollereDiv', this.goalDailyDollerList);
            } else {
                this.amcharts.makeChart('goalMapDailyDollereDiv', this.goalDailyDollerList);
            }
        }, 200);
    }

    goalMapChange(event) {
        this.OnSelect.emit(event);
    }

    ngOnChanges(changes: SimpleChanges) {
        const name: SimpleChange = changes.dataProviderList;
        this.mapGrapgData();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
