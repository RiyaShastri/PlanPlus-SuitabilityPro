import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { PlanningService, ClientProfileService, GoalService } from '../../../../service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { Angulartics2 } from 'angulartics2';
import { AccessRightService } from '../../../../../shared/access-rights.service';
import { AdvisorService } from '../../../../../advisor/service/advisor.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { RefreshDataService, Scenario } from '../../../../../shared/refresh-data';
import { Router } from '@angular/router';
import { getFamilyMemberPayload, AppState, getRevenueDates, getClientDefaultData } from '../../../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { ASSETS_LIABILITY_ACCOUNT_TYPE, ACCOUNT_FLAG, DEPRECIATION_TYPE, PERSON_RELATION } from '../../../../../shared/constants';
import { Disposition } from './Disposition.model';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
    selector: 'app-holding-detail',
    templateUrl: './holding-detail.component.html',
    styleUrls: ['./holding-detail.component.css']
})

export class HoldingDetailComponent implements OnInit, OnDestroy {
    @Input() assetLiabilityDetail;
    @Input() accountDetails;
    @Input() utilityAssetLiabilityDetails;
    @Input() ownerList;
    @Input() fromPage;
    @Input() portfolioId;
    @Output() Change = new EventEmitter();
    @Input() clientId = '';
    loantype;
    frequency;
    paymenttype;
    treatmentondeathtype;
    currency;
    productType;
    compounding;
    startList;
    ACCOUNT_FLAG = ACCOUNT_FLAG;
    selectedDateType: any;
    currentYearDepreciation;
    unitsChanged = false;
    familyMembers;
    ageOptionDisable;
    familyData = [];
    undepreciatedCapitalCost;
    disableUpdateDisposition = false;
    dispositionObject: Disposition;
    isExpand;
    isCorrect = false;
    selectedScenario: Scenario = { id: '00', name: 'Current Scenario' };
    scenarioChanged = new Subject();
    expandId;
    depreciationType;
    selectedDepreciationType;
    totalBreakDown = 0;
    loading = false;
    accessRights = {};
    regexString = /\D/g;
    saveDisable = false;
    currencyMask = createNumberMask({
        prefix: '$'
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });
    percentMask1 = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    customProductValue;
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();
    OTHER_OWNER = ASSETS_LIABILITY_ACCOUNT_TYPE;
    constructor(
        private planningService: PlanningService,
        public translate: TranslateService,
        private accessRightService: AccessRightService,
        private angulartics2: Angulartics2,
        private profileService: ClientProfileService,
        private refreshDataService: RefreshDataService,
        private advisorService: AdvisorService,
        private router: Router,
        private store: Store<AppState>,
        private goalService: GoalService
    ) {
        this.angulartics2.eventTrack.next({ action: 'holdingDetailAccount' });
    }

    async ngOnInit() {

        this.translate.get(['ASSET_LIABILITY.HOLDING_ACCOUNT.FLAT_RATE', 'ASSET_LIABILITY.HOLDING_ACCOUNT.DECLINING_BALANCE'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                this.depreciationType = [
                    { id: DEPRECIATION_TYPE.FLAT_RATE, description: res['ASSET_LIABILITY.HOLDING_ACCOUNT.FLAT_RATE'] },
                    { id: DEPRECIATION_TYPE.DECLINING_BALANCE, description: res['ASSET_LIABILITY.HOLDING_ACCOUNT.DECLINING_BALANCE'] }
                ]
            });

        this.customProductValue = JSON.parse(JSON.stringify(this.assetLiabilityDetail));
        if(this.assetLiabilityDetail){
            this.assetLiabilityDetail.displayUnits = this.assetLiabilityDetail['units'].toFixed(4);
        }
        
        
        await this.initializeData();
        if (this.accountDetails.dispositionFlag === ACCOUNT_FLAG.ON && this.accessRights['DISPOSITION']['accessLevel'] > 0) {
            this.updateDate();
        }
        if (this.accountDetails.recaptureFlag === ACCOUNT_FLAG.ON && this.accessRights['RECAP']['accessLevel'] > 0) {
            this.selectedDepreciationType = this.depreciationType.find(d => d.id == this.dispositionObject.depreciation_type);
            if(!this.selectedDepreciationType){
                this.selectedDepreciationType = DEPRECIATION_TYPE.FLAT_RATE;
            }
            this.updateRecaptureValues();
        }

    }

    updateDate(){
        this.selectedDateType = this.startList.find(model => model.id === this.dispositionObject.modeltype);
            if (this.selectedDateType.id == 0) {
                this.ageOptionDisable = true;
                this.dispositionObject.disposition_year = this.familyMembers[0]['retireYear'];
            }

            this.checkAge();
    }


    async initializeData() {
        this.accessRightService.getAccess(['AL_LIABILITY', 'DISPOSITION', 'RECAP']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res } });
        this.totalAllocation();
        this.assetLiabilityDetail.isDetailExpand = false;
        this.currencyMask = createNumberMask({
            prefix: getCurrencySymbol(this.assetLiabilityDetail.currencyCode, 'narrow'),
            allowDecimal: true
        });
        // this.assetLiabilityDetail.asOfDate = this.assetLiabilityDetail.asOfDate;
        if (this.assetLiabilityDetail.liability !== null) {
            this.assetLiabilityDetail.liability.loanInsured = (this.assetLiabilityDetail.liability.loanInsured === null || this.assetLiabilityDetail.liability.loanInsured==0) ? false : true;
            this.assetLiabilityDetail.liability.inceptionDate = this.assetLiabilityDetail.liability.currentDate;
        }
        // this.linkedClientAccount = this.assetLiabilityDetail.linkedAccountName;

        if (this.accountDetails.dispositionFlag === ACCOUNT_FLAG.ON && this.accessRights['DISPOSITION']['accessLevel'] > 0) {

            this.refreshDataService.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
                if (scenario) {
                    this.selectedScenario = scenario;
                }
            });

            this.loadDispositionDataBasedOnScenario();
            
            this.store.select(getRevenueDates).pipe(takeUntil(this.unsubscribe$)).subscribe(async startEnd => {
                if (startEnd) {
                    this.startList = startEnd[0];
                }else{
                    await this.goalService.getRevenueDates()
                }
            });
            
            await this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
                if (result.hasOwnProperty('familyMembers') && result['familyMembers'].length > 0) {
                    this.familyMembers = result['familyMembers'];
                }
            });

            let initialScenario = null;
            let dataFetched = 0;
            let letDataToBeLoaded = new Promise((resolve,reject) =>{
                this.store.select(getClientDefaultData).pipe(takeUntil(this.unsubscribe$)).subscribe(response =>{
                    if(response){
                        const dataForSelectedClient = response.find(data => data.primaryKey === this.clientId);
                        if(dataForSelectedClient){
                            response.forEach(member => {
                                this.familyData[member.primaryKey] = member;
                            });
                            if (this.familyMembers.length > 0 && this.familyData) {
                                this.familyMembers.forEach(member => {
                                    if (member.relation === PERSON_RELATION.CLIENT1 || member.relation === PERSON_RELATION.CLIENT2) {
                                        member.birthYear = new Date(member.birthDate).getFullYear();
                                        member.retireAge = this.familyData[member.id]['startAge'];
                                        member.retireYear = member.birthYear + parseInt(member.retireAge, 10);
                                        member.horizonAge = this.familyData[member.id]['endAge'];
                                        member.horizonYear = member.birthYear + parseInt(member.horizonAge, 10);
                                        this.ownerList[member.id] = member;
                                        initialScenario = this.selectedScenario.id;
                                    }
                                }, this);
                            }
                            resolve();
                        }else{
                            if(dataFetched == 0){
                                this.goalService.getClientData(this.clientId,this.selectedScenario.id);
                                dataFetched++;
                            }else{
                                reject();
                            }
                            
                        }
                    }else{
                        if(dataFetched == 0){
                            this.goalService.getClientData(this.clientId,this.selectedScenario.id);
                            dataFetched++;
                        }else{
                            reject();
                        }
                    }
                });
            })
            this.scenarioChanged.pipe(takeUntil(this.unsubscribe$)).subscribe(hasScenarioChanged => {
                if(this.selectedScenario.id == '01'){
                    this.disableUpdateDisposition = true;
                }else{
                    this.disableUpdateDisposition = false;
                }
                if(initialScenario && this.selectedScenario.id !== initialScenario){
                    this.goalService.getClientData(this.clientId,this.selectedScenario.id);
                }
                
            });
            
           await letDataToBeLoaded;

            this.refreshDataService.selectedScenario.pipe(takeUntil(this.unsubscribe$)).subscribe(scenario => {
                if (scenario) {
                    this.scenarioChanged.next();
                    this.loadDispositionDataBasedOnScenario();
                    this.updateDate();
                    this.checkValues();
                }
            });
        }else{
            this.isCorrect = true;
        }
        this.loantype = this.utilityAssetLiabilityDetails[0];
        this.frequency = this.utilityAssetLiabilityDetails[1];
        this.paymenttype = this.utilityAssetLiabilityDetails[2];
        this.currency = this.utilityAssetLiabilityDetails[3];
        this.productType = this.utilityAssetLiabilityDetails[4];
        this.compounding = this.utilityAssetLiabilityDetails[5];
        this.treatmentondeathtype = this.utilityAssetLiabilityDetails[6];
        this.setDefault();
    }

    checkValues() {
        this.dispositionObject.modeltype = this.selectedDateType.id;
        if (this.selectedDateType.id == 0) {
            this.dispositionObject.disposition_year = this.familyMembers[0]['retireYear'];
            this.ageOptionDisable = true;
        } else {
            this.ageOptionDisable = false;
        }
        this.checkAge();
    }

    loadDispositionDataBasedOnScenario() {

        if (this.assetLiabilityDetail['disposition']) {
            this.assetLiabilityDetail.disposition.forEach(disp => {
                if (disp.scenario == this.selectedScenario.id) {
                    this.dispositionObject = {
                        disposition_year: disp['disposition_year'],
                        payout_period: disp['payout_period'],
                        growrate_to_disp: disp['growrate_to_disp'] ? disp['growrate_to_disp'] : 0,
                        growrate_during_disp: disp['growrate_during_disp'],
                        client_exemption: disp['client_exemption'],
                        inclusionRate: disp['inclusionRate'],
                        modeltype: disp['modeltype'],
                        income_est: disp['income_est'],
                        disp_ondeath: disp['disp_ondeath'],
                        disp_ondisability: disp['disp_ondisability'],
                        assetnum: disp['assetnum'],
                        scenario: this.selectedScenario.id,
                        update_disposition: disp['update_disposition'] == 1 ? true : false

                    }

                    if (this.accountDetails.recaptureFlag === ACCOUNT_FLAG.ON && this.accessRights['RECAP']['accessLevel'] > 0) {
                        this.dispositionObject = {
                            ...this.dispositionObject,
                            depreciable: disp['depreciable'],
                            cur_depreciation: disp['cur_depreciation'],
                            depreciation_rate: disp['depreciation_rate'],
                            depreciation_type: disp['depreciation_type']
                        }
                    }
                }
            });

            if (!this.dispositionObject || this.dispositionObject.scenario != this.selectedScenario.id) {
                this.setDefaultDisposition();
            }

        } else{
            this.setDefaultDisposition();
        }

    }

    setDefaultDisposition(){
        this.dispositionObject = {
            disposition_year: 0,
            payout_period: 0,
            growrate_to_disp: 0,
            growrate_during_disp: 0,
            client_exemption: 0,
            inclusionRate: 0,
            modeltype: 0,
            income_est: 0,
            assetnum: 0,
            scenario: this.selectedScenario.id,
            update_disposition: false
        };


        if (this.accountDetails.recaptureFlag === ACCOUNT_FLAG.ON && this.accessRights['RECAP']['accessLevel'] > 0) {
            this.dispositionObject = {
                ...this.dispositionObject,
                depreciable: 0,
                cur_depreciation: 0,
                depreciation_rate: 0,
                depreciation_type: DEPRECIATION_TYPE.FLAT_RATE
            }
        }
    }

    checkAge() {
        if (this.selectedDateType.id != 2) {
            this.isCorrect = true;
        } else {
            if (this.dispositionObject.disposition_year < this.familyMembers[0]['retireYear']) {
                this.isCorrect = false;
            } else {
                this.isCorrect = true;
            }
        }
    }

    checkDepreciationType() {
        this.dispositionObject.depreciation_type = this.selectedDepreciationType.id;
        this.updateRecaptureValues();
    }

    setDefault() {
        // setTimeout(() => {
        this.assetLiabilityDetail.prod_type = this.productType.find(x => parseInt(x.id, 10) === parseInt(this.assetLiabilityDetail.prod_type, 10));
        this.assetLiabilityDetail.selectedCurrencyCode = this.currency.find(x => x.currencyCode.trim() === this.assetLiabilityDetail.currencyCode.trim());

        if (this.assetLiabilityDetail.liability !== null) {
            if (this.assetLiabilityDetail.isAdd || this.assetLiabilityDetail.IsCustom) {
                this.assetLiabilityDetail.liability.compoundFrequency = this.compounding.find(x => parseInt(x.frequencyId, 10) === 1);
                this.assetLiabilityDetail.liability.loanType = this.loantype.find(x => parseInt(x.loanTypeId, 10) === 5);
                this.assetLiabilityDetail.liability.paymentType = this.paymenttype.find(x => parseInt(x.paymentTypeId, 10) === 0);
                this.assetLiabilityDetail.liability.treatmentOnDeath = this.treatmentondeathtype.find(x => parseInt(x.TreatmentOnDeathTypeId, 10) === 0);
                this.assetLiabilityDetail.liability.paymentFrequency = this.frequency.find(x => parseInt(x.frequencyId, 10) === 1);
            } else {
                this.assetLiabilityDetail.liability.compoundFrequency = this.compounding.find(x => parseInt(x.frequencyId, 10) === parseInt(this.assetLiabilityDetail.liability.compoundFrequency, 10));
                this.assetLiabilityDetail.liability.paymentType = this.paymenttype.find(x => parseInt(x.paymentTypeId, 10) === parseInt(this.assetLiabilityDetail.liability.paymentType, 10));
                this.assetLiabilityDetail.liability.treatmentOnDeath = this.treatmentondeathtype.find(x => parseInt(x.treatmentOnDeathTypeId, 10) === parseInt(this.assetLiabilityDetail.liability.treatmentOnDeath, 10));
                this.assetLiabilityDetail.liability.paymentFrequency = this.frequency.find(x => parseInt(x.frequencyId, 10) === parseInt(this.assetLiabilityDetail.liability.paymentFrequency, 10));
                this.assetLiabilityDetail.liability.loanType = this.loantype.find(x => parseInt(x.loanTypeId, 10) === parseInt(this.assetLiabilityDetail.liability.loanType, 10));
            }
        }

        // }, 200);
    }

    recaptureChange() {
        this.updateRecaptureValues();
    }

    updateRecaptureValues() {
        const depreciable = this.dispositionObject.depreciable ? this.dispositionObject.depreciable : 0;
        const cur_depreciation = this.dispositionObject.cur_depreciation ? this.dispositionObject.cur_depreciation : 0;
        const rate = this.dispositionObject.depreciation_rate ? this.dispositionObject.depreciation_rate .toString().replace('%', '') : 0;
        const type = this.selectedDepreciationType.id;
        this.undepreciatedCapitalCost = depreciable - cur_depreciation;

        if (type == DEPRECIATION_TYPE.FLAT_RATE) {
            this.currentYearDepreciation = depreciable * (rate / 100.0);
            this.currentYearDepreciation = parseInt(this.currentYearDepreciation);
        } else {
            this.currentYearDepreciation = (depreciable - cur_depreciation) * (rate / 100.0);
            this.currentYearDepreciation = parseInt(this.currentYearDepreciation);
        }
    }


    collapseLiability(isDetailExpand, id) {
        $('#liability_' + id).toggle();
        this.assetLiabilityDetail.isDetailExpand = !isDetailExpand;
    }
    saveAssetAndLiabilityDetail() {
        if (this.assetLiabilityDetail.productNumber === null && this.assetLiabilityDetail.IsCustom) {
            this.totalAllocation();
            if (this.assetLiabilityDetail.assetsBreakdown.length > 0 && this.totalBreakDown !== 100) {
                this.translate.get(['ALERT_MESSAGE.ERROR_TITLE', 'ASSET_LIABILITY.HOLDING_ACCOUNT.ALLOCATION_BREAKDOWN_ERROR'])
                    .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                        Swal(res['ALERT_MESSAGE.ERROR_TITLE'], res['ASSET_LIABILITY.HOLDING_ACCOUNT.ALLOCATION_BREAKDOWN_ERROR'], 'error');
                        this.saveDisable = false;
                    });
                return;
            }
        }

        const obj = {
            'acb': (this.assetLiabilityDetail['acb'] && this.assetLiabilityDetail['acb'] !== 0) ? this.assetLiabilityDetail['acb'] : this.assetLiabilityDetail['fmv'],
            'accontNumber': this.assetLiabilityDetail['accontNumber'],
            'asOfDate': this.assetLiabilityDetail['asOfDate'],
            'assetsBreakdown': this.assetLiabilityDetail['assetsBreakdown'],
            'companyNumber': (this.assetLiabilityDetail.companyNumber) ? this.assetLiabilityDetail.companyNumber : '',
            'companyName': (this.assetLiabilityDetail.companyName) ? this.assetLiabilityDetail.companyName : '',
            'currencyCode': (this.assetLiabilityDetail['selectedCurrencyCode']) ? this.assetLiabilityDetail['selectedCurrencyCode']['currencyCode'] : this.assetLiabilityDetail['currencyCode'],
            'country': this.assetLiabilityDetail['country'],
            'description': this.assetLiabilityDetail['description'],
            'fmv': this.assetLiabilityDetail['fmv'],
            'included': this.assetLiabilityDetail['included'],
            'relink': this.assetLiabilityDetail['relink'],
            'liquid': this.assetLiabilityDetail['liquid'],
            // 'managed': 1,
            // 'purchaseAmount': 0,
            // 'purchaseDate': '2018-10-02T04:22:07.734Z',
        };

        if (this.fromPage === 'implementation') {
            obj['commisBe'] = 1;
            obj['purchaseAmount'] = this.assetLiabilityDetail['purchaseAmount'];
        }

        if (this.accountDetails.loanFlag === 1) {
            obj['liability'] = {
                'amountBorrowed': (this.assetLiabilityDetail['liability']['amountBorrowed']) ? this.assetLiabilityDetail['liability']['amountBorrowed'] : 0,
                'amountBorrowedDate': (this.assetLiabilityDetail.liability.inceptionDate) ? this.assetLiabilityDetail.liability.inceptionDate : null,
                'compoundFrequency': this.assetLiabilityDetail['liability']['compoundFrequency'] ? parseInt(this.assetLiabilityDetail['liability']['compoundFrequency']['frequencyId'], 10) : 0,
                // 'currencyCode': 'CAD',
                'currentBalance': (this.assetLiabilityDetail.liability.currentBalance) ? this.assetLiabilityDetail.liability.currentBalance : 0,
                'currentDate': this.assetLiabilityDetail['inceptionDate'],
                'description': this.assetLiabilityDetail.liability.description,
                'interestRate': (this.assetLiabilityDetail.liability.interestRate) ? this.assetLiabilityDetail.liability.interestRate : 0,
                // 'interestType': 0,
                'loanAccount': this.assetLiabilityDetail.liability.loanAccount,
                'loanInsured': (this.assetLiabilityDetail.liability.loanInsured) ? 1 : 0,
                'loanType': this.assetLiabilityDetail['liability']['loanType'] ? parseInt(this.assetLiabilityDetail['liability']['loanType']['loanTypeId'], 10) : 0,
                'paymentAmount': (this.assetLiabilityDetail.liability.paymentAmount) ? this.assetLiabilityDetail.liability.paymentAmount : 0,
                'paymentFrequency': this.assetLiabilityDetail['liability']['paymentFrequency'] ? parseInt(this.assetLiabilityDetail['liability']['paymentFrequency']['frequencyId'], 10) : 0,
                'paymentType': (this.assetLiabilityDetail['liability']['paymentType']) ? parseInt(this.assetLiabilityDetail['liability']['paymentType']['paymentTypeId'], 10) : 0,
                'treatmentOnDeath': (this.assetLiabilityDetail['liability']['treatmentOnDeath']) ? parseInt(this.assetLiabilityDetail['liability']['treatmentOnDeath']['treatmentOnDeathTypeId'], 10) : 0,
                // 'prod_type': '2',
                // 'productCode': 'GEN61',
                // 'renewalAmount': 0,
                'renewalDate': (this.assetLiabilityDetail.liability.renewalDate) ? this.assetLiabilityDetail.liability.renewalDate : null
            };
        }

        let disposition = null;
        if (this.accountDetails.dispositionFlag === ACCOUNT_FLAG.ON && this.accessRights['DISPOSITION']['accessLevel'] > 0) {
            const inclusion_rate = this.dispositionObject.inclusionRate ? parseFloat(this.dispositionObject.inclusionRate.toString().replace('%', '')) : 0;
            disposition = {
                'disposition_year': this.dispositionObject.disposition_year ? this.dispositionObject.disposition_year : 0,
                'payout_period': this.dispositionObject.payout_period ? this.dispositionObject.payout_period : 0,
                'growrate_to_disp': this.dispositionObject.growrate_to_disp ? parseFloat(this.dispositionObject.growrate_to_disp.toString().replace('%', '')) : 0,
                'growrate_during_disp': this.dispositionObject.growrate_during_disp ? parseFloat(this.dispositionObject.growrate_during_disp.toString().replace('%', '')) : 0,
                'client_exemption': this.dispositionObject.client_exemption ? parseFloat(this.dispositionObject.client_exemption.toString()) : 0,
                'inclusionRate': inclusion_rate,
                'modeltype': this.dispositionObject.modeltype ? parseInt(this.dispositionObject.modeltype.toString()) : 0,
                'income_est': this.dispositionObject.income_est ? parseFloat(this.dispositionObject.income_est.toString().replace('%', '')) : 0,
                'disp_ondeath': this.dispositionObject.disp_ondeath ? this.dispositionObject.disp_ondeath : 0,
                'disp_ondisability': this.dispositionObject.disp_ondisability ? this.dispositionObject.disp_ondisability : 0,
                'assetnum': this.dispositionObject.assetnum ? this.dispositionObject.assetnum : 0,
                'scenario': this.selectedScenario.id,
                'update_disposition': this.dispositionObject.update_disposition ? this.dispositionObject.update_disposition == true ? 1 : 0 : 0
            };
        }

        if (this.accountDetails.recaptureFlag === ACCOUNT_FLAG.ON && this.accessRights['RECAP']['accessLevel'] > 0) {
            const depreciable = this.dispositionObject.depreciable ? this.dispositionObject.depreciable : 0;
            const cur_depreciation = this.dispositionObject.cur_depreciation ? this.dispositionObject.cur_depreciation : 0;
            const rate = this.dispositionObject.depreciation_rate ? parseFloat(this.dispositionObject.depreciation_rate.toString().replace('%', '')) : 0;
            disposition = {
                ...disposition,
                'depreciable': depreciable,
                'cur_depreciation': cur_depreciation,
                'depreciation_rate': rate,
                'depreciation_type': this.dispositionObject.depreciation_type ? this.dispositionObject.depreciation_type : 0
            }
        }

        if (disposition) {
            obj['disposition'] = [];
            obj['disposition'].push(disposition);
        }


        if (this.assetLiabilityDetail.productNumber !== null) {

            obj['productNumber'] = this.assetLiabilityDetail.productNumber;
            obj['productCode'] = this.assetLiabilityDetail.productCode;
            obj['units'] = this.unitsChanged? this.assetLiabilityDetail.displayUnits : this.assetLiabilityDetail.units;
            obj['subProductNumber'] = this.assetLiabilityDetail.subProductNumber;
            obj['subProductName'] = this.assetLiabilityDetail.subProductName;
            obj['description'] = this.assetLiabilityDetail.subProductName;
            if (this.assetLiabilityDetail.productType !== null) {
                // obj['prod_type'] = this.assetLiabilityDetail.productType;
                obj['prod_type'] = '2';
            } else {
                delete obj['prod_type'];
            }

            delete obj['description'];
        } else {
            obj['prod_type'] = this.assetLiabilityDetail['prod_type']['id'];
        }

        if (this.assetLiabilityDetail.isAdd || this.assetLiabilityDetail.IsCustom) {
            this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'ASSET_LIABILITY.HOLDING_ACCOUNT.SAVE_CHANGES_MESSAGE','ALERT_MESSAGE.ERROR_TITLE'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    this.planningService.addHolding(obj, this.accountDetails['id']).toPromise().then(result => {
                        if (result) {
                            this.Change.emit();
                            this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                            this.profileService.getInvestmentData(this.clientId);
                            this.advisorService.getInvestmentPayload();
                            this.advisorService.getAdvisorNetWorthPayload();
                            Swal(res['ALERT_MESSAGE.SUCCESS_TITLE'], res['ASSET_LIABILITY.HOLDING_ACCOUNT.SAVE_CHANGES_MESSAGE'],
                                'success');
                            this.saveDisable = false;

                            if (this.fromPage === 'implementation') {
                                this.refreshDataService.changeMessage('added_custom_product');
                                this.refreshDataService.newCustomProduct('{}');
                                this.router.navigate(['/client/' + this.clientId + '/planning/portfolios/' + this.portfolioId + '/implementation']);
                            }
                        }
                    }).catch(error => {
                        Swal(res['ALERT_MESSAGE.ERROR_TITLE'], error['error']['errorMessage'], 'error');
                        this.saveDisable = false;
                    });
                });
        } else {
            obj['assetKey'] = this.assetLiabilityDetail['assetKey'];
            this.translate.get(['ALERT_MESSAGE.SUCCESS_TITLE', 'ASSET_LIABILITY.HOLDING_ACCOUNT.SAVE_CHANGES_MESSAGE', 'ALERT_MESSAGE.ERROR_TITLE'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                    this.planningService.saveAssetAndLiabilityDetail(obj, this.accountDetails['id']).toPromise().then(result => {
                        if (result) {
                            this.Change.emit();
                            this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                            this.profileService.getInvestmentData(this.clientId);
                            this.advisorService.getInvestmentPayload();
                            this.advisorService.getAdvisorNetWorthPayload();
                            Swal(res['ALERT_MESSAGE.SUCCESS_TITLE'], res['ASSET_LIABILITY.HOLDING_ACCOUNT.SAVE_CHANGES_MESSAGE'], 'success');
                            this.saveDisable = false;
                        }
                    }).catch(error => {
                        Swal(res['ALERT_MESSAGE.ERROR_TITLE'], error['error']['errorMessage'], 'error');
                        this.saveDisable = false;
                    });
                });
        }
    }
    totalAllocation() {
        this.totalBreakDown = 0;
        if (!this.assetLiabilityDetail.assetsBreakdown) {
            this.assetLiabilityDetail.assetsBreakdown = [];
        }
        this.assetLiabilityDetail.assetsBreakdown.forEach(item => {
            this.totalBreakDown += parseFloat(item.allocationPercent);
        });
    }

    changeCurrencyCode() {
        this.assetLiabilityDetail.currencyCode = this.assetLiabilityDetail.selectedCurrencyCode.currencyCode.trim();
        this.currencyMask = createNumberMask({
            prefix: getCurrencySymbol(this.assetLiabilityDetail.currencyCode, 'narrow'),
            allowDecimal: true
        });
    }

    checkPriceAndMarketValue(event, value) {
        if (event.key) {
            if (value === 'unit' && this.assetLiabilityDetail.productFmv > 0) {
                this.assetLiabilityDetail.fmv = (this.assetLiabilityDetail.displayUnits * this.assetLiabilityDetail.productFmv).toFixed(0);
                this.unitsChanged = true;
            } else if (value === 'marketValue' && this.assetLiabilityDetail.productFmv > 0) {
                this.assetLiabilityDetail.units = (this.assetLiabilityDetail.fmv / this.assetLiabilityDetail.productFmv).toFixed(8);
                this.assetLiabilityDetail.displayUnits = parseFloat(this.assetLiabilityDetail.units).toFixed(4);
                this.unitsChanged = false;
            }else{
                this.unitsChanged = false;
            }
        }
    }

    clearData() {
        if (this.fromPage === 'implementation') {
            this.refreshDataService.changeMessage('added_custom_product');
            this.refreshDataService.newCustomProduct('{}');
            this.router.navigate(['/client/' + this.clientId + '/planning/portfolios/' + this.portfolioId + '/implementation']);
        } else {
            this.assetLiabilityDetail = JSON.parse(JSON.stringify(this.customProductValue));
            this.initializeData();
            this.refreshDataService.changeMessage('cancel_holdings');
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
