import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { SettingService } from '../../service';
import { RatesOfReturn } from '../../settings-models';
import { environment } from '../../../../environments/environment';
import { PageTitleService } from '../../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { RefreshDataService } from '../../../shared/refresh-data';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { TranslateService } from '@ngx-translate/core';
import { AccessRightService } from '../../../shared/access-rights.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-rates-of-return',
    templateUrl: './rates-of-return.component.html',
    styleUrls: ['./rates-of-return.component.css']
})
export class RatesOfReturnComponent implements OnInit, OnDestroy {
    editDisabled = true;
    methodology = 'Real rates';
    ratesToApply = 'Default';
    inflation: any = {};
    corporateDefined = false;
    ratesOfReturnResponse: any = {};
    backupResp = {};
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 2
    });
    percentMask1 = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    assetClasses = [];
    ratesOfReturnClone = {};
    cmaAcceptance = false;
    isEditable = false;
    regions = [];
    countries = [];
    country = {};
    region = {};
    resAssetClasses = [];
    assetIdMapping = {};
    saveDisable = false;
    showRegion = false;
    accessRights = {};
    disableCMACheckbox = environment['disableCMACheckbox'];
    private unsubscribe$ = new Subject<void>();
    constructor(
        private settingService: SettingService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private refreshDataService: RefreshDataService,
        private accessRightService: AccessRightService,
        private advisorService: AdvisorService,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'CMAreatesOfReturn' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.RATES_OF_RETURNS_TITLE');
        // if (this.ratesOfReturnResponse['corporateDefined']) {
        //     this.corporateDefined = this.ratesOfReturnResponse['corporateDefined'];
        //     this.methodology = this.corporateDefined['methodology'];
        //     this.ratesToApply = this.corporateDefined['ratesToApply'];
        //     this.inflation = this.corporateDefined['inflation'];
        // } else {
        //     this.methodology = this.ratesOfReturnResponse['methodology'];
        //     this.ratesToApply = this.ratesOfReturnResponse['ratesToApply'];
        //     this.inflation = this.ratesOfReturnResponse['inflation'];
        // }
    }

    async ngOnInit() {
        this.countries = await this.settingService.getCountryList().toPromise();
        this.regions = await this.settingService.getRegionList().toPromise();
        this.settingService.getTranslation(this.country['countryCode'], this.region['regionId']);
        // await this.settingService.getRatesOfReturnDetails().toPromise().then(res => {
        //     this.setValues(res);
        // }).catch(error => {
        this.accessRightService.getAccess(['CMAROREDIT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
        this.accessRights = res;
            if (localStorage.getItem('country') && localStorage.getItem('region')) {
                this.country = this.countries.find(x => x.countryCode === localStorage.getItem('country'));
                this.region = this.regions.find(x => x.regionId === localStorage.getItem('region'));
                this.settingService.getTranslation(this.country['countryCode'], this.region['regionId']);
                this.advisorService.getAdvisorDetail().toPromise().then(res => {
                    this.showRegion = res['clientFilter'] === 4;
                    this.editDisabled = this.accessRights['CMAROREDIT']['accessLevel'] < 3 || !this.showRegion;
                });
                this.getClassData();
            } else {
                this.advisorService.getAdvisorDetail().toPromise().then(res => {
                    this.country = this.countries.find(x => x.countryCode === res['country']);
                    this.region = this.regions.find(x => x.regionId === res['region']);
                    this.settingService.getTranslation(this.country['countryCode'], this.region['regionId']);
                    this.getClassData();
                    this.showRegion = res['clientFilter'] === 4;
                    this.editDisabled = this.accessRights['CMAROREDIT']['accessLevel'] < 3 || !this.showRegion;
                });
            }
        });
    }

    makeAssetRollup(res) {
        const tempAsset = [];
        const tempAssetMapping = {};
        res.forEach(ratesOfReturns => {
            if (ratesOfReturns.id === ratesOfReturns.parentClass) {
                if (!tempAssetMapping[ratesOfReturns.id] && tempAssetMapping[ratesOfReturns.id] !== 0) {
                    ratesOfReturns['childClass'] = [];
                    tempAsset.push(ratesOfReturns);
                    tempAssetMapping[ratesOfReturns['id']] = tempAsset.length - 1;
                }
            } else {
                if (ratesOfReturns.checked) {
                    ratesOfReturns['childClass'] = [];
                    tempAsset.push(ratesOfReturns);
                    tempAssetMapping[ratesOfReturns['id']] = tempAsset.length - 1;
                } else {
                    let index = tempAssetMapping[ratesOfReturns.parentClass];
                    if (!index && index !== 0) {
                        const missingRatesOfReturns = JSON.parse(JSON.stringify(this.resAssetClasses[this.assetIdMapping[ratesOfReturns.parentClass]]));
                        missingRatesOfReturns['childClass'] = [];
                        tempAsset.push(missingRatesOfReturns);
                        index = tempAsset.length - 1;
                        tempAssetMapping[ratesOfReturns['parentClass']] = index;
                    }
                    tempAsset[index]['childClass'].push(ratesOfReturns);
                }
            }
        });
        this.assetClasses = tempAsset;
    }

    setValues(res) {

        // backup object to load upon cancel changes.
        this.backupResp = JSON.parse(JSON.stringify(res));

        this.country = this.countries.find(x => x.countryCode === res.country);
        this.region = this.regions.find(x => x.regionId === res.region);
        if (res['lastReviewedCMARor']) {
            this.refreshDataService.changeMessage('lastReviewedDate|' + res['lastReviewedCMARor']);
        }

        this.resAssetClasses = JSON.parse(JSON.stringify(res['ratesOfReturns']));
        this.resAssetClasses.forEach((assetClass, key) => {
            this.assetIdMapping[assetClass['id']] = key;
        });
        this.makeAssetRollup(JSON.parse(JSON.stringify(res['ratesOfReturns'])));

        this.ratesOfReturnResponse = res;

        this.methodology = this.ratesOfReturnResponse['methodologyType'];
        this.ratesToApply = this.ratesOfReturnResponse['ratesToApplyType'];
        this.inflation.type = this.ratesOfReturnResponse['inflationType'];
        this.inflation.defRate = this.ratesOfReturnResponse['inflationRate'];
        this.inflation.custRate = this.ratesOfReturnResponse['customInflationRate'];
    }

    assetRollup(assetClass) {
        const index = this.resAssetClasses.findIndex(x => x.id === assetClass.id);
        this.resAssetClasses[index]['checked'] = !assetClass.checked;
        // assetClass.checked = !assetClass.checked;
        this.cmaAcceptance = false;
        this.makeAssetRollup(this.resAssetClasses);
    }

    methodologyChange(type) { }

    rateChange(rateType) {
        this.cmaAcceptance = false;
        if (this.ratesToApply === 'Custom' && rateType === 'Default') {
            this.translate.get([
                'RATES_OF_RETURN.POPUP.RATE_CHANGE_TITLE',
                'RATES_OF_RETURN.POPUP.RATE_CHANGE_TEXT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal({
                    title: i18text['RATES_OF_RETURN.POPUP.RATE_CHANGE_TITLE'],
                    text: i18text['RATES_OF_RETURN.POPUP.RATE_CHANGE_TEXT'],
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Proceed'
                }).then(result => {
                    if (result.value) {
                        this.ratesToApply = rateType;
                        // reset the response to Default values.
                        this.ratesOfReturnResponse = this.backupResp;
                    } else {
                        this.ratesToApply = 'Custom';
                    }
                });
            });
        }
    }

    inflationToApply(inflationType) {
        this.cmaAcceptance = false;
        if (this.inflation['type'] === 'Default') {
            this.translate.get([
                'RATES_OF_RETURN.POPUP.CUSTOME_RATE_CHANGE_TITLE',
                'RATES_OF_RETURN.POPUP.CUSTOME_RATE_CHANGE_TEXT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal({
                    title: i18text['RATES_OF_RETURN.POPUP.CUSTOME_RATE_CHANGE_TITLE'],
                    text: i18text['RATES_OF_RETURN.POPUP.CUSTOME_RATE_CHANGE_TEXT'],
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Proceed'
                }).then(result => {
                    if (result.value) {
                        this.inflation['type'] = inflationType;
                        // reset Custom inflation rate
                        this.inflation['custRate'] = null;
                    } else {
                        this.inflation['type'] = 'Custom';
                    }
                });
            });
        }
    }

    saveChanges(f) {
        this.saveDisable = true;
        if (!this.ratesOfReturnResponse['cmaAcceptanceRor']) {
            this.translate.get(['RATES_OF_RETURN.POPUP.REVIEW_ALERT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Oops...', i18text['RATES_OF_RETURN.POPUP.REVIEW_ALERT'], 'error');
                this.saveDisable = false;
            });
        } else if (f.form.valid) {

            // Some extra fields which is not require as of now
            // 'cmaIncomeDistributionPayloads': [ // income distribution
            //     {
            //         'assetClass': 'string',
            //         'deferredCapitalGains': 0,
            //         'dividend': 0,
            //         'id': 'string',
            //         'intrest': 0,
            //         'nonTaxable': 0,
            //         'printCode': 'string',
            //         'realisedCapitalGains': 0,
            //         'total': 0
            //     }
            // ],

            const obj = {
                'country': this.country['countryCode'], // drop-down
                'region': this.region['regionId'], // drop-down

                'cmaAcceptanceRor': this.ratesOfReturnResponse['cmaAcceptanceRor'],
                'customInflationRate': (this.inflation.type === 'Custom') ? this.inflation.custRate : this.inflation.defRate,
                'inflationType': this.inflation.type,
                'methodologyType': this.methodology,
                'ratesOfReturns': [], // Flat Array
                'ratesToApplyType': this.ratesToApply,
            };

            const assetClasses = JSON.parse(JSON.stringify(this.assetClasses));
            assetClasses.forEach(element => {
                if (element.childClass && element.childClass.length > 0) {
                    element.childClass.forEach(childElement => {
                        obj.ratesOfReturns.push(childElement);
                    });
                }
                delete element.childClass;
                obj.ratesOfReturns.push(element);
            });

            this.settingService.updateRatesOfReturn(obj).toPromise().then(res => {
                this.translate.get(['RATES_OF_RETURN.POPUP.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['RATES_OF_RETURN.POPUP.SUCCESS'], 'success');
                });
                // TODO: save changes here
                // this.isEditable = !this.isEditable;
                localStorage.setItem('country', this.country['countryCode']);
                localStorage.setItem('region', this.region['regionId']);
                this.isEditable = false;
                this.saveDisable = false;
                this.setValues(res);
            }).catch(err => {
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
                this.saveDisable = false;
            });

        }
    }

    cancelChanges() {
        this.isEditable = !this.isEditable;
        this.setValues(this.backupResp);
    }

    getClassData() {
        this.settingService.getTranslation(this.country['countryCode'], this.region['regionId']);
        if ((this.country && JSON.stringify(this.country) !== '{}') && (this.region && JSON.stringify(this.region) !== '{}')) {

            const obj = {
                'country': this.country['countryCode'],
                'region': this.region['regionId']
            };

            // this.settingService.getClassData(this.country['countryCode'], this.region['regionId']).toPromise().then(res => {
            this.settingService.getClassData(obj).toPromise().then(res => {
                this.setValues(res);
            });
        }
    }

    updateDiff() {
        this.assetClasses.forEach(y => {
            if (this.inflation.type === 'Custom') {
                y.defaultNominalFwd = y.defaultReal + this.inflation.custRate;
            } else {
                y.defaultNominalFwd = y.defaultReal + this.inflation.defRate;
            }
            y.nominalAdjustment = y.customNominalFwd - y.defaultNominalFwd;
            y.realAdjustment = y.customReal - y.defaultReal;
            y.childClass.forEach(child => {
                if (this.inflation.type === 'Custom') {
                    child.defaultNominalFwd = child.defaultReal + this.inflation.custRate;
                } else {
                    child.defaultNominalFwd = child.defaultReal + this.inflation.defRate;
                }
                child.nominalAdjustment = child.customNominalFwd - child.defaultNominalFwd;
                child.realAdjustment = child.customReal - child.defaultReal;

            });
        });
    }

    acceptanceChange() {
        this.ratesOfReturnResponse.cmaAcceptanceRor = false;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
