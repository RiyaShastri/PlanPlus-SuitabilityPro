import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { Angulartics2 } from 'angulartics2';
import { NotesService } from '../../service';
import { NOTE_FIELD_TYPES } from '../../../shared/constants';
import { PageTitleService } from '../../../shared/page-title';
import { slideInOutAnimation } from '../../../shared/animations';
import { RefreshDataService } from '../../../shared/refresh-data';
import { AppState, getAdvisorPayload, getAllCountryFormatePayload } from '../../../shared/app.reducer';
@Component({
    selector: 'app-notes-side-panel',
    templateUrl: './notes-side-panel.component.html',
    styleUrls: ['./notes-side-panel.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class NotesSidePanelComponent implements OnInit, OnDestroy {

    clientId = '';
    closeButtonDisable = false;
    saveDisable = false;
    editable = true;
    noteId = '';
    noteTypes = [];
    noteDetails: any = {};
    invalidDate = false;
    dateFormat = 'yy/mm/dd';
    formatsByCountry = [];
    maxDate = new Date();
    yearRange = (this.maxDate.getFullYear() - 100) + ':' + this.maxDate.getFullYear();
    hourFormat = '12';
    invalidTime = false;
    advisorDetails: any = {};
    noteTypesObject: any = {};
    noteFieldType = NOTE_FIELD_TYPES;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private _location: Location,
        private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private notesService: NotesService,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private dataSharing: RefreshDataService
    ) {
        if (this.router.url.indexOf('view-note') > 0) {
            this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.noteId = params['noteId'];
            });
            this.editable = false;
        }
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });

        this.pageTitleService.setPageTitle('pageTitle|TAB.NOTES');
        this.angulartics2.eventTrack.next({ action: 'notes' });
    }

    ngOnInit() {
        this.store.select(getAllCountryFormatePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data) {
                this.formatsByCountry = data;
                this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                    this.advisorDetails = res;
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
        if (this.noteId && !this.editable) {
            this.notesService.getNoteDetailById(this.clientId, this.noteId).toPromise().then(response => {
                this.noteDetails = response;
            }).catch(err => { });
        } else {
            this.noteDetails['date'] = new Date();
            this.noteDetails['time'] = new Date();
        }
        this.notesService.getListOfNoteTypes(false).toPromise().then(res => {
            res.forEach(type => {
                this.translate.get([
                    'SSID_LABELS.' + type.ssid
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                    type['description'] = text['SSID_LABELS.' + type.ssid];
                    this.noteTypesObject[type.ssid] = text['SSID_LABELS.' + type.ssid];
                });
            });
            this.noteTypes = res;
        }).catch(err => { });
    }

    validateDate() {
        this.invalidDate = this.noteDetails['date'] > this.maxDate ? true : false;
        this.validateTime();
    }

    validateTime() {
        this.invalidTime = false;
        const time = moment(this.noteDetails['time']).format('HH:mm');
        if (moment(this.noteDetails['date']).format('YYYY-MM-DD') === moment(this.maxDate).format('YYYY-MM-DD')) {
            if (time > moment().format('HH:mm')) {
                this.invalidTime = true;
            }
        }
    }

    back() {
        this._location.back();
        this.dataSharing.changeMessage('default message');
    }

    saveNote(type, f: NgForm) {
        const payload = {
            noteId: this.noteDetails['noteId']['noteId'],
            note: this.noteDetails['note'],
            date: moment(this.noteDetails['date']).format('YYYY-MM-DD'),
            hours: moment(this.noteDetails['time']).format('h'),
            min: moment(this.noteDetails['time']).format('mm'),
            block: moment(this.noteDetails['time']).format('a') === 'am' ? 0 : 1,
            noteSupps: this.noteDetails['noteSupps']
        };
        this.translate.get([
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'NOTES.POPUP.NOTE_SUCCESSFULLY_ADDED'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            this.notesService.addNote(this.clientId, payload).toPromise().then(res => {
                this.saveDisable = false;
                f.resetForm();
                this.dataSharing.changeMessage('refresh_notes_list');
                Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['NOTES.POPUP.NOTE_SUCCESSFULLY_ADDED'], 'success');
                if (type === 1) {
                    this.back();
                } else if (type === 2) {
                    this.noteDetails['date'] = new Date();
                    this.noteDetails['time'] = new Date();
                    this.router.navigate(['/client', this.clientId, 'add-note']);
                } else {
                    this.router.navigate(['/client', this.clientId, 'search-notes']);
                }
            }).catch(err => {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                this.saveDisable = false;
            });
        });
    }

    changeNoteType() {
        this.notesService.getNoteFieldsByType(this.noteDetails['noteId'].noteId).toPromise().then(data => {
            this.noteDetails['noteSupps'] = data;
        }).catch(err => { });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }


}
