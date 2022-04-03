import { Component, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import { PlanningService, ClientProfileService, DocumentService } from '../../../service';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload, getFamilyMemberPayload } from '../../../../shared/app.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetLiabilityDetail } from '../../../client-models/asset-liability-detail';
import Swal from 'sweetalert2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { RefreshDataService, Scenario } from '../../../../shared/refresh-data';
import { Angulartics2 } from 'angulartics2';
import { AdvisorService } from '../../../../advisor/service/advisor.service';
import { PageTitleService } from '../../../../shared/page-title';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-holding-account',
    templateUrl: './holding-account.component.html',
    styleUrls: ['./holding-account.component.css']
})
export class HoldingAccountComponent implements OnInit, OnDestroy {
    clientId;
    accountId;
    linkedClientAccount = '';
    expandId;
    itemList = [{ id: '', name: '' }];
    defaultSelected = this.itemList[0];
    assetsDetail;
    holdingAssetLiability = [];
    total = 0;
    totalLiability = 0;
    currentLangulge;
    accountDetails = {};
    utilityAssetLiabilityDetails = [];
    ownerList = [];
    params = {};
    productDetails = {};
    relink = false;
    formatsByCountry = [];
    scenarioObject: Scenario[] = [];
    selectedScenario: Scenario = { id: '00', name: 'Current Scenario' };
    familyMembers = [];
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    fromPage = '';
    portfolioId;
    clientData = {};

    constructor(private planningService: PlanningService,
        private store: Store<AppState>,
        private router: Router,
        private route: ActivatedRoute,
        private advisorService: AdvisorService,
        private refreshDataService: RefreshDataService,
        public translate: TranslateService,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private profileService: ClientProfileService,
        private documentService: DocumentService,
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.HOLDINGS');
        this.angulartics2.eventTrack.next({ action: 'holdingAccounts' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });

        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.accountId = params['accountId'];
            this.accountDetails = {};
            this.holdingAssetLiability = [];
            this.getAccountByAccountId();
        });

    }

    async ngOnInit() {
        this.accessRightService.getAccess(['AL_LIABILITY', 'BTN02', 'PMSE', 'FFS01', 'RELINK_HOLDING', 'SCENARIOACCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });

        if(this.accessRights['SCENARIOACCESS']['accessLevel'] > 0){
            await this.profileService.getClientScenarios(this.clientId, false).toPromise().then((result: any[]) => result.forEach(scenario => {
                this.scenarioObject.push({ name: scenario.scenarioDescription, id: scenario.scenarioType })
            }));
    
            this.refreshDataService.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
                if (scenario) {
                    const scenarioExist = this.scenarioObject.find(scenarioInList => scenarioInList.id === scenario.id);
                    if(scenarioExist){
                        this.selectedScenario = scenario;
                    }
                }
            });
            this.refreshDataService.selectScenario(this.selectedScenario);
        }
        
        
        
        this.getSortByDropdown();
        await this.advisorService.getCountryFormate().toPromise().then(res => {
            this.formatsByCountry = res;
        });
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.getSortByDropdown();
        });
        this.store.select(getFamilyMemberPayload)
            .pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                    this.familyMembers = data['familyMembers'];
                    // this.getAccountByAccountId();
                }
            });

        // user service get product detail from product search panel
        await this.getHoldingsAsset();

        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('edit_holdings|')) {
                this.expand(message.replace('edit_holdings|', ''));
            }
            if (message.includes('cancel_holdings')) {
                this.getHoldingsAsset();
            }
        });

        this.refreshDataService.currentCustomProduct.pipe(takeUntil(this.unsubscribe$)).subscribe(customProduct => {

            if (customProduct !== '') {
                const param = JSON.parse(customProduct);
                this.fromPage = param['fromPage'] || '';
                this.portfolioId = param['portfolioId'] || '';
                if (param.id === 'CUSTOM' && this.fromPage ===''){
                    this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(async clientData => {
                        const assetclassArray = [];
                        await this.planningService.getAssetclass(this.clientId).toPromise().then(assetclass => {

                            assetclass.forEach(asset => {
                                assetclassArray.push({
                                    'allocationBreakdown': asset.description,
                                    'allocationBreakdownId': asset.assetClass,
                                    'allocationPercent': asset.percentage,
                                    'displayOrder': asset.displayOrder,
                                });
                            });
                            this.addCustom(clientData['currencyCode'], assetclassArray);
                        });
                        this.clientData = clientData;
                    });
                }else if (param.id === 'CUSTOM') {
                    this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(async clientData => {
                        const assetclassArray = [];
                        await this.planningService.getAssetclass(this.clientId).toPromise().then(assetclass => {

                            assetclass.forEach(asset => {
                                assetclassArray.push({
                                    'allocationBreakdown': asset.description,
                                    'allocationBreakdownId': asset.assetClass,
                                    'allocationPercent': asset.percentage,
                                    'displayOrder': asset.displayOrder,
                                });
                            });
                            this.addCustom(clientData['currencyCode'], assetclassArray);
                        });
                        this.clientData = clientData;
                    });
                }

                //this.fromPage = '';

                if (param.id === 'RELINK') {
                    this.params = param;
                    this.productDetails = param.productDetail.productDetails;
                    this.getSelectedProductInfo();
                }
            }
        });

        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });

        this.getUtilityAssetLiabilityDetails();
        this.defaultSelected = { id: 'DESCRIPTION', name: 'Description' };
    }

    onSelectScenario(event) {
        this.selectedScenario = event;
        this.refreshDataService.selectScenario(event)
    }

    getSortByDropdown() {
        this.translate.get([
            'ASSET_LIABILITY.HOLDING_ACCOUNT.DROPDOWN_DESCRIPTION',
            'ASSET_LIABILITY.HOLDING_ACCOUNT.DROPDOWN_PRODUCTTYPE',
            'ASSET_LIABILITY.HOLDING_ACCOUNT.DROPDOWN_MARKETVALUE',
            'ASSET_LIABILITY.HOLDING_ACCOUNT.DROPDOWN_UNITS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            this.itemList = [
                { id: 'DESCRIPTION', name: result['ASSET_LIABILITY.HOLDING_ACCOUNT.DROPDOWN_DESCRIPTION'] },
                { id: 'PRODUCTTYPE', name: result['ASSET_LIABILITY.HOLDING_ACCOUNT.DROPDOWN_PRODUCTTYPE'] },
                { id: 'MARKETVALUE', name: result['ASSET_LIABILITY.HOLDING_ACCOUNT.DROPDOWN_MARKETVALUE'] },
                { id: 'UNITS', name: result['ASSET_LIABILITY.HOLDING_ACCOUNT.DROPDOWN_UNITS'] }
            ];
        });
    }

    selectScenario(scenario: Scenario){

    }

    getSelectedProductInfo() {
        if (this.params['value'] && this.params['value'] !== '') {
            this.toggleAssetsList(this.params['value']);
            this.relinkProduct(this.params);
            this.relink = true;
        } else {
            this.addCustomWithProduct(this.params['productDetail']);
        }
    }

    getUtilityAssetLiabilityDetails() {
        this.planningService.getUtilityAssetLiabilityDetails().toPromise().then(result => {
            this.utilityAssetLiabilityDetails = result;
        });
    }

    getAccountByAccountId() {
        this.planningService.getAccountByID(this.accountId).toPromise().then(res => {
            this.accountDetails = res;
            this.familyMembers.forEach(element => {
                if (
                    this.accountDetails['ownership'].filter(x => x['personDetails']['id'] === element['id']).length > 0 &&
                    this.accountDetails['ownership'].find(x => x['personDetails']['id'] === element['id'])['owned'] > 0
                ) {
                    this.ownerList.push(element);
                }
            }, this);
            // this.accountDetails['loanFlag'] = 0;
        });

    }

    // tslint:disable-next-line:use-life-cycle-interface
    async calculateTotal() {
        this.total = 0;
        this.totalLiability = 0;
        this.getAccountByAccountId();
    }
    async addCustom(currencyCode, assetclassArray) {
        // temparory until api got
        const random = Math.floor(Math.random() * (0 - 1000));
        AssetLiabilityDetail['currencyCode'] = currencyCode;
        AssetLiabilityDetail['assetsBreakdown'] = assetclassArray;
        const AssetLiability = {
            ...AssetLiabilityDetail,
            // 'isExpand': true,
            'IsCustom': true,
            'assetKey': 'asset' + random,
            'liability': { 'assetKey': 'LIAB' + random },
        };
        AssetLiability['isAdd'] = true;
        if (this.fromPage === 'implementation') {
            AssetLiability['commisBe'] = 1;
        }
        this.holdingAssetLiability.push(AssetLiability);
        this.expand('asset' + random);
    }
    async addCustomWithProduct(productDetail) {
        const random = Math.floor(Math.random() * (0 - 1000));
        productDetail.assetDetails.assetKey = 'asset' + random;
        productDetail.assetDetails.liability.assetKey = 'LIAB' + random;

        productDetail['assetDetails']['dateFormat'] = this.formatsByCountry.find(x => x.currencyCode.trim() === this.productDetails['currency'])['dateFormate'];

        productDetail.assetDetails['description'] = this.params['productDetail']['company']['name'];
        productDetail.assetDetails['units'] = 0;
        productDetail.assetDetails['fmv'] = 0;
        productDetail.assetDetails['currentLiablities'] = 0;
        productDetail.assetDetails.liability['currentBalance'] = 0;
        productDetail.assetDetails['included'] = true;

        if (this.productDetails['asOfDate'] && this.productDetails['asOfDate'] !== null) {
            productDetail.assetDetails['asOfDate'] = this.productDetails['asOfDate'];
        } else {
            productDetail.assetDetails['asOfDate'] = new Date();
        }
        productDetail.assetDetails['productFmvDate'] = this.productDetails['productFmvDate'];
        productDetail.assetDetails['productCode'] = this.productDetails['productCode'];
        productDetail.assetDetails['companyName'] = this.productDetails['companyName'];
        productDetail.assetDetails['productFmv'] = this.productDetails['unitPrice'];
        productDetail.assetDetails['productType'] = this.productDetails['productType'];
        productDetail.assetDetails['assetsBreakdown'] = this.productDetails['assetAllocation'];
        productDetail.assetDetails['productNumber'] = this.params['productDetail']['productId'];
        productDetail.assetDetails['country'] = this.params['productDetail']['country'];
        productDetail.assetDetails['companyNumber'] = this.params['productDetail']['company']['id'];
        productDetail.assetDetails['subProductName'] = this.params['productDetail']['productDescription'];
        productDetail.assetDetails['currencyCode'] = this.params['productDetail']['currency'];
        productDetail.assetDetails['linkedAccountName'] = this.accountDetails['description'];
        productDetail.assetDetails['isAdd'] = true;

        this.holdingAssetLiability.push(productDetail.assetDetails);
        this.expand('asset' + random);
    }
    relinkProduct(param) {
        const index = this.holdingAssetLiability.findIndex(e => e.assetKey === param.value);
        this.holdingAssetLiability[index]['description'] = this.productDetails['productDescription'];
        this.holdingAssetLiability[index]['productCode'] = this.productDetails['productCode'];
        this.holdingAssetLiability[index]['companyName'] = this.productDetails['companyName'];
        this.holdingAssetLiability[index]['productFmv'] = this.productDetails['unitPrice'];
        this.holdingAssetLiability[index]['productType'] = this.productDetails['productType'];
        this.holdingAssetLiability[index]['assetsBreakdown'] = this.productDetails['assetAllocation'];
        this.holdingAssetLiability[index]['productNumber'] = param['productDetail']['productId'];
        this.holdingAssetLiability[index]['country'] = param['productDetail']['country'];
        this.holdingAssetLiability[index]['companyNumber'] = param['productDetail']['company']['id'];
        this.holdingAssetLiability[index]['subProductName'] = this.productDetails['productDescription'];
        this.holdingAssetLiability[index]['relink'] = this.relink;


        // this.holdingAssetLiability[index] = param.productDetail.assetDetails;
        // this.expand(param.value);
    }
    getHoldingsAsset() {
        return new Promise(async (resolve, reject) => {
            this.total = 0;
            this.totalLiability = 0;
            try {
                const result = await this.planningService.getHoldingsAsset(this.accountId, this.defaultSelected.id.toLowerCase()).toPromise();
                result.assetList.forEach(element => {
                    element.dateFormat = this.formatsByCountry.find(x => x.currencyCode.trim() === element.currencyCode.trim())['dateFormate'];
                }, this);
                this.holdingAssetLiability = [];
                this.holdingAssetLiability = this.holdingAssetLiability.concat(result.assetList);
                await this.calculateTotal();
            } catch (error) {
                this.holdingAssetLiability = this.holdingAssetLiability.concat([]);
            }
            resolve(true);
        });
    }
    public changeAssetAction(index: number) {
        if ($('#dropdownAssetsAction' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#dropdownAssetsAction' + index).toggle();
        }
    }
    async expand(accountId) {
        setTimeout(() => {
            $('#expand_' + accountId).click();
            // $(window).scrollTop($('#expand_' + accountId).offset().top);
        }, 200);
    }
    toggleAssetsList(accountId) {
        $('#assetList_' + accountId).toggle();
    }
    changeAccount(accountId) {
        this.accountId = accountId;
        // this.getHoldingsAsset();
        this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities/' + accountId + '/holding-account']);
        this.getHoldingsAsset();
    }
    sortHolding(event) {
        this.defaultSelected = event;
        this.getHoldingsAsset();
    }
    deleteHolding(id: number, assetId) {
        this.translate.get(['ALERT_MESSAGE.WARNING_MESSAGE', 'ASSET_LIABILITY.HOLDING_ACCOUNT.HOLDING_DELETE_WARNING'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe((ressult: string) => {
                Swal({
                    title: ressult['ASSET_LIABILITY.HOLDING_ACCOUNT.HOLDING_DELETE_WARNING'],
                    text: ressult['ALERT_MESSAGE.WARNING_MESSAGE'],
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes'
                }).then(result => {
                    if (result.value) {
                        this.planningService.deleteAccountHolding(assetId).toPromise().then(data => {
                            // this.holdingAssetLiability.splice(id, 1);
                            this.getHoldingsAsset();
                            this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                            this.profileService.getInvestmentData(this.clientId);
                            this.advisorService.getInvestmentPayload();
                            this.advisorService.getAdvisorNetWorthPayload();
                            this.translate.get(['ALERT_MESSAGE.SUCCESS_DELETED_TITLE', 'ASSET_LIABILITY.HOLDING_ACCOUNT.HOLDING_DELETED_MESSAGE'])
                                .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                                    Swal(res['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], res['ASSET_LIABILITY.HOLDING_ACCOUNT.HOLDING_DELETED_MESSAGE'],
                                        'success');
                                });
                        }).catch(errorResponse => { });
                    }
                });
            });
    }
    SavedDetail(event) {
        // this.calculateTotal();
        this.getHoldingsAsset();
    }

    ngOnDestroy(): void {
        this.refreshDataService.newCustomProduct("");
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    goToAddCustom() {
        let fromPage = this.fromPage;
        this.planningService.addCustomAsset({ id: 'CUSTOM', value: '' , fromPage : ''});
        this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities/' + this.accountId + '/holding-account']);
    }

    getFactSheet(item) {
        if (item !== undefined && item.productCode !== undefined) {
            return this.createFactSheetReport(item.productCode, this.clientData['planningCountry']);
        } else {
            Swal('Fact sheet error', 'Error', 'error');
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
            this.translate.get([
                                'ALERT_MESSAGE.OOPS_TEXT',
                                'SSID_LABELS.ERROR_MESSAGE.' + JSON.parse(err).errorSsid
                            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                                if (JSON.parse(err).errorSsid) {
                                    Swal(text['ALERT_MESSAGE.OOPS_TEXT'], text['SSID_LABELS.ERROR_MESSAGE.' + JSON.parse(err).errorSsid], 'error');
                                } else {
                                    Swal(text['ALERT_MESSAGE.OOPS_TEXT'], JSON.parse(err).errorMessage, 'error');
                                }
                            });

        });
    }
}
