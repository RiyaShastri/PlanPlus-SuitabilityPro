import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { statusData } from '../../client-models/document-status';
import {
    AppState, getIsDocumentLoaded, getDocumentPayloads, getFamilyMemberRiskPayload
} from '../../../shared/app.reducer';
import { DocumentService } from '../../service';
import { fadeInAnimation } from '../../../shared/animations';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { PageTitleService } from '../../../shared/page-title';
import { AccessRightService } from '../../../shared/access-rights.service';

@Component({
    selector: 'app-document-centre',
    templateUrl: './document-centre.component.html',
    styleUrls: ['./document-centre.component.css'],
    animations: [fadeInAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@fadeInAnimation]': '' }
})
export class DocumentCentreComponent implements OnInit, OnDestroy {
    public searchString = '';
    public documentList;
    public documentTypes = [];
    public clientId;
    statusData = statusData;
    isDownloaded = true;
    clientHasEmail = false;
    eventSubscription: any;
    private unsubscribe$ = new Subject<void>();

    public filterBy = [
        { id: 'ALL', name: 'All', lowVersion: false, canUpdate: false },
        { id: 'IN_PROGRESS', name: 'In progress', lowVersion: false, canUpdate: true },
        { id: 'REVIEW', name: 'Under review', lowVersion: false, canUpdate: true },
        { id: 'COMPLETE', name: 'Completed', lowVersion: false, canUpdate: true },
        { id: 'PENDING', name: 'Shared - pending', lowVersion: false, canUpdate: false },
        { id: 'VIEWED', name: 'Shared - viewed', lowVersion: false, canUpdate: false },
    ];
    public selectedFilter = this.filterBy[0];

    public sortBy = [
        { id: 'MOSTRECENT', name: 'Most recent' },
        { id: 'TYPE', name: 'Type' }
    ];
    public selectedSort = this.sortBy[0];

    public groupBy = [
        { id: 'Type', field: 'documentType' },
    ];
    public selectedGroupBy = this.groupBy[0];
    accessRights = {};
    isReadOnly = false;
    client = {};



    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private documentService: DocumentService,
        private pageTitleService: PageTitleService,
        private router: Router,
        private accessRightService: AccessRightService,
        private advisorService: AdvisorService,
        private angulartics2: Angulartics2,
        public translate: TranslateService,
    ) {
        this.angulartics2.eventTrack.next({ action: 'documentCentre' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.DOCUMENT_CENTER_TITLE');

    }

    ngOnInit() {
        this.accessRightService.getAccess(['WEB07', 'DOCSHARE', 'DOCUPLOAD']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.accessRights = res;
            if (this.accessRights) {
                if (this.accessRights['WEB07']['accessLevel'] === 0 && this.accessRights['WEB07']['menuDescr']) {
                    this.router.navigate(['/client', this.clientId, 'overview']);
                } else if (this.accessRights['WEB07']['accessLevel'] === 1) {
                    this.isReadOnly = true;
                }

                this.translate.get([
                    'DOCUMENT.FILTER_OPTIONS.ALL',
                    'DOCUMENT.FILTER_OPTIONS.IN_PROGRESS',
                    'DOCUMENT.FILTER_OPTIONS.REVIEW',
                    'DOCUMENT.FILTER_OPTIONS.COMPLETE',
                    'DOCUMENT.FILTER_OPTIONS.PENDING',
                    'DOCUMENT.FILTER_OPTIONS.VIEWED',
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(t => {
                    this.filterBy = [
                        {
                            id: 'ALL',
                            name: t['DOCUMENT.FILTER_OPTIONS.ALL'],
                            lowVersion: this.accessRights['DOCSHARE']['accessLevel'] === 0,
                            canUpdate: false
                        },
                        { id: 'IN_PROGRESS', name: t['DOCUMENT.FILTER_OPTIONS.IN_PROGRESS'], lowVersion: false, canUpdate: true },
                        {
                            id: 'REVIEW',
                            name: t['DOCUMENT.FILTER_OPTIONS.REVIEW'],
                            lowVersion: this.accessRights['DOCSHARE']['accessLevel'] === 0,
                            canUpdate: true
                        },
                        { id: 'COMPLETE', name: t['DOCUMENT.FILTER_OPTIONS.COMPLETE'], lowVersion: false, canUpdate: true },
                        {
                            id: 'PENDING',
                            name: t['DOCUMENT.FILTER_OPTIONS.PENDING'],
                            lowVersion: this.accessRights['DOCSHARE']['accessLevel'] === 0,
                            canUpdate: false
                        },
                        {
                            id: 'VIEWED',
                            name: t['DOCUMENT.FILTER_OPTIONS.VIEWED'],
                            lowVersion: this.accessRights['DOCSHARE']['accessLevel'] === 0,
                            canUpdate: false
                        },
                    ];
                });
            }
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];

            this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(payload => {
                let clientEmail = '';

                this.client = payload[payload.findIndex(member => member.personalDetails && member.personalDetails.id === this.clientId)];
                if (this.client) {
                    clientEmail = this.client['personalDetails']['email'];
                    this.clientHasEmail = Boolean(clientEmail);
                }
            });


            this.getDocumentListWithFilterOption();
            this.eventSubscription = this.documentService.eventEmitter.subscribe(x => {
                this.getDocumentListWithFilterOption();
            });

            this.store.select(getIsDocumentLoaded).pipe(takeUntil(this.unsubscribe$)).subscribe(loaded => {
                if (!loaded) {
                    this.documentService.getClientDocumentPayloads(this.clientId);
                } else {
                    this.store.select(getDocumentPayloads).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                        this.groupingData(data);
                    });
                }
            });
        });
        this.documentService.subscribeToInvite().pipe(takeUntil(this.unsubscribe$)).subscribe(docinfo => {
            this.doSend(docinfo.docid);
        });

    }

    groupingData(documents) {
        const documentArr = Object.assign([], documents);
        this.documentList = {};
        this.documentTypes = [];
        documentArr.forEach(function (document) {
            const groupByData = document[this.selectedGroupBy.field];
            if (!this.documentList.hasOwnProperty(groupByData)) {
                this.documentList[groupByData] = [];
                this.documentTypes.push(groupByData);
            }
            // if pre existing SDB item has a null status
            // default to IN_PROGRESS
            if ( !document.hasOwnProperty('status')) {
                document.status='IN_PROGRESS';
            }
            document['color'] = statusData[document.status]['color'];
            document['docStatus'] = statusData[document.status]['status'];
            this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(familymembers => {
                const member = familymembers.find(item => {
                    return item.id = this.clientId;
                });
                if (member) {
                    document['viewedByMember'] = member.personalDetails;
                } else {
                    document['viewedByMember'] = {};
                }
            });
            this.documentList[groupByData].push(document);
        }, this);
    }

    async getDocumentListWithFilterOption() {
        const documentArr = await this.documentService.getClientDocuments(this.clientId, this.searchString, this.selectedFilter.id, this.selectedSort.id)
            .debounceTime(1000)
            .distinctUntilChanged()
            .toPromise();
        await this.groupingData(documentArr);

    }

    public getFilterDocument(event) {
        this.selectedFilter = event;
        this.getDocumentListWithFilterOption();
    }

    public getSortDocument(event) {
        this.selectedSort = event;
        this.getDocumentListWithFilterOption();
    }

    serachDocument() {
        this.getDocumentListWithFilterOption();
    }

    public changeDocumentAction(index: number, jIndex: number) {
        if ($('#dropdownUpdateStatus_' + index + '_' + jIndex).is(':visible')) {
            $('.dropdown-status-action').hide();
            $('#dropdownDocumentAction_' + index + '_' + jIndex).hide();
        } else {
            if ($('#dropdownDocumentAction_' + index + '_' + jIndex).is(':visible')) {
                $('.dropdown-document-action').hide();
            } else {
                $('.dropdown-document-action').hide();
                $('#dropdownDocumentAction_' + index + '_' + jIndex).toggle();
            }
        }
    }

    public changeUpdateStatus(index: number, jIndex: number) {
        $('.dropdown-document-action').hide();
        $('#dropdownUpdateStatus_' + index + '_' + jIndex).toggle();
    }

    public downloadClientDocument(docId) {
        this.isDownloaded = false;
        this.documentService.downloadClientDocument(docId).toPromise().then(result => {
            if (result) {
                this.documentService.getClientDocumentPayloads(this.clientId);
                const headers = result.headers.get('content-disposition');
                const filename = headers.split('=')[1];
                this.documentService.downloadFile(result.body, filename, docId).pipe(takeUntil(this.unsubscribe$)).subscribe(r => { this.documentService.eventEmitter.emit() });
                this.isDownloaded = true;
            }
        }).catch(errorResponse => {
            this.isDownloaded = true;
            Swal('Oops...', errorResponse.error.errorMessage, 'error');
        });
    }

    shareClientDocument(docTypeId, docId) {
        this.router.navigate(['./client', this.clientId, 'document-centre', this.clientId, 'send-invite', docTypeId, docId]);
    }

    private doSend(docId) {
        this.documentService.shareClientDocument(docId).toPromise().then(result => {
            if (result != null) {
                this.getDocumentListWithFilterOption();

                Swal('Shared!', 'Document shared successfully.', 'success');
            } else {
                Swal('Oops...', '', 'error');
            }
        }).catch(errorResponse => {
            Swal('Oops...', errorResponse.error.errorMessage, 'error');
        });
    }

    unshareClientDocument(docId) {
        this.documentService.unshareClientDocument(docId).toPromise().then(result => {
            if (result != null) {
                this.getDocumentListWithFilterOption();
                Swal('Unshared!', 'Document unshared successfully.', 'success');
            } else {
                Swal('Oops...', '', 'error');
            }
        }).catch(errorResponse => {
            Swal('Oops...', errorResponse.error.errorMessage, 'error');
        });
    }

    deleteDocument(docId) {
        this.translate.get([
            'DELETE.POPUP.DOCUMENT_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.DOCUMENT_DELETE',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.DOCUMENT_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']

            }).then((result) => {
                if (result.value) {
                    this.documentService.deleteClientDocument(docId).toPromise().then(response => {
                        this.documentService.getClientDocumentPayloads(this.clientId);
                        this.advisorService.getAdvisorDocumentPayload();
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.DOCUMENT_DELETE'], 'success');
                    }).catch(errorResponse => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    updateDocumentStatus(docId, status) {
        this.translate.get([
            'SWEET_ALERT.POPUP.UPDATE_DOCUMENT_STATUS'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.documentService.updateClientDocumentStatus(docId, status).toPromise().then(result => {
                this.documentService.getClientDocumentPayloads(this.clientId);
                this.advisorService.getAdvisorDocumentPayload();
                Swal('Updated!', i18text['SWEET_ALERT.POPUP.UPDATE_DOCUMENT_STATUS'], 'success');
            }).catch(errorResponse => {
                Swal('Oops...', errorResponse.error.errorMessage, 'error');
            });
        });
    }

    ngOnDestroy() {
        this.eventSubscription.unsubscribe();
        this.eventSubscription = null;
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
