import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';

import { StackBarChart } from '../settings-models';
import { SettingService } from '../service';
import Swal from 'sweetalert2';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RefreshDataService } from '../../shared/refresh-data';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleService } from '../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import {AdvisorService} from '../../advisor/service/advisor.service';
import {AppState, getAdvisorPayload, getGraphColours} from '../../shared/app.reducer';
import {Store} from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

// import * as $ from 'jquery';


@Component({
    selector: 'app-preferred-solutions',
    templateUrl: './preferred-solutions.component.html',
    styleUrls: ['./preferred-solutions.component.css']
})
export class PreferredSolutionsComponent implements OnInit, OnDestroy {
    stackBarChart;
    chartColour = [];
    // clientId;
    isExpandedAll = false;
    viewBy = [
        { id: null, name: 'All solutions' },
        { id: 0, name: 'Personal solutions' },
        { id: 1, name: 'Region solutions' },
    ];
    dataSet = [];
    dataSetClone = [];
    selectedViewBy = this.viewBy[0];
    mySolutions = [];
    regionBasedSolutions = {};
    regionKeys = [];

    goalMapTimeline = {
        'type': 'gantt',
        'theme': 'light',
        'columnWidth': 0.5,
        'removeGuide': true,
        'valueAxis': {
            'type': 'date',
            'axisAlpha': 0,
            'labelsEnabled': false
        },
        'categoryAxis': {
            'axisAlpha': 0,
            'gridAlpha': 0,
        },
        'graph': {
            'fillAlphas': 1,
            'balloonText': '<b>[[task]]</b>: [[open]] [[value]]'
        },
        'rotate': true,
        'categoryField': 'category',
        'segmentsField': 'segments',
        'colorField': 'color',
        'startDate': '2015-01-01',
        'startField': 'start',
        'endField': 'end',
        'durationField': 'duration',
        'dataProvider': []
    };

    template = false;

    // temp veriables
    riskQuestionnaire: any = [];
    questions = [];
    cloneSolutionFamilyArray = [];
    solutionFamilyList = [];
    solutionFamily;
    selectedsolutionIdForClone = '';
    selectedcountryCodeForClone = '';
    allClosed = false;
    personDetails: any = [];
    fromPoint;
    changedFromPoint;
    indicator = {
        left: 0,
        bottom: 199,
        background: '#436ab3',
        radius: 0
    };
    member: any = {};
    riskProfileId;
    personAnswers: Object = {};
    keys;
    keyDifferences;
    IsSelected: boolean;
    sliderValue = [];
  solutionsLoaded = false;

    allSolutionFamiliesByRegion = {};
    solutionFamiliesByRegion = [];
    regions = [];
    regions_model;
    regionArray = [];
    childRegionArray = [];
    region = {};
    dataProvider = {};
    graphs = [];
    advisorRegion = '';
    isShowRegion = false;
    advisorId = '';

    defaultSelectRegionPlaceHolder = '';
    selectRegionPlaceHolder = '';
    defaultSelectSolutionFamilyPlaceHolder = '';
    selectSolutionFamilyPlaceHolder = '';
    private unsubscribe$ = new Subject<void>();
    constructor(
        private AmCharts: AmChartsService,
        private modalService: NgbModal,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private refreshDataService: RefreshDataService,
        private activeModal: NgbActiveModal,
        private settingService: SettingService,
        private pageTitleService: PageTitleService,
        private dataSharing: RefreshDataService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'preferredSolution' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PREFERRED_SOLUTION_TITLE');
    }

    async ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.chartColour = res['allGraphColours'];
            }
        });
        this.getPreferredSolutionsData();
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message === 'refereshPrefferedSolutions') {
                this.getPreferredSolutionsData();
                this.dataSharing.changeMessage('default message');
            }
        });
        this.dataProvider['year'] = '';
        this.settingService.getInvestmentPolicies().toPromise().then(response => {
            response.forEach((investment, index) => {
                let graphValue = 0;
                const graphObj = {
                    'balloonText': '<b>[[title]]</b><span style="font-size:14px">[[category]]: <b> ' + investment.suitabilityLow + '-' + investment.suitabiliyHigh + '</b></span>',
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
        await this.settingService.getChildRegions()
            .toPromise()
            .then(data => {
                const childRegionArray = [];
                childRegionArray.push(data);
                this.childRegionArray = childRegionArray;
            });
        this.settingService.getRegion()
            .toPromise()
            .then(data => {
                const regionArray = [];

                // id: null, name: 'All solutions'
                regionArray.push({
                    'regionName': 'All solutions',
                    'regionCode': 'null',
                    'childRegions': []
                });

                regionArray.push({
                    'regionName': data['personalRegionName'],
                    'regionCode': data['personalRegionCode'],
                    'childRegions': []
                });

                regionArray.push({
                    'regionName': data['regionName'],
                    'regionCode': data['regionCode'],
                    'childRegions': (data['childRegions'].length > 0) ? this.getChildData(data['childRegions']) : []
                });

                this.region = {
                    'regionName': 'All solutions',
                    'regionCode': 'null',
                    'childRegions': []
                };
                this.regionArray = regionArray;
            });
      await Observable.of(
              this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(
              res => {this.advisorRegion = res['region'];
              this.isShowRegion = res['clientFilter'] === 4;
              this.advisorId = res['planner']; } )
              )
              .toPromise()
              .catch(err => {
              });
    }

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

    public async  getPreferredSolutionsData() {
        this.dataSet = [];
        this.dataSetClone = [];
        const data = await this.settingService.getAllSolutions().toPromise();
        const personalSolutions = await this.manageSolutions(data['personalSolutions'], 'personal_solutions');
        const regionalSolutions = await this.manageSolutions(data['regionalSolutions'], 'regional_solutions');
        // this.dataSet.push(personalSolutions);
        // this.dataSet.push(regionalSolutions);
        this.dataSet = personalSolutions.concat(regionalSolutions);
        this.dataSetClone = [...this.dataSet];
        this.solutionsLoaded = true;
    }

    public manageSolutions(solutionObj, category) {
        const dataArr = [];
        const regionKeys = Object.keys(solutionObj);
        regionKeys.forEach((regionKey, index) => {
            const solutionFamilyArray = solutionObj[regionKey];
            this.allSolutionFamiliesByRegion[regionKey] = [];
            dataArr.push({
                'parentId': regionKey,
                'parentText': (solutionFamilyArray[0]['regionName']) ? solutionFamilyArray[0]['regionName'] : regionKey,
                'parentRegion': solutionFamilyArray[0]['parentRegion'],
                'countryCode': solutionFamilyArray[0]['countryCode'],
                'solutionFamilies': this.getSolutionFamilyData(solutionFamilyArray, regionKey)
            });
            if ((category === 'regional_solutions' &&
                    this.isShowRegion === true)) {
                if (this.advisorRegion === regionKey ||
                    this.childRegionArray.find(function(element) {
                        return element === regionKey;
                    }) === true) {
                    this.regions.push({
                        'parentId': regionKey,
                        'parentText': (solutionFamilyArray[0]['regionName']) ? solutionFamilyArray[0]['regionName'] : regionKey,
                        'parentRegion': solutionFamilyArray[0]['parentRegion'],
                        'countryCode': solutionFamilyArray[0]['countryCode']
                    });
                }
            } else if ((category === 'personal_solutions')) {
                    this.regions.push({
                        'parentId': regionKey,
                        'parentText': (solutionFamilyArray[0]['regionName']) ? solutionFamilyArray[0]['regionName'] : regionKey,
                        'parentRegion': solutionFamilyArray[0]['parentRegion'],
                        'countryCode': solutionFamilyArray[0]['countryCode']
                    });
            }

            this.cloneSolutionFamilyArray.push({
                'parentId': dataArr[index]['parentId'],
                'solutionFamilies': dataArr[index]['solutionFamilies'],
                'parentRegion':  dataArr[index]['parentRegion'],
                'countryCode': dataArr[index]['countryCode']
            });
        });
        return dataArr;
    }

    getSolutionFamilyData(solutionFamilyArray, regionKey) {
        const dataArr = [];

        solutionFamilyArray.forEach(solutionFamilyObj => {
            this.allSolutionFamiliesByRegion[regionKey].push({
                'solutionFamilyId': solutionFamilyObj['solutionFamilyId'],
                'solutionName': solutionFamilyObj['solutionFamilyText'],
                'parentRegion': solutionFamilyObj['parentRegion'],
                'countryCode': solutionFamilyObj['countryCode']
            });
            const solutionsArr = solutionFamilyObj['solutions'];
            const solutionFamily = {
                'solutionFamilyId': solutionFamilyObj['solutionFamilyId'],
                'solutionName': solutionFamilyObj['solutionFamilyText'],
                'isSuppress': solutionFamilyObj['suppressedFamily'],
                'parentRegion': solutionFamilyObj['parentRegion'],
                'suppressedByParent': solutionFamilyObj['suppressedByParent'],
                'countryCode': solutionFamilyObj['countryCode'],
                'child': []
            };
            solutionsArr.forEach(solution => {
                // solutionFamily['isSuppress'] = solution['suppressedFamily'];
                const additionalData = this.getAdditionalData(solution['riskRange'], solution['mappedSolution']);
                solutionFamily['child'].push({
                    'childName': solution['description'],
                    'solutionId': solution['solutionId'],
                    'parentRegion': solution['parentRegion'],
                    'countryCode': solutionFamilyObj['countryCode'],    // to link the country code
                    'solutionUrl': (solution['solutionUrl']) ? solution['solutionUrl'] : '',
                    'isSuppress': solution['suppressedSolution'],
                    'suppressedByParent': solution['suppressedByParent'],
                    'finaMetricaRangeImage': additionalData['finaMetricaRangeImage'],
                    'dataProvider': [{
                        'category': '',
                        'segments': additionalData['graphData'],
                    }]
                });
            });

            dataArr.push(solutionFamily);
        });
        return dataArr;
    }

    public getAdditionalData(riskRangeArray, isMappedSolution) {
        const graphData = [];
        let finaMetricaRangeImage = '';
        let previousHigh = 0;
        riskRangeArray.forEach((range, index) => {
            const chartData = this.getSolutonData(range['riskType']);
            chartData['duration'] = range['high'] - previousHigh;
            chartData['high'] = range['high'];
            chartData['low'] = range['low'];
            previousHigh = range['high'];
            if (isMappedSolution && range['riskType'] === 'OK') {
                finaMetricaRangeImage = 'assets/images/mapping_seal/FinaMetrica_score-range-logo_' + range['low'] + '-' + range['high'] + '.png';
            }
            if (index === 0) {
                chartData['start'] = 0;
            }
            graphData.push(chartData);
        });
        return {
            'graphData': graphData,
            'finaMetricaRangeImage': finaMetricaRangeImage
        };
    }

    getSolutonData(term) {
        if (term === 'TooMuch') {
            return { 'color': '#f64', 'task': 'Too Much' };
        } else if (term === 'TooLittle') {
            return { 'color': '#f64', 'task': 'Too Little' };
        } else if (term === 'MarginalUpper') {
            return { 'color': '#FC4', 'task': 'Marginally Upper' };
        } else if (term === 'MarginalLower') {
            return { 'color': '#FC4', 'task': 'Marginally Lower' };
        } else if (term === 'OK') {
            return { 'color': '#bd6', 'task': 'Suitable' };
        } else {
            return { 'color': '#f64', 'task': 'Too Much' };
        }
    }


    sorting(event) {
        if (event['regionCode'] !== 'null') {
            this.dataSet = [];
            const regionCloneData = JSON.parse(JSON.stringify(this.dataSetClone));
            for (let i = 0; i < regionCloneData.length; i++) {
                const regionElement = regionCloneData[i];
                if (regionElement['parentId'] === event['regionCode']) {
                    this.dataSet.push(regionElement);
                }
                // this.dataSet.push(regionElement.filter(regionObj => regionObj['parentId'] === event['regionCode']));
            }
        } else {
            this.dataSet = this.dataSetClone;
        }
    }

    changeAction(index: string) {
        if ($('#dropdown-action-' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#dropdown-action-' + index).toggle();
        }
    }

    getChartLoaded(datProvider, graphs) {
        const stackBarChartdata = {
            ...StackBarChart,
            dataProvider: [datProvider],
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

    myOnChange(event) {
        // $('.irs-slider').empty().prepend(event.from);
        // this.fromPointChange.emit(event);
    }

    deleteSolutionFamily(solutionFamilyId) {
        this.translate.get([
            'SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_FAMILY_TITLE',
            'SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_FAMILY_TEXT',
            'SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_FAMILY_SUCCESS',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_FAMILY_TITLE'],
                text: i18text['SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_FAMILY_TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.settingService.deleteSolutionFamily(solutionFamilyId).toPromise().then(data => {
                        Swal(i18text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18text['SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_FAMILY_SUCCESS'], 'success');
                        this.getPreferredSolutionsData();
                    }).catch(err => {
                        Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    deleteSolution(solutionId) {
        this.translate.get([
            'SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_TITLE',
            'SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_TEXT',
            'SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_SUCCESS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_TITLE'],
                text: i18text['SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes'
            }).then(result => {
                if (result.value) {
                    this.settingService.deleteSolution(solutionId).toPromise().then(data => {
                        Swal(i18text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18text['SETTINGS.PREFERRED_SOLUTION.POPUP.DELETE_SOLUTION_SUCCESS'], 'success');
                        this.getPreferredSolutionsData();
                    }).catch(err => {
                        Swal('Oops...', err.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    public solutionFamilySuppressionOption(data, isSuppressed) {
        this.settingService.solutionFamilySuppressionOption(data['solutionFamilyId'], isSuppressed).toPromise().then(data => {
            // this.getPreferredSolutionsData();
        }).catch(err => {
            Swal('Oops...', err.error.errorMessage, 'error');
        });
        data['child'].forEach(child => child.isSuppress = !child.isSuppress);
    }

    public solutionSuppressionOption(solutionId, isSuppressed) {
        this.settingService.solutionSuppressionOption(solutionId, isSuppressed).toPromise().then(data => {
            // this.getPreferredSolutionsData();
        }).catch(err => {
            Swal('Oops...', err.error.errorMessage, 'error');
        });
    }

    openModel(content, parentId, solutionId, countryCode) {
        this.translate.get([
                            'SETTINGS.PREFERRED_SOLUTION.DETAILS.SELECT_REGION',
                            'SETTINGS.PREFERRED_SOLUTION.DETAILS.SELECT_SOLUTION_FAMILY'
                        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                            this.defaultSelectRegionPlaceHolder = i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.SELECT_REGION'];
                            this.defaultSelectSolutionFamilyPlaceHolder = i18text['SETTINGS.PREFERRED_SOLUTION.DETAILS.SELECT_SOLUTION_FAMILY'];
                            this.selectRegionPlaceHolder = this.defaultSelectRegionPlaceHolder;
                            this.selectSolutionFamilyPlaceHolder = this.defaultSelectSolutionFamilyPlaceHolder;
                        });

        this.selectedsolutionIdForClone = solutionId;
        this.selectedcountryCodeForClone = countryCode;
        this.solutionFamilyList = this.cloneSolutionFamilyArray.find(x => x['parentId'] === parentId)['solutionFamilies'];
        setTimeout(() => {
            this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
        }, 500);
    }

    cloneSolution() {
        this.settingService.cloneSolution(this.solutionFamily['solutionFamilyId'], this.selectedsolutionIdForClone)
            .toPromise()
            .then(data => {
                this.getPreferredSolutionsData();
                // this.closeModel();
            }).catch(err => {
                Swal('Oops...', err.error.errorMessage, 'error');
            });
    }

    closeModel() {
        this.activeModal.dismiss();
        this.activeModal.close();
        this.selectRegionPlaceHolder = this.defaultSelectRegionPlaceHolder;
        this.selectSolutionFamilyPlaceHolder = this.defaultSelectSolutionFamilyPlaceHolder;
    }

    selectRegion() {
        this.solutionFamiliesByRegion = this.allSolutionFamiliesByRegion[this.regions_model['parentId']];
//        this.solutionFamiliesByRegion.forEach(element => {
//            if (element['countryCode'] === this.selectedcountryCodeForClone) {
//            }
//        });
        const selectedCountryCode = this.selectedcountryCodeForClone;
        const filtered = this.solutionFamiliesByRegion.filter(function(element, index, arr) {
            const filter = element['countryCode'] === selectedCountryCode;
            return filter;
        });
        this.solutionFamiliesByRegion = filtered;
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        // $(window).scroll(function () {
        // if ($(window).scrollTop() > 650) {
        //     $('.scroll-header').css({ position: 'fixed', top: 0 });
        //     // $('.scroll-header').removeClass('fixed-scroll-header');
        // } else {
        //     $('.scroll-header').css({ position: 'fixed', top: '60px' });
        //     $('.scroll-header').addClass('fixed-scroll-header');
        // }

        // if ($(window).scrollTop() === 0) {
        //     $('.scroll-header').removeClass('fixed-scroll-header');
        //     $('.scroll-header').css({ position: 'static' });
        // }

        // });
    }


    public addSolutionFamily() {

        this.refreshDataService.changeMessage('region_for_add_solution_family|' + JSON.stringify(this.region));

        this.router.navigate(['solution-family'], { relativeTo: this.activatedRoute });
        // [routerLink] = "['solution-family']
    }

    navigateToSolutionInfo(link) {
        let url = '';
        if (!/^http[s]?:\/\//.test(link)) {
            url += 'http://';
        }
        url += link;
        window.open(url, '_blank');
    }

    ngOnDestroy(): void {
        if (this.stackBarChart) {
            this.AmCharts.destroyChart(this.stackBarChart);
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
