import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAuthService } from '../user-auth.service';
import { TokenStorage } from '../../shared/token.storage';
import { PageTitleService } from '../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
    resetKey = '';
    model = {
        currentPassword: '',
        newPassword: '',
        retypePassword: '',
    };
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private route: ActivatedRoute,
        private token: TokenStorage,
        private translate: TranslateService,
        private userService: UserAuthService,
        private pageTitleService: PageTitleService,
        private router: Router,
        private angulartics2: Angulartics2,
    ) {
        this.angulartics2.eventTrack.next({ action: 'changePassword' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.CHANGE_PASSWORD_TITLE');
        this.resetKey = this.route.snapshot.params['resetToken'];
    }

    ngOnInit() { }

    back() {
        this._location.back();
    }

    changePassword() {
        let reqObj = {};
        if (this.resetKey) {
            reqObj = {
                'password': this.model.newPassword,
                'resetKey': this.resetKey
            };
            this.userService.resetPassword(reqObj).toPromise().then(res => {
                this.router.navigate(['/']);
            }).catch(err => {
                swal('Error', err.error.errorMessage, 'error');
            });
        } else {
            reqObj = {
                'currentPassword': this.model.currentPassword,
                'newPassword': this.model.newPassword
            };
            this.translate.get([
                'ALERT_MESSAGE.OOPS_TEXT',
                'ALERT_MESSAGE.DONE_TITLE',
                'CHANGE_PASSWORD.SUCCESS_MESSAGE'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                this.userService.changePassword(reqObj).toPromise().then(res => {
                    swal(text['ALERT_MESSAGE.DONE_TITLE'], text['CHANGE_PASSWORD.SUCCESS_MESSAGE'], 'success');
                    this.userService.logout();
                }).catch(err => {
                    swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
            });
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
