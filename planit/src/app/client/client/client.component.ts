
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Angulartics2 } from 'angulartics2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import {
    AppState, getAdvisorPayload,
    getClientPayload
} from '../../shared/app.reducer';
import { SettingService } from '../../setting/service';
import { PlanningService } from '../service';
import { RefreshDataService } from '../../shared/refresh-data';
import { GENERATE_REPORT_PREVIOUS_URL } from '../../shared/constants';
import { AccessRightService } from '../../shared/access-rights.service';

@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit, OnDestroy {

    public clientId: string;
    public familyName: string;
    public clientData = {};
    public people: any;
    accessRights = {};
    clientCountry = 'can';
    region = '0001';
    GENERATE_REPORT_PREVIOUS_URL = GENERATE_REPORT_PREVIOUS_URL;
    searchNotes;
    calculator = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private accessRightService: AccessRightService,
        private planningService: PlanningService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private settingService: SettingService,
        private datasharing: RefreshDataService,
        private router: Router
    ) {
        this.angulartics2.eventTrack.next({ action: 'client' });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
            localStorage.setItem('currentClientId', this.clientId);
        });
        window.scrollTo(0, 0);
    }

    async ngOnInit() {

        this.accessRightService.getAccess(['WEB07', 'NOT01', 'CLNTE', 'REPORTPANEL',
            'CAL07_SP', 'DCONS_SP', 'LEVRG_SP', 'CAL01_SP', 'CAL02_SP', 'CAL08_SP', 'CAL09_SP']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res) {
                    this.accessRights = res;
                    this.searchNotes = this.accessRights['CLNTE']['accessLevel'] > 0;
                    this.calculator = this.accessRights['CAL07_SP']['accessLevel'] > 0 || this.accessRights['DCONS_SP']['accessLevel'] > 0 || this.accessRights['LEVRG_SP']['accessLevel'] > 0 ||
                        this.accessRights['CAL01_SP']['accessLevel'] > 0 || this.accessRights['CAL02_SP']['accessLevel'] > 0 || this.accessRights['CAL08_SP']['accessLevel'] > 0 ||
                        this.accessRights['CAL09_SP']['accessLevel'] > 0;
                }
            });

        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.region = res['region'];
            } else {
                // this.advisorService.getAdvisorPayload();
            }
        });
        await this.planningService.loadStoreData(this.clientId);
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.settingService.getTranslation(this.clientCountry, this.region);
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            if (Object.keys(clientData).length > 0) {
                this.getClientName(clientData);
            }
            if (clientData && clientData['planningCountry']) {
                this.clientCountry = clientData['planningCountry'];
                this.settingService.getTranslation(this.clientCountry, this.region);
            }
        });
    }

    getClientName(clientData) {
        let clientName = clientData.firstName;
        if (clientData.lastName === clientData.spouseLastName) {
            clientName += ' & ' + clientData.spouseFirstName;
            clientName += '<br> ' + clientData.lastName;
        } else {
            clientName += ' ' + clientData.lastName;
            if (clientData.spouseFirstName && clientData.spouseLastName) {
                clientName += ' &<br>' + clientData.spouseFirstName + ' ' + clientData.spouseLastName;
            }
        }
        this.familyName = clientName;
    }

    goToGenerateReport() {
        const url = this.router.url;
        let data;
        if (url.includes('assets-liabilities')) {
            data = this.GENERATE_REPORT_PREVIOUS_URL.ASSETS_LIABILITY;
        } else if (url.includes('portfolios')) {
            data = this.GENERATE_REPORT_PREVIOUS_URL.PORTFOLIO;
        } else if (url.includes('goals')) {
            data = this.GENERATE_REPORT_PREVIOUS_URL.GOAL;
        } else if (url.includes('cash-flow-management')) {
            data = this.GENERATE_REPORT_PREVIOUS_URL.CASHFLOW_MANAGEMENT;
        } else if (url.includes('estate')) {
            data = this.GENERATE_REPORT_PREVIOUS_URL.ESTATE_PLANNING;
        } else if (url.includes('entity') || url.includes('entities')) {
            data = this.GENERATE_REPORT_PREVIOUS_URL.ENTITY;
        } else {
            data = 'none';
        }
        this.datasharing.changeMessage('go_to_generateReport|' + JSON.stringify(data));
        this.router.navigate(['client/' + this.clientId + '/generate-report']);
    }

    goToCalculator() {
        const url = this.router.url;
        this.datasharing.changeMessage('Go_To_Calculator|' + JSON.stringify(url));
        this.router.navigate(['client/' + this.clientId + '/calculators']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
