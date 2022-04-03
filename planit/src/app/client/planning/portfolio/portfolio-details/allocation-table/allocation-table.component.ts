import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, getGraphColours, getClientPayload } from '../../../../../shared/app.reducer';
import { PortfolioService } from '../../../../service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ASSET_CLASS_COLOURS } from '../../../../../shared/constants';

@Component({
    selector: 'app-allocation-table',
    templateUrl: './allocation-table.component.html',
    styleUrls: ['./allocation-table.component.css']
})
export class AllocationTableComponent implements OnInit, OnChanges, OnDestroy {
    @Input() clientId;
    @Input() portfolioId;
    @Input() allocationResponse;

    graphColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];
    assetClassColours = ASSET_CLASS_COLOURS;
    clientData = {};
    allocationsData = [];
    private unsubscribe$ = new Subject<void>();
    totalCurrentPercent = 0;
    totalCurrentAmount = 0;
    totalTargetPercent = 0;
    totalImplementedPercent = 0;
    totalImplementedAmount = 0;
    constructor(
        private store: Store<AppState>,
        private modalService: NgbModal,
    ) { }

    ngOnInit() {
        this.store.select(getGraphColours).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res && res.hasOwnProperty('allGraphColours') && res['allGraphColours'].length > 0) {
                this.graphColors = res['allGraphColours'];
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
    }


    ngOnChanges(changes) {
        if (changes && changes.hasOwnProperty('allocationResponse') && changes['allocationResponse']['currentValue']) {
            this.totalCurrentPercent = 0;
            this.totalCurrentAmount = 0;
            this.totalTargetPercent = 0;
            this.totalImplementedPercent = 0;
            this.totalImplementedAmount = 0;
            this.allocationResponse.allocations.forEach(alloc => {
                this.totalCurrentPercent += alloc['currentPercent'];
                this.totalCurrentAmount += alloc['currentAmount'];
                this.totalTargetPercent += alloc['targetPercent'];
                this.totalImplementedPercent += alloc['implementedPercent'];
                this.totalImplementedAmount += alloc['implementedAmount'];
            });
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    open(content, allocationsData) {
        this.allocationsData = allocationsData;
        this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
    }
}
