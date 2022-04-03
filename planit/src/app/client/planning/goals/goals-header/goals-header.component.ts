import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-goals-header',
    templateUrl: './goals-header.component.html',
    styleUrls: ['./goals-header.component.css']
})
export class GoalsHeaderComponent implements OnInit, OnDestroy {
    @Input() public clientId;
    @Input() public currentPage;
    accountId = 'ACCOUNTID1';
    public scenario = [
        { id: 1, name: 'Retirement' },
        { id: 2, name: 'Other' }
    ];
    public selectedScenario = this.scenario[0];
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private accessRightService: AccessRightService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['SAV01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
    }

    sorting(event) { }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
