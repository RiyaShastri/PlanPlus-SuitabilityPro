import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { SettingService } from '../../service';
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
    selector: 'app-income-distribution',
    templateUrl: './income-distribution.component.html',
    styleUrls: ['./income-distribution.component.css']
})
export class IncomeDistributionComponent implements OnInit, OnDestroy {
    @ViewChild(NgForm) myForm: NgForm;
    incomeData: any = {};
    defaultIncomeDistribution = [];
    customIncomeDistribution = [];
    incomeDetails: any = {};
    isEditable = false;
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%'
    });
    assetClasses = [];
    hasError = false;
    ID_acceptance = false;
    distribution;
    editDisabled = true;
    regions = [];
    countries = [];
    country = {};
    region = {};
    saveDisable = false;
    showRegion = false;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private pageTitleService: PageTitleService,
        private settingService: SettingService,
        private angulartics2: Angulartics2,
        private accessRightService: AccessRightService,
        private refreshDataService: RefreshDataService,
        private advisorService: AdvisorService,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'CMAIncomeDistribution' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.INCOME_DISTRIBUTION_TITLE');
    }

    async ngOnInit() {
        this.countries = await this.settingService.getCountryList().toPromise();
        this.regions = await this.settingService.getRegionList().toPromise();
        // this.settingService.getTranslation(this.country['countryCode'], this.region['regionId']);
        // await this.settingService.getIncomeDistribution().toPromise().then(res => {
        // await this.settingService.getRatesOfReturnDetails().toPromise().then(res => {
        //     this.setValues(res);
        // }).catch(error => {
        this.accessRightService.getAccess(['CMAINCDISTEDIT']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.accessRights = res;
            if (localStorage.getItem('country') && localStorage.getItem('region')) {
                this.country = this.countries.find(x => x.countryCode === localStorage.getItem('country'));
                this.region = this.regions.find(x => x.regionId === localStorage.getItem('region'));
                this.settingService.getTranslation(this.country['countryCode'], this.region['regionId']);
                this.getClassData(true);
            } else {
                this.advisorService.getAdvisorDetail().toPromise().then(result => {
                    this.country = this.countries.find(x => x.countryCode === result['country']);
                    this.region = this.regions.find(x => x.regionId === result['region']);
                    this.settingService.getTranslation(this.country['countryCode'], this.region['regionId']);
                    this.showRegion = result['clientFilter'] === 4;
                    this.editDisabled = this.accessRights['CMAINCDISTEDIT']['accessLevel'] < 3 || !this.showRegion;
                    this.getClassData(true);
                });
            }
        });
    }

    setValues(res, duplicate) {
        this.country = this.countries.find(x => x.countryCode === res.country);
        this.region = this.regions.find(x => x.regionId === res.region);
        this.ID_acceptance = res['cmaAcceptanceIncDist'];

        this.assetClasses = res['cmaIncomeDistributions'];

        if (res['lastReviewedCMAIncDist']) {
            this.refreshDataService.changeMessage('lastReviewedDate|' + res['lastReviewedCMAIncDist']);
        } else {
            this.refreshDataService.changeMessage('lastReviewedDate|' + ''); // To display N/A on the screen
        }

        // this.assetClasses.forEach(asset => {
        //     // for default distribution
        //     this.defaultIncomeDistribution.push(
        //         {
        //             assetClass: asset['assetClass'],
        //             interest: asset['interest'],
        //             dividend: asset['dividend'],
        //             deferredCapitalGains: asset['deferredCapitalGains'],
        //             realisedCapitalGains: asset['realisedCapitalGains'],
        //             nonTaxable: asset['nonTaxable'],
        //         }
        //     );
        //     // displayed default data for custom also for now.
        //     this.customIncomeDistribution.push(
        //         {
        //             assetClass: asset['assetClass'],
        //             interest: asset['interest'],
        //             dividend: asset['dividend'],
        //             deferredCapitalGains: asset['deferredCapitalGains'],
        //             realisedCapitalGains: asset['realisedCapitalGains'],
        //             nonTaxable: asset['nonTaxable'],
        //         }
        //     );
        // });

        this.incomeDetails['distribution_to_apply'] = res['distributionToApply'];
        this.distribution = this.incomeDetails['distribution_to_apply'];
        if (this.incomeDetails['distribution_to_apply'] === 'Default') {
            this.defaultIncomeDistribution = res['cmaIncomeDistributions'];
            this.incomeDetails.income_distribution = res['cmaIncomeDistributions'];
        } else {
            this.customIncomeDistribution = res['cmaIncomeDistributions'];
            this.incomeDetails.income_distribution = res['cmaIncomeDistributions'];
        }
        this.incomeDetails.income_distribution.forEach(item => {
            item['total'] = item.interest + item.dividend + item.realisedCapitalGains
                + item.deferredCapitalGains + item.nonTaxable;
        });
        if (duplicate) {
            this.incomeData = JSON.parse(JSON.stringify(this.incomeDetails));
        }
    }

    distributionChange(value) {
        if (value === 'Default' && this.distribution === 'Custom') {
            this.translate.get([
                'SETTINGS.INCOME_DISTRIBUTION.POPUP.CUSTOM_ALERT_TITLE',
                'SETTINGS.INCOME_DISTRIBUTION.POPUP.CUSTOM_ALERT_TEXT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal({
                    title: i18text['SETTINGS.INCOME_DISTRIBUTION.POPUP.CUSTOM_ALERT_TITLE'],
                    text: i18text['SETTINGS.INCOME_DISTRIBUTION.POPUP.CUSTOM_ALERT_TEXT'],
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Proceed'
                }).then(result => {
                    if (result.value) {
                        this.getClassData(false);
                    } else {
                        this.incomeDetails['distribution_to_apply'] = 'Custom';
                        this.distribution = this.incomeDetails['distribution_to_apply'];
                    }
                });
            });
        } else {
            this.getClassData(false);
        }
    }

    getTotal(value, item) {
        item['total'] = item.interest + item.dividend + item.realisedCapitalGains
            + item.deferredCapitalGains + item.nonTaxable;
        let hasError = false;
        this.incomeDetails['income_distribution'].forEach(element => {
            if (element['total'] !== 100) {
                hasError = true;
            }
        });
        if (hasError) {
            this.hasError = true;
        } else {
            this.hasError = false;
        }
    }

    cancelChanges(f: NgForm) {
        this.incomeDetails = JSON.parse(JSON.stringify(this.incomeData));
        this.isEditable = !this.isEditable;
        this.hasError = false;
    }

    updateIncomeDistribution(f: NgForm) {
        this.saveDisable = true;
        if (!this.ID_acceptance) {
            this.translate.get(['SETTINGS.INCOME_DISTRIBUTION.POPUP.REVIEW_ALERT', 'ALERT_MESSAGE.OOPS_TEXT'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], i18text['SETTINGS.INCOME_DISTRIBUTION.POPUP.REVIEW_ALERT'], 'error');
            });
            this.saveDisable = false;
        } else if (!f.form.valid) {
            this.translate.get(['SETTINGS.INCOME_DISTRIBUTION.POPUP.REQUIRED_FIELDS_ALERT', 'ALERT_MESSAGE.OOPS_TEXT'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], i18text['SETTINGS.INCOME_DISTRIBUTION.POPUP.REQUIRED_FIELDS_ALERT'], 'error');
            });
            this.saveDisable = false;
        } else {
            const obj = {
                'country': this.country['countryCode'], // drop-down
                'region': this.region['regionId'], // drop-down
                'cmaAcceptanceIncDist': this.ID_acceptance,
                'cmaIncomeDistributions': this.incomeDetails['income_distribution'],
                'distributionToApply': this.incomeDetails['distribution_to_apply'],
            };

            this.settingService.updateIncomeDistribution(obj).toPromise().then(res => {
                this.translate.get(['SETTINGS.INCOME_DISTRIBUTION.POPUP.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE'])
                .pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['SETTINGS.INCOME_DISTRIBUTION.POPUP.SUCCESS'], 'success');
                });
                localStorage.setItem('country', this.country['countryCode']);
                localStorage.setItem('region', this.region['regionId']);
                this.isEditable = false;
                this.saveDisable = false;
                this.setValues(res, true);
            }).catch(err => {
                this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
                this.saveDisable = false;
            });

        }
    }

    getClassData(duplicate) {
        this.settingService.getTranslation(this.country['countryCode'], this.region['regionId']);
        if ((this.country && JSON.stringify(this.country) !== '{}') && (this.region && JSON.stringify(this.region) !== '{}')) {

            const obj = {
                'country': this.country['countryCode'],
                'region': this.region['regionId'],
                'distributionToApply': this.incomeDetails['distribution_to_apply'],
            };

            // this.settingService.getClassData(this.country['countryCode'], this.region['regionId']).toPromise().then(res => {
            this.settingService.getClassData(obj).toPromise().then(res => {
                if (res.cmaIncomeDistributions.length === 0 && this.incomeDetails['distribution_to_apply'] === 'Custom') {
                    return;
                }
                this.setValues(res, duplicate);
            });

        }
    }

    changeAcceptance() {
        this.ID_acceptance = false;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
