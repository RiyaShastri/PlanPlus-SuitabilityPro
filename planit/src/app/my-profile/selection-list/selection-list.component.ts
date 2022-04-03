import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { slideInOutAnimation } from '../../shared/animations';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../shared/page-title';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-selection-list',
    templateUrl: './selection-list.component.html',
    styleUrls: ['./selection-list.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class SelectionListComponent implements OnInit, OnDestroy {
    type = 0;
    list = [];
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private advisorService: AdvisorService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private pageTitleService: PageTitleService
    ) {
        this.angulartics2.eventTrack.next({ action: 'brandingSectionListSidePanel' });
        if (this.router.url.indexOf('document-cover-page-selection') > -1) {
            this.type = 1;
            this.pageTitleService.setPageTitle('pageTitle|TAB.MY_PROFILE_BRANDING_DOCUMENT_COVER_PAGE_SELECTION');
        } else if (this.router.url.indexOf('document-disclaimer-selection') > -1) {
            this.pageTitleService.setPageTitle('pageTitle|TAB.MY_PROFILE_BRANDING_DOCUMENT_DISCLAIMER_SELECTION');
            this.type = 2;
        } else if (this.router.url.indexOf('report-disclaimer-selection') > -1) {
            this.pageTitleService.setPageTitle('pageTitle|TAB.MY_PROFILE_BRANDING_REPORT_DISCLAIMER_SELECTION');
            this.type = 3;
        }
    }

    ngOnInit() {
        if (this.type === 1 || this.type === 2) {
            this.advisorService.getDocumentsListForBranding().toPromise().then(res => {
                this.list = res;
            }).catch(err => {});
            // this.list = [{ name: 'Goal Based Investment Plan', coverPage: 'c2', disclaimer: 'd2' },
            // { name: 'Client Profile', coverPage: 'c1', disclaimer: 'd1' },
            // { name: 'Life Goals Plan', coverPage: 'c2', disclaimer: 'd2' },
            // { name: 'Estate Plan', coverPage: 'c1', disclaimer: 'd2' }];
        } else {
            this.list = [{ name: 'Cash Flow Report', disclaimer: 'd1' },
            { name: 'Product Concentration Report', disclaimer: 'd2' },
            { name: 'Net Worth Report', disclaimer: 'd1' },
            { name: 'Tax Report', disclaimer: 'd1' }];
        }
    }


    back() {
        this.router.navigate(['/my-profile', 'branding']);
    }

    submitForm() {
        if (this.type === 1 || this.type === 2) {
            this.advisorService.updateSelectionForDocuments(this.list).toPromise().then(res => {
                this.list = res;
                this.translate.get(['BRANDING.SELECTION_LIST.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    if (this.type === 1) {
                        Swal('Updated!', i18text['BRANDING.SELECTION_LIST.POPUP.SUCCESS'], 'success');
                    } else {
                        Swal('Updated!', i18text['BRANDING.SELECTION_LIST.POPUP.SUCCESS'], 'success');
                    }
                });
                this.back();
            }).catch(err => {
                Swal('Oops!', err.error.errorMessage, 'error');
            });
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
