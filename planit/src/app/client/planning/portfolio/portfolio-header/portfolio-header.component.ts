import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { PortfolioService } from '../../../service';
import { Component, OnInit, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { AppState, getPortfolioPayload } from '../../../../shared/app.reducer';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-portfolio-header',
    templateUrl: './portfolio-header.component.html',
    styleUrls: ['./portfolio-header.component.css']
})
export class PortfolioHeaderComponent implements OnInit, OnDestroy {
    @Output() switchPortfolio = new EventEmitter();
    @Input() clientId;
    @Input() goalId;
    @Input() portfolioId;
    @Input() isEditableRoute;
    @Input() detailsLoaded;
    @Input() currentPage;
    portfolioData = [];
    portfolioName: string;
    selectedPortfolio;
    accessRights = {};
    user = '';
    isCombinedRole = false;
    showAnalysisTab = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private portfolioService: PortfolioService,
        private store: Store<AppState>,
        private accessRightService: AccessRightService,
        private ngxPermissionsService: NgxPermissionsService,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        const permissions = this.ngxPermissionsService.getPermissions();
        if (Object.keys(permissions).length > 1) {
            this.isCombinedRole = true;
        } else {

                this.showAnalysisTab = true;

        }
        this.accessRightService.getAccess(['POADD', 'MODGL', 'PORTIMPLTAB', 'CLI05', 'CLI02']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res } });
        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result.hasOwnProperty('portfolios') && result['portfolios'].length > 0 && (result.hasOwnProperty('clientId') && result['clientId'] === this.clientId)) {
                this.portfolioData = result['portfolios'];
                this.selectedPortfolio = this.portfolioData[this.portfolioData.findIndex(p => p.id === this.portfolioId)];
                if (this.selectedPortfolio) {
                    this.portfolioName = this.selectedPortfolio['description'];
                }
            }
        });
    }

    changePortfolio(portfolioId, goals) {
        this.portfolioId = portfolioId;
        const goalId = (goals.length > 0) ? goals[0]['id'] : '';
        this.selectedPortfolio = this.portfolioData[this.portfolioData.findIndex(p => p.id === this.portfolioId)];
        this.portfolioName = this.selectedPortfolio['description'];
        this.switchPortfolio.emit({ portfolioId: portfolioId, goalId: goalId });
    }

    deletePortfolio() {
        this.translate.get([
            'PORTFOLIOS.DELETE_POPUP.TITLE',
            'PORTFOLIOS.DELETE_POPUP.TEXT',
            'PORTFOLIOS.DELETE_POPUP.DELETE_SUCCESS',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['PORTFOLIOS.DELETE_POPUP.TITLE'],
                text: i18text['PORTFOLIOS.DELETE_POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.portfolioService.deletePortfolio(this.portfolioId).toPromise().then(response => {
                        this.portfolioService.getClientPortfolioPayload(this.clientId, true, true);
                        Swal(i18text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18text['PORTFOLIOS.DELETE_POPUP.DELETE_SUCCESS'], 'success');
                    }).catch(errorResponse => {
                        Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
