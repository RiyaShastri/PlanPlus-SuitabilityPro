import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { PageTitleService } from '../../shared/page-title';
import { AccessRightService } from '../../shared/access-rights.service';
import {AdvisorService} from "../../advisor/service/advisor.service";
import {Login} from "../../shared/app.actions";
import {Store} from "@ngrx/store";
import {AppState} from "../../shared/app.reducer";
import {UserAuthService} from "../../auth/user-auth.service";

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

    public clientId: string;
    accessRights = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private store: Store<AppState>,
        private authService: UserAuthService,
        private advisorService: AdvisorService
    ) {
        this.angulartics2.eventTrack.next({ action: 'clientOverview' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.CLIENT_OVERVIEW_TITLE');
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    async ngOnInit() {
        this.accessRightService.getAccess(['WEB07', 'POB01', 'SCH01', 'HMOGL', 'RISKTOLERCLIENT', 'CLIVALUES', 'COLLAB', 'CLI02', 'NETWORTHTILE', 'INVESTTILE'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res) {
                    this.accessRights = res;
                }
            });

      await this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(async param => {
        if (param['sso'] !== undefined) {
          this.store.dispatch(new Login());
          window.localStorage.setItem('modelPopup', 'true');
          window.localStorage.setItem('isSSO', param['sso']);
          this.authService.localStorageFetcher.emit(window.localStorage);
        }
        if (param['migrated'] !== undefined) {
          await this.advisorService.migrateAdvisor();
        }
      });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
