import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AppState, getAdvisorDocument } from '../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { AdvisorService } from '../../service/advisor.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-documents-center-tile',
    templateUrl: './documents-center-tile.component.html',
    styleUrls: ['./documents-center-tile.component.css']
})
export class DocumentsCenterTileComponent implements OnInit, OnDestroy {

    @ViewChild('review') public review: NgbTooltip;
    @ViewChild('inprogress') public inprogress: NgbTooltip;
    itemList = [
        { id: 'MOSTRECENT', name: 'Most recent' },
        { id: 'IN_PROGRESS', name: 'In Progress' },
        { id: 'REVIEW', name: 'Under Review' },
        { id: 'COMPLETE', name: 'Completed' },
        { id: 'PENDING', name: 'Pending' },
        { id: 'VIEWED', name: 'Viewed' },
    ];
    documentLoaded = false;
    defaultSelected = this.itemList[0];
    documentList: any;
    pageNum = 1;
    TotalClients;
    unsubscribe$;

    constructor(
        private store: Store<AppState>,
        private advisorService: AdvisorService
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getAdvisorDocument).subscribe(data => {
            this.documentList = data;
            this.TotalClients = data.totalRecords;
            this.documentLoaded = true;
        });
    }

    getAdvisorDocuments(pageNum) {
        this.documentLoaded = false;
        this.advisorService.getAdvisorDocument(this.defaultSelected.id, pageNum).toPromise().then(result => {
            if (result) {
                this.documentList = result;
                this.TotalClients = result.totalRecords;
                this.documentLoaded = true;
            }
        });
    }

    getFilterDocument(event) {
        this.defaultSelected = event;
        this.getAdvisorDocuments(this.pageNum);
    }

    getPageFilterClient(event) {
        this.getAdvisorDocuments(event.currentPage);
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }
}
