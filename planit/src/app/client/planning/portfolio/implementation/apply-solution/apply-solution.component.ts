import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../../shared/animations';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, PortfolioService } from '../../../../service';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import swal from 'sweetalert2';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { PageTitleService } from '../../../../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../../shared/access-rights.service';
@Component({
    selector: 'app-apply-solution',
    templateUrl: './apply-solution.component.html',
    styleUrls: ['./apply-solution.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class ApplySolutionComponent implements OnInit, OnDestroy {
    clientId;
    portfolioId;
    isDetailExpand = false;
    searchString = '';
    suitabilityScore = 0;
    suitabilityLabel = '';
    showSearchField = false;
    implementedSolutionId = '';
    solutionData = {
        'OK': [],
        'MarginalUpper': [],
        'MarginalLower': [],
        'TooLittle': [],
        'TooMuch': [],
    };
    closeButtonDisable = false;
    accountId;
    currency = '';
    fromAccountsTable = false;
    private unsubscribe$ = new Subject<void>();
    accessRights = {};
    isAccount = false;
    constructor(
        private _location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private planningService: PlanningService,
        private portfolioService: PortfolioService,
        private pageTitleService: PageTitleService,
        private dataSharing: RefreshDataService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private accessRightService: AccessRightService,
    ) {
        this.angulartics2.eventTrack.next({ action: 'applySolutionSidePanel' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.APPLY_SOLUTION_TITLE');
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
        });

        this.route.params.subscribe(params => {
            if (params.hasOwnProperty('accountId')) {
                this.accountId = params['accountId'];
                this.fromAccountsTable = true;
                this.route.queryParams.subscribe(queryParam => {
                    this.currency = queryParam.currency;
                });
            }
        });
        this.isAccount = this.accountId ? true : false;
    }

    ngOnInit() {
        this.accessRightService.getAccess(['CLI07']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.accessRights = res;
            }
        });
        this.getPortfolioSolution();
        this.getImplementedSolution();
    }

    getPortfolioSolution() {
        this.portfolioService.getPortfolioSolution(this.portfolioId, this.searchString)
            .debounceTime(1000)
            .distinctUntilChanged()
            .toPromise().then(result => {
                if (result) {
                    this.solutionData = result['solutions'];
                    this.showSearchField = result['showSearchField'];
                    if (this.searchString !== '') {
                        this.showSearchField = true;
                    }
                    this.suitabilityScore = result['suitabilityScore'];
                }
            });
    }

    getImplementedSolution() {
        this.portfolioService.getRecommendedSolution(this.portfolioId).toPromise().then(data => {
            if (data.length > 0) {
                this.implementedSolutionId = data[0]['solutionId'];
            }
        }).catch(errorResponse => {

        });
    }

    back() {
        this._location.back();
    }

    toggle() {
        $('#moreDetai').toggle();
    }

    customClick() {
        const obj = {};
        if (this.isAccount) {
            obj['account'] = true;
            this.dataSharing.changeMessage('Custom_Solution_For_Manage_Account|' + JSON.stringify(this.accountId));
        } else {
            obj['custom'] = true;
        }
        this.planningService.redirectToImplementation(obj);
        this.back();
    }

    selectedSolution(selectedSolutionId) {
        let payload = {};
        this.translate.get([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'PORTFOLIO.IMPLEMENTATION.POPUP.SOLUTION_SUCCESSFULLY_APPLIED'
        ]).subscribe(i18Text => {
            if (this.fromAccountsTable) {
                payload = {
                    clinum: this.clientId,
                    currencyCode: this.currency,
                    plannum: this.accountId,
                };
            }
            this.portfolioService.saveImplementedSolution(this.portfolioId, selectedSolutionId, payload).toPromise().then(res => {
                if (this.fromAccountsTable) {
                    this.dataSharing.changeMessage('solution_applied_on_account|' + this.currency);
                } else {
                    this.dataSharing.changeMessage('change_implemented_solution');
                }
                swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.SOLUTION_SUCCESSFULLY_APPLIED'], 'success');
                this.back();
            }).catch(err => {
                swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
