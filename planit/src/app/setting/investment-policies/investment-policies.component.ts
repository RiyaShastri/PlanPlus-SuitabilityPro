import { Component, OnInit, DoCheck, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import { Angulartics2 } from 'angulartics2';
import { PortfolioService } from '../../client/service';
import { AppState, getAllCountryFormatePayload, getAdvisorPayload, getGraphColours } from '../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { SettingService } from '../service';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { debugOutputAstAsTypeScript, ThrowStmt } from '@angular/compiler';
import { RefreshDataService } from '../../shared/refresh-data';
import { Router } from '@angular/router';
import { INVESTMENT_POLICY_VIEW } from '../../shared/constants';
import { PageTitleService } from '../../shared/page-title';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { AccessRightService } from '../../shared/access-rights.service';
import { chartColors } from '../../client/client-models';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-investment-policies',
    templateUrl: './investment-policies.component.html',
    styleUrls: ['./investment-policies.component.css']
})
export class InvestmentPoliciesComponent implements OnInit, OnDestroy {
    INVESTMENT_POLICY_VIEW = INVESTMENT_POLICY_VIEW;
    isEditable = false;
    isDetailExpand;
    policy = 'default';
    viewBy = [];
    selectedViewBy;
    lastReviewDate = '';
    minMaxPolicy = [];
    selectedPolicy;
    assetsClassDropDown = [];
    defaultAssetClass;
    advisoreData = {};
    investmentData;
    copyOfInvestmentData;
    allAssetsClassData = {};
    allIncomeDistributionData = {};
    accessRights = {};
    chartColour = [];
    policyData = {
        'total': [],
        'downsideVolatility': []
    };
    isHundredPercent = false;
    policyAcceptance = false;
    isDefaultRange = true;
    saveButtonDisable = false;
    percentDecimalMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 1
    });
    private unsubscribe$ = new Subject<void>();
    public lastReviewedDate = '';
    dateFormat = '';
    constructor(
        private angulartics2: Angulartics2,
        private portfolioService: PortfolioService,
        private store: Store<AppState>,
        private settingService: SettingService,
        private refreshDataService: RefreshDataService,
        private translate: TranslateService,
        private dataSharing: RefreshDataService,
        private router: Router,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.INVESTMENT_POLICIES');
        this.angulartics2.eventTrack.next({ action: 'defaultInvestmentPolicies' });
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(response => {
            if (response.includes('individual_policy_added')) {
                const data = JSON.parse(response.replace('individual_policy_added|', ''));
                this.investmentData = data;
                this.policyAcceptance = false;
                this.isDefaultRange = false;
                this.setData();
            }
        });
    }

    ngOnInit() {
        this.translate.get(['SETTINGS.INVESTMENT_POLICIES.TARGET',
            'SETTINGS.INVESTMENT_POLICIES.TARGET_POLICY_RANGE',
            'SETTINGS.INVESTMENT_POLICIES.BY_ASSET_CLASS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.viewBy = [
                { id: INVESTMENT_POLICY_VIEW.TARGET, name: i18Text['SETTINGS.INVESTMENT_POLICIES.TARGET'] },
                { id: INVESTMENT_POLICY_VIEW.TARGET_POLICY_RANGE, name: i18Text['SETTINGS.INVESTMENT_POLICIES.TARGET_POLICY_RANGE'] }
            ];
            this.selectedViewBy = this.viewBy[0];
            this.minMaxPolicy = [
                { id: 1, name: i18Text['SETTINGS.INVESTMENT_POLICIES.BY_ASSET_CLASS'] }
            ];
            this.selectedPolicy = this.minMaxPolicy[0];
        });
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                const formatsByCountry = data;
                this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                    if (res) {
                        this.dateFormat = formatsByCountry[res['country']]['dateFormate'];
                    }
                });
            }
        });
        this.accessRightService.getAccess(['CMAINCDIST', 'DFTINVPOLEDIT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.accessRights = res);
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.chartColour = res['allGraphColours'];
            }
        });
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result && result['country']) {
                this.advisoreData = result;
                this.policyAcceptance = this.advisoreData['invPolicyAcceptance'];
                this.portfolioService.getRollupClassList(this.advisoreData['country']).toPromise().then(resp => {
                    this.assetsClassDropDown = resp;
                    if (this.assetsClassDropDown) {
                        this.defaultAssetClass = this.assetsClassDropDown.find(x => x.value === 'Detail');
                    }
                });
            }
        });
        this.setInvestmentData();
    }

    setInvestmentData() {
        this.settingService.getDefaultInvestmentData().toPromise().then(data => {
            if (data) {
                this.investmentData = JSON.parse(JSON.stringify(data));
                this.copyOfInvestmentData = JSON.parse(JSON.stringify(data));
                this.isDefaultRange = data['showDefaultRange'];
                this.lastReviewDate = data['lastReviewedDate'];
                this.refreshDataService.changeMessage('IPS_last_updated_data|' + this.lastReviewDate);
                this.setData();
                this.lastReviewedDate = data['lastReviewedDate'];
            }
        }).catch(error => { });
    }

    setData() {
        if (this.investmentData.investmentTargetPolicyDTO.length > 0) {
            this.policyData = {
                'total': [],
                'downsideVolatility': []
            };
            this.allAssetsClassData = {};
            this.allIncomeDistributionData = {};
            this.investmentData.investmentTargetPolicyDTO.forEach((invest, index) => {
                const allAsset = [];
                const allIncomDestribution = [];
                invest.defaultInvestmentPayloads.forEach(asset => {
                    allAsset.push(asset);
                });
                this.allAssetsClassData[invest.investmentPolicyId] = allAsset;
                invest.incomeDistributions.forEach(incom => {
                    allIncomDestribution.push(incom);
                });
                this.allIncomeDistributionData[invest.investmentPolicyId] = allIncomDestribution;
                this.policyData['total'][invest.investmentPolicyId] = invest.total;
                this.policyData['downsideVolatility'][invest.investmentPolicyId] = invest.risk * -2;
            });
            this.investmentData.investmentTargetPolicyDTO.forEach(element => {
                this.checkPolicyTotal(element.investmentPolicyId);
            });
            const length = this.investmentData.investmentTargetPolicyDTO.length;
            this.investmentData.investmentTargetPolicyDTO.forEach((investment, index) => {
                if (index === 0) {
                    this.investmentData.investmentTargetPolicyDTO[index].yourLowRange = 0;
                    this.investmentData.investmentTargetPolicyDTO[length - 1].yourHighRange = 100;
                }
            });
            this.investmentData.investmentTargetPolicyDTO.forEach((investment, index) => {
                if (index === 0) {
                    this.investmentData.investmentTargetPolicyDTO[index].yourLowRange = 0;
                    this.investmentData.investmentTargetPolicyDTO[length - 1].yourHighRange = 100;
                }
            });
        }
    }

    saveInvestmentPolicy() {
        const obj = JSON.parse(JSON.stringify(this.investmentData));
        this.investmentData.investmentTargetPolicyDTO.forEach((invest, index) => {
            this.allAssetsClassData[invest.investmentPolicyId].forEach((asset, j) => {
                obj.investmentTargetPolicyDTO[index].defaultInvestmentPayloads[j] = asset;
            });
        });
        let range = 0;
        let errorState = false;
        this.investmentData.investmentTargetPolicyDTO.forEach((invest, index) => {
            if (index > 0 && invest.yourLowRange !== +range + 1) {
                errorState = true;
            }
            range = invest.yourHighRange;
        });
        if (errorState) {
            this.saveButtonDisable = false;
            this.translate.get(['SETTINGS.INVESTMENT_POLICIES.YOUR_RANGE_ERROR']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                swal(i18Text['SETTINGS.INVESTMENT_POLICIES.YOUR_RANGE_ERROR'], '', 'error');
            });
        } else {
            obj.investmentTargetPolicyDTO.forEach(invest => {
                if (invest.investmentPolicyId.includes('add')) {
                    invest.investmentPolicyId = null;
                }
            });
            this.settingService.updateDefaultInvestmentPolicy(obj).toPromise().then(response => {
                this.setInvestmentData();
                this.refreshTranslation();
                if (this.isEditable) {
                    this.changeEdit();
                }
                this.dataSharing.changeMessage('Deefault message');
                if (obj.investmentType === 1) {
                    this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'SETTINGS.INVESTMENT_POLICIES.SUCCESS_UPDATE_CUSTOM_POLICY'])
                    .pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                        swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['SETTINGS.INVESTMENT_POLICIES.SUCCESS_UPDATE_CUSTOM_POLICY'], 'success');
                    });
                } else {
                    this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'SETTINGS.INVESTMENT_POLICIES.SUCCESS_UPDATE_DEFAULT_POLICY'])
                    .pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                        swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['SETTINGS.INVESTMENT_POLICIES.SUCCESS_UPDATE_DEFAULT_POLICY'], 'success');
                    });
                }
                this.saveButtonDisable = false;
            }).catch(err => {
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                    swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
                this.saveButtonDisable = false;
            });
        }
    }

    checkPolicyTotal(id) {
        let total = 0;
        this.allAssetsClassData[id].forEach(investment => {
            total = total + parseInt(investment.targetPercent, 10);
        });
        this.policyData['total'][id] = total;
        if (total > 100) {
            this.isHundredPercent = true;
        } else if (total < 100) {
            this.isHundredPercent = true;
        } else {
            this.isHundredPercent = false;
        }
    }

    setYourRange(event, i) {
        if (event > 0 && event < 100) {
            const length = this.investmentData.investmentTargetPolicyDTO.length;
            this.investmentData.investmentTargetPolicyDTO.forEach((investment, index) => {
                if (index === i + 1) {
                    investment.yourLowRange = parseInt(this.investmentData.investmentTargetPolicyDTO[i].yourHighRange, 10) + 1;
                    if (index === (length - 2) && investment.yourLowRange < 100) {
                        if (this.investmentData.investmentTargetPolicyDTO[length - 2].yourHighRange !== 0) {
                            this.investmentData.investmentTargetPolicyDTO[length - 1].yourLowRange = 100 - this.investmentData.investmentTargetPolicyDTO[length - 2].yourHighRange;
                        }
                        this.investmentData.investmentTargetPolicyDTO[length - 1].yourHighRange = 100;
                    }
                }
            });
        }
    }

    deleteInvestmentPolicy(id) {
        this.investmentData.investmentTargetPolicyDTO.forEach((invest, index) => {
            if (invest.investmentPolicyId === id) {
                this.investmentData.investmentTargetPolicyDTO.splice(index, 1);
            }
        });
        delete this.allAssetsClassData[id];
        const length = this.investmentData.investmentTargetPolicyDTO.length;
        this.investmentData.investmentTargetPolicyDTO.forEach((investment, index) => {
            if (index === 0) {
                this.investmentData.investmentTargetPolicyDTO[index].yourLowRange = 0;
                this.investmentData.investmentTargetPolicyDTO[length - 1].yourHighRange = 100;
            } else if (this.investmentData.investmentTargetPolicyDTO[index - 1].yourHighRange !==
                this.investmentData.investmentTargetPolicyDTO[index].yourLowRange - 1 ) {
                this.investmentData.investmentTargetPolicyDTO[index - 1].yourHighRange = this.investmentData.investmentTargetPolicyDTO[index].yourLowRange - 1;
            }
        });
        this.isDefaultRange = false;
        this.policyAcceptance = false;
    }

    editIndividualPolicy(id) {
        const obj = JSON.parse(JSON.stringify(this.investmentData));
        this.dataSharing.changeMessage('edit_indiviual_investment_policy|' + JSON.stringify(obj));
        this.router.navigate(['/settings', 'investment-policies', id, 'edit-policy']);
    }

    addPolicy() {
        const obj = JSON.parse(JSON.stringify(this.investmentData));
        this.dataSharing.changeMessage('Add_New_Investment_Policy|' + JSON.stringify(obj));
        this.router.navigate(['/settings', 'investment-policies', 'add-policy']);
    }

    changeView(value) {
        this.selectedViewBy = value;
    }

    changePolicy(value) {
        this.selectedPolicy = value;
    }

    changeAssetsClass(event) {
        this.defaultAssetClass = event;
        this.setData();
    }

    toggle() {
        $('#expandDetails').toggle();
    }

    changeEdit() {
        this.isEditable = !this.isEditable;
    }

    toggleActionMenu(id, index) {
        if ($('#' + id + '_' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#' + id + '_' + index).toggle();
        }

    }

    selectInvestmentPolicy(value) {
        if (parseInt(value, 10) === 0) {
            this.translate.get([
                'SETTINGS.PJM_DATA.POPUP.DISTRIBUTION_CHANGE_TITLE',
                'SETTINGS.PJM_DATA.POPUP.DISTRIBUTION_CHANGE_TEXT',
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal({
                    title: i18text['SETTINGS.PJM_DATA.POPUP.DISTRIBUTION_CHANGE_TITLE'],
                    text: i18text['SETTINGS.PJM_DATA.POPUP.DISTRIBUTION_CHANGE_TEXT'],
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Proceed'
                }).then(result => {
                    if (result.value) {
                        const obj = Object.assign({}, this.copyOfInvestmentData);
                        this.investmentData.investmentTargetPolicyDTO.forEach((invest, index) => {
                            this.allAssetsClassData[invest.investmentPolicyId].forEach((asset, j) => {
                                obj.investmentTargetPolicyDTO[index].defaultInvestmentPayloads[j] = asset;
                            });
                        });
                        obj.investmentType = 0;
                        this.settingService.updateDefaultInvestmentPolicy(obj).toPromise().then(response => {
                            this.setInvestmentData();
                            this.refreshTranslation();
                        });
                    } else {
                        this.investmentData.investmentType = 1;
                    }
                });
            });
        } else {
            this.investmentData.investmentType = parseInt(value, 10);
        }
    }

    refreshTranslation() {
        this.dataSharing.changeTranslation('{"default" : "translation"}');
        this.settingService.getTranslation(this.advisoreData['country'], this.advisoreData['region']);
    }

    clearAllData() {
        this.setInvestmentData();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
