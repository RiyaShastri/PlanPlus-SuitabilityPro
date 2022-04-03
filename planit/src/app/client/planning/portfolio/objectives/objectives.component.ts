import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { PortfolioService } from '../../../service';
import { riskScoreBadge } from '../../../client-models';
import { Angulartics2 } from 'angulartics2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['../../../profile/risk-tolerance-kyc/risk-tolerance-kyc.component.css', './objectives.component.css']
})
export class ObjectivesComponent implements OnInit, OnDestroy {

    public clientId;
    public portfolioId;
    allowEdit = false;
    expandToggled = false;
    expandAll = false;
    timeHorizon;
    chekmarkDisable = false;
    check = false;
    portfoliosAll = [];
    portfolioData = [];
    defaultport = [];
    defaultName;
    portfolioDetails;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private portfolioService: PortfolioService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'portfolioObjective' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
            this.timeHorizon = [
                { 'id': 1, 'name': '7 to 9 years' },
                { 'id': 2, 'name': '7 to 9 years' },
                { 'id': 3, 'name': '7 to 9 years' }
            ];
            this.portfolioService.getListOfPortfolios(this.clientId).toPromise().then(data => {
                if (data.hasOwnProperty('portfolios')) {
                    this.portfoliosAll.push(data['portfolios']);
                    if (this.portfoliosAll[0]) {
                        this.portfoliosAll[0].forEach(element => {
                            this.defaultport.push({
                                'id': element.id, 'description': element.description,
                                'defaultPortfolio': element.defaultPortfolio
                            });
                        });
                    }
                    this.portfolioData = this.portfoliosAll[0].filter(result => result.id === this.portfolioId);
                    this.defaultName = this.defaultport.filter(action => action.defaultPortfolio === true)[0];
                }
            }).catch(errorResponse => { });
            this.portfolioService.getPortfoliosDetailsById(this.clientId, this.portfolioId).toPromise().then(result => {
                this.portfolioDetails = result[0];
            }).catch(errorResponse => { });
        });
    }

    toggleEdit() {
        this.allowEdit = !this.allowEdit;
        if (this.check === true) {
            this.check = false;
        }
    }

    toggleExpand() {
        this.expandToggled = true;
        this.expandAll = !this.expandAll;
    }

    checkMark() {
        this.check = !this.check;
    }
    getRiskBadge(score) {
        return riskScoreBadge(score).label;
    }
    portfolioSwitch(portfolioId) {
        this.router.navigate(['/client/' + this.clientId + '/planning/portfolios/' + portfolioId + '/objectives']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
