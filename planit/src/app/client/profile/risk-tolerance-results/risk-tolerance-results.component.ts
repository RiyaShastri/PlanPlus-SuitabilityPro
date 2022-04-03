import * as $ from 'jquery';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, OnDestroy, } from '@angular/core';

import Swal from 'sweetalert2';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NgbDropdownConfig, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { RiskGroups } from '../../client-models';
import { PageTitleService } from '../../../shared/page-title';
import { ClientProfileService, PortfolioService } from '../../service';
import { Angulartics2 } from 'angulartics2';
import { AccessRightService } from '../../../shared/access-rights.service';
import { getFamilyMemberRiskPayload, AppState } from '../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-risk-tolerance-results',
    templateUrl: './risk-tolerance-results.component.html',
    styleUrls: ['./risk-tolerance-results.component.css'],
    providers: [NgbDropdownConfig]
})
export class RiskToleranceResultsComponent implements OnInit, OnDestroy {
    comment;
    clientId;
    personalId;
    riskImagesrc;
    questionId;
    questionnaireType = '';
    locale = 'en';
    questions = [];
    agreed: any = {};
    familyMembersRisk = null;
    keyDifferences = null;
    sectionMapping = {};
    sectionKeys = [];
    calculatedScoreIndex = 0;
    personAnswers: Object = {};
    allClosed = true;
    firstClosed = true;
    secondClosed = true;
    thirdClosed = true;
    fourthClosed = true;
    fifthClosed = true;
    diffAllClosed = true;
    today = new Date();
    private chart: AmChart;
    riskGroups = RiskGroups;
    showLegendRedStar = false;
    showLegendOrangeStar = false;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    @ViewChild('t') public tooltip: NgbTooltip;
    public displayTooltip(): void {
        const isOpen = this.tooltip.isOpen();
        if (!isOpen) {
            this.tooltip.open();
        }
    }
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private profileService: ClientProfileService,
        config: NgbDropdownConfig,
        private store: Store<AppState>,
        public translate: TranslateService,
        public pageTitleService: PageTitleService,
        private AmCharts: AmChartsService,
        private accessRightService: AccessRightService,
        private portfolioService: PortfolioService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'riskToleranceResults' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.RISK_TOLERANCE_RESULT_TITLE');
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.personalId = params['personalId'];
            this.getRiskData();
            this.getRiskQuestions();
            this.getDifferences();
        });
        this.accessRightService.getAccess(['KYC']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res } });
        config.autoClose = false;
    }

    async ngOnInit() {

        if (this.translate.store.currentLang) {
            this.locale = this.translate.store.currentLang;
        }

        this.getRiskData();
        this.getRiskQuestions();
        await this.getDifferences();

        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.locale = event.lang;
            this.riskImagesrc = 'assets/images/RiskToleranceGraph/' + this.familyMembersRisk.questionnaireType + '/' + this.locale + '-' + this.keyDifferences['riskGroup'] + '.png';
            this.getRiskQuestions();
        });
    }

    async getRiskData() {
        let riskData = this.profileService.getPersonRiskData(this.clientId, this.personalId).toPromise().then(data => {
            this.familyMembersRisk = data;
            this.personAnswers = data['answers'];
            this.agreed.riskScore = this.familyMembersRisk.agreedScore ? this.familyMembersRisk.agreedScore : this.familyMembersRisk.calculatedScore;
            this.questionnaireType = this.familyMembersRisk.questionnaireType;
        }).catch(error => {
            this.familyMembersRisk = null;
        });
        await riskData;
    }

    async getRiskQuestions() {
        let riskQuestions = this.profileService.getRiskToleranceQuestions(this.clientId, this.personalId, this.locale).toPromise().then(data => {
            this.modifyQuestions(data['questions']);
            if (this.questionnaireType == 'FM25') {
                this.sectionMapping = {
                    'RISK_RESULTS_PAGE.YOUR_RISK_GROUP.CONTENT_2.TITLE': [this.questions[2], this.questions[9], this.questions[11], this.questions[6], this.questions[5]],
                    'RISK_RESULTS_PAGE.YOUR_RISK_GROUP.CONTENT_3.TITLE': [this.questions[7], this.questions[4]],
                    'RISK_RESULTS_PAGE.YOUR_RISK_GROUP.CONTENT_4.TITLE': [this.questions[1]],
                    'RISK_RESULTS_PAGE.YOUR_RISK_GROUP.CONTENT_5.TITLE': [this.questions[8], this.questions[3]],
                    'RISK_RESULTS_PAGE.YOUR_RISK_GROUP.CONTENT_6.TITLE': [this.questions[17], this.questions[13], this.questions[18], this.questions[20], this.questions[15]],
                    'RISK_RESULTS_PAGE.YOUR_RISK_GROUP.CONTENT_7.TITLE': [this.questions[21]]
                };
            } else {
                this.sectionMapping = { '': this.questions };
            }
            this.sectionKeys = Object.keys(this.sectionMapping);
        }).catch(errorResponse => {
            this.questions = [];
        });
        await riskQuestions;
    }

    modifyQuestions(questions) {
        questions.forEach(question => {
            question.text = question.text.split('~');
            question['template'] = false;
        });
        this.questions = questions;
    }

    async getDifferences() {
        let differences = this.profileService.getKeyDifferences(this.clientId, this.personalId).toPromise().then(res => {
            this.keyDifferences = res;
            this.showLegendRedStar = false;
            this.showLegendOrangeStar = false;
            this.calculatedScoreIndex = res.riskGroupText.findIndex(riskGroup => riskGroup.text === res['riskGroup']);
            this.riskImagesrc = 'assets/images/RiskToleranceGraph/' + this.familyMembersRisk.questionnaireType + '/' + this.locale + '-' + this.keyDifferences['riskGroup'] + '.png';
            this.removeAccordionHref();

        }).catch(error => {
            this.keyDifferences = null;
        });
        await differences;
    }

    private removeAccordionHref() {
        setTimeout(() => {
            $('.ui-accordion').find('a').each(function () {
                $(this).removeAttr('href');
            });
        }, 1000);
    }

    changeRisk(form: NgForm) {
        const obj = {
            'agreedScore': parseInt(form.value.riskScore, 10),
            'agreedRPChange': true,
            'comment': (form.value.comment) ? form.value.comment : ''
        };

        this.profileService.updateAgreedRisk(obj, this.personalId, this.clientId).toPromise().then(res => {
            this.familyMembersRisk.agreedScore = form.value.riskScore;
            this.familyMembersRisk.comments = form.value.comment;
            this.getRiskData();
            this.portfolioService.getClientPortfolioPayload(this.clientId);
            this.profileService.getClientFamilyMembersRisk(this.clientId);
            this.displayTooltip();
            this.agreed.comment = null;
        }).catch(errorResponse => {
            Swal('Oops...', errorResponse.error.errorMessage, 'error');
        });
    }

    cancelChangeRisk() {
        this.agreed.riskScore = this.familyMembersRisk.agreedScore ? this.familyMembersRisk.agreedScore : this.familyMembersRisk.calculatedScore;
        this.agreed.comment = null;
    }

    makeChart(qid, event) {
        $('.popover').each(function (index) {
            if (event.target.nextElementSibling.id !== $(this).attr('id')) {
                $(this).find('.sidebar_action_icon').click();
            }
        });
        setTimeout(() => {
            this.chart = this.AmCharts.makeChart('chartdiv', this.makeOptions(this.makeDataProvider(qid)));
        }, 50);
    }

    private makeDataProvider(qid) {
        const dataProvider = [];
        const data = this.keyDifferences['distributionMap'][qid];
        let riskGroup;
        this.keyDifferences['riskGroupText'].forEach((element, index) => {
            if (index === this.calculatedScoreIndex + this.keyDifferences['keyDifferencesMap'][qid]) {
                riskGroup = element.text;
            }
        });
        const riskGroupIds = Object.keys(data).sort();
        riskGroupIds.forEach(groupId => {
            if (data.hasOwnProperty(groupId)) {
                const value = data[groupId];
                dataProvider.push({
                    riskGroups: this.riskGroups[groupId],
                    percent: value * 100,
                    color: (groupId === riskGroup ? '#9999FF' : '#CCDDEE'),
                    bullet: (groupId === riskGroup ? 'assets/images/check-sign-line.svg' : ''),
                });
            }
        });

        return dataProvider;
    }

    private makeOptions(dataProvider) {
        return {
            'type': 'serial',
            'theme': 'light',
            'dataProvider': dataProvider,
            'valueAxes': [{
                'axisAlpha': 0,
                'gridColor': '#ddd',
                'gridThickness': 0.8,
                'gridAlpha': 1,
                'dashLength': 0,
                'maximum': 100,
                'autoGridCount': false,
                'gridCount': 2,
                'tickLength': 0,
                'title': '%',
                'color': '#bbb',
                'titleColor': '#bbb'
            }],
            'balloon': {
                'enabled': false
            },
            'gridAboveGraphs': false,
            'startDuration': 1,
            'graphs': [{
                'fillColorsField': 'color',
                'type': 'column',
                'fixedColumnWidth': 70,
                'valueField': 'percent',
                'bulletOffset': 50,
                'bulletSize': 20,
                'colorField': 'color',
                'customBulletField': 'bullet',
                'fillAlphas': 0.8,
                'lineAlpha': 0,
            }],
            'chartCursor': {
                'enabled': true,
                'zoomable': false,
                'valueBalloonsEnabled': false,
                'cursorAlpha': 0.2,
                'categoryBalloonColor': '#99AABB',
            },
            'categoryField': 'riskGroups',
            'categoryAxis': {
                'axisColor': '#ddd',
                'gridPosition': 'start',
                'gridAlpha': 0,
                'tickLength': 0,
                'color': '#99AABB'
            },
            'export': {
                'enabled': true
            }
        };
    }

    ngOnDestroy() {
        if (this.chart) {
            this.AmCharts.destroyChart(this.chart);
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    async memberSwitch(memberId) {
        this.personalId = memberId;
        await this.getRiskData();
        this.getRiskQuestions();
        this.getDifferences();
        this.router.navigate(['/client/' + this.clientId + '/profile/risk-tolerance/' + memberId + '/results']);
    }

    toggleAll() {
        this.allClosed = !this.allClosed;
        if (this.allClosed) {
            this.firstClosed = true;
            this.secondClosed = true;
            this.thirdClosed = true;
            this.fourthClosed = true;
            this.fifthClosed = true;
        } else {
            this.firstClosed = false;
            this.secondClosed = false;
            this.thirdClosed = false;
            this.fourthClosed = false;
            this.fifthClosed = false;
        }
    }

    toggleKeyDiff() {
        this.diffAllClosed = !this.diffAllClosed;
        if (this.diffAllClosed) {
            this.questions.forEach(question => {
                question['template'] = false;
            });
        } else {
            this.questions.forEach(question => {
                question['template'] = true;
            });
        }
    }

    // public sendMaxPercentageDetail(array) {
    //     let index = null;
    //     for (let i = 0; i < array.length; i++) {
    //         const element = array[i];
    //         if (i === 0) {
    //             index = i;
    //         } else {
    //             if (element['percent'] > array[index]['percent']) {
    //                 index = i;
    //             }
    //         }
    //     }
    //     return array[index]['riskGroup'];
    // }

    checkKeyDiff(questionId) {
        if (this.keyDifferences['keyDifferencesMap'].hasOwnProperty(questionId)) {
            return true;
        } else {
            return false;
        }
    }

    checkAllCondition() {

        if (this.questionnaireType === 'FM25') {
            if (this.questions.filter((obj) => obj['template'] === false).length === 16) {
                this.diffAllClosed = true;
            }
            if (this.questions.filter((obj) => obj['template'] === true).length === 16) {
                this.diffAllClosed = false;
            }
        } else {
            if (this.questions.filter((obj) => obj['template'] === false).length === this.questions.length) {
                this.diffAllClosed = true;
            }
            if (this.questions.filter((obj) => obj['template'] === true).length === this.questions.length) {
                this.diffAllClosed = false;
            }
        }
    }

    showDiffOverviewWarning() {
        if (this.keyDifferences) {
            const hasDifference = Object.keys(this.keyDifferences['keyDifferencesMap']).find(k => this.keyDifferences['keyDifferencesMap'][k] !== 0);
            return Boolean(hasDifference);
        } else {
            return false;
        }
    }

    showAgreedOverviewWarning() {
        return this.familyMembersRisk.agreedScore !== this.familyMembersRisk.calculatedScore;
    }

    setShowLegendOrangeStar() {
        this.showLegendOrangeStar = true;
        return true;
    }

    setShowLegendRedStar() {
        this.showLegendRedStar = true;
        return true;
    }
}
