import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Angulartics2 } from 'angulartics2';
import { Login } from '../../shared/app.actions';
import { AppState } from '../../shared/app.reducer';
import { PageTitleService } from '../../shared/page-title';
import { AdvisorService } from '../service/advisor.service';
import { UserAuthService } from '../../auth/user-auth.service';
import { AccessRightService } from '../../shared/access-rights.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
    accessRights: any;
    investmentPolicies;
    private unsubscribe$ = new Subject<void>();

    constructor(private advisorService: AdvisorService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private route: ActivatedRoute,
        private authService: UserAuthService,
        private router: Router,
        public translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'advisorDashboard' });
        window.scrollTo(0, 0);
    }

   async ngOnInit() {
     this.accessRightService.getAccess
     (['WEB07', 'SCH01', 'DEMOTILE', 'DOCTILE', 'RISKDISTTILE', 'COLLAB', 'NETWORTHTILE',
       'INVESTTILE', 'SUITTILE', 'WORKFLOWTILE', 'CMAROR', 'CMAINCDIST', 'PJMADMIN', 'CLIVALUES', 'WORKFLOWTILE', 'DFTINVPOL'])
       .pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
       this.accessRights = res;
       this.investmentPolicies = this.accessRights['DFTINVPOL']['accessLevel'] > 0;
     });
      await this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(async param => {
            if (param['sso'] !== undefined) {
                this.store.dispatch(new Login());
                window.localStorage.setItem('modelPopup', 'true');
                window.localStorage.setItem('isSSO', param['sso']);
                this.authService.localStorageFetcher.emit(window.localStorage);
            }
            if ( param['migrated'] !== undefined ) {
              await this.advisorService.migrateAdvisor();
            }
        });

        this.advisorService.getAdvisorDetail().toPromise().then(response => {
            if (response['licenseAgreed'] === false) {
                this.router.navigate(['../accept-licence-agreement']);
            }
            if (window.localStorage.getItem('modelPopup') === 'true' && response['licenseAgreed'] === true) {
                this.acceptancePopup(response);
            }
        });
        this.pageTitleService.setPageTitle('pageTitle|TAB.DASHBOARD_TITLE');

    }

    acceptancePopup(res) {
        if (res['acceptedWarning'] || (res['cmaAcceptanceROR'] || this.accessRights['CMAROR']['accessLevel'] === 0) &&
            (res['cmaAcceptanceIncDist'] || this.accessRights['CMAINCDIST']['accessLevel'] === 0) &&
            (res['invPolicyAcceptance'] || !this.investmentPolicies) &&
            (res['pjmAcceptance'] || this.accessRights['PJMADMIN']['accessLevel'] === 0)) {
            return;
        }

        this.translate.get([
            'LOGIN.SETTING.POPUP.CMA',
            'LOGIN.SETTING.POPUP.PJM',
            'LOGIN.SETTING.POPUP.DIP',
            'LOGIN.SETTING.POPUP.TITLE',
            'LOGIN.SETTING.POPUP.DESC',
            'LOGIN.SETTING.POPUP.END',
            'LOGIN.SETTING.POPUP.AGREE',
            'LOGIN.SETTING.POPUP.DECLINE',
            'LOGIN.SETTING.POPUP.SETTING',
            'LOGIN.SETTING.POPUP.FOR',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
          if (i18MenuTexts['LOGIN.SETTING.POPUP.TITLE'] !== 'LOGIN.SETTING.POPUP.TITLE') {
            const cma = ((res['cmaAcceptanceROR'] || this.accessRights['CMAROR']['accessLevel'] === 0) &&
              (res['cmaAcceptanceIncDist'] || this.accessRights['CMAINCDIST']['accessLevel'] === 0)) ? '' :
              '<li style="list-style: disc;"><b>' + i18MenuTexts['LOGIN.SETTING.POPUP.CMA'] + '</b></li>';
            const pjm = (res['pjmAcceptance'] || this.accessRights['PJMADMIN']['accessLevel'] === 0) ? '' : '<li style="list-style: disc;"><b>' + i18MenuTexts['LOGIN.SETTING.POPUP.PJM'] + '</b></li>';
            const dip = (res['invPolicyAcceptance'] || !this.investmentPolicies) ? '' : '<li style="list-style: disc;"><b>' + i18MenuTexts['LOGIN.SETTING.POPUP.DIP'] + '</b></li>';

            Swal({
              title: i18MenuTexts['LOGIN.SETTING.POPUP.TITLE'],
              type: 'warning',
              html: '<div class="need_help">' +
                '<p class="desc_txt">' + i18MenuTexts['LOGIN.SETTING.POPUP.DESC'] + ' <i>' + i18MenuTexts['LOGIN.SETTING.POPUP.SETTING'] + '</i> '
                + i18MenuTexts['LOGIN.SETTING.POPUP.FOR'] + ':</p>' +
                '<ul>' +

                cma + pjm + dip +

                '</ul>' +
                '<p class="desc_txt" style="margin-top: 1rem;">' + i18MenuTexts['LOGIN.SETTING.POPUP.END'] + '</p>' +
                '</div>',
              confirmButtonText: i18MenuTexts['LOGIN.SETTING.POPUP.AGREE'],
              confirmButtonColor: '#3085d6',
              cancelButtonText: i18MenuTexts['LOGIN.SETTING.POPUP.DECLINE'],
              cancelButtonColor: '#d33',
              showCancelButton: true,
              focusConfirm: false,
              allowOutsideClick: false,
              allowEscapeKey: false
            }).then(result => {
              if (result.value) {

                this.advisorService.cancelWarning().toPromise().then(r => {
                  res.acceptedWarning = true;
                }).catch(err => {
                  // Swal('Oops...Error updating advisor details.', err.error.errorMessage, 'error');
                });
              } else {
                this.authService.logout();
              }
            });
            window.localStorage.removeItem('modelPopup');
          }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
