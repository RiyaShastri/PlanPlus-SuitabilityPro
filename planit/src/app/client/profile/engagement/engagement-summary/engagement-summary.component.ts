import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import * as tableDragger from 'table-dragger';
import { ClientProfileService } from '../../../service';
import { AppState, getEngagementValue, getEngagementPriority } from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';
import { environment } from '../../../../../environments/environment';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-engagement-summary',
    templateUrl: './engagement-summary.component.html',
    styleUrls: ['./engagement-summary.component.css']
})
export class EngagementSummaryComponent implements OnInit, OnDestroy {
    index = -1;
    dragger;
    title = '';
    clientId = '';
    popupType = 0;
    isEditable = false;
    isValuesExpanded = false;
    isPrioritesExpanded = false;
    add_custom_priority = false;
    accessRights = {};
    engagementSummary = [];
    isClientPriorities = false;
    defaultPriorities = [];
    clientPriorities = [];
    selectedDefaultPriority = [];
    priorityReqJson = {};
    environment = {};
    saveDisabled = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private accessRightService: AccessRightService,
        private modalService: NgbModal,
        private clientProfileService: ClientProfileService,
        private angulartics2: Angulartics2,
        private refreshDataService: RefreshDataService,
        public translate: TranslateService,
        private pageTitleService: PageTitleService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.ENGAGEMENT_SUMMARY');
        this.angulartics2.eventTrack.next({ action: 'engagementSummary' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.environment = environment;
    }

    ngOnInit() {
        this.refreshPage();
        this.accessRightService.getAccess(['HMOGL', 'CLIVALUES', 'ENG01', 'INVITEVALUES']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.accessRights = res);
    }

    refreshPage() {
        this.getEngagementList();
        this.getClientPriorities();
    }

    getEngagementList() {
        this.store.select(getEngagementValue).pipe(takeUntil(this.unsubscribe$)).subscribe(engagementSummary => {
            this.engagementSummary = engagementSummary;
        });
    }

    getClientPriorities() {
        this.store.select(getEngagementPriority).pipe(takeUntil(this.unsubscribe$)).subscribe(priorities => {
            if (priorities.length > 0) {
                this.isClientPriorities = true;
                this.clientPriorities = priorities;
                this.isPrioritesExpanded = true;
            } else {
                this.isClientPriorities = false;
                this.clientPriorities = [];
                this.selectedDefaultPriority = [];
            }
            this.getDefaultPriorities();
        });
    }

    getDefaultPriorities() {
        this.clientProfileService.getAllPriorities(this.clientId).toPromise().then(defaultPriorities => {
            this.defaultPriorities = Object.assign([], defaultPriorities);
            if (!this.isClientPriorities) {
                this.isClientPriorities = false;
                this.clientPriorities = defaultPriorities;
            }
        }).catch(errorResponse => {
            this.defaultPriorities = [];
        });
    }

    toggleActionMenu(id, index) {
        if ($('#' + id + '_' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#' + id + '_' + index).toggle();
        }
    }

    deletePriority(priorityId) {
        this.translate.get([
            'DELETE.POPUP.PRIORITY_TITLE',
            'DELETE.POPUP.TEXT',
            'DELETE.POPUP.YES',
            'SWEET_ALERT.POPUP.PRIORITY_DELETE',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.PRIORITY_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['DELETE.POPUP.YES'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.clientProfileService.deleteClientPriority(this.clientId, priorityId).toPromise().then(deletedPriorities => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.PRIORITY_DELETE'], 'success');
                        this.isEditable = true;
                        this.clientProfileService.getClientEngagementPriorities(this.clientId);
                    }).catch(errorResponse => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                    });
                }
            });
        });
    }

    submitModal() {
        if (this.popupType === 1 && this.selectedDefaultPriority.length > 0) {
            this.clientProfileService.saveDefaultPriority(this.clientId, this.selectedDefaultPriority).toPromise().then(updatedPriorities => {
                this.selectedDefaultPriority = [];
                if (!this.add_custom_priority) {
                    this.clientProfileService.getClientEngagementPriorities(this.clientId);
                    this.saveDisabled = false;
                }
            });
        }
        if (this.popupType === 2 || (this.popupType === 1 && this.add_custom_priority)) {
            this.clientProfileService.addUpdateClientPriority(this.clientId, this.priorityReqJson).toPromise().then(updatedPriorities => {
                this.translate.get(['ENGAGEMENT.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal('Success', i18text['ENGAGEMENT.POPUP.SUCCESS'], 'success');
                });
                this.saveDisabled = false;
                this.add_custom_priority = false;
                this.makeEditable();
                this.clientProfileService.getClientEngagementPriorities(this.clientId);
            }).catch(errorResponse => {
                this.saveDisabled = false;
                Swal('Oops...', errorResponse['error']['errorMessage'], 'error');
            });
        }
    }

    open(content, type, index = 0) {
        this.popupType = type;
        this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
        if (type === 1) {
            this.title = 'Add Priority';
            this.priorityReqJson = {};
        } else if (type === 2) {
            this.title = 'Edit Priority';
            this.priorityReqJson = Object.assign({}, this.clientPriorities[index]);
        }
    }

    makeEditable() {
        this.isEditable = true;
        this.isPrioritesExpanded = true;
        if (this.isEditable && this.clientPriorities.length > 0 && this.isClientPriorities) {
            setTimeout(() => {
                const el = document.getElementById('priorities-table');
                this.dragger = tableDragger(el, {
                    mode: 'row',
                    dragHandler: '.draggable-row',
                    onlyBody: true,
                    animation: 300
                });
                this.dragger.on('drop', (from, to, el1) => {
                    this.clientPriorities[from]['rank'] = to;
                    if (from < to) {
                        for (let i = from; i < to; i++) {
                            this.clientPriorities[i + 1]['rank'] = i;
                        }
                    } else {
                        for (let i = from; i > to; i--) {
                            this.clientPriorities[i - 1]['rank'] = i;
                        }
                    }
                    this.clientPriorities.sort(function (obj1, obj2) { return obj1['rank'] - obj2['rank']; });
                });
            }, 500);
        }
    }

    editPriorities() {
        if (this.isClientPriorities) {
            this.clientProfileService.updateClientPriorities(this.clientId, this.clientPriorities).toPromise().then(updatedPriorities => {
                this.translate.get(['ENGAGEMENT.POPUP.SUCCESS_PRIORITIES']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal('Success', i18text['ENGAGEMENT.POPUP.SUCCESS_PRIORITIES'], 'success');
                });
                this.isEditable = false;
                this.saveDisabled = false;
                this.clientProfileService.getClientEngagementPriorities(this.clientId);
            }).catch(errorResponse => {
                Swal('Oops...', errorResponse['error']['errorMessage'], 'error');
                this.saveDisabled = false;
            });
        } else {
            this.clientProfileService.saveDefaultPriority(this.clientId, this.selectedDefaultPriority).toPromise().then(updatedPriorities => {
                this.selectedDefaultPriority = [];
                this.translate.get(['ENGAGEMENT.POPUP.SUCCESS_PRIORITIES']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                    Swal('Success', i18text['ENGAGEMENT.POPUP.SUCCESS_PRIORITIES'], 'success');
                });
                this.isEditable = false;
                this.saveDisabled = false;
                this.clientProfileService.getClientEngagementPriorities(this.clientId);
            }).catch(errorResponse => {
                Swal('Oops...', errorResponse['error']['errorMessage'], 'error');
                this.saveDisabled = false;
            });
        }
    }

    cancelChanges() {
        this.isEditable = false;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
