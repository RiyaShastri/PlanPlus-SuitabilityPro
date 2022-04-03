import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SettingService } from '../../setting/service';
import { AdvisorService } from '../service/advisor.service';
import { ClientProfileService, DocumentService } from '../../client/service';
import { AppState, getProvincePayload, getCountryPayload, getLangualePayload, getclientDocumentTypePayload } from '../../shared/app.reducer';

@Component({
    selector: 'app-advisor',
    templateUrl: './advisor.component.html',
    styleUrls: ['./advisor.component.css']
})
export class AdvisorComponent implements OnInit, OnDestroy {
    plannerDetail = {};
    plannerName = '';
    advisorCountry = 'CAN';
    region = '';
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private profileService: ClientProfileService,
        private advisorService: AdvisorService,
        private documentService: DocumentService,
        private translate: TranslateService,
        private settingService: SettingService
    ) { }

    ngOnInit() {
        this.advisorService.getAdvisorDetail().toPromise().then(res => {
            this.plannerDetail = res;
            this.plannerName = res['firstName'];
            this.advisorCountry = res['country'];
            this.region = res['region'];
            this.settingService.getTranslation(this.advisorCountry, this.region);
        }).catch(errorResponse => {
            this.plannerDetail = {};
            this.plannerName = window.localStorage.getItem('plannerName');
        });
        this.store.select(getProvincePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(proviceData => {
            if (!proviceData) {
                this.profileService.getProvince();
            }
        });
        this.store.select(getCountryPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(countryData => {
            if (!countryData) {
                this.profileService.getCountry();
            }
        });
        this.store.select(getLangualePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(languageData => {
            if (!languageData) {
                this.profileService.getLanguages();
            }
        });
        this.store.select(getclientDocumentTypePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(documentTypeData => {
            if (!documentTypeData) {
                this.documentService.getClientDocumentType();
            }
        });
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.settingService.getTranslation(this.advisorCountry, this.region);
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
