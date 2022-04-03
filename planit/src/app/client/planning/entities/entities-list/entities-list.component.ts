import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { EntitiesService } from '../../../service';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { PageTitleService } from '../../../../shared/page-title';

@Component({
    selector: 'app-entities-list',
    templateUrl: './entities-list.component.html',
    styleUrls: ['./entities-list.component.css']
})
export class EntitiesListComponent implements OnInit, OnDestroy {

    clientId;
    entitiesList = [];
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private entityService: EntitiesService,
        private dataSharing: RefreshDataService,
        private pageTitleService: PageTitleService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PLANNING_ENTITIES_LIST');
        this.getEntityList();
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(async message => {
            if (message === 'entityDeleted') {
                this.getEntityList();
                this.dataSharing.changeMessage('default message');
            }
        });

    }

    getEntityList() {
        this.entityService.getEntitiesList(this.clientId).toPromise().then(entities => {
            this.entitiesList = entities;
        }).catch(err => {
            this.entitiesList = [];
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
