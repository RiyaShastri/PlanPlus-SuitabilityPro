import { Component, OnInit, DoCheck, OnDestroy } from '@angular/core';
import { AppState, getAdvisorPayload, getGraphColours } from '../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { ClientProfileService } from '../../client/service';
import { SettingService } from '../service';
import { timeHorizonDropdownValues } from '../settings-models';
import { StackBarChart } from '../settings-models';
import Swal from 'sweetalert2';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { RefreshDataService } from '../../shared/refresh-data';
import { PageTitleService } from '../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../shared/access-rights.service';
interface Country {
    country: string;
    countryCode: string;
}

@Component({
    selector: 'app-professional-judgement-matrix',
    templateUrl: './professional-judgement-matrix.component.html',
    styleUrls: ['./professional-judgement-matrix.component.css']
})
export class ProfessionaljudgementMatrixComponent implements OnInit, DoCheck, OnDestroy {
    stackBarChart;
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    countries: Array<object> = [];
    regionArray: Array<object> = [];
    policyArray: Array<object> = [{
        'policyName': 'CORE',
        'policyId': 'CORE'
    }];
    country;
    region;
    policy;
    matrixOpt = 'default';
    checked = false;
    isAddTimeHorizon = false;
    accordionEnviorment: object = {
        isTimeHorizon: false,
        isKnowledge: false,
        isExperience: false,
        isComposure: false
    };
    public timeHorizonArray: Array<object> = [];
    public timeHorizonArrayError = '';
    public knowledgeRanges = {};
    public knowledgeRangesError = '';
    public knowledgeNotAllowed = ['4'];
    public experienceRanges = {};
    public experienceRangesError = '';
    public experienceNotAllowed = ['3'];
    public composureRanges = {};
    public composureNotAllowed = ['5'];
    public investmentPolicies = [];
    public clonePJMData = {};
    public clonePJMDataClone = {};
    public displayPrefrence = {
        isEdit: false,
        isView: false
    };
    pjmAcceptance = false;
    lastReviewDate = '';
    dataProvider = {};
    graphs = [];
    sliderValue = [];
    chartColour = [];
    canCreateCustom = false;
    showRegion = false;
    graphSpans = {};
    saveDisable = false;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private AmCharts: AmChartsService,
        private clientProfileService: ClientProfileService,
        private settingService: SettingService,
        private refreshDataService: RefreshDataService,
        private pageTitleService: PageTitleService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private accessRightService: AccessRightService
    ) {
        this.angulartics2.eventTrack.next({ action: 'PJM' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PJM_TITLE');
        this.displayPrefrence.isView = true;
    }

    async ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.chartColour = res['allGraphColours'];
            }
        });
        this.accessRightService.getAccess(['PJMADMINEDIT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        await this.getCountryData();
        await this.getRegionData();
        this.dataProvider['year'] = '';
        this.settingService.getInvestmentPolicies().toPromise().then(response => {
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
                this.dataProvider[investment.investmentPolicyId.trim()] = graphValue;
                this.graphs.push(graphObj);
                this.sliderValue.push({
                    name: investment.description,
                    colour: this.chartColour[index],
                    percent: graphValue
                });
            });
            this.getChartLoaded(this.dataProvider, this.graphs);
        }).catch(errorRespon => {
        });
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisorDetails => {
            this.canCreateCustom = advisorDetails['clientFilter'] === 4;
            this.pjmAcceptance = advisorDetails['pjmAcceptance'];
        });
    }

    ngDoCheck() {
        if (JSON.stringify(this.clonePJMData) !== '{}' && !this.checkForChanges()) {
            if (this.checked) {
                // this.lastReviewDate = this.clonePJMDataClone['lastReviewDate'];
            } else {
                // Swal('Warning', 'Please check that you have reviewed and accepted the default or custom professional judgement matrix shown above as your own.', 'warning');
                this.lastReviewDate = this.clonePJMDataClone['lastReviewDate'];
            }
        } else {
            this.checked = false;
            this.lastReviewDate = this.clonePJMDataClone['lastReviewDate'];
        }
    }

    getChartLoaded(dataProvider, graphs) {
        const stackBarChartdata = {
            ...StackBarChart,
            dataProvider: [dataProvider],
            graphs: graphs,
            colors: this.chartColour
        };
        this.stackBarChart = this.AmCharts.makeChart('chartdiv', stackBarChartdata);
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
    /**
     *this method is use to get initial details for each PJM
     *
     * @private
     * @memberof ProfessionaljudgementMatrixComponent
     */
    private getPJMDetails() {
        this.settingService.getPJMDetails()
            .toPromise()
            .then(data => {
                this.clonePJMData = JSON.parse(JSON.stringify(data));
                this.clonePJMDataClone = JSON.parse(JSON.stringify(data));

                this.populateData(JSON.parse(JSON.stringify(data)));
            });
    }

    public populateData(data, matrixOpt?) {
        const regionArray = JSON.parse(JSON.stringify(this.getChildData(this.regionArray)));
        let res = {};
        regionArray.find(function f(o) {
            if (o.regionCode === data['regionCode']) {
                res = Object.assign({}, o);
                return true;
            }
            if (o.childRegions) {
                return (o.childRegions = o.childRegions.filter(f)).length;
            }
        });

        this.region = res;
        this.country = this.countries.find(x => x['countryCode'] === data['countryCode']);
        this.policy = this.policyArray.find(x => x['policyId'] === data['selectedInvestmentPolicy']);
        this.knowledgeRanges = data['knowledgeRanges'];
        this.experienceRanges = data['experienceRanges'];
        this.composureRanges = data['composureRanges'];
        this.getGraphSpans(Object.assign({}, this.composureRanges), 'composure');
        this.lastReviewDate = data['lastReviewDate'];
        // Fix display null on PJM settings
        if (this.lastReviewDate == null) { this.lastReviewDate = 'N/A'; }

        this.refreshDataService.changeMessage('PJM_last_updated_data|' + this.lastReviewDate);

        this.investmentPolicies = data['investmentPolicies'];
        if (matrixOpt !== 'default') {
            this.matrixOpt = (data['matrixType'] === 0) ? 'default' : 'custom';
        }

        this.timeHorizonArray = [];
        for (let i = 0; i < timeHorizonDropdownValues.length; i++) {
            const element = timeHorizonDropdownValues[i];
            if (data['horizonRanges'][element['value']] !== undefined) {
                this.timeHorizonArray.push({
                    timeHorizonId: element['value'],
                    timeHorizonName: element['name'],
                    suitabilityScore: data['horizonRanges'][element['value']]
                });
            }
        }
    }

    getGraphSpans(graphData, graphType) {
        this.graphSpans = {};
        if (!this.graphSpans.hasOwnProperty(graphType)) {
            this.graphSpans[graphType] = {};
        }
        for (const question in graphData) {
            if (graphType === 'composure' && question === '5') {
                // skip unknown for composure
            } else if (graphData.hasOwnProperty(question)) {
                const answer = graphData[question];
                if (!this.graphSpans[graphType].hasOwnProperty(answer)) {
                    if (graphData[question] !== null) {
                        this.graphSpans[graphType][answer] = question;
                    }
                } else {
                    this.graphSpans[graphType][answer] += ' and ' + question;
                }
            }
        }
    }

    /**
     *this function is to get Country data form store if not available in store it will fetch from API
     *
     * @memberof ProfessionaljudgementMatrixComponent
     */
    public getCountryData() {
        this.settingService.checkJurisdictions().toPromise().then(response => {
            this.countries = response;
            this.getPJMDetails();
        }).catch(errorResponse => {
            this.countries = [];
        });
    }

    /**
     *this function is to get Region Data
     *
     * @memberof ProfessionaljudgementMatrixComponent
     */
    public getRegionData() {
        this.settingService.getRegion()
            .toPromise()
            .then(data => {
                const regionArray = [];
                regionArray.push({
                    'regionName': data['regionName'],
                    'regionCode': data['regionCode'],
                    'childRegions': (data['childRegions'].length > 0) ? this.getChildData(data['childRegions']) : []
                });
                this.regionArray = regionArray;
                if (this.regionArray.length >= 1 && this.regionArray[0]['childRegions'].length > 0) {
                    this.showRegion = true;
                }
            });
    }

    /**
     *this function is used to seprate each child region using recursively
     *
     * @param {*} childDataArray this parameter will pass initial object for children hierarchy
     * @returns
     * @memberof ProfessionaljudgementMatrixComponent
     */
    getChildData(childDataArray) {
        const regionArray = [];
        childDataArray.forEach(element => {
            regionArray.push({
                'regionName': element['regionName'],
                'regionCode': element['regionCode'],
                'childRegions': (element['childRegions'].length > 0) ? JSON.parse(JSON.stringify(this.getChildData(element['childRegions']))) : []
            });
        });
        return regionArray;
    }

    /**
     *delete side panepanel of time horizon
     *
     * @param {*} event
     * @memberof ProfessionaljudgementMatrixComponent
     */
    public closeSidePanel(event) {
        this.isAddTimeHorizon = false;
    }

    /**
     *handle time horizon events
     *
     * @param {*} event
     * @memberof ProfessionaljudgementMatrixComponent
     */
    public onTimeZoneAdd(event) {
        this.timeHorizonArray = [];
        setTimeout(() => {
            this.timeHorizonArray = event;
        }, 0);
        this.isAddTimeHorizon = false;
    }

    /**
     *remove single time horizone
     *
     * @param {*} index passing index from front-end for splice
     * @memberof ProfessionaljudgementMatrixComponent
     */
    public removeTimeHorizon(index) {
        this.timeHorizonArray.splice(index, 1);
    }

    public checkRange(rangeObj) {
        let max = 0;
        this.translate.get(['SETTINGS.PJM_DATA.MESSAGE_CHECK_RANGE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            if (rangeObj === 'timeHorizonArray') {
                for (let i = 0; i < this.timeHorizonArray.length; i++) {
                    const element = this.timeHorizonArray[i];
                    if (max >= element['suitabilityScore'] || element['suitabilityScore'] > 100) {
                        this[rangeObj + 'Error'] = i18text['SETTINGS.PJM_DATA.MESSAGE_CHECK_RANGE'];
                        return;
                    } else {
                        max = element['suitabilityScore'];
                        this[rangeObj + 'Error'] = '';
                    }
                }
            } else {
                max = 0;
                for (const key in this[rangeObj]) {
                    if (((rangeObj === 'knowledgeRanges' && key !== '4') ||
                         (rangeObj === 'experienceRanges' && key !== '3') ||
                         (rangeObj === 'composureRanges' && key !== '5')) &&
                            max >= this[rangeObj][key] || this[rangeObj][key] > 100) {
                        this[rangeObj + 'Error'] = i18text['SETTINGS.PJM_DATA.MESSAGE_CHECK_RANGE'];
                        return;
                    } else {
                        max = this[rangeObj][key];
                        this[rangeObj + 'Error'] = '';
                    }
                }
            }
        });
    }

    public updatePJM() {
        this.saveDisable = true;
        if (!this.pjmAcceptance) {
            this.translate.get(['SETTINGS.PJM_DATA.POPUP.REVIEW_ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Oops...', i18text['SETTINGS.PJM_DATA.POPUP.REVIEW_ALERT'], 'error');
                this.saveDisable = false;
            });
        } else {

            const obj = {
                'regionCode': this.region['regionCode'],
                'selectedInvestmentPolicy': 'CORE',
                // 'selectedInvestmentPolicy': this.policy['policyId'],
                'countryCode': this.country['countryCode'],
                'pjmAcceptance': this.pjmAcceptance,
                'composureRanges': this.composureRanges,
                'experienceRanges': this.experienceRanges,
                'knowledgeRanges': this.knowledgeRanges,
                // 'investmentPolicies': this.investmentPolicies,
            };

            obj['horizonRanges'] = {};
            obj['matrixType'] = (this.matrixOpt === 'default') ? 0 : 1;

            for (let i = 0; i < this.timeHorizonArray.length; i++) {
                const element = this.timeHorizonArray[i];
                obj['horizonRanges'][element['timeHorizonId']] = element['suitabilityScore'];
            }


            this.settingService.updatePJM(obj).toPromise().then(res => {
                this.refreshDataService.changeMessage('PJM_last_updated_data|' + res['lastReviewDate']);
                this.translate.get(['SETTINGS.PJM_DATA.POPUP.SUCESS', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['SETTINGS.PJM_DATA.POPUP.SUCESS'], 'success');
                });
                this.editPJM('view');
                this.saveDisable = false;
            }).catch(errorResponse => {
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                });
                this.saveDisable = false;
            });
        }
    }

    checkForChanges() {

        const matrixType = (this.matrixOpt === 'default') ? 0 : 1;
        const obj = {};
        obj['horizonRanges'] = {};

        for (let i = 0; i < this.timeHorizonArray.length; i++) {
            const element = this.timeHorizonArray[i];
            obj['horizonRanges'][element['timeHorizonId']] = element['suitabilityScore'];
        }

        if (
            this.region['regionCode'] === this.clonePJMDataClone['regionCode'] &&
            this.country['countryCode'] === this.clonePJMDataClone['countryCode'] &&
            matrixType === this.clonePJMDataClone['matrixType'] &&
            this.isEquivalent(this.composureRanges, this.clonePJMDataClone['composureRanges']) &&
            this.isEquivalent(this.experienceRanges, this.clonePJMDataClone['experienceRanges']) &&
            this.isEquivalent(this.knowledgeRanges, this.clonePJMDataClone['knowledgeRanges']) &&
            this.isEquivalent(obj['horizonRanges'], this.clonePJMDataClone['horizonRanges'])
        ) {

            return true;
        } else {
            return false;
        }
    }

    isEquivalent(a, b) {
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);
        if (aProps.length !== bProps.length) {
            return false;
        }

        for (let i = 0; i < aProps.length; i++) {
            const propName = aProps[i];
            if (a[propName] !== b[propName]) {
                return false;
            }
        }
        return true;
    }

    distributionChange(value) {
        if (value === 'default') {
            this.translate.get([
                'SETTINGS.PJM_DATA.POPUP.DISTRIBUTION_CHANGE_TITLE',
                'SETTINGS.PJM_DATA.POPUP.DISTRIBUTION_CHANGE_TEXT',
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal({
                    title: i18text['SETTINGS.PJM_DATA.POPUP.DISTRIBUTION_CHANGE_TITLE'],
                    text: i18text['SETTINGS.PJM_DATA.POPUP.DISTRIBUTION_CHANGE_TEXT'],
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Proceed'
                }).then(result => {
                    if (result.value) {
                        // this.incomeDetails = JSON.parse(JSON.stringify(this.incomeData));
                        this.populateData(this.clonePJMData, 'default');
                    } else {
                        this.matrixOpt = 'custom';
                    }
                });
            });
        } else {
            this.matrixOpt = value;
        }
    }

    public editPJM(prefrence) {
        if (prefrence === 'view') {
            this.displayPrefrence.isView = true;
            this.displayPrefrence.isEdit = false;
        } else if (prefrence === 'cancel') {
            this.displayPrefrence.isView = true;
            this.displayPrefrence.isEdit = false;
            this.clonePJMData = {};
            this.graphSpans = {};
            this.composureRanges = {};
            this.timeHorizonArray = [];
            this.populateData(this.clonePJMDataClone);
        } else {
            this.displayPrefrence.isView = false;
            this.displayPrefrence.isEdit = true;
        }
    }

    objectKeys(obj) {
        return Object.keys(obj);
    }

    public isDefaultMatrixOpt() {
        return this.matrixOpt === 'default';
    }

    public filterBy(ranges, notAllowedArray) {
        const result = [];
        ranges.forEach( x => {
            if (notAllowedArray.indexOf(x) === -1) {
                result.push(x);
            }
        });
        return result;
    }

    acceptanceChange() {
        this.pjmAcceptance = false;
    }

    ngOnDestroy(): void {
        if (this.stackBarChart) {
            this.AmCharts.destroyChart(this.stackBarChart);
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
