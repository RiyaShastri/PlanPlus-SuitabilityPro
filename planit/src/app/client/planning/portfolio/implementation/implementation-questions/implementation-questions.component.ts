import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { slideInOutAnimation } from '../../../../../shared/animations';
import { Angulartics2 } from 'angulartics2';
import { PortfolioService } from '../../../../service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';

@Component({
    selector: 'app-implementation-questions',
    templateUrl: './implementation-questions.component.html',
    styleUrls: ['./implementation-questions.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class ImplementationQuestionsComponent implements OnInit, OnDestroy {
    expandAll = false;
    forceUpdateReviewDate = false;
    closeButtonDisable = false;
    clientId;
    portfolioId;
    questions = {};
    i18text = {};
    unsubscribe$ = new Subject<void>();
    saveDisabled = false;
    isRevisited = false;
    openTabs = [];
    constructor(
        private _location: Location,
        private angulartics2: Angulartics2,
        private portfolioService: PortfolioService,
        private route: ActivatedRoute,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'implementationSidePanel' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
        });
    }

    ngOnInit() {
        this.translate.stream([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'CUSTOM.IMPLEMENTATION_QUESTIONS_SUCCESS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18text = i18Text;
        });
        this.portfolioService.getEditQuestion(this.clientId, this.portfolioId).toPromise().then(result => {
            this.questions = result;
            this.questions['questionsReviewed'] = false;
            this.questions['sectionDetails'].forEach((section, index) => {
                section['expand'] = false;
                if (index === 0) {
                    section['expand'] = true;
                }
                section['questions'].forEach((question) => {
                    question['options'].forEach(option => {
                        if (option['selected']) {
                            if (!question.multipleSelect) {
                                question['answersId'] = option['id'];
                            }
                            this.isRevisited = true;
                        }
                    });
                });
            });
        }).catch(err => { });
    }

    back() {
        this._location.back();
    }

    makeSelection(questionObj, optionIndex) {
        questionObj['options'].forEach((option, index) => {
            option['selected'] = false;
            if (index === optionIndex) {
                option['selected'] = true;
            }
        });
        if (this.isRevisited) {
            this.forceUpdateReviewDate = true;
            this.questions['questionsReviewed'] = true;
        }
    }

    toggleExpand() {
        this.expandAll = !this.expandAll;
        this.openTabs = [];
        this.questions['sectionDetails'].forEach((element, index) => {
            if (this.expandAll) {
                this.openTabs.push(index);
            }
            element['expand'] = this.expandAll;
        });
    }

    saveResponse(f) {
        if (f.valid) {
            this.portfolioService.updateQuestions(this.clientId, this.portfolioId, this.questions).toPromise().then(result => {
                swal(this.i18text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18text['CUSTOM.IMPLEMENTATION_QUESTIONS_SUCCESS'], 'success');
                this.portfolioService.getClientPortfolioPayload(this.clientId);
                this.back();
            }).catch(errorResponse => {
                swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
            });
        }
        this.saveDisabled = false;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onTabOpen(e) {
        const tabIndex = this.openTabs.indexOf(e.index);
        if (tabIndex > -1) {
            this.openTabs.splice(tabIndex, 1);
        } else {
            this.openTabs.push(e.index);
        }
        if (this.openTabs.length === this.questions['sectionDetails'].length) {
            this.expandAll = true;
        } else {
            this.expandAll = false;
        }
    }
}
