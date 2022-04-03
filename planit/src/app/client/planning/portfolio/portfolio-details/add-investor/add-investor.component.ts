import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { riskScoreBadge } from '../../../../../client/client-models/index';
import { slideInOutAnimation } from '../../../../../shared/animations/index';
import { ClientProfileService, PortfolioService } from '../../../../service/index';
import { AppState, getFamilyMemberRiskPayload, getFamilyMemberPayload } from '../../../../../shared/app.reducer';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { _localeFactory } from '@angular/core/src/application_module';
import { PageTitleService } from '../../../../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-add-investor',
    templateUrl: './add-investor.component.html',
    styleUrls: ['./add-investor.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddInvestorComponent implements OnInit, OnDestroy {

    familyMembersRisk = {};
    clientId;
    riskScoreBadge = riskScoreBadge;
    portfolioId;
    portfolio = {};
    selectedInvestors = [];
    investors = [];
    investorList = {};
    addPortfolioValueHolder = {};
    addedInvestors = [];
    isEditableRoute;
    isBeforePortfolio = false;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<AppState>,
        private portfolioService: PortfolioService,
        private refreshDataService: RefreshDataService,
        private profileService: ClientProfileService,
        private pageTitleService: PageTitleService,
        private translate: TranslateService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_INVESTOR_TITLE');
        this.isEditableRoute = this.router.url.includes('/details/edit') ? true : false;
        this.clientId = this.route.parent.parent.parent.snapshot.params['clientId'];
        this.portfolioId = this.route.parent.snapshot.params['portfolioId'];
        if (this.portfolioId === undefined) {
            this.isBeforePortfolio = true;
        }
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('add_investor_screen|')) {
                this.isBeforePortfolio = true;
                this.addPortfolioValueHolder = JSON.parse(message.replace('add_investor_screen|', ''));
                this.portfolio['description'] = (this.addPortfolioValueHolder['description']) ? this.addPortfolioValueHolder['description'] : '';
                const addedPersons = (this.addPortfolioValueHolder['persons']) ? this.addPortfolioValueHolder['persons'] : [];

                this.addedInvestors = [];
                addedPersons.forEach(person => {
                    this.addedInvestors.push(person.personalDetails.id);
                });
            } else {
                this.addPortfolioValueHolder = {};
            }
        });

        // if (this.isBeforePortfolio && JSON.stringify(this.addPortfolioValueHolder) === '{}') {
        //     this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', 'add-portfolio']);
        // }
    }

    ngOnInit() {
        this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.investors = [];
                data.forEach(member => {
                    this.familyMembersRisk[member.personalDetails.id] = member;
                    this.investors.push(member);
                    this.investorList[member.personalDetails.id] = member.personalDetails;
                    if (this.addedInvestors.indexOf(member.personalDetails.id) > -1) {
                        this.selectedInvestors.push(member.personalDetails.id);
                    }
                });
            } else {
                this.profileService.getClientFamilyMembersRisk(this.clientId);
            }
            if (!this.isBeforePortfolio) {
                this.getInvestors();
            }
        });
        if (!this.isBeforePortfolio) {
            this.portfolioService.getPortfoliosDetailsById(this.portfolioId, 'CAD').toPromise().then(results => {
                this.portfolio = results;
            }).catch(errorResponse => { });
        }
    }

    getInvestors() {
        this.investors = [];
        this.portfolioService.getInvestorsList(this.clientId, this.portfolioId).toPromise().then(response => {
            const array = response;
            array.forEach(investor => {
                if (this.familyMembersRisk[investor.id] !== undefined) {
                    this.investorList[investor.id] = investor;
                    this.investors.push(this.familyMembersRisk[investor.id]);
                }
            });
        }).catch(errorRespone => { });
    }

    back() {
        if (this.isBeforePortfolio && JSON.stringify(this.addPortfolioValueHolder) !== '{}') {
            this.refreshDataService.changeMessage('add_investor_screen_backto_portfolio|' + JSON.stringify(this.addPortfolioValueHolder));
        }
        this._location.back();
    }

    addInvestor() {
        if (this.isBeforePortfolio && JSON.stringify(this.addPortfolioValueHolder) !== '{}') {
            const personPayloadDTO = [];
            this.selectedInvestors.forEach(id => {
                personPayloadDTO.push(this.familyMembersRisk[id]);
            });
            this.addPortfolioValueHolder['persons'] = personPayloadDTO;
            this.refreshDataService.changeMessage('add_investor_screen_backto_portfolio|' + JSON.stringify(this.addPortfolioValueHolder));
            this.back();
        } else {
            const personPayloadDTO = [];
            this.selectedInvestors.forEach(id => {
                personPayloadDTO.push(this.investorList[id]);
            });
            this.portfolioService.addInvestors(this.clientId, this.portfolioId, personPayloadDTO).toPromise().then(res => {
                this.translate.get(['PORTFOLIO.ADD_INVESTOR.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal('Success!', i18text['PORTFOLIO.ADD_INVESTOR.POPUP.SUCCESS'], 'success');
                });
                this.portfolioService.getClientPortfolioPayload(this.clientId);
                if (this.isEditableRoute) {
                    this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details', 'edit']);
                } else {
                    this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'details']);
                }
            }).catch(err => {
                Swal('Oops...', err.error.errorMessage, 'error');
            });
            this.back();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
