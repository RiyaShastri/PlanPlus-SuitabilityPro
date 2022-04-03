import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlanningService, DocumentService, PortfolioService } from '../../client/service';
import { ActivatedRoute } from '../../../../node_modules/@angular/router';
import { slideInOutAnimation } from '../../shared/animations/slide-in-out.animation';
import { PageTitleService } from '../../shared/page-title';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-rename-item',
    templateUrl: './rename-item.component.html',
    styleUrls: ['./rename-item.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class RenameItemComponent implements OnInit, OnDestroy {
    public clientId;
    public params;
    public itemId;
    public portfolio;
    public docTypeId;
    public newDescription = null;
    public type;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private route: ActivatedRoute,
        private planningservice: PlanningService,
        private portfolioService: PortfolioService,
        private pageTitleService: PageTitleService,
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.RENAME_PORTFOLIO_TITLE');
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        if (!this.clientId) {
            this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
            });
        }
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params.hasOwnProperty('portfolioId')) {
                this.itemId = params['portfolioId'];
                this.type = 'portfolio';
            } else {
                this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(subparams => {
                    if (subparams.hasOwnProperty('portfolioId')) {
                        this.itemId = subparams['portfolioId'];
                        this.type = 'portfolio';
                    } else {
                        this.itemId = params['docId'];
                        this.docTypeId = params['docTypeId'];
                        this.type = 'document';
                    }
                });
            }
        });
    }

    ngOnInit() {
        if (this.type === 'portfolio') {
            this.portfolioService.getPortfoliosDetailsById(this.itemId, 'CAD').toPromise().then(res => {
                this.portfolio = res;
            }).catch(err => { });
        }
    }

    renameItem() {
        if (this.type === 'portfolio') {
            this.portfolioService.renamePortfolio(this.clientId, this.portfolio.id, this.newDescription).toPromise().then(res => {
                Swal('Updated!', 'Portfolio has been renamed successfully.', 'success');
                this.portfolioService.getClientPortfolioPayload(this.clientId);
                this.back();
            }).catch(err => {
                Swal('Oops...', err.error.errorMessage, 'error');
            });
        }
    }
    back() {
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
