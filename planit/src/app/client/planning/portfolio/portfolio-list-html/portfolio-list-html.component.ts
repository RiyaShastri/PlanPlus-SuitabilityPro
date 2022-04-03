import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { AppState, getPortfolioPayload, getClientPayload } from '../../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { PortfolioService } from '../../../service';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-portfolio-list-html',
    templateUrl: './portfolio-list-html.component.html',
    styleUrls: ['./portfolio-list-html.component.css']
})
export class PortfolioListHtmlComponent implements OnInit, OnDestroy {
    portfoliosData = [];
    allTotalAssets: number;
    @Input() isTile: boolean;
    @Input() limit;
    @Input() clientId: string;
    accessRights = {};
    clientData = {};
    user = '';
    permissions = {};
    isCombinedRole = false;
    showRiskCapacity = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private store: Store<AppState>,
        private accessRightService: AccessRightService,
        private portfolioService: PortfolioService,
        private ngxPermissionsService: NgxPermissionsService,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        const permissions = this.ngxPermissionsService.getPermissions();
        if (Object.keys(permissions).length > 1) {
            this.isCombinedRole = true;
        }
        if (permissions.hasOwnProperty('PROFILER') && !permissions.hasOwnProperty('ADVISOR')) {
            this.showRiskCapacity = true;
        }
        this.accessRightService.getAccess(['POB01', 'MODGL', 'PORTIMPLTAB', 'CLI02', 'CLI05', 'RISKTOLERCLIENT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res } });
        this.allTotalAssets = 0;
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.getPortfoliosData();
    }

    getPortfoliosData() {
        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result.hasOwnProperty('portfolios')) {
                this.portfoliosData = result['portfolios'];
                this.allTotalAssets = result['totalAssets'];
                if (this.limit !== '') {
                    this.portfoliosData = this.portfoliosData.slice(0, this.limit);
                }
            }
        });
    }

    changeOwnershipAction(index: number) {
        if ($('#dropdownOwnershipAction' + index).is(':visible')) {
            $('.dropdown-portfolio-owned-action').hide();
        } else {
            $('.dropdown-portfolio-owned-action').hide();
            $('#dropdownOwnershipAction' + index).toggle();
        }
    }

    changePortfolioAction(index: number) {
        if ($('#dropdownPortfolioAction' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#dropdownPortfolioAction' + index).toggle();
        }
    }

    delete(portfolioId: any) {
        this.translate.get([
            'PORTFOLIOS.DELETE_POPUP.TITLE',
            'PORTFOLIOS.DELETE_POPUP.TEXT',
            'PORTFOLIOS.DELETE_POPUP.DELETE_SUCCESS',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
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
                    this.portfolioService.deletePortfolio(portfolioId).toPromise().then(async response => {
                        await this.portfolioService.getClientPortfolioPayload(this.clientId);
                        this.getPortfoliosData();
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
