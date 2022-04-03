import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import swal from 'sweetalert2';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import { SCENARIOS } from '../../../../shared/constants';
import { EntitiesService } from '../../../service';
import { slideInOutAnimation } from '../../../../shared/animations';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { PageTitleService } from '../../../../shared/page-title';

@Component({
    selector: 'app-edit-long-term-income',
    templateUrl: './edit-long-term-income.component.html',
    styleUrls: ['./edit-long-term-income.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class EditLongTermIncomeComponent implements OnInit, OnDestroy {

    @Output() closePanelEvent = new EventEmitter();
    @Input() allIncomeData = [];
    @Input() incomeId;
    @Input() entityType;
    closeButtonDisable;
    saveDisable = false;
    clientId;
    entityId;
    incomeData = {};
    selectedIncomeId = 0;
    unsubscribe$ = new Subject<void>();
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    clientData = {};
    scenario = SCENARIOS.CURRENT_SCENARIO;
    i18text = {};
    inserting = false;
  currencyPrefix = '$';
  currencyMask = createNumberMask({
    prefix: this.currencyPrefix
  });
  revenueTypes = [
    {
      id: 1,
      value: 1,
      ssid: "NET_ACTIVE_BUSINESS_INCOME",
      label: "NET_ACTIVE_BUSINESS_INCOME"},{
    id:2,
      value: 2,
      ssid: "NET_ACTIVE_BUSINESS_INCOME_NO_SBD",
      label: "NET_ACTIVE_BUSINESS_INCOME_NO_SBD"
    },{
    id:3,
      value: 3,
      ssid: "INTER_CORPORATE_DIVIDEND",
      label: "INTER_CORPORATE_DIVIDEND"},{
    id:4,
      value: 4,
     ssid: "NET_OTHER_PASSIVE_INCOME",
      label: "NET_OTHER_PASSIVE_INCOME"},{
    id:5,
      value: 5,
      ssid: "OTHER_CAPITAL_GAIN",
      label: "OTHER_CAPITAL_GAIN"
    }
  ];

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private entityService: EntitiesService,
        private translate: TranslateService,
        private dataSharing: RefreshDataService,
        private decimalPipe: DecimalPipe,
        private pageTitleService: PageTitleService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
        });
    }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_ENTITIES_EDIT_LONG_TERM_INCOME');
        this.translate.stream([
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ENTITY.POPUP.INCOME_UPDATED_SUCCESSFULLY'
        ]).subscribe(res => {
            this.i18text = res;
        });

        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.clientData['inflation'] = this.decimalPipe.transform(this.clientData['inflation'], '1.2-2');
        });

        if(this.entityType == 1){
          this.revenueTypes = [
            {
              id: 6,
              value: 6,
              ssid: "HOLDCO_SAVINGS",
              label: "HOLDCO_SAVINGS"
            }
            ];
        }else {
          this.revenueTypes = [
            {
              id: 1,
              value: 1,
              ssid: "NET_ACTIVE_BUSINESS_INCOME",
              label: "NET_ACTIVE_BUSINESS_INCOME"
            }, {
              id: 2,
              value: 2,
              ssid: "NET_ACTIVE_BUSINESS_INCOME_NO_SBD",
              label: "NET_ACTIVE_BUSINESS_INCOME_NO_SBD"
            }, {
              id: 3,
              value: 3,
              ssid: "INTER_CORPORATE_DIVIDEND",
              label: "INTER_CORPORATE_DIVIDEND"
            }, {
              id: 4,
              value: 4,
              ssid: "NET_OTHER_PASSIVE_INCOME",
              label: "NET_OTHER_PASSIVE_INCOME"
            }, {
              id: 5,
              value: 5,
              ssid: "OTHER_CAPITAL_GAIN",
              label: "OTHER_CAPITAL_GAIN"
            }
          ];
        }

        this.inserting = !this.incomeId;

          this.allIncomeData.forEach(incomeObj => {
            incomeObj['label'] = incomeObj['ssid'] ? incomeObj['ssid'] : incomeObj['description'];
            incomeObj['value'] = incomeObj['id'];
            if(!this.inserting) {
              if (incomeObj['id'] === this.incomeId) {
                this.selectedIncomeId = incomeObj['revenueType'];
                this.incomeData = Object.assign({}, incomeObj);
                this.incomeData['defaultToStart'] = !this.incomeData['defaultToStart'];
                this.incomeData['defaultFromStart'] = !this.incomeData['defaultFromStart'];
              }
            }else{

                this.incomeData = {};
                this.incomeData['defaultRecord'] = false;
                this.incomeData['indexToStart'] = this.clientData['inflation'];
                this.incomeData['indexFromStart'] = this.clientData['inflation'];

            }
          });

    }

    updateIncome() {
        this.saveDisable = true;
        this.incomeData['defaultToStart'] = this.incomeData['defaultToStart'] ? 0 : 1;
        this.incomeData['defaultFromStart'] = this.incomeData['defaultFromStart'] ? 0 : 1;
        this.incomeData['revenueType'] = this.selectedIncomeId;
        if(!this.inserting) {
          this.entityService.editIncome(this.clientId, this.entityId, this.scenario, this.incomeData).toPromise().then(res => {
            swal(this.i18text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18text['ENTITY.POPUP.INCOME_UPDATED_SUCCESSFULLY'], 'success');
            this.back();
            this.dataSharing.changeMessage('refreshEntityLongTermData');
            this.saveDisable = false;
          }).catch(err => {
            swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            this.saveDisable = false;
          });
        }else{
          this.entityService.addIncome(this.clientId, this.entityId, this.scenario, this.incomeData).toPromise().then(res => {
            swal(this.i18text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18text['ENTITY.POPUP.INCOME_UPDATED_SUCCESSFULLY'], 'success');
            this.back();
            this.dataSharing.changeMessage('refreshEntityLongTermData');
            this.saveDisable = false;
          }).catch(err => {
            swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            this.saveDisable = false;
          });
        }
    }

    onToggleCheckbox(indexType) {
        if (indexType === 0) {
            this.incomeData['indexToStart'] = this.incomeData['defaultToStart'] ? this.incomeData['indexToStart'] : this.clientData['inflation'];
        } else if (indexType === 1) {
            this.incomeData['indexFromStart'] = this.incomeData['defaultFromStart'] ? this.incomeData['indexFromStart'] : this.clientData['inflation'];
        }
    }



    back() {
        this.closePanelEvent.emit();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
