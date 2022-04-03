import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { INVESTMENT_STRATEGY, SCENARIOS, ENTITY_INCOME_DISTRIBUTION } from '../../../../shared/constants';
import { EntitiesService, PlanningService } from '../../../service';
import { PageTitleService } from '../../../../shared/page-title';

@Component({
    selector: 'app-investment-return-risk',
    templateUrl: './investment-return-risk.component.html',
    styleUrls: ['./investment-return-risk.component.css']
})
export class InvestmentReturnRiskComponent implements OnInit, OnDestroy {

    clientId;
    entityId;
    entitiesList = null;
    unsubscribe$ = new Subject<void>();
    selectedEntity = {};
    percentMaskDecimal = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
    });
    strategies = INVESTMENT_STRATEGY;
    strategiesOptions = [];
    i18Text = {};
    closeButtonDisable = false;
    saveDisabled = false;
    selectedScenario = SCENARIOS.CURRENT_SCENARIO;
    total = 0;
    distributions = ENTITY_INCOME_DISTRIBUTION;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private entityService: EntitiesService,
        private pageTitleService: PageTitleService,
        private planningService: PlanningService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_ENTITIES_INVESTMENT_RISK_RETURN');
        this.translate.stream([
            'CUSTOM.CURRENT',
            'CUSTOM.TARGET',
            'SETTINGS.CUSTOM',
            'SETTINGS.INCOME_DISTRIBUTION.INTEREST',
            'SETTINGS.INCOME_DISTRIBUTION.DIVIDEND',
            'SETTINGS.INCOME_DISTRIBUTION.DEFERRED_CAPITAL_GAINS',
            'SETTINGS.INCOME_DISTRIBUTION.REALIZED_CAPITAL_GAINS',
            'SETTINGS.INCOME_DISTRIBUTION.NON_TAXABLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ENTITY.POPUP.INVESTMENT_RETURN_RISK_SUCCESSFULLY_UPDATED'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            this.i18Text = i18MenuTexts;
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
            this.entityService.getInvestmentStrategies(this.clientId).toPromise().then(strategies => {
                this.strategiesOptions = strategies;
                this.getEntityData();
            }).catch(err => { });
        });
    }

    getEntityData(investmentStrategy = '') {
        this.entityService.getInvestmentReturnRiskData(this.clientId, this.entityId, this.selectedScenario, investmentStrategy).toPromise().then(res => {
            this.setEntityData(res);
        }).catch(entityError => {
            if (entityError.status === 403 || entityError.status === 404) {
                this.router.navigate(['/client/' + this.clientId + '/planning/entities/list']);
            }
            this.entitiesList = [];
            this.selectedEntity = {};
        });
    }

    setEntityData(res) {
        res['investmentStrategy'] = this.strategiesOptions.find(s => s.portnum === res['investmentStrategy']);
        this.selectedEntity = res;
        this.calculateTotal();
        this.entitiesList = [];
        this.entitiesList.push(res);
        if (res['investmentStrategy'].portnum === INVESTMENT_STRATEGY.CUSTOM) {
            this.selectedEntity['custom'] = true;
        }
    }

    changeEntity(entityId) {
        this.entityId = entityId;
        this.router.navigate(['/client/' + this.clientId + '/planning/entities/' + this.entityId + '/investment-return-risk']);
    }

    changeScenario(value) {
        this.selectedScenario = value.id;
        this.getEntityData(this.selectedEntity['investmentStrategy'].portnum);
    }

    onChangeOfStrategy() {
        if (this.selectedEntity['investmentStrategy'].portnum === INVESTMENT_STRATEGY.CUSTOM) {
            this.selectedEntity['custom'] = true;
        }
        this.getEntityData(this.selectedEntity['investmentStrategy'].portnum);
    }

    getCustomSelectedData() {
        if (!this.selectedEntity['custom']) {
            // tslint:disable-next-line:max-line-length
            this.entityService.getInvestmentReturnRiskData(this.clientId, this.entityId, this.selectedScenario, this.selectedEntity['investmentStrategy'].portnum, this.selectedEntity['custom']).toPromise().then(res => {
                this.setEntityData(res);
            }).catch(err => {
                this.entitiesList = [];
                this.selectedEntity = {};
            });
        }
    }

    saveDetails() {
        this.saveDisabled = true;
        const payload = JSON.parse(JSON.stringify(this.selectedEntity));
        payload['investmentStrategy'] = this.selectedEntity['investmentStrategy']['portnum'];
        this.entityService.updateInvestmentRiskReturn(this.clientId, this.entityId, this.selectedScenario, payload).toPromise().then(res => {
            Swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18Text['ENTITY.POPUP.INVESTMENT_RETURN_RISK_SUCCESSFULLY_UPDATED'], 'success');
            this.planningService.getClientPlanningSummary(this.clientId);
            this.saveDisabled = false;
            this.back();
        }).catch(err => {
            Swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            this.saveDisabled = false;
        });
    }

    calculateTotal() {
        this.total = 0;
        this.distributions.forEach(element => {
            this.total += this.selectedEntity[element.valueKey];
        });
    }

    back() {
        this.router.navigate(['/client/' + this.clientId + '/planning/entities/list']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
