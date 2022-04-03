import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { slideInOutAnimation } from '../../../../shared/animations';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { EstateService } from '../../../service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-residual-distribution',
    templateUrl: './residual-distribution.component.html',
    styleUrls: ['./residual-distribution.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class ResidualDistributionComponent implements OnInit {
    familyMembers = [];
    relations = [];
    percentDecimalMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 1
    });
    clientId;
    testatorId;
    residualDistribution = [];
    showError = false;
    saveButtonDisabled = false;
    closeButtonDisabled = false;
    unsubscribeRefreshDataService;
    backFromNamedBeneficiary = false;
    dataFromNamedBeneficiary = [];
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private estateService: EstateService,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService,
        private router: Router
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.testatorId = params['testatorId'];
        });

        this.unsubscribeRefreshDataService = this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('back_from_Named_Beneficiary|')) {
                this.backFromNamedBeneficiary = true;
                this.dataFromNamedBeneficiary = JSON.parse(message.replace('back_from_Named_Beneficiary|', ''));
            }
        });
    }

    ngOnInit() {
        this.estateService.getDistributions(this.clientId).toPromise().then(res => {
            res.forEach(testator => {
                if (testator.testatorId === this.testatorId) {
                    testator.distributionBeneficiaryDetails.forEach(beneficiary => {
                        if (beneficiary.residualBeneficiary === true) {
                            if (this.backFromNamedBeneficiary) {
                                const index = this.dataFromNamedBeneficiary.findIndex(bene => bene.beneficiaryId === beneficiary.beneficiaryId);
                                if (index >= 0) {
                                    beneficiary['value'] = this.dataFromNamedBeneficiary[index]['value'];
                                }
                            }
                            this.residualDistribution.push(beneficiary);
                        }
                    });
                }
            });
        });
        this.refreshDataService.changeMessage('default messsage');
    }

    changeDistributionPercent() {
        let total = 0;
        let estateIndex = 0;
        this.showError = false;
        this.residualDistribution.forEach((beneficiary, index) => {
            if (beneficiary.beneficiaryId !== null) {
                total += parseInt(beneficiary['value'], 10);
            } else {
                estateIndex = index;
            }
        });
        if (total > 100) {
            this.showError = true;
        } else {
            this.residualDistribution[estateIndex]['value'] = 100 - total;
        }
    }

    async submitForm() {
        this.saveButtonDisabled = true;
        await this.estateService.updateResidualDistribution(this.clientId, this.residualDistribution).toPromise().then(res => {
            this.translate.get([
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ESTATE_PLANING.POPUP.DISTRIBUTION_SUCCESSFULLY_ADDED',
                'ESTATE_PLANING.POPUP.DISTRIBUTION_SUCCESSFULLY_UPDATED'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['ESTATE_PLANING.POPUP.DISTRIBUTION_SUCCESSFULLY_UPDATED'], 'success');
            });
            this.refreshDataService.changeMessage('refresh_estate_distributions');
        }).catch(err => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
        this.saveButtonDisabled = true;
        this.back();

    }

    back() {
        this.router.navigate(['/client', this.clientId, 'planning', 'estate', 'distributions']);
        this.closeButtonDisabled = false;
    }

    openAddBeneficiary() {
        const parseData = Object.assign([], this.residualDistribution);
        this.refreshDataService.changeMessage('add_Named_Beneficiary_residual|' + JSON.stringify(parseData));
        this.router.navigate(['/client', this.clientId, 'planning', 'estate', 'distributions', 'add-named-beneficiary'], { queryParams: { testatorId: this.testatorId } });
    }

}
