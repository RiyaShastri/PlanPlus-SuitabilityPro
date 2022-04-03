import * as $ from 'jquery';
import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { getCurrencySymbol, DecimalPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import {
    AppState,
    getClientPayload,
    getGraphColours
} from '../../../../../shared/app.reducer';
import { PortfolioService, DocumentService } from '../../../../service';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { ASSET_CLASS_COLOURS, SOLUTION_TYPES, IMPLEMENTATION_ACCOUNTS_ACTIONS } from '../../../../../shared/constants';
import { TranslateService } from '@ngx-translate/core';
import { SettingService } from '../../../../../setting/service';
import { ASSET_TYPE } from '../../../../../shared/constants';

@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.css']
})
export class ManageProductsComponent implements OnInit, OnDestroy {
    @Input() clientId;
    @Input() portfolioId;
    ASSETS_BALANCED = ASSET_TYPE.BALANCED;
    value = 5000;
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 1
    });
    currencyMask = createNumberMask({
        prefix: '$',
        allowDecimal: true
    });
    clientData = {};
    private unsubscribe$ = new Subject<void>();
    selectedAccountsList = null;
    totalCurrent = 0;
    totalImplementation = 0;
    totalUnallocated = 0;
    graphColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];
    assetClassColours = ASSET_CLASS_COLOURS;
    allocationsData = [];
    i18Text = {};
    accountsList = [];
    accountsListBackup = [];
    selectedCurrency = 'CAD';
    productDescription = '';
    $calculate: Subject<void> = new Subject<void>();
    solutionTypes = SOLUTION_TYPES;
    actionPerformed = IMPLEMENTATION_ACCOUNTS_ACTIONS;

    constructor(
        private store: Store<AppState>,
        private settingService: SettingService,
        private dataSharing: RefreshDataService,
        private portfolioService: PortfolioService,
        private modalService: NgbModal,
        private documentService: DocumentService,
        private translateService: TranslateService,
        private dp: DecimalPipe
    ) {
        this.$calculate.debounceTime(2000).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.updateTotals();
        });
    }

    ngOnInit() {
        this.translateService.stream([
            'PORTFOLIO.IMPLEMENTATION.PRODUCT_INFO_DOCUMENT_AVAILABLE',
            'GENERATE_REPORT.POPUP.REPORT_DOWNLOAD_QUESTION',
            'CUSTOM.DOWNLOAD',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
            'ALERT_MESSAGE.OOPS_TEXT',
            'PORTFOLIO.IMPLEMENTATION.POPUP.DELETE_UNUSED_PRODUCTS_WARNING',
            'PORTFOLIO.IMPLEMENTATION.POPUP.REMOVE_PRODUCT_WARNING',
            'PORTFOLIOS.DELETE_POPUP.TEXT',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'PORTFOLIO.IMPLEMENTATION.POPUP.DELETED_UNUSED_PRODUCTS_SUCCESSFULLY'
        ]).subscribe(text => {
            this.i18Text = text;
        });

        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(graphColours => {
            if (graphColours && graphColours.hasOwnProperty('allGraphColours') && graphColours['allGraphColours'].length > 0) {
                this.graphColors = graphColours['allGraphColours'];
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow'),
                allowDecimal: true
            });
        });

        this.portfolioService.selectedAccountsData.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.accountsList = data['accounts'];
                this.accountsListBackup = JSON.parse(JSON.stringify(data['accounts']));
                this.selectedCurrency = data['currency'];
                this.selectedAccountsList = this.accountsList.filter(account => account.checked === true);
                this.totalCurrent = 0;
                this.totalImplementation = 0;
                this.totalUnallocated = 0;
                this.accountsList.forEach(account => {
                    if (account.checked === true) {
                        this.totalCurrent += account.totalCurrentAmount;
                        this.totalImplementation += account.totalImplementedAmount;
                        this.totalUnallocated += account.unallocatedAmount;
                    }
                });
                this.portfolioService.shareUpdatedProducts(
                    {
                        accountsData: this.accountsList,
                        totalImplementation: this.totalImplementation,
                        totalCurrent: this.totalCurrent,
                        selectedCurrency: this.selectedCurrency
                    });
            }
        });

        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('products_selected_to_add|')) {
                const obj = JSON.parse(message.replace('products_selected_to_add|', ''));
                const selectedProducts = [];
                obj['selectedProducts'].forEach((product, index) => {
                    let prodId = '';
                    let prodSub = '';
                    let productCode = '';
                    let assetClassName = '';
                    if (product.subProducts.length > 1) {
                        prodId = product.productId;
                        prodSub = product.selectedProductCode.subProductId;
                        productCode = product.selectedProductCode.productCode;
                        assetClassName = product.selectedProductCode.assetClassName;
                    } else {
                        prodId = product.productId;
                        prodSub = product.subProducts[0].subProductId;
                        productCode = product.subProducts[0].productCode;
                        assetClassName = product.subProducts[0].assetClassName;
                    }
                    const productDetails = {
                        description: product.productDescription,
                        productCode: productCode,
                        productNumber: prodId,
                        subProductNumber: prodSub,
                        units: 0,
                        fmv: 0,
                        fmvPercentage: 0,
                        purchaseAmount: 0,
                        implemenetedPercentage: 0,
                        currencyCode: product.currency,
                        linkedAccountKey: obj['accountId'],
                        commisBe: 1,
                        primaryAssetClassSsid: assetClassName,
                    };
                    this.portfolioService.getProductAllocations(prodId).toPromise().then(res => {
                        productDetails['assetsBreakdown'] = [];
                        if (res) {
                            res.forEach(asset => {
                                const assetDetails = {
                                    allocationBreakdown: '',
                                    allocationBreakdownId: asset['assetClass'],
                                    allocationPercent: asset['percentage'],
                                    displayOrder: asset['displayOrder'],
                                    ssid: asset['ssid']
                                };
                                productDetails['assetsBreakdown'].push(assetDetails);
                            });
                        }
                        selectedProducts.push(productDetails);
                        if (index === obj['selectedProducts'].length - 1) {
                            for (const account of this.accountsList) {
                                if (account.plannum === obj['accountId']) {
                                    account.assets = account.assets.concat(selectedProducts);
                                    account.actionPerformed = this.actionPerformed['CUSTOM_SOLUTION'];
                                    account.customSolutionApplied = true;
                                }
                            }
                            this.portfolioService.shareUpdatedProducts(
                                {
                                    accountsData: this.accountsList,
                                    totalImplementation: this.totalImplementation,
                                    totalCurrent: this.totalCurrent,
                                    selectedCurrency: this.selectedCurrency
                                });
                        }
                    });
                });

            }
        });
    }

    calculate(event, accIndex, prodIndex, type) {
        const keyCode = event.keyCode;
        const numberKeyCodes = [8, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 190];
        if (numberKeyCodes.includes(keyCode) || (keyCode >= 48 && keyCode <= 57)) {
            if (type === 1) {
                this.accountsList[accIndex].assets[prodIndex].implemenetedPercentage =
                    (this.accountsList[accIndex].assets[prodIndex].purchaseAmount / this.accountsList[accIndex].totalCurrentAmount) * 100;
            } else {
                this.accountsList[accIndex].assets[prodIndex].purchaseAmount =
                    (this.accountsList[accIndex].assets[prodIndex].implemenetedPercentage * this.accountsList[accIndex].totalCurrentAmount) / 100;
            }
            this.accountsList[accIndex].totalImplementedAmount = this.accountsList[accIndex].assets.reduce((sum, product) => sum + product.purchaseAmount, 0);
            this.$calculate.next();
        }
    }

    updateTotals() {
        this.totalImplementation = 0;

        this.accountsList.forEach((account, accIndex) => {
            let accountImplementChange = false;
            if (account.checked) {
                this.totalImplementation += account.totalImplementedAmount;
                this.accountsList[accIndex].assets.forEach((product, pIndex) => {
                    if (this.accountsListBackup[accIndex].assets[pIndex] &&
                        (product.purchaseAmount !== this.accountsListBackup[accIndex].assets[pIndex].purchaseAmount ||
                            product.implemenetedPercentage !== this.accountsListBackup[accIndex].assets[pIndex].implemenetedPercentage)) {
                        accountImplementChange = true;
                    }
                });
                if (accountImplementChange) {
                    this.accountsList[accIndex].customSolutionApplied = true;
                    this.accountsList[accIndex].actionPerformed = this.actionPerformed['CUSTOM_SOLUTION'];
                } else {
                    this.accountsList[accIndex].customSolutionApplied = this.accountsListBackup[accIndex].customSolutionApplied;
                    this.accountsList[accIndex].actionPerformed = this.accountsListBackup[accIndex].actionPerformed['CUSTOM_SOLUTION'];
                }
            }
        });
        this.portfolioService.shareUpdatedProducts(
            {
                accountsData: this.accountsList,
                totalImplementation: this.totalImplementation,
                totalCurrent: this.totalCurrent,
                selectedCurrency: this.selectedCurrency
            });
    }

    public changeProductAction(index: number, jIndex: number) {
        if ($('#dropdownProductAction_' + index + '_' + jIndex).is(':visible')) {
            $('.dropdown-product-action').hide();
        } else {
            $('.dropdown-product-action').hide();
            $('#dropdownProductAction_' + index + '_' + jIndex).toggle();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    open(content, allocationsData, productDescription) {
        this.allocationsData = allocationsData;
        this.productDescription = productDescription;
        this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
    }

    getProductInfo(productId) {
        let filename = null;
        let file = null;
        this.settingService.getSolutionsProductInfo(productId).toPromise().then(res => {
            file = res['body'];
            const headers = res.headers.get('content-disposition');
            filename = headers.split('=')[1];
            Swal({
                title: this.i18Text['PORTFOLIO.IMPLEMENTATION.PRODUCT_INFO_DOCUMENT_AVAILABLE'],
                text: this.i18Text['GENERATE_REPORT.POPUP.REPORT_DOWNLOAD_QUESTION'],
                type: 'success',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: this.i18Text['CUSTOM.DOWNLOAD'],
                cancelButtonText: this.i18Text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.documentService.downloadFile(file, filename);
                }
            });
        }).catch(err => {
            if (JSON.parse(err).errorSsid) {
                Swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], this.i18Text['SSID_LABELS.ERROR_MESSAGE.' + JSON.parse(err).errorSsid], 'error');
            } else {
                Swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(err).errorMessage, 'error');
            }
        });
    }

    removeProduct(accIndex, prodIndex) {
        Swal({
            title: this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.REMOVE_PRODUCT_WARNING'],
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then(result => {
            if (result.value) {
                this.accountsList[accIndex].assets.splice(prodIndex, 1);
                if (this.accountsList[accIndex].assets.length !== this.accountsListBackup[accIndex].assets.length) {
                    this.accountsList[accIndex].customSolutionApplied = true;
                    this.accountsList[accIndex].actionPerformed = this.actionPerformed['CUSTOM_SOLUTION'];
                } else {
                    this.accountsList[accIndex].assets.forEach(product => {
                        if (!this.accountsListBackup[accIndex].assets.includes(product.productNumber)) {
                            this.accountsList[accIndex].customSolutionApplied = true;
                            this.accountsList[accIndex].actionPerformed = this.actionPerformed['CUSTOM_SOLUTION'];
                        }
                    });
                }
                this.portfolioService.shareUpdatedProducts(
                    {
                        accountsData: this.accountsList,
                        totalImplementation: this.totalImplementation,
                        totalCurrent: this.totalCurrent,
                        selectedCurrency: this.selectedCurrency
                    });
            }
        });
    }

    deleteUnusedProducts() {
        const payload = [];
        this.accountsList.forEach(account => {
            if (account.checked === true) {
                payload.push(account.plannum);
            }
        });
        Swal({
            title: this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.DELETE_UNUSED_PRODUCTS_WARNING'],
            text: this.i18Text['PORTFOLIOS.DELETE_POPUP.TEXT'],
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then(result => {
            if (result.value) {
                this.portfolioService.removeUnusedProducts(this.clientId, this.portfolioId, payload).toPromise().then(res => {
                    this.dataSharing.changeMessage('refresh_implementation_accounts');
                    Swal(this.i18Text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.DELETED_UNUSED_PRODUCTS_SUCCESSFULLY'], 'success');
                }).catch(errorResponse => {
                    Swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                });
            }
        });
    }

    roundOff(value) {
        return parseFloat(this.dp.transform(value, '1.0-2'));
    }
}
