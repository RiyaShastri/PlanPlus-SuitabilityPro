import { Component, OnInit } from '@angular/core';
import { Location, DecimalPipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalculatorService } from '../../../../service';
import { Store } from '@ngrx/store';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppState, getClientPayload } from '../../../../../shared/app.reducer';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { getCurrencySymbol } from '@angular/common';
import swal from 'sweetalert2';
import { valueAtRiskGraph } from '../../../../client-models/goal-analysis-charts';

@Component({
    selector: 'app-life-insurance',
    templateUrl: './life-insurance.component.html',
    styleUrls: ['./life-insurance.component.css']
})
export class LifeInsuranceComponent implements OnInit {

    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    numberMask = createNumberMask({
        prefix: '',
        suffix: ''
    });
    clientId;
    isError;
    selectedScenario;
    clientData = {};
    scenarioLists = [];
    lifeInsuranceData = {};
    graphObj = {};
    i18Text = {};
    isDisabilityInsurance = false;
    savePayload = {};
    saveData: Subject<void> = new Subject<void>();
    private unsubscribe$ = new Subject<void>();

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private calculatorService: CalculatorService,
        private store: Store<AppState>,
        private amcharts: AmChartsService,
        private translate: TranslateService,
        private router: Router,
        private decimalPipe: DecimalPipe
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.clientId = param['clientId'];
        });
        this.isDisabilityInsurance = this.router.url.includes('disability-insurance') ? true : false;
        this.saveData.debounceTime(1000).switchMap(() => this.calculatorService
            .calculateLifeInsuranceAndDisabilityInsurance(this.isDisabilityInsurance, this.savePayload)).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res.hasOwnProperty('errors')) {
                    res['errorsPayload'] = Object.values(res['errors']);
                }
                this.lifeInsuranceData = res;
                this.drawGraph();
                this.isError = (this.lifeInsuranceData.hasOwnProperty('errors') && Object.keys(this.lifeInsuranceData['errors']).length > 0) ? true : false;
            }, err => { });
    }

    async ngOnInit() {
        this.translate.stream([
            'CALCULATOR.LIFE_INSURANCE.SHORTAGE',
            'CALCULATOR.LIFE_INSURANCE.ADDITIONAL_INSURANCE_REQUIRED',
            'CALCULATOR.LIFE_INSURANCE.AMOUNT',
            'CALCULATOR.LIFE_INSURANCE.SUCCESS_FOR_LIFE_INSURANCE',
            'CALCULATOR.LIFE_INSURANCE.SUCCESS_FOR_DISABILITY_INSURANCE',
            'CALCULATOR.WARNING_TITLE',
            'CALCULATOR.WARNING_SELECT_SCENARIO',
            'ALERT.TITLE.SUCCESS',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currency
            });
        });
        this.calculatorService.scenarioDroplistForLifeInsuranceAndDisabilityInsurance(this.isDisabilityInsurance, this.clientId).toPromise().then(result => {
            this.scenarioLists = result;
        }).catch(err => { });
        this.calculatorService.getDataOfLifeInsuranceAndDisabilityInsurance(this.isDisabilityInsurance).toPromise().then(result => {
            this.lifeInsuranceData = result;
            this.drawGraph();
        }).catch(err => { });
    }


    drawGraph() {
        const currency = this.currency;
        const dataProvider = [];
        let graphs = [], valueAxes = [], titles = [];
        this.graphObj = {};
        dataProvider.push({
            country: this.i18Text['CALCULATOR.LIFE_INSURANCE.SHORTAGE'] + (this.lifeInsuranceData['insuranceCurrentBenefitsResponse']['afterTaxRateOfReturn'] - 1) + '%',
            visits: parseFloat(this.decimalPipe.transform((this.isDisabilityInsurance ?
                this.lifeInsuranceData['insuranceAnalysisResponse']['minusOneAfterTaxRateOfReturnSurplus2'] :
                this.lifeInsuranceData['insuranceAnalysisResponse']['minusOneAfterTaxRateOfReturnSurplus']), '1.0-0')),
            color: '#77a9ff'
        });
        dataProvider.push({
            country: this.i18Text['CALCULATOR.LIFE_INSURANCE.SHORTAGE'] + this.lifeInsuranceData['insuranceCurrentBenefitsResponse']['afterTaxRateOfReturn'] + '%',
            visits: parseFloat(this.decimalPipe.transform((this.isDisabilityInsurance ?
                this.lifeInsuranceData['insuranceAnalysisResponse']['surplus2'] : this.lifeInsuranceData['insuranceAnalysisResponse']['surplus']), '1.0-0')),
            color: '#a9dc54'
        });
        dataProvider.push({
            country: this.i18Text['CALCULATOR.LIFE_INSURANCE.SHORTAGE'] + (this.lifeInsuranceData['insuranceCurrentBenefitsResponse']['afterTaxRateOfReturn'] + 1) + '%',
            visits: parseFloat(this.decimalPipe.transform((this.isDisabilityInsurance ?
                this.lifeInsuranceData['insuranceAnalysisResponse']['plusOneAfterTaxRateOfReturnSurplus2'] :
                this.lifeInsuranceData['insuranceAnalysisResponse']['plusOneAfterTaxRateOfReturnSurplus']), '1.0-0')),
            color: '#ee6545'
        });
        graphs = [
            {
                balloonText: '[[category]] : [[value]]' + this.currency,
                fillAlphas: 5,
                type: 'column',
                valueField: 'visits',
                fillColorsField: 'color',
                lineAlpha: 0.2,
            }
        ];
        valueAxes = [{
            gridAlpha: 0.2,
            fillAlpha: 1,
            stackType: 'regular',
            title: this.i18Text['CALCULATOR.LIFE_INSURANCE.AMOUNT'],
            labelFunction: function (number, label) {
                console.log('number', number);
                if (number === 0) {
                    label = currency + '-';
                } else {
                    label = currency + Math.abs(number).toLocaleString('en');
                }
                return label;
            }
        }];
        titles = [
            {
                'text': this.i18Text['CALCULATOR.LIFE_INSURANCE.ADDITIONAL_INSURANCE_REQUIRED'],
                'size': 14,
                'color': '#788588'
            }
        ];
        this.graphObj = {
            ...valueAtRiskGraph,
            titles: titles,
            graphs: graphs,
            dataProvider: dataProvider,
            valueAxes: valueAxes,
            categoryAxis: {
                ...valueAtRiskGraph['categoryAxis'],
                autoWrap: true
            }
        };
        console.log('this.graphObj ===>', this.graphObj);
        setTimeout(() => {
            this.amcharts.makeChart('graphDiv', this.graphObj);
        }, 1000);
    }

    async calculateData() {
        this.savePayload = await this.setPayload();
        this.saveData.next();
    }

    setPayload() {
        const dataPayload = {
            ...this.lifeInsuranceData,
            screenId: this.selectedScenario && this.selectedScenario['key'] ? this.selectedScenario['key'] : null,
            errors: {}
        };
        return dataPayload;
    }

    changeScenario() {
        this.setData();
    }

    setData() {
        if (this.selectedScenario && this.selectedScenario['key']) {
            this.calculatorService.getDataOfLifeInsuranceAndDisabilityInsurance(this.isDisabilityInsurance, this.clientId, this.selectedScenario['key']).toPromise().then(result => {
                this.lifeInsuranceData = result;
                this.drawGraph();
            }).catch(error => { });
        } else {
            swal(this.i18Text['CALCULATOR.WARNING_TITLE'], this.i18Text['CALCULATOR.WARNING_SELECT_SCENARIO'], 'warning');
        }
    }

    back() {
        this.location.back();
    }

    async saveCalculatorData(f: NgForm) {
        if (f.valid) {
            this.savePayload = await this.setPayload();
            this.calculatorService.saveLifeInsuranceAndDisabilityInsurance(this.isDisabilityInsurance, this.clientId, this.savePayload).toPromise().then(result => {
                this.back();
                if (this.isDisabilityInsurance) {
                    swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['CALCULATOR.LIFE_INSURANCE.SUCCESS_FOR_DISABILITY_INSURANCE'], 'success');
                } else {
                    swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['CALCULATOR.LIFE_INSURANCE.SUCCESS_FOR_LIFE_INSURANCE'], 'success');
                }
            }).catch(errorResponse => {
                swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
            });
        }
    }

    generateReport() {
    }

}
