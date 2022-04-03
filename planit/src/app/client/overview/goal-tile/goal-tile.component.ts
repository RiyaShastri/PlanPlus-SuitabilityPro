import * as $ from 'jquery';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
    AppState,
    getIsGoalLoaded,
    getGoalPayload,
    getClientPayload,
    getPortfolioPayload
} from '../../../shared/app.reducer';
import { GoalService, PortfolioService } from '../../service';
import { environment } from '../../../../environments/environment';
import { AccessRightService } from '../../../shared/access-rights.service';

@Component({
    selector: 'app-goal-tile',
    templateUrl: './goal-tile.component.html',
    styleUrls: ['./goal-tile.component.css']
})
export class GoalTileComponent implements OnInit, OnDestroy {
    public data: any[];
    @Input() public clientId;
    clientData = {};
    allPortfolios: any;
    environment = {};
    accessRights = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private goalService: GoalService,
        private store: Store<AppState>,
        public translate: TranslateService,
        private accessRightService: AccessRightService,
        private portfolioService: PortfolioService
    ) { }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.store.select(getIsGoalLoaded).pipe(take(1)).pipe(takeUntil(this.unsubscribe$)).subscribe((loaded: boolean) => {
            if (!loaded) {
                this.goalService.getClientGoalPayload(this.clientId);
            }
        });
        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result.hasOwnProperty('portfolios')) {
                this.allPortfolios = {};
                result.portfolios.forEach(portfolio => {
                    this.allPortfolios[portfolio.id] = portfolio.description;
                });
                this.store.select(getGoalPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    this.data = data;
                });
            }
        });
        this.environment = environment;
        this.accessRightService.getAccess(['PLANTRAC', 'SAV01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res } });
    }

    changeGoalAction(index: number) {
        if ($('#dropdownGoalAction' + index).is(':visible')) {
            $('.dropdown-goal-action').hide();
        } else {
            $('.dropdown-goal-action').hide();
            $('#dropdownGoalAction' + index).toggle();
        }
    }

    delete(goalId) {
        this.translate.get([
            'DELETE.POPUP.GOAL_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.GOAL_DELETE',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.GOAL_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.goalService.deleteGoal(goalId).toPromise().then(res => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.GOAL_DELETE'], 'success');
                        this.goalService.getClientGoalPayload(this.clientId);
                        this.portfolioService.getClientPortfolioPayload(this.clientId);
                    }).catch(err => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
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
