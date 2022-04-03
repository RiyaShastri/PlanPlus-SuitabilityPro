import { AppState, getkycQuestionsPayLoad, getFamilyMemberRiskPayload } from '../../../shared/app.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfileService } from '../../service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { riskScoreBadge } from '../../client-models';
import { Store } from '@ngrx/store';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as $ from 'jquery';
import { PageTitleService } from '../../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import {AccessRightService} from '../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-risk-tolerance-kyc',
    templateUrl: './risk-tolerance-kyc.component.html',
    styleUrls: ['./risk-tolerance-kyc.component.css']
})

export class RiskToleranceKycComponent implements OnInit, OnDestroy {
    familyMembersRisk = {};
    currTabIndex = -1;
    clientId;
    personalId;
    riskScoreBadge = riskScoreBadge;
    personDetail = {};
    allowEdit = false;
    expandToggled = false;
    expandAll = false;
    locale = 'en';
    questionModified = false;
    questionArr = {};
    accessRights = {};
    pageLayout = {
        'left': {
            'CORE-1': 'Annual income (from all sources)',
            'CORE-3': 'Estimated net worth',
            'CORE-4': 'Investment capital'
        },
        'right-2': {
            'CORE-2': 'Stability of income',
            'CORE-5': 'Education',
        }
    };
    questionArrWithCategory = {
        'left': {},
        'right': {},
        'right-2': {},
    };
    questionArrWithCategoryIds = {
        'left': [],
        'right': [],
        'right-2': [],
    };
    answer = {
        'right': [],
        'right-2': [],
        'left': []
    };
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private profileService: ClientProfileService,
        private store: Store<AppState>,
        public translate: TranslateService,
        public pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'riskToleranceKYC' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.RISK_TOLERANCE_KYC_TITLE');
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
       this.accessRightService.getAccess(['KYC']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res){ this.accessRights = res}});
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.personalId = this.route.snapshot.params['personalId'];
            this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data) {
                    const personRiskDetail = data.filter(riskData => riskData.personalDetails.id === this.personalId)[0];
                    if (personRiskDetail) {
                        this.familyMembersRisk = personRiskDetail;
                        this.personDetail = personRiskDetail['personalDetails'];
                    }
                } else {
                    this.profileService.getClientFamilyMembersRisk(this.clientId);
                }
            });
            this.getKYCdetails();
        });
        this.locale = this.translate.store.currentLang;
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.locale = event.lang;
            this.getKYCdetails();
        });
    }

    async getKYCdetails() {
        const locale = (this.locale === 'fr') ? 'FRE' : 'ENG';
            this.profileService.getKYCdetails(this.clientId, this.personalId, locale, 2).toPromise().then(response => {
                this.modifiedQuestion(response, 'left');
                this.modifiedQuestion(response, 'right-2');
                this.questionModified = true;
        });
    }

    modifiedQuestion(res, portion) {
        this.questionArrWithCategory[portion] = {};
        this.questionArrWithCategoryIds[portion] = [];
        res.questions.forEach(question => {
            if (this.pageLayout[portion].hasOwnProperty(question.id)) {
                if (question['multipleSelect']) {
                    const selectedAns = [];
                    question['options'].forEach(option => {
                        if (option.selected) {
                            selectedAns.push((option.value).toFixed(0));
                        }
                    });
                    this.answer[portion][question['id']] = selectedAns;
                } else {
                    const selectedAnswer = question['options'].find(x => x['selected'] === true);
                    if (selectedAnswer !== undefined) {
                        this.answer[portion][question['id']] = selectedAnswer;
                    }
                }

                const questionCategory = this.pageLayout[portion][question.id];
                if (!this.questionArrWithCategory[portion].hasOwnProperty(questionCategory)) {
                    this.questionArrWithCategory[portion][questionCategory] = [];
                    this.questionArrWithCategoryIds[portion].push(questionCategory);
                }
                this.questionArrWithCategory[portion][questionCategory].push(question);
            }
        });
    }

    toggleEdit() {
        this.allowEdit = !this.allowEdit;
    }

    toggleExpand() {
        this.expandToggled = true;
        this.expandAll = !this.expandAll;
    }

    editkyc() {
        const reqArray = [{
            'kycType': 'KYC',
            'answers': this.getAnswers($.extend(this.answer['left'], this.answer['right-2']))
        }];
        this.profileService.editRiskKYC(this.clientId, this.personalId, reqArray).toPromise().then(data => {
            this.getKYCdetails();
            this.allowEdit = false;
        });
    }

    getAnswers(answerObj) {
        const questionKeys = Object.keys(answerObj);
        const masterObj = {};

        questionKeys.forEach(questionKey => {
            if (Array.isArray(answerObj[questionKey])) {
                masterObj[questionKey] = answerObj[questionKey].reduce((a, b) => parseInt(a, 10) + parseInt(b, 10), 0);
            } else {
                masterObj[questionKey] = answerObj[questionKey]['id'];
            }
        });
        return masterObj;
    }

    memberSwitch(memberId) {
        this.router.navigate(['/client/' + this.clientId + '/profile/risk-tolerance/' + memberId + '/know-your-client']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
