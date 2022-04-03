import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getCurrencySymbol, Location } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { Subject } from 'rxjs/Subject';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import { EntitiesService, PlanningService } from '../../../service';
import { SCENARIOS } from '../../../../shared/constants';
import { ENTITY_SSID, ENTITIES_CURRENT_YEAR_INCOME_TYPE } from '../../../../shared/constants';
import { SelectItem } from 'primeng/api';
import { PageTitleService } from '../../../../shared/page-title';

@Component({
    selector: 'app-current-year-income-distributions',
    templateUrl: './current-year-income-distributions.component.html',
    styleUrls: ['./current-year-income-distributions.component.css']
})
export class CurrentYearIncomeDistributionsComponent implements OnInit, OnDestroy {
    clientId;
    entityId;
    entitiesList = [];
    unsubscribe$ = new Subject<void>();
    clientData = {};
    currencyMask = createNumberMask({
        prefix: '$'
    });
    orderList: SelectItem[];
    closeButtonDisable = false;
    ownerList = [];
    selectedScenario = SCENARIOS.CURRENT_SCENARIO;
    currentYearIncomeData = [];
    currentYearDistributions = [];
    retainedEarnings;
    i18text = {};
    saveButtonDisabled = false;
    retainedEarningsPayload = [];
    SSID = ENTITY_SSID;
    $calculate: Subject<void> = new Subject<void>();
    calculatiDataPayload = {};
    INCOME_TYPE = ENTITIES_CURRENT_YEAR_INCOME_TYPE;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private location: Location,
        private entityService: EntitiesService,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private planningService: PlanningService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
        });
        // tslint:disable-next-line: max-line-length
        this.$calculate.debounceTime(1000).switchMap(() => this.entityService.calulateCurrentData(this.clientId, this.entityId, this.selectedScenario, this.calculatiDataPayload)).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.closeButtonDisable = false;
                this.setEntityCurrentData(res);
            }
        });
    }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_ENTITIES_CURRENT_YEAR_INCOME_DISTRIBUTIONS');
        this.translate.stream([
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ENTITY.POPUP.ENTITY_CURRENT_YEAR_DATA_UPDATED_SUCCESSFULLY',
            'ALERT_MESSAGE.WISH_TO_PROCEED_QUESTION',
            'ALERT_MESSAGE.LOST_CHANGES_MESSAGE',
            'ALERT_MESSAGE.WARNING_MESSAGE',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).subscribe(res => {
            this.i18text = res;
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        this.entityService.getSourcesList(this.clientId).toPromise().then(res => {
            this.orderList = [];
            res.forEach(element => {
                if (element.id !== 3) {
                    element['label'] = element['ssid'];
                    element['value'] = element['id'];
                    this.orderList.push(element);
                }
            });
        }).catch(err => {
            this.orderList = [];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
            this.getCurrentData();
        });
        this.entityService.getSourcesList(this.clientId).toPromise().then(res => {
            this.orderList = [];
            res.forEach(element => {
                if (element.id !== 3) {
                    element['label'] = element['ssid'];
                    element['value'] = element['id'];
                    this.orderList.push(element);
                }
            });
        }).catch(err => {
            this.orderList = [];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
            this.getCurrentData();
        });
    }

    getCurrentData() {
        this.currentYearIncomeData = [];
        this.currentYearDistributions = [];
        this.entityService.getEntityCurrentData(this.clientId, this.entityId, this.selectedScenario).toPromise().then(res => {
            this.setEntityCurrentData(res);
        }).catch(entityError => {
            if (entityError.status === 403 || entityError.status === 404) {
                this.router.navigate(['/client/' + this.clientId + '/planning/entities/list']);
            }
        });
    }

    setEntityCurrentData(res) {
        this.entitiesList = [];
        this.entitiesList.push(res['entityPlanningDetails']);
        this.currentYearIncomeData = res['currentYearIncomePayloads'];
        this.currentYearDistributions = res['currentYearDistributionPayloads'];
        this.retainedEarnings = res['retainedEarnings'];
    }

    changeEntity(entityId) {
        this.entityId = entityId;
        this.router.navigate(['/client/' + this.clientId + '/planning/entities/' + this.entityId + '/current-year-income-distributions']);
    }

    checkActiveBusinessIncome(type, index) {
        if (type === this.INCOME_TYPE.FEDERAL) {
            if (this.currentYearIncomeData[index]['ssid'] === this.SSID.NET_ACTIVE_BUSINESS_INCOME) {
                this.currentYearIncomeData[index]['provincial'] = this.currentYearIncomeData[index]['federal'];
            }
        } else {
            if (this.currentYearIncomeData[index]['ssid'] === this.SSID.NET_ACTIVE_BUSINESS_INCOME) {
                this.currentYearIncomeData[index]['federal'] = this.currentYearIncomeData[index]['provincial'];
            }
        }
    }

    updateIncomeDistribution() {
        const payload = {
            currentYearDistributionPayloads: this.currentYearDistributions,
            currentYearIncomePayloads: this.currentYearIncomeData,
            entityPlanningDetails: this.entitiesList[0],
            retainedEarnings: this.retainedEarnings
        };
        this.entityService.updateEntityCurrentData(this.clientId, this.entityId, this.selectedScenario, payload).toPromise().then(res => {
            this.getCurrentData();
            this.planningService.getClientPlanningSummary(this.clientId);
            this.saveButtonDisabled = false;
            swal(this.i18text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18text['ENTITY.POPUP.ENTITY_CURRENT_YEAR_DATA_UPDATED_SUCCESSFULLY'], 'success');
        }).catch(err => {
            this.saveButtonDisabled = false;
            swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
        });
    }

    calculateCurrentData() {
        const payload = {
            scenario: this.selectedScenario,
            currentYearDistributionPayloads: this.currentYearDistributions,
            currentYearIncomePayloads: this.currentYearIncomeData,
            entityPlanningDetails: this.entitiesList[0],
            retainedEarnings: this.retainedEarnings
        };
        this.calculatiDataPayload = payload;
        this.$calculate.next();
    }

    back() {
        swal({
            title: this.i18text['ALERT_MESSAGE.LOST_CHANGES_MESSAGE'],
            text: this.i18text['ALERT_MESSAGE.WISH_TO_PROCEED_QUESTION'],
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.i18text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
            cancelButtonText: this.i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
        }).then(result => {
            if (result.value) {
                this.getCurrentData();
                this.location.back();
                this.closeButtonDisable = false;
            }
        });
    }

    changeScenario(value) {
        this.selectedScenario = value.id;
        this.getCurrentData();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
