import { Component, OnInit, OnChanges, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';

import { PagerService } from '../../shared/pager.service';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnChanges {
    @Input() TotalItem: number;
    @Input() PageSize: number;
    @Output() OnPageChange = new EventEmitter();
    @Input() pageChangingNum: Subject<number>;
    // pager object
    pager: any = {};

    // paged items
    pagedItems: any[];
    constructor(private pagerService: PagerService) {
        // this.OnPageChange.emit(this.pager);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setPageInit(1);
    }

    ngOnInit() {
        if (this.pageChangingNum) {
            this.pageChangingNum.subscribe(v => {
                this.setPageInit(v);
            });
        }
        this.setPageInit(1);
        // this.OnPageChange.emit(this.pager); // we have already set initial page on line no 35, so we don't need to emit in ngOninit.
    }
    setPageInit(page) {
        this.pager = this.pagerService.getPager(this.TotalItem, page, this.PageSize);
    }
    setPage(page) {
        // get pager object from service
        this.pager = this.pagerService.getPager(this.TotalItem, page, this.PageSize);
        this.OnPageChange.emit(this.pager);
    }
}
