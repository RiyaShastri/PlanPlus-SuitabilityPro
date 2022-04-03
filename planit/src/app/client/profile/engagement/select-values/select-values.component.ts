import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ClientProfileService } from '../../../service';
import { slideInOutAnimation } from '../../../../shared/animations';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../../../shared/page-title';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-select-values',
    templateUrl: './select-values.component.html',
    styleUrls: ['./select-values.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class SelectValuesComponent implements OnInit, OnDestroy {
    personId;
    newValue;
    clientId = '';
    memberDetails;
    allValues = [];
    selectedValues = [];
    closeButtonDisable = false;
    saveDisabled = false;
    columnLength = 0;
    addButtonDisabled = false;
    customValues = [];
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private _location: Location,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        public translate: TranslateService,
        private clientProfileService: ClientProfileService,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.SELECT_VALUES_SIDE_PANEL');
        this.angulartics2.eventTrack.next({ action: 'engagementSelectValueSidePanel' });
        this.route.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.personId = this.route.snapshot.params['personalId'];
    }

    ngOnInit() {
        if (this.personId) {
            this.clientProfileService.getAllValues(this.personId).toPromise().then(values => {
                values.forEach(value => {
                    if (value.custom === false) {
                        this.allValues.push(value);
                    }
                });
                this.columnLength = Math.ceil(this.allValues.length / 2);
            }).catch(errorResponse => {
                this.allValues = [];
            });
            this.clientProfileService.getEngagementList(this.clientId).toPromise().then(engagementSummary => {
                engagementSummary.forEach(personEngagement => {
                    if (personEngagement.personId === this.personId) {
                        this.memberDetails = personEngagement;
                        this.memberDetails['values'].forEach(value => {
                            this.selectedValues.push(value.id);
                            if (value.custom === true) {
                                this.customValues.push(value);
                            }
                        });
                    }
                });
            }).catch(() => {
            });
        }

        this.accessRightService.getAccess(['CLIVALUES']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res) {
                    this.accessRights = res;
                }
            });
    }

    open(content) {
        this.newValue = '';
        this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
    }

    closeModal() {
        this.router.navigate(['/client/' + this.clientId + '/profile/engagement/summary/' + this.personId + '/select-values']);
    }

    addValue() {
        this.addButtonDisabled = true;
        const i = this.customValues.length;
        this.customValues.push({
            id: 'custom_value_' + i,
            text: this.newValue,
            details: 'This is a custom value',
            selected: true,
            custom: true
        });
        this.selectedValues.push('custom_value_' + i);
        this.columnLength = Math.ceil(this.allValues.length / 2);
        this.addButtonDisabled = false;
    }

    selectValues() {
        this.saveDisabled = true;
        if (this.selectedValues.length !== 5) {
            this.saveDisabled = false;
            const len = this.selectedValues.length;
            const param = { 'length': len };
            this.translate.get(['ENGAGEMENT.VALUES_WARNING', 'ALERT_MESSAGE.OOPS_TEXT'], param).pipe(takeUntil(this.unsubscribe$)).subscribe((res: string) => {
                Swal(res['ALERT_MESSAGE.OOPS_TEXT'], res['ENGAGEMENT.VALUES_WARNING'], 'error');
            });
        } else {
            const payload = [];
            const values = this.allValues.concat(this.customValues);
            values.forEach(element => {
                if (this.selectedValues.includes(element['id'])) {
                    const obj = {
                        custom: element['custom'],
                        description: element['text'],
                        valueId: typeof element['id'] === 'string' && element['id'].includes('custom_value_') ? null : element['id']
                    };
                    payload.push(obj);
                }
            });
            this.clientProfileService.updatePersonValues(this.personId, payload).toPromise().then(updated => {
                this.translate.get([
                    'SWEET_ALERT.POPUP.VALUES_UPDATE'
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
                    Swal('Success', i18MenuTexts['SWEET_ALERT.POPUP.VALUES_UPDATE'], 'success');
                });
                this.clientProfileService.getClientEngagementValues(this.clientId);
                this.back();
                this.saveDisabled = false;
            }).catch(errorResponse => {
                this.translate.get([
                    'ALERT_MESSAGE.OOPS_TEXT'
                ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
                    Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                });
                this.saveDisabled = false;
            });
        }
    }

    back() {
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
