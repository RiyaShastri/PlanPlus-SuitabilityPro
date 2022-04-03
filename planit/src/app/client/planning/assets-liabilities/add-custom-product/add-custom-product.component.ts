import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../shared/animations';
import { Location, getCurrencySymbol } from '@angular/common';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { SettingService } from '../../../../setting/service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { AppState, getAdvisorPayload } from '../../../../shared/app.reducer';

@Component({
    selector: 'app-add-custom-product',
    templateUrl: './add-custom-product.component.html',
    styleUrls: ['./add-custom-product.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddCustomProductComponent implements OnInit, OnDestroy {
    saveButtonDisable = false;
    closeDisable = false;
    solutionFamily;
    customProduct = {};
    productType = [];
    currencyMask = createNumberMask({
        prefix: '$'
    });
    unsubscribe$ = new Subject<void>();
    assetsBreakdown = [];
    totalBreakDown = 0;
    percentMask1 = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    isFromAddSolution = false;
    i18Text = {};
    solutionId;
    constructor(
        private location: Location,
        private settingService: SettingService,
        private route: ActivatedRoute,
        private router: Router,
        private translation: TranslateService,
        private store: Store<AppState>
    ) {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params['solutionFamilyId']) {
                this.solutionFamily = params['solutionFamilyId'];
            }
            if (params['solutionId']) {
                this.solutionId = params['solutionId'];
            }
        });
        if (this.router.url.includes('/add-solution/')) {
            this.isFromAddSolution = true;
        }
        if (!this.isFromAddSolution) {
            this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.solutionFamily = params['solutionFamily'];
            });
        }
    }

    ngOnInit() {
        this.translation.stream([
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ASSET_LIABILITY.PRODUCT_SEARCH.CUSTOM_SUCCESS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            this.i18Text = result;
        });
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.currencyMask = createNumberMask({
                    prefix: getCurrencySymbol(res['currencyCode'], 'narrow'),
                });
            }
        });
        this.settingService.getProductType().toPromise().then(products => {
            this.productType = products;
        }).catch(err => { });
        this.settingService.getAllocationClassDetails(this.solutionFamily).toPromise().then(result => {
            result.forEach(alloc => {
                this.assetsBreakdown.push({
                    'allocationBreakdown': alloc['description'],
                    'allocationBreakdownId': alloc['assetClass'],
                    'allocationPercent': alloc['percentage'],
                    'displayOrder': alloc['displayOrder'],
                    'ssid': alloc['ssid']
                });
            });
            this.totalAllocation();
        }).catch(err => { });
    }

    addCustomProduct() {
        const obj = {
            'assetsBreakdown': this.assetsBreakdown,
            'productType': this.customProduct['prod_type']['id'],
            'productDescription': this.customProduct['productDescription'],
            'solutionFamily': this.solutionFamily
        };
        this.settingService.addCustomProduct(obj).toPromise().then(result => {
            this.settingService.shareCustomProducts(result);
            if (this.isFromAddSolution) {
                this.router.navigate(['/settings', 'preferred-solutions', this.solutionFamily, 'add-solution']);
            } else {
                this.router.navigate(['/settings', 'preferred-solutions', this.solutionId, 'solution-info'], { queryParams: {  solutionFamily: this.solutionFamily }});
            }
            Swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18Text['ASSET_LIABILITY.PRODUCT_SEARCH.CUSTOM_SUCCESS'], 'success');
        }).catch(errorResponse => {
            Swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
        });
    }

    back() {
        this.location.back();
    }

    totalAllocation() {
        this.totalBreakDown = 0;
        this.assetsBreakdown.forEach(item => {
            this.totalBreakDown += item['allocationPercent'];
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
