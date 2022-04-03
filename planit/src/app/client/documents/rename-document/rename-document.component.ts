import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { Angulartics2 } from 'angulartics2';
import {
    AppState,
    getIsDocumentLoaded,
    getDocumentPayloads
} from '../../../shared/app.reducer';
import { slideInOutAnimation } from '../../../shared/animations';
import { DocumentService } from '../../service/document.service';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { PageTitleService } from '../../../shared/page-title';

@Component({
    selector: 'app-rename-document',
    templateUrl: './rename-document.component.html',
    styleUrls: ['./rename-document.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})

export class RenameDocumentComponent implements OnInit, OnDestroy {
    public document: any;
    newDocumentName = '';
    clientId;
    documentList;
    documentId;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private _location: Location,
        private documentService: DocumentService,
        private pageTitleService: PageTitleService,
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'renameDocument' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.RENAME_DOCUMENT_TITLE');
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.documentId = this.route.snapshot.params['docId'];
    }

    ngOnInit() {
        this.store.select(getIsDocumentLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe(loaded => {
            if (!loaded) {
                this.documentService.getClientDocumentPayloads(this.clientId);
            } else {
                this.store.select(getDocumentPayloads).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    this.documentList = data;
                    this.getCurrentDocDetail();
                });
            }
        });
    }

    getCurrentDocDetail() {
        const documentIndex = this.documentList.findIndex(document => document.documentID === this.documentId);
        this.document = this.documentList[documentIndex];
    }

    back() {
        this._location.back();
    }

    renameDocument() {
        this.documentService.renameClientDocument(this.documentId, this.newDocumentName).toPromise().then(response => {
            this.documentService.getClientDocumentPayloads(this.clientId);
            this.advisorService.getAdvisorDocumentPayload();
            this.back();
        }).catch(errorResponse => {
            Swal('Oops...', errorResponse.error.errorMessage, 'error');
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
