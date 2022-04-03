import { NgForm } from '@angular/forms';
import { Location, getCurrencySymbol } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { NgxPermissionsService } from 'ngx-permissions';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { PageTitleService } from '../../../../shared/page-title';
import { slideInOutAnimation } from '../../../../shared/animations';
import { PortfolioService, ClientProfileService } from '../../../service';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { timeHorizonDropdownValues } from '../../../../setting/settings-models';
import { AppState, getFamilyMemberPayload, getFamilyMemberRiskPayload, getClientPayload, getIsGoalLoaded, getGoalPayload } from '../../../../shared/app.reducer';
import {AccessRightService} from "../../../../shared/access-rights.service";

@Component({
    selector: 'app-add-portfolio',
    templateUrl: './add-portfolio.component.html',
    styleUrls: ['./add-portfolio.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddPortfolioComponent implements OnInit, OnDestroy {

    public clientId;
    public portfolio: any = {};
    public newPortfolio: any = {};
    public addAccountValueHolder: any = {};
    public addPortfolioValueHolder: any = {};
    public timeHorizonDropdownArray = Object.assign([], timeHorizonDropdownValues);
    currencyMask = createNumberMask({
        prefix: '$'
    });
    public investorList: any = [];
    public isGrayOut = false;
    decisionMaker;
    investment = 0;
    clientData = {};
    selectDecisionMaker = true;
    investorWithScore = 0;
    saveDisable = false;
    closeButtonDisable = false;
    showLinkGoals = true;
    private unsubscribe$ = new Subject<void>();
    public hasGoals = false;
    accessRights = {};

    constructor(
        private router: Router,
        private _location: Location,
        private route: ActivatedRoute,
        private refreshDataService: RefreshDataService,
        private store: Store<AppState>,
        private profileService: ClientProfileService,
        private pageTitleService: PageTitleService,
        private portfolioService: PortfolioService,
        private ngxPermissionsService: NgxPermissionsService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private acceessRightsService: AccessRightService
    ) {
        this.angulartics2.eventTrack.next({ action: 'addPortfolio' });
        setTimeout(() => {
            this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_PORTFOLIO_TITLE');
        }, 0);
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        // this.timeHorizonDropdownArray.splice(0, 1);  // SP-732
        this.translate.get(['PORTFOLIOS.TIME_HORIZON.LESS_THAN_A_YEAR',
            'PORTFOLIOS.TIME_HORIZON.MORE_THAN_TWENTY_YEARS'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                this.timeHorizonDropdownArray.forEach(function (item) {
                    if (item.value === 0) { // less than 1 year
                        item.displayText = i18text['PORTFOLIOS.TIME_HORIZON.LESS_THAN_A_YEAR'];
                    } else if (item.value === 999) {    // more than 20 years
                        item.displayText = i18text['PORTFOLIOS.TIME_HORIZON.MORE_THAN_TWENTY_YEARS'];
                    }
                });
            });
        this.acceessRightsService.getAccess(['CLI02', 'CLI05']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.accessRights = res);
    }

    ngOnInit() {
        this.portfolio['persons'] = [];
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        this.store.select(getGoalPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(goalPayload => {
            if (goalPayload && goalPayload.length > 0) {
                this.hasGoals = true;
            }
        });
        this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                if (data.length === 1) {
                    this.investorList = [data[0]];
                    this.isGrayOut = true;
                    this.decisionMaker = data[0]['personalDetails']['id'];
                }
            } else {
                this.profileService.getClientFamilyMembersRisk(this.clientId);
            }
        });
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('add_protFolio_screen|')) {
                this.addAccountValueHolder = JSON.parse(message.replace('add_protFolio_screen|', ''));
                this.showLinkGoals = false;
            } else {
                this.addAccountValueHolder = {};
            }

            if (message.includes('add_investor_screen_backto_portfolio|')) {
                this.addPortfolioValueHolder = JSON.parse(message.replace('add_investor_screen_backto_portfolio|', ''));
                this.portfolio.description = (this.addPortfolioValueHolder.description) ? this.addPortfolioValueHolder.description : '';
                this.portfolio.timeHorizonObj = this.addPortfolioValueHolder.timeHorizonObj;
                this.investorList = this.addPortfolioValueHolder.persons;
                if (this.investorList.length === 1) {
                    this.decisionMaker = this.investorList[0]['personalDetails']['id'];
                } else if (this.investorList.length > 1) {
                    let decisionMaker;
                    this.investorWithScore = 0;
                    this.investorList.forEach(investor => {
                        if (investor.agreedScore > 0) {
                            decisionMaker = investor.personalDetails.id;
                            this.investorWithScore++;
                        }
                    });
                    if (this.investorWithScore === 1) {
                        this.decisionMaker = decisionMaker;
                        this.selectDecisionMaker = false;
                    }
                }
            } else {
                this.addPortfolioValueHolder = {};
            }
            // remove Unknown from the time horizon option
            if (this.timeHorizonDropdownArray !== undefined) {
                this.timeHorizonDropdownArray.splice(this.timeHorizonDropdownArray.findIndex(x => x['name'] === 'Unknown'), 1);
            }
        });
    }

    addPortfolio(f: NgForm, temp, opt) {
        if (f.form.valid) {
            const permissions = this.ngxPermissionsService.getPermissions();
            let data = {};
            if (!permissions.hasOwnProperty('ADVISOR')) {
                data = {
                    clientNum: this.clientId,
                    description: this.portfolio.description,
                    timeHorizon: this.portfolio.timeHorizonObj.value,
                    ownership: [],
                };

                this.investorList.forEach(investor => {
                    data['ownership'].push({
                        ownerId: investor.personalDetails.id,
                        decisionMaker: (investor.personalDetails.id === this.decisionMaker) ? true : false,
                        invested: (investor.personalDetails.id === this.decisionMaker) ? this.investment : 0,
                        owner: {id: investor.personalDetails.id, role: investor.personalDetails.relation}

                    });
                });
            } else {
                data = {
                    clientNum: this.clientId,
                    description: this.portfolio.description,
                };
            }
            if ((!permissions.hasOwnProperty('ADVISOR') && this.investment > 0)
                || permissions.hasOwnProperty('ADVISOR')
                || (this.accessRights.hasOwnProperty('CLI05')
                    && this.accessRights['CLI05'].hasOwnProperty('accessLevel')
                    && this.accessRights['CLI05']['accessLevel'] === 3) ) {

                this.portfolioService.addPortfolio(data).toPromise().then(async res => {
                    this.newPortfolio = await res;
                    await this.portfolioService.getClientPortfolioPayload(this.clientId);

                    if (JSON.stringify(this.addAccountValueHolder) !== '{}') {
                        this.addAccountValueHolder['portfolioId'] = this.newPortfolio['portfolionum'];
                        this.refreshDataService.changeMessage('add_protFolio_screen|' + JSON.stringify(this.addAccountValueHolder));
                        if (temp === 1) {
                            this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', 'link-portfolios-to-goals']);
                        } else {
                            this.router.navigate(['/client', this.clientId, 'planning', 'assets-liabilities', 'add-account']);
                        }
                    } else {
                        if (temp === 1) {
                            this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', 'link-portfolios-to-goals']);
                        }
                    }
                    this.translate.get(['PORTFOLIO.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        Swal('Success', i18text['PORTFOLIO.POPUP.SUCCESS'], 'success');
                    });
                    this.saveDisable = false;
                    if (temp !== 1) {
                        this.back(opt);
                    }
                }).catch(errorResponse => {
                    Swal('Oops...', errorResponse.error.errorMessage, 'error');
                    this.back(1);
                });
            } else if (this.investment <= 0) {
                this.translate.get(['PORTFOLIO.POPUP.INVESTMENT_AMOUNT_ERROR']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal('Oops...', i18text['PORTFOLIO.POPUP.INVESTMENT_AMOUNT_ERROR'], 'error');
                });
            } else {
                this.translate.get(['PORTFOLIO.POPUP.PORTFOLIO_NOT_ADDED']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal('Oops...', i18text['PORTFOLIO.POPUP.PORTFOLIO_NOT_ADDED'], 'error');
                });
            }
        } else {
            this.translate.get(['PORTFOLIO.POPUP.ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Oops...', i18text['PORTFOLIO.POPUP.ALERT'], 'error');
            });
        }
    }

    back(opt) {
        if (JSON.stringify(this.addAccountValueHolder) === '{}') {
            this.refreshDataService.changeMessage('default message');
            if (opt === 1) {
                this._location.back();
            } else {
                this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.newPortfolio.portfolionum, 'details', 'edit']);
            }
        } else {
            this._location.back();
        }
    }

    addInvestor() {
        this.portfolio['persons'] = this.investorList;
        this.refreshDataService.changeMessage('add_investor_screen|' + JSON.stringify(this.portfolio));
        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', 'add-investor']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
