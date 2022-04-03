import { AppState, getDocumentPayloads } from '../../../shared/app.reducer';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { DocumentService } from '../../service';
import { statusData } from '../../client-models';

@Component({
    selector: 'app-document-tile',
    templateUrl: './document-tile.component.html',
    styleUrls: ['./document-tile.component.css']
})
export class DocumentTileComponent implements OnInit, OnDestroy {
    @Input() public clientId;
    public documents: any = [];
    documentLoaded = false;
    statusData = statusData;
    unsubscribe$;

    constructor(
        private store: Store<AppState>,
        private documentService: DocumentService
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getDocumentPayloads).subscribe(data => {
            if (data) {
                this.documents = data.slice(0, 4);
                this.documentLoaded = true;
            } else {
                this.documentService.getClientDocumentPayloads(this.clientId);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }
}
