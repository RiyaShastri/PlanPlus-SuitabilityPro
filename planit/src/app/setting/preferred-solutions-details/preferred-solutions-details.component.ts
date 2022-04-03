import { Component, OnDestroy, OnInit } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { Angulartics2 } from 'angulartics2';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PageTitleService } from '../../shared/page-title';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { AccessRightService } from '../../shared/access-rights.service';
import { pieChartArray } from '../../client/client-models/portfolio-charts';
import { SettingService } from '../service';
import { StackBarChart, SOLUTION_DETAILS_PAYLOAD } from '../settings-models';
import { fadeInAnimation } from '../../shared/animations';
import { RefreshDataService } from '../../shared/refresh-data';
import { SOLUTION_TYPES, ASSET_TYPE, RANGE_RADIOBUTTON_OPTIONS, ADVISOR_TYPES, RISK_RANGES } from '../../shared/constants';
import { AppState, getAdvisorPayload, getAllCountryFormatePayload, getGraphColours } from '../../shared/app.reducer';
import { DocumentService } from '../../client/service';

@Component({
    selector: 'app-preferred-solutions-details',
    templateUrl: './preferred-solutions-details.component.html',
    styleUrls: ['./preferred-solutions-details.component.css'],
    animations: [fadeInAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@fadeInAnimation]': '' }
})
export class PreferredSolutionsDetailsComponent implements OnInit, OnDestroy {
    stackBarChart;
    policyChart;
    policyChart2;
    solutionFamilyDetails = [];
    graphColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    currencyMask = createNumberMask({
        prefix: '$'
    });
    allowTranslate = false;
    displayPrefrence = {};
    // isView = false;
    dataProviderStackBar = {};
    graphsStackBar = [];
    sliderValue = [];
    formatsByCountry = [];
    maxDate = new Date();
    yearRange = (this.maxDate.getFullYear() - 100) + ':' + this.maxDate.getFullYear();
    assetObj = {};
    solutionTypes = SOLUTION_TYPES;
    selectedSolutionType = SOLUTION_TYPES.TAILORED_SOLUTION;
    reqData = JSON.parse(JSON.stringify(SOLUTION_DETAILS_PAYLOAD));
    ganttChartDataProvider = [];
    graphError = '';
    chartColour = [];
    saveDisable = false;
    region = '0001';
    closeButtonDisable = false;
    isShowRegion = false;
    advisorId = '';
    country = '';
    parentRegion = false;
    personalSolution = false;
    dateFormat = 'yy/mm/dd';
    datePipeFormat = 'yy/MM/dd';
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    i18text = {};
    productTotal = 0;
    selectedTab = ADVISOR_TYPES['PROFILER'];
    productAllocations;
    solutionObj = {
        'profiler': {
            totalAllocation: 0,
            cashAllocation: 0
        },
        'protracker': {
            totalAllocation: 0,
            cashAllocation: 0
        }
    };

    assetType = ASSET_TYPE;
    $calculate: Subject<void> = new Subject<void>();
    rangeOptions = RANGE_RADIOBUTTON_OPTIONS;
    advisorTypes = ADVISOR_TYPES;
    isAnalyticsSidePanelOpen = false;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private AmCharts: AmChartsService,
        private settingService: SettingService,
        private advisorService: AdvisorService,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private refreshDataService: RefreshDataService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private documentService: DocumentService
    ) {
        this.accessRightService.getAccess(['MAPPINGADMIN', 'CUSTIMPL', 'PREFSOLTNTRACKER']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.accessRights = res;
        });
        this.angulartics2.eventTrack.next({ action: 'preferredSolutionDetails' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PREFERRED_SOLUTION_DETAILS_TITLE');
        this.activatedRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params: Params) => {
            if (params['solutionId']) {
                this.displayPrefrence['isView'] = true;
                this.reqData['solutionId'] = params['solutionId'];
            } else if (params['solutionFamilyId']) {
                this.displayPrefrence['isAdd'] = true;
                this.reqData['solutionFamilyId'] = params['solutionFamilyId'];
            } else {
                this.displayPrefrence['isEdit'] = true;
            }
        });
        this.activatedRoute.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params['solutionFamily'] && this.reqData && this.reqData['solutionFamilyObj']) {
                this.reqData['solutionFamilyObj']['solutionFamilyId'] = params['solutionFamily'];
            }
        });
        this.$calculate.debounceTime(1000).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.updateSuitabilityRange();
        });
    }

    ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.chartColour = res['allGraphColours'];
            }
        });
        this.translate.stream([
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.POPUP.CHANGE_TO_SINGLE_FUND_WARNING',
            'ALERT_MESSAGE.WISH_TO_PROCEED_QUESTION',
            'FORM.ACTION.PROCEED',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
            'PORTFOLIO.IMPLEMENTATION.PRODUCT_INFO_DOCUMENT_AVAILABLE',
            'GENERATE_REPORT.POPUP.REPORT_DOWNLOAD_QUESTION',
            'CUSTOM.DOWNLOAD',
            'ALERT_MESSAGE.OOPS_TEXT',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.POPUP.SAVE_SOLUTION_TITLE',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.POPUP.SAVE_SOLUTION_TEXT',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.POPUP.SAVE_SOLUTION_SUCCESS',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.INVALID_RISK_RANGE_ERROR',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.INVALID_UPPER_RISK_RANGE_ERROR',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.INVALID_OK_RISK_RANGE_ERROR',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.INVALID_MARGINAL RISK_RANGE_ERROR',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.TOO_MUCH',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.TOO_LITTLE',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.MARGINALLY_UPPER',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.MARGINALLY_LOWER',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.SUITABLE',
            'SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.TOO_MUCH',
            'PORTFOLIO.IMPLEMENTATION.POPUP.REMOVE_PRODUCT_WARNING'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            this.i18text = text;
        });

        this.getListOfSolutionFamily();
        if (this.displayPrefrence['isAdd']) {
            this.getListOfAssetClasses();
        }
        this.advisorService.headerLoaded.pipe(takeUntil(this.unsubscribe$)).subscribe(async val => {
            if (val) {
                this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                    if (res) {
                        this.isShowRegion = res['clientFilter'] === 4;
                        this.advisorId = res['planner'];
                        this.region = res['region'];
                        this.country = res['country'];
                        this.currencyMask = createNumberMask({
                            prefix: getCurrencySymbol(res['currencyCode'], 'narrow'),
                        });
                    }
                });

                this.settingService.getAccesibleLanguage().toPromise().then(getAccesibleLanguage => {
                    (getAccesibleLanguage.length) ? this.allowTranslate = true : this.allowTranslate = false;
                }).catch(error => { });

                this.dataProviderStackBar['year'] = '';
                this.settingService.getInvestmentPolicies().toPromise().then(response => {
                    this.graphsStackBar = [];
                    response.forEach((investment, index) => {
                        let graphValue = 0;
                        const graphObj = {
                            'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b>' + investment.suitabilityLow + '-' + investment.suitabiliyHigh + '</b></span>',
                            // 'labelText': '[[value]]',
                            'fillColors': this.chartColour[index],
                            'labelPosition': 'inside',
                            'color': '#000000',
                            'fillAlphas': 0.8,
                            'lineAlpha': 0.2,
                            'title': investment.description,
                            'type': 'column',
                            'valueField': investment.investmentPolicyId.trim()
                        };
                        if (index === 0) {
                            graphObj['newStack'] = true;
                            graphValue = investment.suitabiliyHigh - investment.suitabilityLow;
                        } else {
                            graphValue = (investment.suitabiliyHigh - investment.suitabilityLow) + 1;
                        }
                        this.dataProviderStackBar[investment.investmentPolicyId.trim()] = graphValue;
                        this.graphsStackBar.push(graphObj);
                        this.sliderValue.push({
                            name: investment.description,
                            colour: this.chartColour[index],
                            percent: graphValue
                        });
                    });
                    setTimeout(() => {
                        this.getChartLoaded(this.dataProviderStackBar, this.graphsStackBar);
                    }, 100);
                }).catch(errorRespone => {
                });
                this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
                    if (this.reqData['solutionFamilyId']) {
                        this.createAllocationGraph();
                    }
                });

                this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    if (data) {
                        this.formatsByCountry = data;
                        if (this.formatsByCountry[this.country]) {
                            this.datePipeFormat = this.formatsByCountry[this.country]['dateFormate'];
                            const format = this.formatsByCountry[this.country]['dateFormate'];
                            if (format.includes('yyyy') || format.includes('YYYY')) {
                                this.dateFormat = format.replace('yyyy' || 'YYYY', 'yy').replace('MM' || 'M', 'mm');
                            } else {
                                this.dateFormat = format.replace('yy' || 'YY', 'y').replace('MM' || 'M', 'mm');
                            }
                        }
                    }
                });
            }
        });
        this.advisorService.headerLoaded.emit(true);

        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('products_selected_to_add|')) {
                const obj = JSON.parse(message.replace('products_selected_to_add|', ''));
                obj['selectedProducts'].forEach(product => {
                    let prodId = '';
                    let prodSub = '';
                    let productCode = '';
                    let assetClassName = '';
                    if (product.subProducts.length > 1) {
                        prodId = product.productId;
                        prodSub = product.selectedProductCode.subProductId;
                        productCode = product.selectedProductCode.productCode;
                        assetClassName = product.selectedProductCode.assetClassName;
                    } else {
                        prodId = product.productId;
                        prodSub = product.subProducts[0].subProductId;
                        productCode = product.subProducts[0].productCode;
                        assetClassName = product.subProducts[0].assetClassName;
                    }
                    const productDetails = {
                        assetClassName: assetClassName,
                        currency: product.currency,
                        percentage: this.reqData['protracker']['solutionType'] === SOLUTION_TYPES.SINGLE_FUND_SOLUTION ||
                            (obj['selectedProducts'].length === 1 && this.reqData['protracker']['products'].length === 0) ? 100 : 0,
                        productCode: productCode,
                        productDescription: product.productDescription,
                        productId: prodId,
                        subProductId: prodSub
                    };
                    this.reqData['protracker']['products'].push(productDetails);
                });
                this.calcTotalProductPercentage();
                this.refreshDataService.changeMessage('default message');
            }
        });
        this.settingService.newCustomProductsData.pipe(takeUntil(this.unsubscribe$)).subscribe(productDetails => {
            productDetails['percentage'] = this.reqData['protracker']['solutionType'] === SOLUTION_TYPES.SINGLE_FUND_SOLUTION ||
                this.reqData['protracker']['products'].length === 0 ? 100 : 0;
            this.reqData['protracker']['products'].push(productDetails);
            this.calcTotalProductPercentage();
        });
    }

    getListOfAssetClasses() {
        this.settingService.getAllocationClassDetails(this.reqData['solutionFamilyId']).toPromise().then(allocations => {
            if (allocations) {
                allocations.forEach((assetClass, index) => {
                    assetClass['type'] = assetClass['type'] === ASSET_TYPE.CASH ? 1 : (assetClass['type'] === ASSET_TYPE.EQUITY ? 2 : 3);
                    assetClass['displayOrder'] = index + 1;
                    assetClass['percentage'] = (assetClass['type'] === 1) ? 100 : 0;
                });
                this.reqData['profiler']['assetAllocations'] = Object.assign([], allocations);
                this.calculateTotalAllocation();
                this.updateRiskRates();
            }
        });
    }

    getAllocationDataForProducts() {
        const productsAllocationObj = [];
        const totalProducts = this.reqData[this.selectedTab]['products'].length;
        if (totalProducts > 0) {
            this.reqData[this.selectedTab]['products'].forEach((product, index) => {
                productsAllocationObj.push({
                    productId: product.productId,
                    percentage: product.percentage
                });
                if (index === totalProducts - 1) {
                    this.getAllocation(productsAllocationObj);
                }
            });
        } else {
            this.reqData[this.selectedTab]['assetAllocations'] = [];
            this.reqData[this.selectedTab]['currencyAllocations'] = [];
            this.calculateTotalAllocation();
            this.updateRiskRates();
        }
    }

    getAllocation(productsAllocationObj) {
        this.settingService.getAllocationsBasedOnProducts(productsAllocationObj, this.reqData['solutionFamilyObj']['countryCode']).toPromise().then(allocation => {
            this.reqData[this.selectedTab]['assetAllocations'] = allocation['assetAllocations'];
            this.reqData[this.selectedTab]['currencyAllocations'] = allocation['currencyAllocations'];
            this.calculateTotalAllocation();
            this.updateRiskRates();
        }).catch(err => { });
    }

    calculateTotalAllocation() {
        this.solutionObj[this.selectedTab].totalAllocation = 0;
        this.solutionObj[this.selectedTab].cashAllocation = 0;
        this.reqData[this.selectedTab]['calculatedGrowth'] = 0;
        this.reqData[this.selectedTab]['assetAllocations'].forEach(asset => {
            this.solutionObj[this.selectedTab].totalAllocation = this.solutionObj[this.selectedTab].totalAllocation + asset.percentage;
            if (asset.type !== 1) {
                this.solutionObj[this.selectedTab].cashAllocation = this.solutionObj[this.selectedTab].cashAllocation + asset.percentage;
            }
            if (asset.type === 2) {
                this.reqData[this.selectedTab]['calculatedGrowth'] = this.reqData[this.selectedTab]['calculatedGrowth'] + asset.percentage;
                if (!this.reqData[this.selectedTab]['overrideAppliedGrowth']) {
                    this.reqData[this.selectedTab]['appliedGrowth'] = this.reqData[this.selectedTab]['calculatedGrowth'];
                }
                this.reqData[this.selectedTab]['defaultAppliedGrowth'] = this.reqData[this.selectedTab]['appliedGrowth'];
            }
        });
    }

    updateRiskRates() {
        if (this.reqData[this.selectedTab]['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS['DEFAULT']) {
            this.assetObj['assetClass'] = this.formatedDataForAssetClasses();
            this.assetObj['countryCode'] = this.reqData['solutionFamilyObj']['countryCode'] ? this.reqData['solutionFamilyObj']['countryCode'] : this.country;
            this.assetObj['region'] = this.region;

            this.settingService.updateRiskGraph(this.assetObj).toPromise().then(async res => {
                this.reqData[this.selectedTab]['rateOfReturn'] = await res['rateOfReturn'];
                this.reqData[this.selectedTab]['risk'] = await res['riskValue'];
                await this.createAllocationGraph();
                await this.updateSuitabilityRange();
            }).catch(err => {
                this.updateSuitabilityRange();
            });
        } else {
            this.updateSuitabilityRange();
        }
    }

    createAllocationGraph() {
        const dataProvider = [];
        this.reqData[this.selectedTab]['assetAllocations'].forEach(element => {
            this.translate.get(['SSID_LABELS.' + element.ssid]).pipe(takeUntil(this.unsubscribe$)).subscribe((response: string) => {
                dataProvider.push({ category: response['SSID_LABELS.' + element.ssid], percent: element.percentage });
            });
        });
        setTimeout(() => {
            this.drawGraph(dataProvider);
        }, 300);
    }

    drawGraph(dataProvider) {
        const chartArray = {
            ...pieChartArray,
            allLabels: [
                {
                    text: 'Return ' + this.reqData[this.selectedTab]['rateOfReturn'] + '%',
                    align: 'center',
                    bold: false,
                    size: 14,
                    color: '#345',
                    y: 80,
                    id: 'text1'
                },
                {
                    text: 'Risk ' + this.reqData[this.selectedTab]['risk'] + '%',
                    align: 'center',
                    bold: false,
                    y: 100,
                    color: '#345',
                    size: 14,
                    id: 'text2'
                }
            ],
            balloonText: '[[category]] [[percent]]%',
            titleField: 'category',
            valueField: 'percent',
            colors: this.graphColors,
            dataProvider: dataProvider,
        };
        this.policyChart = this.AmCharts.makeChart('chartdiv1', chartArray);
        this.policyChart2 = this.AmCharts.makeChart('chartdiv2', chartArray);
    }

    onChangeOfAppliedGrowth() {
        this.$calculate.next();
    }

    updateSuitabilityRange() {
        if (!this.reqData[this.selectedTab]['overrideAppliedGrowth']) {
            this.reqData[this.selectedTab]['appliedGrowth'] = this.reqData[this.selectedTab]['calculatedGrowth'];
        }
        this.reqData[this.selectedTab]['defaultAppliedGrowth'] = this.reqData[this.selectedTab]['appliedGrowth'];
        if (this.reqData[this.selectedTab]['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS['DEFAULT']) {
            this.settingService.riskRanges(this.reqData[this.selectedTab]['defaultAppliedGrowth']).toPromise().then(res => {
                this.reqData[this.selectedTab]['defaultOkRangeLow'] = res['okRangeLow'];
                this.reqData[this.selectedTab]['defaultOkRangeHigh'] = res['okRangeHi'];
                this.reqData[this.selectedTab]['defaultMarginalRangeLow'] = (res['marginalRangeLow']) ? res['marginalRangeLow'] : 0;
                this.reqData[this.selectedTab]['defaultMarginalRangeHigh'] = res['marginalRangeHigh'];
                this.reqData[this.selectedTab]['inputOkRangeLow'] = res['okRangeLow'];
                this.reqData[this.selectedTab]['inputOkRangeHigh'] = res['okRangeHi'];
                this.reqData[this.selectedTab]['inputMarginalRangeLow'] = (res['marginalRangeLow']) ? res['marginalRangeLow'] : 0;
                this.reqData[this.selectedTab]['inputMarginalRangeHigh'] = res['marginalRangeHigh'];
                this.updateOnClasses(RANGE_RADIOBUTTON_OPTIONS['DEFAULT']);
            }).catch(err => { });
        }
    }

    updateOnClasses(type) {
        const okayHighKey = type + 'OkRangeHigh';
        const okayLowKey = type + 'OkRangeLow';
        const marginalLowKey = type + 'MarginalRangeLow';
        const marginalHighKey = type + 'MarginalRangeHigh';

        if (type === RANGE_RADIOBUTTON_OPTIONS.INPUT) {
            if (
                this.reqData[this.selectedTab][okayLowKey] === 0 &&
                this.reqData[this.selectedTab][okayHighKey] === 0 &&
                this.reqData[this.selectedTab][marginalLowKey] === 0 &&
                this.reqData[this.selectedTab][marginalHighKey] === 0
            ) {
                return;
            }
        }

        if (
            this.reqData[this.selectedTab][okayHighKey] <= 0 ||
            this.reqData[this.selectedTab][okayHighKey] > 100 ||
            this.reqData[this.selectedTab][marginalHighKey] <= 0 ||
            this.reqData[this.selectedTab][marginalHighKey] > 100 ||
            this.reqData[this.selectedTab][okayLowKey] >= 100 ||
            this.reqData[this.selectedTab][marginalLowKey] >= 100
        ) {
            this.graphError = this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.INVALID_RISK_RANGE_ERROR'];
            return;
        }
        if (
            (this.reqData[this.selectedTab][okayHighKey] < this.reqData[this.selectedTab][okayLowKey])
            || (this.reqData[this.selectedTab][marginalHighKey] < this.reqData[this.selectedTab][marginalLowKey])
        ) {
            this.graphError = this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.INVALID_UPPER_RISK_RANGE_ERROR'];
            return;
        }
        if (this.reqData[this.selectedTab][marginalLowKey] > this.reqData[this.selectedTab][okayLowKey]) {
            this.graphError = this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.INVALID_OK_RISK_RANGE_ERROR'];
            return;
        }
        if (this.reqData[this.selectedTab][marginalHighKey] < this.reqData[this.selectedTab][okayHighKey]) {
            this.graphError = this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.INVALID_MARGINAL_RISK_RANGE_ERROR'];
            return;
        }

        const riskRangeArray = [];
        this.graphError = '';
        if (this.reqData[this.selectedTab][okayLowKey] !== 0) {

            if (this.reqData[this.selectedTab][marginalLowKey] !== 0) {
                riskRangeArray.push({
                    'high': this.reqData[this.selectedTab][marginalLowKey] - 1,
                    'low': 0,
                    'riskType': RISK_RANGES['TOO_MUCH']
                });
            }

            riskRangeArray.push({
                'high': this.reqData[this.selectedTab][okayLowKey] - 1,
                'low': this.reqData[this.selectedTab][marginalLowKey],
                'riskType': RISK_RANGES['MARGINAL_UPPER']
            });
        }

        riskRangeArray.push({
            'high': this.reqData[this.selectedTab][okayHighKey],
            'low': this.reqData[this.selectedTab][okayLowKey],
            'riskType': RISK_RANGES['OK']
        });

        if (this.reqData[this.selectedTab][okayHighKey] !== 100) {
            riskRangeArray.push({
                'high': this.reqData[this.selectedTab][marginalHighKey],
                'low': this.reqData[this.selectedTab][okayHighKey] + 1,
                'riskType': RISK_RANGES['MARGINAL_LOWER']
            });

            if (this.reqData[this.selectedTab][marginalHighKey] !== 100) {
                riskRangeArray.push({
                    'high': 100,
                    'low': this.reqData[this.selectedTab][marginalHighKey] + 1,
                    'riskType': RISK_RANGES['TOO_LITTLE']
                });
            }
        }

        const graphObj = {};
        const segmentsObj = {};
        segmentsObj['category'] = '';
        graphObj['dataProvider'] = [];
        segmentsObj['segments'] = [];
        riskRangeArray.forEach((range, index) => {
            const chartData = this.getSolutionData(range['riskType']);
            chartData['duration'] = range['high'] - range['low'];
            chartData['high'] = range['high'];
            chartData['low'] = range['low'];

            if (index === 0) {
                chartData['start'] = 0;
            }
            segmentsObj['segments'].push(chartData);
        }, this);
        graphObj['dataProvider'].push(segmentsObj);
        this.ganttChartDataProvider = [];
        this.ganttChartDataProvider.push(graphObj['dataProvider'][0]);
    }

    getListOfSolutionFamily() {
        this.settingService.getSolutionFamily().toPromise().then(data => {
            this.solutionFamilyDetails = data;
            if (this.reqData['solutionFamilyId']) {
                this.getPreselectedSolutionFamily(this.reqData['solutionFamilyId']);
            } else if (this.displayPrefrence['isView']) {
                this.getSolutionDetails(this.reqData['solutionId']);
            }
        }).catch(err => { });
    }

    getSolutionDetails(solutionId) {
        this.settingService.getSolutionDetails(solutionId).toPromise().then(data => {
            if (data) {
                this.reqData = JSON.parse(JSON.stringify(data));
                this.getPreselectedSolutionFamily(this.reqData['solutionFamilyId']);
                if (this.reqData['lastReviewed']) {
                    this.reqData['lastReviewed'] = this.createDateAsUTC(this.reqData['lastReviewed']);
                }
                if (this.reqData['lastUpdateDate']) {
                    this.reqData['lastUpdateDate'] = this.createDateAsUTC(this.reqData['lastUpdateDate']);
                }
            }
        }).catch(err => { });
    }

    getPreselectedSolutionFamily(solutionFamilyId) {
        this.reqData['solutionFamilyObj'] = this.solutionFamilyDetails.find(x => x['solutionFamilyId'] === solutionFamilyId);
        if (this.reqData['solutionFamilyObj']) {
            this.parentRegion = this.reqData['solutionFamilyObj'].parentRegion;
            this.personalSolution = this.reqData['solutionFamilyObj'].ownerType === 'A';
        }
        if (this.displayPrefrence['isAdd']
            && (this.reqData['countryCode'] === null
                || this.reqData['countryCode'] === undefined)) {
            this.reqData['countryCode'] = this.reqData['solutionFamilyObj']['countryCode'];
        }
        this.setData();
        this.settingService.getTranslation(this.reqData['solutionFamilyObj']['countryCode'], this.region);
    }

    setData() {
        this.reqData.profiler['selectedRangeType'] = this.reqData.profiler['customRange'] === true ? RANGE_RADIOBUTTON_OPTIONS['CUSTOM'] : RANGE_RADIOBUTTON_OPTIONS['DEFAULT'];
        if (!this.reqData.profiler['overrideAppliedGrowth']) {
            this.reqData.profiler['appliedGrowth'] = this.reqData.profiler['calculatedGrowth'];
        }
        this.reqData.profiler['defaultAppliedGrowth'] = this.reqData.profiler['appliedGrowth'];
        this.reqData.profiler['inputOkRangeLow'] = this.reqData.profiler['okayLow'];
        this.reqData.profiler['inputOkRangeHigh'] = this.reqData.profiler['okayHigh'];
        this.reqData.profiler['inputMarginalRangeLow'] = this.reqData.profiler['marginalLow'];
        this.reqData.profiler['inputMarginalRangeHigh'] = this.reqData.profiler['marginalHigh'];
        this.reqData.profiler['defaultOkRangeLow'] = this.reqData.profiler['okayLow'];
        this.reqData.profiler['defaultOkRangeHigh'] = this.reqData.profiler['okayHigh'];
        this.reqData.profiler['defaultMarginalRangeLow'] = this.reqData.profiler['marginalLow'];
        this.reqData.profiler['defaultMarginalRangeHigh'] = this.reqData.profiler['marginalHigh'];

        this.reqData.protracker['selectedRangeType'] = this.reqData.protracker['customRange'] === true ? RANGE_RADIOBUTTON_OPTIONS['CUSTOM'] : RANGE_RADIOBUTTON_OPTIONS['DEFAULT'];
        if (!this.reqData.protracker['overrideAppliedGrowth']) {
            this.reqData.protracker['appliedGrowth'] = this.reqData.protracker['calculatedGrowth'];
        }
        this.reqData.protracker['defaultAppliedGrowth'] = this.reqData.protracker['appliedGrowth'];
        this.reqData.protracker['inputOkRangeLow'] = this.reqData.protracker['okayLow'];
        this.reqData.protracker['inputOkRangeHigh'] = this.reqData.protracker['okayHigh'];
        this.reqData.protracker['inputMarginalRangeLow'] = this.reqData.protracker['marginalLow'];
        this.reqData.protracker['inputMarginalRangeHigh'] = this.reqData.protracker['marginalHigh'];
        this.reqData.protracker['defaultOkRangeLow'] = this.reqData.protracker['okayLow'];
        this.reqData.protracker['defaultOkRangeHigh'] = this.reqData.protracker['okayHigh'];
        this.reqData.protracker['defaultMarginalRangeLow'] = this.reqData.protracker['marginalLow'];
        this.reqData.protracker['defaultMarginalRangeHigh'] = this.reqData.protracker['marginalHigh'];
        this.selectedSolutionType = this.reqData.protracker['solutionType'];


        if (!this.displayPrefrence['isAdd']) {
            this.calcTotalProductPercentage(false);
            this.calculateTotalAllocation();
            this.updateRiskRates();
            this.createAllocationGraph();
            if (this.reqData[this.selectedTab]['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS['CUSTOM']) {
                this.updateOnClasses(RANGE_RADIOBUTTON_OPTIONS['INPUT']);
            } else {
                this.updateOnClasses(RANGE_RADIOBUTTON_OPTIONS['DEFAULT']);
            }
        }
    }

    updateGraph() {
        this.calculateTotalAllocation();
        if (this.solutionObj[this.selectedTab]['cashAllocation'] < 100) {
            this.reqData[this.selectedTab]['assetAllocations'][0].percentage = 100 - this.solutionObj[this.selectedTab]['cashAllocation'];
        } else {
            this.reqData[this.selectedTab]['assetAllocations'][0].percentage = 0;
        }
        this.calculateTotalAllocation();
        this.updateRiskRates();
    }

    getChartLoaded(dataProvider, graphs) {
        const stackBarChart = {
            ...StackBarChart,
            dataProvider: [dataProvider],
            graphs: graphs,
            colors: this.chartColour
        };
        this.stackBarChart = this.AmCharts.makeChart('chartdiv', stackBarChart);
        const ngcontent = '_ngcontent-c14';
        $('.irs:first').find('.irs').find('.irs-line').remove();
        let addDynamicBlock = '<div ' + ngcontent + ' class="slider-main">';
        this.sliderValue.forEach(val => {
            addDynamicBlock = addDynamicBlock + '<div ' + ngcontent + ' style="width: ' + val.percent + '%;background: ' + val.colour + ';"></div>';
        });
        addDynamicBlock = addDynamicBlock + '</div>';
        $('.irs:first').find('.irs').prepend(addDynamicBlock);
        // $('.irs-slider').empty().prepend(this.fromPoint.toString());
        $('.irs-slider').empty().prepend('0');
        $('.irs-grid').css({ 'border-top': '2px solid #c5c5c5' });
        $('.p-slider .irs-grid-text').css({ 'margin-bottom': '25px' });
        setTimeout(() => {
            $('.irs-with-grid .irs-grid').css({ 'width': '100%', 'left': '0' });
        }, 100);

    }

    createDateAsUTC(date) {
        let d1;
        if (date == null) {
            d1 = new Date();
        } else {
            d1 = new Date(date);
        }
        return new Date(d1.getTime() + d1.getTimezoneOffset() * 60 * 1000);
    }

    getSolutionData(term) {
        if (term === RISK_RANGES['TOO_MUCH']) {
            return { 'color': '#f64', 'task': this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.TOO_MUCH'] };
        } else if (term === RISK_RANGES['TOO_LITTLE']) {
            return { 'color': '#f64', 'task': this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.TOO_LITTLE'] };
        } else if (term === RISK_RANGES['MARGINAL_UPPER']) {
            return { 'color': '#FC4', 'task': this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.MARGINALLY_UPPER'] };
        } else if (term === RISK_RANGES['MARGINAL_LOWER']) {
            return { 'color': '#FC4', 'task': this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.MARGINALLY_LOWER'] };
        } else if (term === RISK_RANGES['OK']) {
            return { 'color': '#bd6', 'task': this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.SUITABLE'] };
        } else {
            return { 'color': '#f64', 'task': this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.RISK_RANGES.TOO_MUCH'] };
        }
    }

    saveSolution() {
        if (this.reqData['profiler']['selectedValue'] === RANGE_RADIOBUTTON_OPTIONS['CUSTOM']) {

            if (
                this.reqData['profiler']['inputOkRangeLow'] === 0 &&
                this.reqData['profiler']['inputOkRangeHigh'] === 0 &&
                this.reqData['profiler']['inputMarginalRangeLow'] === 0 &&
                this.reqData['profiler']['inputMarginalRangeHigh'] === 0
            ) {
                this.graphError = 'Invalid Range Selection!';
                return;
            } else {
                this.graphError = '';
            }
        }

        if (this.reqData['protracker']['selectedValue'] === RANGE_RADIOBUTTON_OPTIONS['CUSTOM']) {

            if (
                this.reqData['protracker']['inputOkRangeLow'] === 0 &&
                this.reqData['protracker']['inputOkRangeHigh'] === 0 &&
                this.reqData['protracker']['inputMarginalRangeLow'] === 0 &&
                this.reqData['protracker']['inputMarginalRangeHigh'] === 0
            ) {
                this.graphError = 'Invalid Range Selection!';
                return;
            } else {
                this.graphError = '';
            }
        }

        const profilerTxtPrefix = this.reqData['profiler']['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS['CUSTOM'] ? 'input' : 'default';
        const protrackerTxtPrefix = this.reqData['protracker']['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS['CUSTOM'] ? 'input' : 'default';

        const reqData = {
            solutionName: this.reqData['solutionName'],
            solutionFamilyId: this.reqData['solutionFamilyObj']['solutionFamilyId'],
            solutionUrl: this.reqData['solutionUrl'],
            lastReviewed: this.reqData['lastReviewed'] ? moment(this.reqData['lastReviewed']).format('YYYY-MM-DD') : moment(this.maxDate).format('YYYY-MM-DD'),
            mappedSolution: this.reqData['mappedSolution'],
            profiler: {
                calculatedGrowth: this.reqData['profiler']['calculatedGrowth'],
                appliedGrowth: this.reqData['profiler']['overrideAppliedGrowth'] ? this.reqData['profiler']['appliedGrowth'] : this.reqData['profiler']['calculatedGrowth'],
                overrideAppliedGrowth: this.reqData['profiler']['overrideAppliedGrowth'],
                customRange: this.reqData['profiler']['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS['CUSTOM'] ? true : false,
                okayLow: this.reqData['profiler'][profilerTxtPrefix + 'OkRangeLow'],
                okayHigh: this.reqData['profiler'][profilerTxtPrefix + 'OkRangeHigh'],
                marginalLow: this.reqData['profiler'][profilerTxtPrefix + 'MarginalRangeLow'],
                marginalHigh: this.reqData['profiler'][profilerTxtPrefix + 'MarginalRangeHigh'],
                assetAllocations: this.reqData['profiler']['assetAllocations'],
                rateOfReturn: this.reqData['profiler']['rateOfReturn'],
                risk: this.reqData['profiler']['risk'],
                currencyAllocations: this.reqData['profiler']['currencyAllocations']
            },
            protracker: {
                calculatedGrowth: this.reqData['protracker']['calculatedGrowth'],
                appliedGrowth: this.reqData['protracker']['overrideAppliedGrowth'] ? this.reqData['protracker']['appliedGrowth'] : this.reqData['protracker']['calculatedGrowth'],
                overrideAppliedGrowth: this.reqData['protracker']['overrideAppliedGrowth'],
                customRange: this.reqData['protracker']['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS['CUSTOM'] ? true : false,
                okayLow: this.reqData['protracker'][protrackerTxtPrefix + 'OkRangeLow'],
                okayHigh: this.reqData['protracker'][protrackerTxtPrefix + 'OkRangeHigh'],
                marginalLow: this.reqData['protracker'][protrackerTxtPrefix + 'MarginalRangeLow'],
                marginalHigh: this.reqData['protracker'][protrackerTxtPrefix + 'MarginalRangeHigh'],
                assetAllocations: this.reqData['protracker']['assetAllocations'],
                rateOfReturn: this.reqData['protracker']['rateOfReturn'],
                risk: this.reqData['protracker']['risk'],
                currencyAllocations: this.reqData['protracker']['currencyAllocations'],
                products: this.reqData['protracker']['products'],
                solutionType: this.reqData['protracker']['solutionType'],
            }
        };

        if (this.displayPrefrence['isEdit']) {
            reqData['solutionId'] = this.reqData['solutionId'];
        }

        // const urlRegex1 = new RegExp("((http|https)://)?[a-zA-Z]\w*(\.\w+)+(/\w*(\.\w+)*)*(\?.+)*");
        if (this.reqData['solutionUrl'] === null ||
            this.reqData['solutionUrl'].trim() === '' ||
            // (/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&\(\)\*\+,;=.]+$/.test(this.reqData['solutionUrl']))
            (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/){1}[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(this.reqData['solutionUrl']))
        ) {
            this.saveSolutionAfterConfirmation(reqData);
        } else {

            swal({
                title: this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.POPUP.SAVE_SOLUTION_TITLE'],
                // text: 'Solution information link is not valid. Do you still wish to proceed?',
                text: this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.POPUP.SAVE_SOLUTION_TEXT'] + 'e.g. https://www.sample.com.', // message is been updated due to PPSD-187
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes'
            }).then(result => {
                if (result.value) {
                    this.saveSolutionAfterConfirmation(reqData);
                }
            });

        }

    }

    saveSolutionAfterConfirmation(reqData) {
        this.settingService.saveSolution(reqData, reqData['solutionId'])
            .toPromise()
            .then(data => {
                swal(this.i18text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.POPUP.SAVE_SOLUTION_SUCCESS'], 'success');
                this.saveDisable = false;
                if (this.displayPrefrence['isAdd']) {
                    this.reqData = null;
                    this.router.navigate(['/settings', 'preferred-solutions']);
                } else {
                    this.displayPrefrence['isView'] = true;
                    this.displayPrefrence['isEdit'] = false;
                    this.getSolutionDetails(reqData['solutionId']);
                }
            }).catch(errorResponse => {
                swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                this.saveDisable = false;
            });
    }

    translateInput(input) {
        if (input === '' || input === null || input === undefined) {
            return;
        }
        this.refreshDataService.changeMessage('solution_name|' + input);
        this.router.navigate(['translation'], { relativeTo: this.activatedRoute });
    }

    editSolution() {
        this.displayPrefrence['isView'] = false;
        this.displayPrefrence['isEdit'] = true;
    }

    revertHandler() {
        history.back();
    }

    formatedDataForAssetClasses() {
        const allocationObj = {};
        if (this.reqData[this.selectedTab]['assetAllocations']) {
            this.reqData[this.selectedTab]['assetAllocations'].forEach(element => {
                Object.assign(allocationObj, { [element['assetClass']]: element['percentage'] });
            });
        }
        return allocationObj;
    }

    changeSolutionsAction(index: number) {
        if ($('#dropdownSolutionsAction' + index).is(':visible')) {
            $('.dropdown-solutions-action').hide();
        } else {
            $('.dropdown-solutions-action').hide();
            $('#dropdownSolutionsAction' + index).toggle();
        }
    }

    changeSolutionType() {
        if (this.selectedSolutionType === SOLUTION_TYPES.SINGLE_FUND_SOLUTION && this.reqData[this.selectedTab]['products'].length > 1) {
            swal({
                title: this.i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.POPUP.CHANGE_TO_SINGLE_FUND_WARNING'],
                text: this.i18text['ALERT_MESSAGE.WISH_TO_PROCEED_QUESTION'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: this.i18text['FORM.ACTION.PROCEED'],
                cancelButtonText: this.i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.reqData[this.selectedTab]['products'] = [];
                    this.reqData[this.selectedTab]['solutionType'] = this.selectedSolutionType;
                    this.calcTotalProductPercentage();
                } else {
                    this.selectedSolutionType = this.reqData[this.selectedTab]['solutionType'];
                }
            });
        } else {
            this.reqData[this.selectedTab]['solutionType'] = this.selectedSolutionType;
        }
    }

    getProductInfo(productId) {
        let filename = null;
        let file = null;
        this.settingService.getSolutionsProductInfo(productId).toPromise().then(res => {
            file = res['body'];
            const headers = res.headers.get('content-disposition');
            filename = headers.split('=')[1];
            swal({
                title: this.i18text['PORTFOLIO.IMPLEMENTATION.PRODUCT_INFO_DOCUMENT_AVAILABLE'],
                text: this.i18text['GENERATE_REPORT.POPUP.REPORT_DOWNLOAD_QUESTION'],
                type: 'success',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: this.i18text['CUSTOM.DOWNLOAD'],
                cancelButtonText: this.i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.documentService.downloadFile(file, filename);
                }
            });
        }).catch(err => {
            if (JSON.parse(err).errorSsid) {
                swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], this.i18text['SSID_LABELS.ERROR_MESSAGE.' + JSON.parse(err).errorSsid], 'error');
            } else {
                swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(err).errorMessage, 'error');
            }
        });
    }

    deleteProduct(prodIndex) {
        swal({
            title: this.i18text['PORTFOLIO.IMPLEMENTATION.POPUP.REMOVE_PRODUCT_WARNING'],
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then(result => {
            if (result.value) {
                this.reqData[this.selectedTab]['products'].splice(prodIndex, 1);
                this.checkProductTotal();
            }
        });
    }

    checkProductTotal() {
        if (this.reqData[this.selectedTab]['products'].length > 0) {
            let sum = 0;
            this.reqData[this.selectedTab]['products'].forEach((product, index) => {
                if (index > 0) {
                    sum = sum + product.percentage;
                }
            });
            if (sum <= 100) {
                this.reqData[this.selectedTab]['products'][0].percentage = 100 - sum;
            } else {
                this.reqData[this.selectedTab]['products'][0].percentage = 0;
            }
        }
        this.calcTotalProductPercentage();
    }

    calcTotalProductPercentage(callAllocationAPI = true) {
        if (this.reqData['protracker']['products']) {
            this.productTotal = 0;
            this.reqData['protracker']['products'].forEach(product => {
                this.productTotal = this.productTotal + product.percentage;
            });
        }
        if (this.productTotal <= 100 && callAllocationAPI) {
            this.getAllocationDataForProducts();
        }
    }

    switchUser(user) {
        this.selectedTab = user;
        if (!this.displayPrefrence['isAdd']) {
            this.calculateTotalAllocation();
            this.updateRiskRates();
            this.createAllocationGraph();
            if (this.reqData[this.selectedTab]['selectedRangeType'] === RANGE_RADIOBUTTON_OPTIONS['CUSTOM']) {
                this.updateOnClasses('input');
            } else {
                this.updateOnClasses(RANGE_RADIOBUTTON_OPTIONS['DEFAULT']);
            }
        }
        else
            this.updateSuitabilityRange();
    }
    
    ngOnDestroy(): void {
        if (this.policyChart) {
            this.AmCharts.destroyChart(this.policyChart);
        }
        if (this.policyChart2) {
            this.AmCharts.destroyChart(this.policyChart2);
        }
        if (this.stackBarChart) {
            this.AmCharts.destroyChart(this.stackBarChart);
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    openAnalyticsSidePanel() {
        this.isAnalyticsSidePanelOpen = true;
    }

    closePanel() {
        this.isAnalyticsSidePanelOpen = false;
    }

}
