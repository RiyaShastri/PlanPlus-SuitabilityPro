import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState, getAdvisorPayload } from '../shared/app.reducer';
import { SettingService } from './service';
import { AdvisorService } from '../advisor/service/advisor.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-setting',
    templateUrl: './setting.component.html',
    styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit, OnDestroy {
    clientId;
    advisorCountry = 'can';
    advisorRegion = '0001';
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private translate: TranslateService,
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private settingService: SettingService
    ) {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.advisorCountry = res['country'];
                this.advisorRegion = res['region'];
            }
        });
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.settingService.getTranslation(this.advisorCountry, this.advisorRegion);
        });
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res['country']) {
                this.advisorCountry = res['country'];
                this.settingService.getTranslation(this.advisorCountry, this.advisorRegion);

            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
