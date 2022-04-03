import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../shared/animations';
import { Location, getCurrencySymbol } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  AppState,
  getCountryPayload,
  getClientPayload,
  getAllCountryFormatePayload
} from '../../../../shared/app.reducer';
import { ClientProfileService, GoalService } from '../../../service';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import {a} from "@angular/core/src/render3";

@Component({
    selector: 'app-education-institution',
    templateUrl: './education-institution.component.html',
    styleUrls: ['./education-institution.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class EducationInstitutionComponent implements OnInit, OnDestroy {
    model = <any>{};
    country = [];
    clientData = {};
    institutonList = [];
    cost;
    costOriginal;
    currencyCode;
    currencySymbol;
    clientCurrencyCode;
    clientCurrencySymbol;
    clientId;
    goalId;
    currentModel = {};
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private _location: Location,
        private store: Store<AppState>,
        private profileService: ClientProfileService,
        private goalService: GoalService,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private refreshDataService: RefreshDataService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.EDUCATION_INSTITUTION');
        this.angulartics2.eventTrack.next({ action: 'educationInstitution' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.goalId = params['goalId'];
        });
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('education_added|')) {
                this.currentModel = JSON.parse(message.replace('education_added|', ''));
            }
        });
    }

    async ngOnInit() {
        await this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        await this.store.select(getCountryPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(countryData => {
            if (countryData) {
                this.country = countryData;
                if (this.country.length > 0 && this.clientData) {
                    this.model['country'] = this.country.find(count => count.countryCode === this.clientData['planningCountry']);
                  this.clientCurrencyCode = this.model['country']['currencyCode'];
                  this.clientCurrencySymbol = this.model['country']['currencySymbol'];
                    this.model['tuition'] = 'resident';
                    this.model['roomBoard'] = true;
                    if (this.model['country']) {
                        this.selectCountry(this.model['country']);
                    }
                }
            } else {
                this.profileService.getCountry();
            }
        });
    }

    selectCountry(country) {
        this.goalService.getInstitutionList(country.countryCode).toPromise().then(response => {
            this.institutonList = response;
              const item = this.country.find(value => value['countryCode'] === country.countryCode);
              this.currencyCode = item['currencyCode'];
              this.currencySymbol = item['currencySymbol'];
        }).catch(error => {
        });
    }

    institutionCost() {
        if (this.model['institution']) {
            this.goalService.getInstitutionCost(this.model['institution'].institutionId, (this.model['tuition'] === 'resident'), this.model['roomBoard'], this.clientId).toPromise().then(cost => {
                this.cost = cost['institutionCost'];
                this.costOriginal = cost['institutionCostOriginal'];
            });
        }
    }

    addEducationIstitution() {
        if (this.goalId) {
            this.refreshDataService.changeMessage('on_edit_goal_education_add|' + JSON.stringify(this.cost));
            this.router.navigate(['/client', this.clientId, 'planning', 'goals', this.goalId, 'edit-goal']);
        } else {
            if (!this.goalId && JSON.stringify(this.currentModel) !== '{}') {
                this.currentModel['cost'] = this.cost;
                this.refreshDataService.changeMessage('add_goal_education_institution_added|' + JSON.stringify(this.currentModel));
                this.router.navigate(['/client', this.clientId, 'planning', 'goals', 'summary', 'add-goal']);
            }
        }
    }

    back() {
        if (!this.goalId && JSON.stringify(this.currentModel) !== '{}') {
            this.refreshDataService.changeMessage('add_goal_education_institution_added|' + JSON.stringify(this.currentModel));
            this.router.navigate(['/client', this.clientId, 'planning', 'goals', 'summary', 'add-goal']);
        } else {
            this._location.back();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
