import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxRolesService, NgxPermissionsService } from 'ngx-permissions';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import swal from 'sweetalert2';
import { UserAuthService } from '../user-auth.service';
import {Login, Logout} from '../../shared/app.actions';
import { environment } from '../../../environments/environment';
import { RefreshDataService } from '../../shared/refresh-data';
import { AppState } from '../../shared/app.reducer';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { PageTitleService } from '../../shared/page-title';
import { TokenStorage } from '../../shared/token.storage';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
    username: string;
    password: string;
    loginFailed = false;
    isLoginStarted = false;
    errorCode = '';
    actionMessage = {
        type: '',
        message: '',
    };

    environment = environment;
    window = window;
    timeoutMsg = '';
    useAlternate = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private userService: UserAuthService,
        private advisorService: AdvisorService,
        private router: Router,
        private ngxRolesService: NgxRolesService,
        private permissionsService: NgxPermissionsService,
        private pageTitleService: PageTitleService,
        private route: ActivatedRoute,
        private refreshDataService: RefreshDataService,
        private angulartics2: Angulartics2,
        private token: TokenStorage,
        private store: Store<AppState>,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'login' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.LOGIN_TITLE');
        this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params['errorCode'] !== undefined) {
                this.errorCode = params['errorCode'];
            }
        });
    }

    ngOnInit() {
        if (navigator.cookieEnabled) {
            if (!this.errorCode && new TokenStorage().getToken('AuthToken')) {
                this.router.navigate(['./advisor', 'dashboard']);
            }
            this.timeoutMsg = '';
            this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
                if (message === 'timeout') {
                    this.translate.get(['LOGIN.TIMEOUT_MESSAGE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                        this.timeoutMsg = i18text['LOGIN.TIMEOUT_MESSAGE'];
                    });
                    this.refreshDataService.changeMessage('default message');
                } else if (message.includes('cookie-disabled')) {
                    setTimeout(() => {
                        this.translate.get(['LOGIN.COOKIE_DISABLED_MESSAGE', 'ALERT_MESSAGE.ALERT_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                            swal(i18text['ALERT_MESSAGE.ALERT_TITLE'], i18text['LOGIN.COOKIE_DISABLED_MESSAGE'], 'warning');
                        });
                    }, 50);
                }
            });
        } else {
            this.translate.get(['LOGIN.COOKIE_DISABLED_MESSAGE', 'ALERT_MESSAGE.ALERT_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT_MESSAGE.ALERT_TITLE'], i18text['LOGIN.COOKIE_DISABLED_MESSAGE'], 'warning');
            });
        }

    }

    public async onLogin() {
        if (navigator.cookieEnabled) {
            if (window.localStorage.getItem('plannerName')) {
                // clear the old login data and continue with the login.
                await this.token.signOut();
            }
            this.actionMessage = {
                type: '',
                message: '',
            };
            this.timeoutMsg = '';
            this.isLoginStarted = true;
            this.userService.login(this.username, this.password).toPromise().then(response => {
                this.isLoginStarted = false;
                const planner = response['claims']['rol']['advisor']['planner'];
                let licenses = response['claims']['rol']['advisor']['licenses'] || '';
                const TOKEN_KEY = 'AuthToken';
                const REFRESH_KEY = 'RefreshToken';
                this.token.saveToken(response['token'], true, TOKEN_KEY);
                this.token.saveToken(response['refreshToken'], true, REFRESH_KEY);
                this.store.dispatch(new Login());
                this.angulartics2.eventTrack.next({ action: 'login' });
                licenses = licenses.toUpperCase();
                window.localStorage.setItem('plannerName', planner);
                window.localStorage.setItem('modelPopup', 'true');
                this.permissionsService.flushPermissions();
                if (licenses.indexOf('<B>PRO</B>PLANNER') > -1 && licenses.indexOf('<B>PRO</B>FILER') > -1) {
                    this.permissionsService.loadPermissions(['ADVISOR', 'PROFILER']);
                    this.ngxRolesService.addRole('COMBINED', ['ADVISOR', 'PROFILER']);
                    window.localStorage.setItem('role', '["ADVISOR","PROFILER"]');
                } else if (licenses.indexOf('<B>PRO</B>PLANNER') > -1) {
                    this.permissionsService.loadPermissions(['ADVISOR']);
                    this.ngxRolesService.addRole('ADVISOR', ['ADVISOR']);
                    window.localStorage.setItem('role', '["ADVISOR"]');
                } else if (licenses.indexOf('<B>PRO</B>FILER') > -1) {
                    this.permissionsService.loadPermissions(['PROFILER']);
                    this.ngxRolesService.addRole('PROFILER', ['PROFILER']);
                    window.localStorage.setItem('role', '["PROFILER"]');
                } else {
                    // In this case we have no license available. So we prevent login.
                  this.translate.get(['LOGIN.INVALID_LICENSE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    this.actionMessage = {type: 'error', message: i18text['LOGIN.INVALID_LICENSE']};
                  });
                    this.isLoginStarted = false;
                    this.loginFailed = true;
                    this.store.dispatch(new Logout());
                    this.token.signOut();
                    return;
                }
                this.advisorService.getAccessRightsPayload();
                this.router.navigate(['./advisor', 'dashboard']);
            }).catch(errorResponse => {
                this.translate.get(['LOGIN.INVALID_PASSWORD', 'LOGIN.EXPIRED']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    this.actionMessage = { type: 'error', message: i18text['LOGIN.INVALID_PASSWORD'] };
                    if (errorResponse.errorCode === 'account-expired') {
                        this.actionMessage['message'] = i18text['LOGIN.EXPIRED'];
                    }
                    this.isLoginStarted = false;
                    this.loginFailed = true;
                  this.store.dispatch(new Logout());
                  this.token.signOut();
                });
            });
        } else {
            this.translate.get(['LOGIN.COOKIE_DISABLED_MESSAGE', 'ALERT_MESSAGE.ALERT_TITLE']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                swal(i18text['ALERT_MESSAGE.ALERT_TITLE'], i18text['LOGIN.COOKIE_DISABLED_MESSAGE'], 'warning');
            });
        }
    }
    async sendResetLink() {
        this.actionMessage = {
            type: '',
            message: '',
        };
        this.userService.sendResetLink(this.username).toPromise().then(resetRes => {
            if (resetRes === true) {
                this.actionMessage = {
                    type: 'success',
                    message: 'An email has been sent to the email address provided with a link to reset your password.',
                };
            } else {
                this.actionMessage = {
                    type: 'error',
                    message: 'Please provide a valid username.',
                };
            }
        }).catch(errorResponse => {
            this.actionMessage = {
                type: 'error',
                message: 'Please provide a valid username.',
            };
        });

    }

    needHelp() {
        this.translate.get([
            'LOGIN.NEED_HELP',
            'LOGIN.POPUP.DESCRIPTION',
            'LOGIN.POPUP.LIVE_CHAT',
            'LOGIN.POPUP.LIVE_CHAT_URL',
            'LOGIN.POPUP.MAIL_SUPPORT_URL',
            'LOGIN.POPUP.CONFIRM_BUTTON'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            swal({
                title: i18text['LOGIN.NEED_HELP'],
                html: '<div class="need_help">' +
                    '<p class="desc_txt">' + i18text['LOGIN.POPUP.DESCRIPTION'] + '</p>' +
                    '<ul>' +
                    '<li><i class="ion-md-chat"></i><span><a href=' + i18text['LOGIN.POPUP.LIVE_CHAT_URL'] + ' target="_blank">' +
                    i18text['LOGIN.POPUP.LIVE_CHAT'] + '</a></span></li>' +
                    '<li><i class="ion-md-mail"></i><span><a class="" href=' + i18text['LOGIN.POPUP.MAIL_SUPPORT_URL'] + '>support@planplus.com</a></span></li></ul></div>',
                confirmButtonText: i18text['LOGIN.POPUP.CONFIRM_BUTTON'],
                confirmButtonColor: '#8899aa',
                focusConfirm: false
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
