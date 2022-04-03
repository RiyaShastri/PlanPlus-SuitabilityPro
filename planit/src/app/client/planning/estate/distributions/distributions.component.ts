import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { fadeInAnimation } from '../../../../shared/animations';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import { EstateService, ClientProfileService } from '../../../service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.css'],
    animations: [fadeInAnimation],
    // attach the fade in animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@fadeInAnimation]': '' }
})
export class DistributionsComponent implements OnInit, OnDestroy {
    relations = {};
    clientId;
    clientData = {};
    currencyMask = createNumberMask({
        prefix: '$'
    });
    distributionData;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private estateService: EstateService,
        private refreshDataService: RefreshDataService,
        private translate: TranslateService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    async ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow')
            });
        });
        await this.estateService.getRelationsForBeneficiaries().toPromise().then(res => {
            res.forEach(relation => {
                this.relations[relation.id] = relation.ssid;
            });
        });
        this.getDistributions();
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('refresh_estate_distributions')) {
                this.getDistributions();
                this.refreshDataService.changeMessage('default message');
            }
        });
    }

    getDistributions() {
        this.distributionData = null;
        this.estateService.getDistributions(this.clientId).toPromise().then(res => {
            this.distributionData = [];
            let clientDistribution;
            res.forEach(element => {
                if (element.testatorId === this.clientId) {
                    clientDistribution = element;
                } else {
                    this.distributionData.push(element);
                }
            });
            this.distributionData.unshift(clientDistribution);
        });
    }

    toggleActionMenu(id, index1, index2, beneficiaryId) {
        if ($('#' + id + '_' + index1 + '_' + index2 + '_' + beneficiaryId).is(':visible')) {
            $('.dropdown-distribution-action').hide();
        } else {
            $('.dropdown-distribution-action').hide();
            $('#' + id + '_' + index1 + '_' + index2 + '_' + beneficiaryId).toggle();
        }
    }

    deleteDistribution(beneficiary) {
        this.translate.get([
            'DELETE.POPUP.ESTATE_DISTRIBUTION_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'ESTATE_PLANING.POPUP.BENEFICIARY_DELETED_SUCCESSFULLY',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {

            Swal({
                title: i18MenuTexts['DELETE.POPUP.ESTATE_DISTRIBUTION_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES']
            }).then(result => {
                if (result.value) {
                    this.estateService.deleteDistribution(this.clientId, beneficiary).toPromise().then(response => {
                        this.refreshDataService.changeMessage('refresh_estate_distributions');
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_TITLE'], i18MenuTexts['ESTATE_PLANING.POPUP.BENEFICIARY_DELETED_SUCCESSFULLY'], 'success');
                    }).catch(errorResponse => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
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
