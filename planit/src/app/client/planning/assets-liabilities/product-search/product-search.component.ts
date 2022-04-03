import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanningService, DocumentService } from '../../../service';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Angulartics2 } from 'angulartics2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { slideInOutAnimation } from '../../../../shared/animations';
import { AppState, getClientPayload, getAdvisorPayload } from '../../../../shared/app.reducer';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { SetFavouriteList } from '../../../../shared/app.actions';
import { PageTitleService } from '../../../../shared/page-title';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { SOLUTION_TYPES } from '../../../../shared/constants';

@Component({
    selector: 'app-product-search',
    templateUrl: './product-search.component.html',
    styleUrls: ['./product-search.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class ProductSearchComponent implements OnInit, OnDestroy {
    changePage: Subject<number> = new Subject();
    clientId;
    accountId;
    loading = false;
    assetId = '';
    isAdvancedSearch = false;
    currency = [{ currencyCode: 'ALL', description: 'ALL' }];
    productType = [];
    country;
    accountDetail;
    favourites = [];
    favouritesModel = [];
    assetClass = [];
    accessRights = {};
    resultsLoading = false;
    favouritesByProduct;
    favouritModel: any = {};
    productId;
    msgs = [];
    // @ViewChild('f') addFavouritForm: FormGroup;
    searchModel: any =
        {
            searchString: '',
            productType: {},
            currency: {},
            country: {},
            favourites: {},
            assetClass: {}
        };
    searchActive: Subject<any> = new Subject<any>();
    productList;
    clientData = {};
    pageSize = { value: 10, id: 10 };
    pageNum = 1;
    totalRecords = 0;
    pageLimits = [{
        value: 10,
        id: 10
    }, {
        value: 25,
        id: 25
    }, {
        value: 50,
        id: 50
    }, {
        value: 100,
        id: 100
    }, {
        value: 200,
        id: 200
    }];
    closeButtonDisable = false;
    multiProductSelection = false;
    selectedProducts = [];
    private unsubscribe$ = new Subject<void>();
    locale = 'en';
    i18Text = {};
    singleProductSelection = false;
    fromPreferredSolution = false;
    fromImplementation = false;
    portfolioId;
    solutionId;
    solutionFamilyId;
    isAddSolution = false;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private planningService: PlanningService,
        private store: Store<AppState>,
        private modalService: NgbModal,
        public translate: TranslateService,
        private accessRightService: AccessRightService,
        private _location: Location,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private documentService: DocumentService,      
        private dataSharing: RefreshDataService,
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PRODUCT_SEARCH');
        this.angulartics2.eventTrack.next({ action: 'productSearch' });
        this.multiProductSelection = this.router.url.includes('/implementation/') ? true : false;

        if (this.router.url.includes('/implementation/')) {
            this.fromImplementation = true;
        }
        if (this.router.url.includes('/add-solution/')) {
            this.isAddSolution = true;
        }
        if (this.router.url.includes('preferred-solutions/')) {
            this.fromPreferredSolution = true;
            this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                // tslint:disable-next-line:triple-equals
                if (params.solutionType && params.solutionType == SOLUTION_TYPES.SINGLE_FUND_SOLUTION) {
                    this.singleProductSelection = true;
                } else {
                    this.multiProductSelection = true;
                }
                if (params.solutionFamily) {
                    this.solutionFamilyId = params.solutionFamily;
                }
            });
        }
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params['solutionFamilyId']) {
                this.solutionId = params['solutionFamilyId'];
            } else {
                this.solutionId = params['solutionId'];
            }
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['FAV01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        if (this.translate.store.currentLang) {
            this.locale = this.translate.store.currentLang;
        }

        this.translate.stream([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'PORTFOLIO.IMPLEMENTATION.POPUP.PRODUCTS_SUCCESSFULLY_ADDED_TO_THE_ACCOUNT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.WARNING_MESSAGE',
            'ASSET_LIABILITY.PRODUCT_SEARCH.DELETED_FROM_FAVOURITE_WARNING',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ASSET_LIABILITY.PRODUCT_SEARCH.DELETED_FROM_FAVOURITE_MESSAGE',
            'ASSET_LIABILITY.PRODUCT_SEARCH.SELECT_PRODUCT_CODE_WARNING',
            'ASSET_LIABILITY.PRODUCT_SEARCH.EXIST_FAVOURITE_MESSAGE',
            'ASSET_LIABILITY.PRODUCT_SEARCH.ADD_FAVOURITE_MESSAGE'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        if (!this.clientId) {
            this.route.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
            });
        }
        if (this.clientId) {
            this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
                this.clientData = clientData;
                if (this.clientData && this.clientData.hasOwnProperty('currencyCode')) {
                    this.getProductSearchUtility(this.clientData['planningCountry']);
                }
            });
        } else {
            this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisorPayload => {
                if (advisorPayload && advisorPayload.hasOwnProperty('country')) {
                    this.getProductSearchUtility(advisorPayload['country']);
                }
            });
        }
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
            this.accountId = params['accountId'];
        });
        if (!this.accountId) {
            this.accountId = this.route.snapshot.params['accountId'];
        }
        this.assetId = this.route.snapshot.params['assetId'];
        if (!this.fromPreferredSolution) {
            this.getAccountSummaryByAccount();
        }
        // this.getProductSearchUtility(this.clientData['planningCountry']);
        this.getFavouriteList();
        // this.store.select(getIsFavouriteListLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe(loaded => {
        //     if (!loaded) {
        //         this.getFavouriteList();
        //     } else {
        //         this.store.select(getFavouriteListPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
        //             if (result) {
        //                 this.favourites = result;
        //                 // this.favourites = [];
        //             }
        //         });
        //     }
        // });
        this.searchActive.asObservable().pipe(takeUntil(this.unsubscribe$)).subscribe(payload => {
            this.doSearch(payload);
        });
    }

    private getAccountSummaryByAccount() {
        this.planningService.getAccountByID(this.accountId)
            .toPromise().then(data => {
                // this.accountDetail = data.find(x => x.id === this.accountId);
                this.accountDetail = data;
            });
    }

    back() {
        this._location.back();
    }

    addCustom() {
        const customProductObj = {
            id: 'CUSTOM',
            value: '',
            fromPage: (this.fromImplementation ? 'implementation' : ''),
            portfolioId: this.portfolioId
        };
        this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities/' + this.accountId + '/holding-account']);
        this.dataSharing.newCustomProduct(JSON.stringify(customProductObj));
    }

    async addCustomByProduct(productDetail) {
        productDetail.assetDetails = {};
        productDetail.assetDetails.liability = {};
        let prodId = '';
        let prodSub = '';
        if (productDetail.subProducts.length > 1) {
            if (!productDetail.selectedProductCode) {
                Swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], this.i18Text['ASSET_LIABILITY.PRODUCT_SEARCH.SELECT_PRODUCT_CODE_WARNING'], 'error');
                return;
            }
            productDetail.assetDetails.productCode = productDetail.selectedProductCode.productCode;
            prodId = productDetail.productId;
            prodSub = productDetail.selectedProductCode.subProductId;
        } else {
            productDetail.assetDetails.productCode = productDetail.subProducts[0].productCode;
            prodId = productDetail.productId;
            prodSub = productDetail.subProducts[0].subProductId;
        }
        productDetail.productDetails = await this.planningService.getSelectedProductInfo(prodId, prodSub).toPromise();
        if (this.assetId) {
            this.planningService.addCustomAsset({ id: 'RELINK', value: this.assetId, productDetail: productDetail });
        } else {
            this.planningService.addCustomAsset({ id: 'RELINK', value: '', productDetail: productDetail });
        }
        this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities/' + this.accountId + '/holding-account']);
    }

    getPageFilterClient(event) {
        this.pageNum = event.currentPage;
        this.getProductSearch();
    }

    getProductSearch() {
        const productSearchParam = {
            searchString: this.searchModel.searchString ? this.searchModel.searchString : '',
            favList: this.searchModel.favourites.id ? this.searchModel.favourites.id : 'None',
            productType: 'ALL',
            assetClass: 'ALL',
            currency: 'ALL',
            country: this.clientData['planningCountry'],
            planningCountry: this.clientData['planningCountry'],
            displayRecords: this.pageSize.value,
            pageNum: this.pageNum
        };

        if (this.isAdvancedSearch) {
            productSearchParam['productType'] = this.searchModel.productType.id ? this.searchModel.productType.id : 'ALL';
            productSearchParam['assetClass'] = this.searchModel.assetClass.assetClass ? this.searchModel.assetClass.assetClass : 'ALL';
            productSearchParam['currency'] = this.searchModel.currency.currencyCode ? this.searchModel.currency.currencyCode : 'ALL';
            productSearchParam['country'] = this.searchModel.country.countryCode ? this.searchModel.country.countryCode : 'CAN';
        }

        this.searchActive.next(productSearchParam);
    }

    private doSearch(productSearchParam) {
        this.planningService.getProductSearch(productSearchParam).toPromise().then(result => {
            // this.productList = result;
            this.productList = result['products'];
            this.totalRecords = result['totalRecords'];
            this.resultsLoading = false;
        });
    }

    // for get all drop down list data
    getProductSearchUtility(planningCountry) {
        this.planningService.getProductSearchUtility(planningCountry).toPromise().then(result => {
            this.productType.push({
                description: 'ALL',
                id: 'ALL'
            });
            this.productType = this.productType.concat(result[0]);
            this.currency = [];
            this.currency.push({ currencyCode: 'ALL', description: 'ALL' });
            const tempList: [any] = result[1];
            tempList.sort((a, b) => {
                return ('' + a.description).localeCompare(b.description);
            });
            this.currency = this.currency.concat(tempList);

            this.country = result[2];
            this.assetClass = result[3];
            this.searchModel.productType = this.productType[0];
            this.searchModel.currency = this.currency[0];
            if (!this.searchModel.country.countryCode) {
                this.searchModel.country = this.country.find(x => x.countryCode.trim() === this.clientData['planningCountry']);
            }
            this.searchModel.assetClass = this.assetClass[0];
        });
    }

    getFavouriteList() {
        this.planningService.getFavouriteList().toPromise().then(result => {
            this.store.dispatch(new SetFavouriteList(result));
            this.favourites = result;
            this.searchModel.favourites = this.favourites.find(x => x.id === 'NONE');
            this.favouritesModel = result;
            this.favouritesModel = $.grep(this.favouritesModel, function (e) {
                return e.id !== 'NONE';
            });
            this.favouritesModel = $.grep(this.favouritesModel, function (e) {
                return e.id !== 'ALL';
            });
            // this.favourites = [];
        });
    }

    AddFavourites(content, product) {
        this.msgs = [];
        this.favouritesByProduct = null;
        this.favouritModel = null;
        this.planningService.getFavListByProdsub(product.productId).toPromise().then(result =>{
            this.favouritesByProduct = result;
            });
        if (product.selectedProductCode) {
            this.productId = product.selectedProductCode;
            //this.favouritesByProduct = product.selectedProductCode.favlistDetails;
        } else {
            this.productId = product.subProducts[0];
           // this.favouritesByProduct = product.subProducts[0].favlistDetails;
        }
        this.modalService.open(content, { backdrop: 'static', keyboard: false }).result.then(
            (closeResult) => {
                // modal close
            },
        );
    }

    removeProductFavrouit(productId, favouriteId) {
        this.msgs = [];
        Swal({
            title: this.i18Text['ASSET_LIABILITY.PRODUCT_SEARCH.DELETED_FROM_FAVOURITE_WARNING'],
            // text: this.i18Text['ALERT_MESSAGE.WARNING_MESSAGE'],
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.i18Text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
        }).then(result => {
            if (result.value) {
                this.planningService.deleteProductFavourite(productId.subProductId, favouriteId)
                    .pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                        this.favouritesByProduct.splice(this.favouritesByProduct.findIndex(e => e.id === favouriteId), 1);
                        if (this.productId.favlistDetails.length <= 0) {
                            this.productId.favlistDetails = [];
                        }

                        this.msgs.push({
                            severity: 'success', summary: this.i18Text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'],
                            detail: this.i18Text['ASSET_LIABILITY.PRODUCT_SEARCH.DELETED_FROM_FAVOURITE_MESSAGE']
                        });

                    });
            }

        });
    }

    addProductFavourite(addFavouritForm: NgForm) {
        this.msgs = [];
        if (this.favouritesByProduct) {
            const existFavourit = this.favouritesByProduct.filter(
                fav => fav.id === this.favouritModel.id);
            if (existFavourit.length > 0) {
                this.msgs.push({ severity: 'error', summary: this.i18Text['ALERT_MESSAGE.ERROR_TITLE'], detail: this.i18Text['ASSET_LIABILITY.PRODUCT_SEARCH.EXIST_FAVOURITE_MESSAGE'] });
                return;
            }
        }
        const productId = this.productId;
        this.planningService.addProductFavourite(productId.subProductId, this.favouritModel.id).toPromise().then(data => {
            // get favourit after add
            if (this.favouritesByProduct) {
                this.favouritesByProduct.push(this.favouritModel);
            } else {
                this.favouritesByProduct = [];
                this.favouritesByProduct.push(this.favouritModel);
            }
            if (this.productId.favlistDetails) {
                const existProduct = this.productId.favlistDetails.filter(x => x.id === this.favouritModel.id);
                if (existProduct <= 0) {
                    this.productId.favlistDetails.push(this.favouritModel);
                }
            } else {
                this.productId.favlistDetails = [];
                this.productId.favlistDetails.push(this.favouritModel);
            }

            // this.productId.favlistDetails
            this.favouritModel = {};
            addFavouritForm.resetForm();
            this.msgs.push({ severity: 'success', summary: this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], detail: this.i18Text['ASSET_LIABILITY.PRODUCT_SEARCH.ADD_FAVOURITE_MESSAGE'] });
        }).catch(errorResponse => { });
    }

    productCodeSelect(event, productDetail) {
        productDetail.selectedProductCode = event;
    }
    getFactSheet(productDetail) {
        if (productDetail !== undefined
                && productDetail.subProducts !== undefined
                && productDetail.subProducts.length > 0
                && productDetail.subProducts[0].productCode !== undefined) {
            return this.createFactSheetReport(productDetail.subProducts[0].productCode, this.clientData['planningCountry']);
        }
    }

    createFactSheetReport(prod_code: string, planningCountry: string) {
        let filename = null;
        let file = null;
        this.planningService.generateFactSheetReport(prod_code, planningCountry)
        .toPromise().then(res => {
            file = res['body'];
            const headers = res.headers.get('content-disposition');
            filename = headers.split('=')[1];
            this.documentService.downloadFile(file, filename);
        }).catch(err => {
        });
    }
    
    async addProductsToAccount(item?) {
        if (this.singleProductSelection) {
            this.selectedProducts.push(item);
        }
        this.dataSharing.changeMessage('products_selected_to_add|' + JSON.stringify({ accountId: this.accountId, selectedProducts: this.selectedProducts }));
        if (!this.fromPreferredSolution) {
            Swal(this.i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], this.i18Text['PORTFOLIO.IMPLEMENTATION.POPUP.PRODUCTS_SUCCESSFULLY_ADDED_TO_THE_ACCOUNT'], 'success');
        }
        this.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
