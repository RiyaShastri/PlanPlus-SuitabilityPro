import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import {
    AppState,
    getIsLoggedIn
} from '../../shared/app.reducer';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { PageTitleService } from '../../shared/page-title';
import { SetAdvisorDetail } from '../../shared/app.actions';
import { UserAuthService } from '../user-auth.service';

@Component({
    selector: 'app-licence',
    templateUrl: './licence.component.html',
    styleUrls: ['./licence.component.css']
})
export class LicenceComponent implements OnInit, OnDestroy {
    @Input() afterLogin = false;
    isLogin = false;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        private _location: Location,
        private advisorService: AdvisorService,
        private pageTitleService: PageTitleService,
        private router: Router,
        private authService: UserAuthService,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        window.localStorage.removeItem('modelPopup');
        this.angulartics2.eventTrack.next({ action: 'licenceAgreement' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.LICENCE_AGREEMENT_TITLE');
        this.store.select(getIsLoggedIn).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            this.isLogin = data;
        });
    }

    ngOnInit() {
    }

    back() {
        this._location.back();
    }

    decline() {
        this.authService.logout();
    }

    accept() {
        this.translate.get([
            'MY_PROFILE.LICENCE_AGREEMENT.POPUP.SUCCESS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(async i18text => {
            await this.advisorService.agreeLicence().toPromise().then(advisorDetail => {
            this.store.dispatch(new SetAdvisorDetail(advisorDetail));
            swal('Success', i18text['MY_PROFILE.LICENCE_AGREEMENT.POPUP.SUCCESS'], 'success');
            window.localStorage.setItem('modelPopup', 'true');
            this.router.navigate(['./advisor', 'dashboard']);
        }).catch(err => {
            swal('Oops...', err.error.errorMessage, 'error');
        });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
