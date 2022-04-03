import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Angulartics2 } from 'angulartics2';
import { slideInOutAnimation } from '../../../shared/animations';
import { NotesService } from '../../service';
import { PageTitleService } from '../../../shared/page-title';
import { RefreshDataService } from '../../../shared/refresh-data';
import { AppState, getAdvisorPayload, getAllCountryFormatePayload } from '../../../shared/app.reducer';
@Component({
    selector: 'app-search-notes',
    templateUrl: './search-notes.component.html',
    styleUrls: ['./search-notes.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class SearchNotesComponent implements OnInit, OnDestroy {

    clientId = '';
    closeButtonDisable = false;
    invalidFromDate = false;
    invalidToDate = false;
    noteTypes = [];
    today = new Date();
    searchParams = {
        type: {},
        from: new Date(this.today.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
    };
    dateFormat = 'yy/mm/dd';
    formatsByCountry: any;
    maxDate = new Date();
    yearRange = (this.maxDate.getFullYear() - 100) + ':' + this.maxDate.getFullYear();
    accessToDelete = true;
    showDateError = false;
    notesList: any;
    noteTypesObject: any = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private _location: Location,
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private notesService: NotesService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private dataSharing: RefreshDataService
    ) {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.pageTitleService.setPageTitle('pageTitle|TAB.SEARCH_NOTES');
        this.angulartics2.eventTrack.next({ action: 'search_notes' });
    }

    ngOnInit() {
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.formatsByCountry = data;
                this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                    if (res && res['country']) {
                        const format = this.formatsByCountry[res['country']]['dateFormate'];
                        if (format.includes('yyyy') || format.includes('YYYY')) {
                            this.dateFormat = format.replace('yyyy' || 'YYYY', 'yy');
                        } else {
                            this.dateFormat = format.replace('yy' || 'YY', 'y');
                        }
                    }
                });
            }
        });
        this.getNoteTypes();
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('refresh_notes_list')) {
                this.getNoteTypes();
                this.dataSharing.changeMessage('default message');
            }
        });
    }

    getNoteTypes() {
        this.notesService.getListOfNoteTypes(true).toPromise().then(res => {
            res.forEach(type => {
                this.translate.get([
                    'SSID_LABELS.' + type.ssid
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                    type['description'] = text['SSID_LABELS.' + type.ssid];
                    this.noteTypesObject[type.ssid] = text['SSID_LABELS.' + type.ssid];
                });
            });
            this.noteTypes = res;
            this.searchParams['type'] = this.noteTypes[0];
            this.searchNote();
        }).catch(err => { });
    }

    searchNote() {
        this.invalidFromDate = this.searchParams['from'] > this.maxDate ? true : false;
        this.invalidToDate = this.searchParams['to'] > this.maxDate ? true : false;
        if (this.searchParams['from'] && this.searchParams['to'] && !this.invalidFromDate && !this.invalidToDate) {
            if (this.searchParams['from'] <= this.searchParams['to']) {
                this.showDateError = false;
                const searchPayload = {
                    fromDate: moment(this.searchParams['from']).format('YYYY-MM-DD'),
                    noteType: this.searchParams['type']['noteId'],
                    toDate: moment(this.searchParams['to']).format('YYYY-MM-DD')
                };
                this.notesService.getListOfNotes(this.clientId, searchPayload).toPromise().then(res => {
                    this.notesList = res;
                }).catch(err => {
                    this.notesList = {};
                });
            } else {
                this.showDateError = true;
            }
        }
    }

    toggleActionMenu(id, index) {
        if ($('#' + id + '_' + index).is(':visible')) {
            $('.dropdown-notes-action').hide();
        } else {
            $('.dropdown-notes-action').hide();
            $('#' + id + '_' + index).toggle();
        }
    }

    deleteNote(noteId, type, dateStamp) {
        this.translate.get([
            'NOTES.POPUP.CONFIRM_DELETE_TITLE',
            'ALERT_MESSAGE.WARNING_MESSAGE',
            'NOTES.POPUP.SUCCESSFULLY_DELETED',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ], { noteType: this.noteTypesObject[type], dateStamp: dateStamp }).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['NOTES.POPUP.CONFIRM_DELETE_TITLE'],
                text: i18MenuTexts['ALERT_MESSAGE.WARNING_MESSAGE'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.notesService.deleteNote(this.clientId, noteId).toPromise().then(res => {
                        this.searchNote();
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['NOTES.POPUP.SUCCESSFULLY_DELETED'], 'success');
                    }).catch(err => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    back() {
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
