import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { slideInOutAnimation } from '../../../shared/animations';
import { PageTitleService } from '../../../shared/page-title';
import { AccessRightService } from '../../../shared/access-rights.service';

@Component({
    selector: 'app-client-search',
    templateUrl: './client-search.component.html',
    styleUrls: ['./client-search.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class ClientSearchComponent implements OnInit, OnDestroy {
    accessRights = {};
    closeButtonDisable = false;
    searchSpouse = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private _location: Location,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(paramsObj => {
            if (paramsObj.personalId) {
                this.searchSpouse = true;
            }
        });
        setTimeout(() => {
            this.pageTitleService.setPageTitle('pageTitle|TAB.SEARCH_CLIENT_TITLE');
        }, 0);
    }

    ngOnInit() {
        this.accessRightService.getAccess(['CLI18']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
    }

    back() {
        this._location.back();
    }
    addClient() {
        this.router.navigate(['/advisor/dashboard/add-client']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
