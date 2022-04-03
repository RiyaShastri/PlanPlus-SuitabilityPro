import { Component, OnInit, OnDestroy } from '@angular/core';
import { getCurrencySymbol, Location, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import swal from 'sweetalert2';
import { slideInOutAnimation } from '../../../../shared/animations';
import { AppState, getClientPayload, getGoalPayload } from '../../../../shared/app.reducer';
import { EntitiesService } from '../../../service';
import { SCENARIOS } from '../../../../shared/constants';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { SelectItem } from 'primeng/api';
import { PageTitleService } from '../../../../shared/page-title';

@Component({
    selector: 'app-distribution-side-panel',
    templateUrl: './distribution-side-panel.component.html',
    styleUrls: ['./distribution-side-panel.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class DistributionSidePanelComponent implements OnInit, OnDestroy {

    clientId = '';
    entityId = '';
    shareClassesOpt;
    sourcesOptions: SelectItem[];
    distribution = null;
    currencyPrefix = '$';
    currencyMask = createNumberMask({
        prefix: this.currencyPrefix
    });
    percentDecimalMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    distributionId;
    closeButtonDisabled = false;
    saveButtonDisabled = false;
    clientData;
    goals = [];
    editDistribution = false;
    private unsubscribe$ = new Subject<void>();
    i18text = {};
    scenario = SCENARIOS.CURRENT_SCENARIO;

    constructor(
        private store: Store<AppState>,
        private _location: Location,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private entityService: EntitiesService,
        private dataSharing: RefreshDataService,
        private decimalPipe: DecimalPipe,
        private pageTitleService: PageTitleService
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.clientId = param['clientId'];
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.entityId = param['entityId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params.hasOwnProperty('distributionId') && params['distributionId']) {
                this.distributionId = params['distributionId'];
                this.editDistribution = true;
            }
        });
    }

    ngOnInit() {
        this.translate.stream([
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ENTITY.POPUP.DISTRIBUTION_ADDED_SUCCESSFULLY',
            'ENTITY.POPUP.DISTRIBUTION_UPDATED_SUCCESSFULLY'
        ]).subscribe(res => {
            this.i18text = res;
        });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_ENTITIES_EDIT_LONG_TERM_DISTRIBUTION');
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.clientData['inflation'] = this.decimalPipe.transform(this.clientData['inflation'], '1.2-2');
            if (!this.editDistribution) {
                this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_ENTITIES_ADD_DISTRIBUTION');
                this.distribution = {};
                this.distribution['defaultRecord'] = false;
                this.distribution['indexToStart'] = this.clientData['inflation'];
                this.distribution['indexFromStart'] = this.clientData['inflation'];
            }
            this.currencyPrefix = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currencyPrefix
            });
        });
        this.store.select(getGoalPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.goals = data;
            }
        });
        this.entityService.getSharesList(this.clientId, this.entityId).toPromise().then(res => {
            this.shareClassesOpt = res;
            this.getSourcesOption();
        }).catch(err => {
            this.shareClassesOpt = [];
        });
    }

    getSourcesOption() {
        this.entityService.getSourcesList(this.clientId).toPromise().then(sources => {
            sources.forEach(source => {
                source['label'] = source['ssid'];
                source['value'] = source['id'];
            });
            this.sourcesOptions = sources;
            if (this.editDistribution) {
                this.getDistributionData();
            }
        }).catch(err => {
            this.sourcesOptions = [];
        });
    }

    getDistributionData() {
        this.entityService.getDistributionByDistributionId(this.clientId, this.entityId, this.distributionId).toPromise().then(res => {
            this.distribution = res;
            this.distribution['shareClassId'] = this.shareClassesOpt.find(s => s.shareClassId === this.distribution['shareClassId']);
            this.distribution['shareOwnerGoaltoFundList'].forEach(element => {
                if (element['fundedGoal']) {
                    element['fundedGoal'] = this.goals.find(g => g.key === element['fundedGoal']);
                }
            });
            this.distribution['sourceId'] = this.distribution['source']['id'];
            this.distribution['defaultToStart'] = !this.distribution['defaultToStart'];
            this.distribution['defaultFromStart'] = !this.distribution['defaultFromStart'];
            this.distribution['indexToStart'] = this.distribution['defaultToStart'] ? this.distribution['indexToStart'] : this.clientData['inflation'];
            this.distribution['indexFromStart'] = this.distribution['defaultFromStart'] ? this.distribution['indexFromStart'] : this.clientData['inflation'];
        });
    }

    onToggleCheckbox(checkbox) {
        if (checkbox === 0) {
            this.distribution['indexToStart'] = this.distribution['defaultToStart'] ? this.distribution['indexToStart'] : this.clientData['inflation'];
        } else if (checkbox === 1) {
            this.distribution['indexFromStart'] = this.distribution['defaultFromStart'] ? this.distribution['indexFromStart'] : this.clientData['inflation'];
        }
    }

    onChangeOfShareClass() {
        this.distribution['shareOwnerGoaltoFundList'] = [];
        this.entityService.getShareClassData(this.clientId, this.entityId, this.distribution['shareClassId']['shareClassId']).toPromise().then(res => {
            res.forEach(element => {
                element['fundedGoal'] = this.goals.find(g => g.key === element['fundedGoal']);
            });
            this.distribution['shareOwnerGoaltoFundList'] = res;
        }).catch(err => { });
    }

    back() {
        this._location.back();
    }

    submitForm() {
        this.saveButtonDisabled = true;
        this.distribution['shareOwnerGoaltoFundList'].forEach(element => {
            if (element['fundedGoal']) {
                element['isfunded'] = true;
                element['fundedGoalDescription'] = element['fundedGoal'].description;
                element['fundedGoal'] = element['fundedGoal'].key;
            }
        });
        this.distribution['source'] = this.sourcesOptions.filter(s => s['id'] === this.distribution['sourceId'])[0];
        this.distribution['description'] = this.distribution['shareClassId'].description;
        this.distribution['shareClassId'] = this.distribution['shareClassId'].shareClassId;
        this.distribution['defaultToStart'] = !this.distribution['defaultToStart'];
        this.distribution['defaultFromStart'] = !this.distribution['defaultFromStart'];
        if (!this.editDistribution) {
            this.entityService.addDistribution(this.clientId, this.entityId, this.scenario, this.distribution).toPromise().then(res => {
                this.dataSharing.changeMessage('refreshEntityLongTermData');
                this.saveButtonDisabled = false;
                swal(this.i18text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18text['ENTITY.POPUP.DISTRIBUTION_ADDED_SUCCESSFULLY'], 'success');
            }).catch(err => {
                this.saveButtonDisabled = false;
                swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        } else {
            this.entityService.editDistribution(this.clientId, this.entityId, this.scenario, this.distribution).toPromise().then(res => {
                this.dataSharing.changeMessage('refreshEntityLongTermData');
                this.saveButtonDisabled = false;
                swal(this.i18text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18text['ENTITY.POPUP.DISTRIBUTION_UPDATED_SUCCESSFULLY'], 'success');
            }).catch(err => {
                this.saveButtonDisabled = false;
                swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        }
        this.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
