import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccessRightService } from '../shared/access-rights.service';
import { environment } from '../../environments/environment';
import { UserAuthService } from '../auth/user-auth.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-my-profile',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit, OnDestroy {
    accessRights = {};
    showBranding = environment['branding'];
    isSSO = false;
    environment = environment;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private accessRightService: AccessRightService,
        private authService: UserAuthService
    ) { }

    ngOnInit() {
        this.authService.localStorageFetcher.emit(window.localStorage);
        this.accessRightService.getAccess(['WEB11', 'REG_BRAND_ADMN', 'WEB10', 'LICAGREE'])
        .pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res}});
        this.isSSO = window.localStorage.getItem('isSSO') == 'true' ? true : false;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
