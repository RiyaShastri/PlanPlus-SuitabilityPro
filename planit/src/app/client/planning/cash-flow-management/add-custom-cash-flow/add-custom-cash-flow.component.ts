import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { PlanningService } from '../../../service';
import { slideInOutAnimation } from '../../../../shared/animations';
import { Store } from '@ngrx/store';
import { AppState, getFamilyMemberPayload, getClientPayload } from '../../../../shared/app.reducer';
import { RefreshDataService } from '../../../../shared/refresh-data';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { getCurrencySymbol } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { PERSON_RELATION } from '../../../../shared/constants';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-add-custom-cash-flow',
    templateUrl: './add-custom-cash-flow.component.html',
    styleUrls: ['./add-custom-cash-flow.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddCustomCashFlowComponent implements OnInit, OnDestroy {
    @Output() closePanelEvent = new EventEmitter();
    @Input() currencyPrefix = '$';
    @Input() clientId = '';
    @Input() categories = [];
    obj = {
        clinum: this.clientId,
        desc: '',
        category: '',
        joint: false,
        hasTaxImpact: false,
        clientAmount: 0,
        spouseAmount: 0,
    };
    currencyMask = createNumberMask({
        prefix: this.currencyPrefix
    });
    client1;
    client2;
    clientData;
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private planningService: PlanningService,
        private translate: TranslateService,
        private store: Store<AppState>,
        private dataSharing: RefreshDataService
    ) { }

    ngOnInit() {
        this.obj['clinum'] = this.clientId;
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                this.client1 = data['familyMembers'].filter(x => x.relation === PERSON_RELATION.CLIENT1)[0];
                this.client2 = data['familyMembers'].filter(x => x.relation === PERSON_RELATION.CLIENT2)[0];
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData && clientData.hasOwnProperty('currencyCode')) {
                this.clientData = clientData;
                this.currencyPrefix = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
                this.currencyMask = createNumberMask({
                    prefix: this.currencyPrefix
                });
            }
        });
    }

    addItem() {
        this.obj.category = this.obj.category['category'];
        this.translate.get([
            'CASH_FLOW_MANAGEMENT.POPUP.SUCCESSFULLY_ADDED',
            'ALERT_MESSAGE.UPDATED',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.planningService.addCashFlowItem(this.obj).toPromise().then(res => {
                Swal(i18text['ALERT_MESSAGE.SUCCESS'], i18text['CASH_FLOW_MANAGEMENT.POPUP.SUCCESSFULLY_ADDED'], 'success');
                this.dataSharing.changeMessage('refresh_cashFlow');
                this.closePanel();
            }).catch(err => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                this.closePanel();
            });
        });
    }

    closePanel() {
        this.closePanelEvent.emit('true');
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
