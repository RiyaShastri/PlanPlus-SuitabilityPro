import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import { takeUntil } from 'rxjs/operators';
import { getCurrencySymbol, Location } from '@angular/common';
import { EntitiesService } from '../../../service';
import { SCENARIOS, ENTITY_SSID } from '../../../../shared/constants';
import { RefreshDataService } from '../../../../shared/refresh-data';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';

@Component({
    selector: 'app-long-term-income-distributions',
    templateUrl: './long-term-income-distributions.component.html',
    styleUrls: ['./long-term-income-distributions.component.css']
})
export class LongTermIncomeDistributionsComponent implements OnInit, OnDestroy {
    clientId;
    entityId;
    unsubscribe$ = new Subject<void>();
    currencyMask = createNumberMask({
        prefix: '$'
    });
    entitiesList = [];
    longTermWithdrawals = [];
    longTermIncome = [];
    clientData = {};
    goToEditIncome = false;
    incomeId = '';
    selectedScenario = SCENARIOS.CURRENT_SCENARIO;
    longTermIncomeCopy;
    i18Text = {};
    entityType = 0;
    SALARY = ENTITY_SSID.SALARY;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private location: Location,
        private entityService: EntitiesService,
        private dataSharing: RefreshDataService,
        private translate: TranslateService,
        private pageTitleService: PageTitleService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_ENTITIES_LONG_TERM_INCOME_DISTRIBUTIONS');
        this.translate.stream([
            'ALERT_MESSAGE.WARNING_MESSAGE',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
            'ALERT.TITLE.SUCCESS',
            'ALERT_MESSAGE.OOPS_TEXT',
            'DELETE.POPUP.DISTRIBUTION_DELETE_TITLE',
            'ENTITY.POPUP.DISTRIBUTION_DELETED_SUCCESSFULLY',
            'DELETE.POPUP.DELETE_TITLE',
            'DELETE.POPUP.NOT_UNDO'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
            this.longTermData();
        });
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('refreshEntityLongTermData')) {
                this.longTermData();
                this.dataSharing.changeMessage('default message');
            }
        });
    }

    longTermData() {
        this.entityService.getLongTermIncomeDistributionData(this.clientId, this.entityId, this.selectedScenario).toPromise().then(res => {
            this.entitiesList = [];
            this.longTermIncome  = [];
            this.longTermWithdrawals = [];
            this.entitiesList.push(res['entityPlanningDetails']);
            this.longTermIncome = res['longTermIncomeHelpers'];
            this.longTermIncomeCopy = JSON.parse(JSON.stringify(res['longTermIncomeHelpers']));
            this.longTermWithdrawals = res['longTermWithdrawalHelpers'];
        }).catch(entityError => {
            if (entityError.status === 403 || entityError.status === 404) {
                this.router.navigate(['/client/' + this.clientId + '/planning/entities/list']);
            }
        });
    }

    changeDistributionAction(id, index, ownerIndex) {
        if ($('#' + id + '_' + index + ownerIndex).is(':visible')) {
            $('.dropdown-distribution-action').hide();
        } else {
            $('.dropdown-distribution-action').hide();
            $('#' + id + '_' + index + ownerIndex).toggle();
        }
    }

  changeIncomeAction(id, index) {
    if ($('#' + id + '_' + index).is(':visible')) {
      $('.dropdown-income-action').hide();
    } else {
      $('.dropdown-income-action').hide();
      $('#' + id + '_' + index).toggle();
    }
  }

    changeEntity(entityId) {
        this.entityId = entityId;
        this.router.navigate(['/client/' + this.clientId + '/planning/entities/' + this.entityId + '/long-term-income-distributions']);
    }

    deleteDistribution(distributionId, distributionName) {
        swal({
            title: this.i18Text['DELETE.POPUP.DISTRIBUTION_DELETE_TITLE'],
            html: this.i18Text['DELETE.POPUP.DELETE_TITLE'] +
                '&nbsp; <span class="fw-600">' + distributionName + '</span> ? <br/> <small>' + this.i18Text['DELETE.POPUP.NOT_UNDO'] + '</small>',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.i18Text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
            cancelButtonText: this.i18Text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
        }).then(result => {
            if (result.value) {
                this.entityService.deleteDistrbution(this.clientId, this.entityId, distributionId).toPromise().then(response => {
                    this.longTermData();
                    swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['ENTITY.POPUP.DISTRIBUTION_DELETED_SUCCESSFULLY'], 'success');
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    openEditIncomeSidePanel(id) {
        this.incomeId = id;
        this.goToEditIncome = true;
    }

    closeEditIncomeSidePanel() {
        this.goToEditIncome = false;
    }

    changeScenario(value) {
        this.selectedScenario = value.id;
        this.longTermData();
    }

}
