import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../shared/animations';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState, getCountryPayload, getLangualePayload } from '../../shared/app.reducer';
import { ClientProfileService } from '../../client/service';
import { RefreshDataService } from '../../shared/refresh-data';
import { Router } from '@angular/router';
import { SettingService } from '../service';
import Swal from 'sweetalert2';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';


@Component({
    selector: 'app-translations',
    templateUrl: './translations.component.html',
    styleUrls: ['./translations.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class TranslationsComponent implements OnInit, OnDestroy {
    viewBy = [
        { id: 0, name: 'LANGUAGE' },
        { id: 1, name: 'JURISDICTION' }
    ];
    selectedViewBy = this.viewBy[0];
    drop2Items = [];
    drop2Selected = {};
    languages = [];
    countries = [];
    drop2selctedView = {};
    public originalMessageValue = '';
    countryModel = {};
    languageModel = {};
    translateItems = [];
    regionArray = [];
    region = {};
    isGlobalRegion = false;
    goToLandingScreen = false;
    closeButtonDisable = false;
    brandingSelection = 0;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private store: Store<AppState>,
        private clientProfileService: ClientProfileService,
        private refreshDataService: RefreshDataService,
        private router: Router,
        private settingService: SettingService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'translationSidePanel' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.TRANSLATION_TITLE');
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('solution_name|')) {
                this.originalMessageValue = message.replace('solution_name|', '');
            } else if (message.includes('solution_family_name|')) {
                this.originalMessageValue = message.replace('solution_family_name|', '');
                this.goToLandingScreen = true;
            } else if (message.includes('branding_translation|')) {
                const obj = JSON.parse(message.replace('branding_translation|', ''));
                this.originalMessageValue = obj.input;
                this.brandingSelection = obj.selection;
            } else {
                this.router.navigate(['/settings', 'preferred-solutions']);
            }
        });
    }

    async ngOnInit() {
        await this.settingService.checkJurisdictions().toPromise().then(resultJuridict => {
            if (resultJuridict) {
                this.countries.push({ id: 0, name: 'JURISDICTION' });
                resultJuridict.forEach(juridic => {
                    this.countries.push({
                        id: juridic.countryCode,
                        name: juridic.country
                    });
                });
            }
        }).catch(error => {
            this.countries = [];
        });
        await this.settingService.getAccesibleLanguage().toPromise().then(resultlang => {
            if (resultlang) {
                this.languages.push({ id: 0, name: 'LANGUAGE' });
                resultlang.forEach(language => {
                    this.languages.push({ id: language.langcode, name: language.lang });
                });
            }
            this.fillDropdown2();
        }).catch(error => {
            this.languages = [];
        });

        await this.settingService.getRegion().toPromise().then(region => {
            this.regionArray = [];
            this.regionArray.push({
                'regionName': region['regionName'],
                'regionCode': region['regionCode'],
                'childRegions': (region['childRegions'].length > 0) ? this.getChildData(region['childRegions']) : []
            });
        });
        if (this.regionArray) {
            this.isRegionDropdown(this.regionArray);
        }
    }

    getChildData(childDataArray) {
        this.regionArray = [];
        childDataArray.forEach(chiledRegion => {
            this.regionArray.push({
                'regionName': chiledRegion['regionName'],
                'regionCode': chiledRegion['regionCode'],
                'childRegions': (chiledRegion['childRegions'].length > 0) ? JSON.parse(JSON.stringify(this.getChildData(chiledRegion['childRegions']))) : []
            });
        });
        if (this.regionArray) {
            this.isRegionDropdown(this.regionArray);
        }
        return this.regionArray;
    }

    isRegionDropdown(regionArray) {
        let ans = false;
        regionArray.forEach(region => {
            ans = region['regionCode'].includes('0001');
        });
        if (ans) {
            this.isGlobalRegion = true;
        } else {
            this.isGlobalRegion = false;
        }
    }

    viewByChanged(selectedViewBy) {
        this.selectedViewBy = selectedViewBy;
        this.drop2selctedView = {};
        this.fillDropdown2();
    }

    fillDropdown2() {
        if (this.selectedViewBy.id === 0) {
            this.drop2Items = Object.assign([], this.countries);
            this.translateItems = Object.assign([], this.languages);
        } else {
            this.drop2Items = Object.assign([], this.languages);
            this.translateItems = Object.assign([], this.countries);
        }
        this.drop2Selected = this.drop2Items[0];
    }

    drop2select(drop2selctedValue) {
        if (drop2selctedValue.name === 'LANGUAGE' || drop2selctedValue.name === 'JURISDICTION') {
            this.drop2selctedView = {};
        } else {
            this.drop2selctedView = drop2selctedValue;
        }
    }

    addTranslation(f) {
        const reqObj = {
            'filter': this.drop2selctedView['id'],
            'keyPhraseMap': this.countryModel,
            'region': this.region['regionCode'] ? this.region['regionCode'] : this.regionArray[0].regionCode,
            'viewBy': this.selectedViewBy.id
        };
        this.settingService.saveTranslation(reqObj).toPromise().then(response => {
            if (response) {
                this.translate.get(['TRANSLATION.POPUP.SUCCESS', 'ALERT_MESSAGE.SUCCESS_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['TRANSLATION.POPUP.SUCCESS'], 'success');
                });
                if (this.goToLandingScreen) {
                    this.refreshDataService.changeMessage('refereshPrefferedSolutions');
                    this.router.navigate(['/settings', 'preferred-solutions']);
                } else {
                    this.back();
                }
            }
        }).catch(errorResponse => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
            });
        });
    }

    sorting(event) {
        this.region = event;
    }

    back() {
        if (this.goToLandingScreen) {
            this.refreshDataService.changeMessage('refereshPrefferedSolutions');
            this.router.navigate(['/settings', 'preferred-solutions']);
            return;
        }
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
