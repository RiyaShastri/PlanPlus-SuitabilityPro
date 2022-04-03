import * as $ from 'jquery';
import { Router } from '@angular/router';
import { UserAuthService } from '../../auth/user-auth.service';
import { Component, OnInit, HostListener, ElementRef, ViewChild, Input, OnChanges, NgZone, OnDestroy } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { SettingService } from '../../setting/service';
import {getAdvisorPayload, AppState, getBrandingDetails, getClientPayload} from '../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { RefreshDataService } from '../../shared/refresh-data';
import { AccessRightService } from '../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isBranding = false;
    @Input() logoSrc?= 'assets/images/logo/s_pro_trans.png';
    @Input() custLogoSrc?= null;
    @Input() bgColours?= {};
    @Input() textColours?= {};
    @Input() addClass?= false;
    url = '';
    plannerName = '';
    isClient = false;
    isDashboard = false;
    menuOpen = false;
    plannerDetail = {};
    menus = [];
    applicableLangList = [];
    languageToShow = '';
    advisorRegion = '';
    advisorCountry = '';
    brandingDetails: object = {};
    isBeta = false;
    hasCustLogo = false;
    dftImageSrc = '';
    custImageSrc = '';
    avatarUrl = '';
    taskDigits = '0';
    liveChatUrl = '';
    clientId = '';
    @ViewChild('menuListRef') menuListRef: ElementRef;
    @ViewChild('menuOpenRef') menuOpenRef: ElementRef;
    accessRights = {};
    timer = null;
    private lastTime: number;
    private dateTimerInterval: number = 1000 * 60 * 1;
    private dateTimerTolerance: number = 1000 * 60 * 30;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private userService: UserAuthService,
        private advisorService: AdvisorService,
        private settingService: SettingService,
        private ngZone: NgZone,
        private refreshDataService: RefreshDataService,
        private accessRightService: AccessRightService,
        public translate: TranslateService,
        private store: Store<AppState>
    ) {
        router.events.pipe(takeUntil(this.unsubscribe$)).subscribe((val) => {
            setTimeout(() => {
                this.applyActiveClassBackgrounOnDropdownMenu();
            }, 1000);
            this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(payload => {
                  if (payload) {
                    this.clientId = payload['clientNum'];
                    if (this.clientId) {
                        this.isClient = true;
                    } else {
                        this.isClient = false;
                    }
                  } else {
                    this.isClient = false;
                  }
                });
            if (this.router.url.indexOf('/advisor/dashboard') > -1) {
                this.isDashboard = true;
            } else {
                this.isDashboard = false;
            }
        });
        this.generateLiveChatUrl();
        this.generateMenu();
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
            this.generateLiveChatUrl();
            this.generateMenu();
        });
    }

    applyActiveClassBackgrounOnDropdownMenu() {
        const elems = document.querySelectorAll('.custom-dropdown-menu ul li ul li a');
        let index = 0;
        const length = elems.length;
        for (; index < length; index++) {
            elems[index]['style'].background = this.getColours('bg', 'color1', true);
        }
        if (document.querySelectorAll('.custom-dropdown-menu ul li ul li a.active').length > 0) {
            document.querySelectorAll('.custom-dropdown-menu ul li ul li a.active')[0]['style'].background = this.getColours('bg', 'color2', true);
        }
    }

    async ngOnInit() {
        if (!this.isBranding) {
            await this.advisorService.loadAdvisorStoreData();
        }
        this.accessRightService.getAccess(['LIVECHAT', 'WEB10']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.generateLiveChatUrl();
        this.generateMenu();
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event: LangChangeEvent) => {
            this.generateLiveChatUrl();
            this.generateMenu();
            // this.settingService.getTranslation(this.advisorCountry, this.advisorRegion);
        });
        if (typeof environment.beta !== 'undefined' && environment.beta) {
            this.isBeta = environment.beta;
        } else {
            this.isBeta = false;
        }
        this.url = environment.apiUrl;
        if (!this.isBranding) {
            this.settingService.getAccesibleLanguage().toPromise().then(resp => {
                Object.keys(resp).forEach(langs => this.applicableLangList.push(resp[langs]['langcode']));
                this.translate.langs = [];
                this.translate.addLangs(this.applicableLangList);
                if (window.localStorage.getItem('language')) {
                    this.languageToShow = this.applicableLangList.find(lang => lang === window.localStorage.getItem('language'));
                } else {
                    this.languageToShow = this.applicableLangList.find(lang => lang === 'en');
                    window.localStorage.setItem('language', this.languageToShow);
                }
                this.translate.use(this.languageToShow);
                // this.settingService.getTranslation(this.advisorCountry, this.advisorRegion);
                this.getAdvisorDetails();
            }).catch(errorResponse => {
                this.translate.use('en');
                this.languageToShow = 'en';
                // this.settingService.getTranslation(this.advisorCountry, this.advisorRegion);
                this.getAdvisorDetails();
            });
        }
        this.getBrandingDetails();
        this.displayTaskBadge();
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message === 'new_task_added' || message === 'Badge_update_for_specified_client') {
                this.displayTaskBadge();
                this.refreshDataService.changeMessage('default message');
            } else if (message === 'branding_details_updated') {
                this.getBrandingDetails();
                this.refreshDataService.changeMessage('default message');
            }
        });

        /**
         * ekZero timeout solution
         */
        this.startDateCompare();
        this.refreshDataService.manageTimeout.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            this.ngZone.runOutsideAngular(() => {
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                if (message === 'updateTimeout') {
                    this.timer = setTimeout(() => {
                        console.log('Time is up!');
                        this.ngZone.run(() => {
                            this.refreshDataService.changeMessage('timeout');
                            this.userService.logoutAction();
                            this.userService.logout();
                        });
                    }, 1000 * 60 * 30);
                }
            });
        });
        this.advisorService.headerLoaded.emit(true);
    }


    @HostListener('document:touchstart', ['$event'])
    @HostListener('document:click', ['$event'])
    public clickedOutside($event) {
        if (typeof $event.target.className === 'string') {
            if ($event.target.className.includes('btn-floating') || $event.target.className.includes('ion-md-more')
                || $event.target.className.includes('sub-menu') || $event.target.className.includes('ui-chkbox') || $event.target.className.includes('action-list')) {
                return;
            } else {
                $('.dropdown-floating').hide();
            }
        }
    }

    private startDateCompare() {
        this.ngZone.runOutsideAngular(() => {
            this.lastTime = (new Date()).getTime();
            setInterval(() => {
                if ((new Date()).getTime() > (this.lastTime + this.dateTimerInterval + this.dateTimerTolerance)) { // look for 10 sec diff
                    this.ngZone.run(() => {
                        this.refreshDataService.changeMessage('timeout');
                        this.userService.logout();
                    });
                }
                this.lastTime = (new Date()).getTime();
            }, this.dateTimerInterval);
        });
    }

    getAdvisorDetails() {
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.plannerDetail = res;
                this.plannerName = res['firstName'] + ' ' + res['surname'];
                this.advisorCountry = res['country'];
                this.advisorRegion = res['region'];
                // this.settingService.getTranslation(this.advisorCountry, this.advisorRegion);
            } else {
                // this.advisorService.getAdvisorPayload();
            }
        }, errorResponse => {
            this.plannerDetail = {};
            // this.settingService.getTranslation(this.advisorCountry, this.advisorRegion);
        });
    }

    getBrandingDetails() {
        this.store.select(getBrandingDetails).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.brandingDetails = JSON.parse(JSON.stringify(data));
                if (this.brandingDetails.hasOwnProperty('bannerBranding')) {
                    this.dftImageSrc = this.url + '/v30/branding/images/' + this.brandingDetails['bannerBranding']['defaultImagePath'];
                    if (this.brandingDetails['bannerBranding']['selection'] === 1 && this.brandingDetails['bannerBranding']['customImagePath']) {
                        this.custImageSrc = this.url + '/v30/branding/images/' + this.brandingDetails['bannerBranding']['customImagePath'];
                        this.hasCustLogo = true;
                    }
                }
            }
        });
    }

    displayTaskBadge() {
        this.advisorService.getNewTaskBellDigits().toPromise().then(taskDigits => {
            this.taskDigits = (taskDigits['response'] > 99) ? '99+' : taskDigits['response'];
        }).catch(errorResponse => {
            this.taskDigits = '0';
        });
    }

    ngOnChanges(changes) {
        if (changes.hasOwnProperty('logoSrc')) {
            this.logoSrc = changes.logoSrc.currentValue;
        }
    }

    generateLiveChatUrl() {
        this.translate.get([
            'HEADER.LIVE_CHAT_URL'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.liveChatUrl = i18text['HEADER.LIVE_CHAT_URL'];
        });
    }
    generateMenu() {
        this.translate.get([
            'HEADER.MY_PROFILE',
            'HEADER.SETTINGS',
            'SETTINGS.PREFERRED_SOLUTIONS.TITLE',
            'SETTINGS.CMA.TITLE',
            'SETTINGS.PJM.TITLE',
            'HEADER.LOGOUT',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            this.menus = [];
            this.menus = [
                {
                    link: ['/my-profile/about-me'],
                    isLink: true,
                    text: i18MenuTexts['HEADER.MY_PROFILE'],
                    childMenus: []
                }
            ];
            this.menus.push(
                {
                    link: ['/settings'],
                    isLink: true,
                    text: i18MenuTexts['HEADER.SETTINGS'],
                    childMenus: [
                    ]
                });
            this.menus.push(
                {
                    link: () => { this.logout(); },
                    isLink: false,
                    text: i18MenuTexts['HEADER.LOGOUT'],
                    childMenus: []
                });
            // one more checking to make sure that the menu item is having correct access rights
            if (this.accessRights.hasOwnProperty('WEB10')
                && this.accessRights['WEB10'].hasOwnProperty('accessLevel')
                && this.accessRights['WEB10'].hasOwnProperty('id')
                && this.accessRights['WEB10']['accessLevel'] < 1
                && this.accessRights['WEB10']['id'] !== '') {
                if (this.menus.length > 2) {    // with my profile item
                    this.menus.splice(0, 1);
                }
            } else {
                if (this.accessRights === null
                    || this.accessRights.hasOwnProperty('WEB10') === false
                    || this.accessRights['WEB10'].hasOwnProperty('accessLevel') === false
                    || this.accessRights['WEB10'].hasOwnProperty('id') === false
                    || this.accessRights['WEB10']['id'] === '') {    // should not be empty
                    // async call a function to wait for accessRight ready
                    this.startAsync();
                }
            }
        });
    }

    @HostListener('window:click', ['$event', '$event.target'])
    onClick(event: MouseEvent, targetElement: HTMLElement): void {
        if (!targetElement) {
            return;
        }
        const clickedInside = this.menuListRef.nativeElement.contains(targetElement);
        const clickedOnMenu = this.menuOpenRef.nativeElement.contains(targetElement);
        if ((!clickedInside && !clickedOnMenu)) {
            this.menuOpen = false;
        }
        if (clickedInside) {
            if (targetElement.parentElement.classList.contains('sub-menu_wrapper')) {
                return;
            }
            this.menuOpen = false;
        }
    }

    changeLanguage(selectedLang) {
        this.languageToShow = selectedLang;
        window.localStorage.setItem('language', selectedLang);
        this.advisorService.getAllBrandingDataByLang(selectedLang);
        this.translate.use(this.languageToShow);
    }

    logout() {
        this.userService.logout();
    }

    getColours(obj, key, actual?) {
        if (actual) {
            if (obj === 'bg' && this.brandingDetails.hasOwnProperty('bannerBgColors')) {
                const key1 = (this.brandingDetails['bannerBgColors']['selection'] === 0) ? 'bannerBgDefaultColors' : 'bannerBgCustomColors';
                // tslint:disable-next-line:max-line-length
                const str = 'rgb(' + this.brandingDetails['bannerBgColors'][key1][key][0] + ',' + this.brandingDetails['bannerBgColors'][key1][key][1] + ',' + this.brandingDetails['bannerBgColors'][key1][key][2] + ')';
                return str;
            } else if (obj === 'text' && this.brandingDetails.hasOwnProperty('bannerTextColors')) {
                const key1 = (this.brandingDetails['bannerTextColors']['selection'] === 0) ? 'bannerTextDefaultColors' : 'bannerTextCustomColors';
                // tslint:disable-next-line:max-line-length
                const str = 'rgb(' + this.brandingDetails['bannerTextColors'][key1][key][0] + ',' + this.brandingDetails['bannerTextColors'][key1][key][1] + ',' + this.brandingDetails['bannerTextColors'][key1][key][2] + ')';
                return str;
            } else {
                return '';
            }
        }

        if (obj.hasOwnProperty(key) && obj[key].length > 0) {
            const str = 'rgb(' + obj[key][0] + ',' + obj[key][1] + ',' + obj[key][2] + ')';
            return str;
        } else {
            return '';
        }
    }

    getBackgroundstyleObj() {
        // return this.getColours('bg', 'color2', true);
        return {
            'background': this.getColours('bg', 'color2', true)
        };
    }

    checkActive(event) {
        if (event.srcElement.className.indexOf('active') > -1) {
            setTimeout(() => {
                event.srcElement.style.background = this.getColours('bg', 'color2', true);
            }, 0);
        }
    }

    async startAsync() {
        await this.delay(500);
        this.reroute(this);
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reroute(obj: HeaderComponent): boolean {
        if (this.accessRights === null
            || this.accessRights.hasOwnProperty('WEB10') === false
            || this.accessRights['WEB10'].hasOwnProperty('accessLevel') === false
            || this.accessRights['WEB10'].hasOwnProperty('id') === false
            || this.accessRights['WEB10']['id'] === '') {    // should not be empty
            // async call a function to wait for accessRight ready
            this.startAsync();
        } else {
            if (this.accessRights['WEB10']['accessLevel'] < 1
                && this.accessRights['WEB10']['id'] !== '') {
                if (this.menus.length > 2) {    // with my profile item
                    this.menus.splice(0, 1);
                }
                return true;
            } else {
                return false;
            }
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
