import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageTitleService } from '../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { AccessRightService } from '../../shared/access-rights.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
    selector: 'app-setting-summary',
    templateUrl: './setting-summary.component.html',
    styleUrls: [
        '../../client/profile/summary/summary.component.css',
        './setting-summary.component.css'
    ]
})
export class SettingSummaryComponent implements OnInit, OnDestroy {
    accessRights = {};
    showCMA = false;
    showFavProd = environment.favprod;
    permissions;
    unsubscribe$: any;
    constructor(
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private angulartics2: Angulartics2,
        private ngxPermissionsService: NgxPermissionsService
    ) {
        this.angulartics2.eventTrack.next({ action: 'settingSummary' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.SETTING_SUMMARY_TITLE');
    }

    ngOnInit() {
        this.unsubscribe$ = this.accessRightService.getAccess(['PJMADMIN', 'WEB24', 'WEB25', 'CMAROR', 'CMAINCDIST', 'DFTINVPOL']).subscribe(res => {
            this.accessRights = res;
            this.showCMA = this.accessRights['CMAROR']['accessLevel'] > 1 || this.accessRights['CMAINCDIST']['accessLevel'] > 1;
        });
        this.permissions = this.ngxPermissionsService.getPermissions();
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }
}
