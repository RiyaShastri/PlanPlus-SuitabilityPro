import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageTitleService } from '../../shared/page-title';
import { AppState, getAdvisorPayload } from '../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { AdvisorService } from '../../advisor/service/advisor.service';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-subscriptions',
    templateUrl: './subscriptions.component.html',
    styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
    unsubscribe$;
    constructor(
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private pageTitleService: PageTitleService
    ) { }
    role = 'Advisor';
    userLicences = [];
    advisorDetails = {};
    window = window;
    environment = environment;
    isSSO = false;

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.SUBSCRIPTION_TITLE');
        this.unsubscribe$ = this.store.select(getAdvisorPayload).subscribe(advisorDetails => {
            if (advisorDetails) {

                this.advisorService.getUserLicences().toPromise().then(res => {
                    this.userLicences = res;
                    this.userLicences.forEach(obj => {
                        if (advisorDetails['licenses'].includes(obj['licenseName'])) {
                            obj['authorized'] = true;
                        } else {
                            obj['authorized'] = false;
                        }
                    });
                }).catch(err => {
                });
                this.advisorDetails = advisorDetails;
            }
        });
      this.isSSO = window.localStorage.getItem('isSSO') === 'true' ? true : false;
    }

    ngOnDestroy() {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }
}
