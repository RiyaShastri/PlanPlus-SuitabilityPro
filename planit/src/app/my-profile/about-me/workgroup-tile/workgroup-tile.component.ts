import * as $ from 'jquery';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { WorkgroupPayload } from '../../my-profile-models';
import Swal from 'sweetalert2';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { RefreshDataService } from '../../../shared/refresh-data';
import { Store } from '@ngrx/store';
import { AppState, getAdvisorPayload } from '../../../shared/app.reducer';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-workgroup-tile',
    templateUrl: './workgroup-tile.component.html',
    styleUrls: ['./workgroup-tile.component.css']
})
export class WorkgroupTileComponent implements OnInit, OnDestroy {
    plannerId;
    myWorkgroups;
    memberWorkgroups;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private dataSharing: RefreshDataService,
        private translate: TranslateService
    ) {
        this.myWorkgroups = WorkgroupPayload['myWorkgroups'];
        this.memberWorkgroups = WorkgroupPayload['memberWorkgroups'];
    }

    ngOnInit() {
        this.store.select(getAdvisorPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(advisorDetails => {
            if (advisorDetails) {
                this.plannerId = advisorDetails['planner'];
                if (this.plannerId) {
                    this.getOwnedWorkgroupDetails();
                    this.getMemberWorkgroupDetails();
                }
            } else {
                // this.advisorService.getAdvisorPayload();
            }
        });
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('refresh_workgroup_list')) {
                if (this.plannerId) {
                    this.getOwnedWorkgroupDetails();
                    this.getMemberWorkgroupDetails();
                }
                this.dataSharing.changeMessage('default message');
            }
        });
    }

    getOwnedWorkgroupDetails() {
        this.advisorService.getWorkgroupDetails('Owned').toPromise().then(res => {
            this.myWorkgroups = res;
            this.joinMembersList(this.myWorkgroups, 'Owned');
        }).catch(err => { });
    }

    getMemberWorkgroupDetails() {
        this.advisorService.getWorkgroupDetails('Memebers').toPromise().then(res => {
            this.memberWorkgroups = res;
            this.joinMembersList(this.memberWorkgroups, 'Memebers');
        }).catch(err => { });
    }

    joinMembersList(workgroupList, type) {
        workgroupList.forEach(workgroup => {
            workgroup['memberList'] = '';
            workgroup['isMember'] = '';
            workgroup['members'].forEach((member, index) => {
                if (member.memberId !== this.plannerId) {
                    workgroup['memberList'] = workgroup['memberList'] + member.firstName + ' ' + member.lastName;
                    if (index < (workgroup['members'].length - 1)) {
                        workgroup['memberList'] = workgroup['memberList'] + ', ';
                    }
                } else {
                    if (type === 'Memebers') {
                        workgroup['isMember'] = member.status === 2 ? true : member.status === 3 ? false : '';
                    }
                }
            });
        });
    }

    public toggleActionMenu(id, index) {
        if ($('#' + id + '_' + index).is(':visible')) {
            $('.dropdown-workgroup-action').hide();
        } else {
            $('.dropdown-workgroup-action').hide();
            $('#' + id + '_' + index).toggle();
        }

    }

    deleteWorkgroup(workgroupId) {
        this.translate.get([
            'WORKGROUP.POPUP.DELETE_CONFIRMATION.TITLE',
            'WORKGROUP.POPUP.DELETE_CONFIRMATION.TEXT',
            'WORKGROUP.POPUP.SUCCESSFULLY_DELETED',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            Swal({
                title: text['WORKGROUP.POPUP.DELETE_CONFIRMATION.TITLE'],
                text: text['WORKGROUP.POPUP.DELETE_CONFIRMATION.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.advisorService.deleteWorkgroup(workgroupId).toPromise().then(res => {
                        Swal(text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], text['WORKGROUP.POPUP.SUCCESSFULLY_DELETED'], 'success');
                        this.myWorkgroups = [];
                        this.getOwnedWorkgroupDetails();
                    }).catch(err => {
                        Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    joinOrLeaveWorkgroup(workgroupId, isMember) {
        const payload = {
            join: true,
            workgroupid: workgroupId
        };
        if (isMember === false) {
            payload.join = true;
            this.translate.get([
                'WORKGROUP.POPUP.SUCCESSFULLY_JOINED_GROUP',
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ALERT_MESSAGE.OOPS_TEXT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                this.advisorService.joinOrLeaveWorkgroup(payload).toPromise().then(res => {
                    this.memberWorkgroups = [];
                    this.getMemberWorkgroupDetails();
                    Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['WORKGROUP.POPUP.SUCCESSFULLY_JOINED_GROUP'], 'success');
                }).catch(err => {
                    Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
            });
        } else if (isMember === true) {
            this.translate.get([
                'WORKGROUP.POPUP.LEAVE_GROUP_CONFIRM.TITLE',
                'WORKGROUP.POPUP.LEAVE_GROUP_CONFIRM.TEXT',
                'WORKGROUP.POPUP.SUCCESSFULLY_LEFT_GROUP',
                'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ALERT_MESSAGE.OOPS_TEXT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal({
                    title: text['WORKGROUP.POPUP.LEAVE_GROUP_CONFIRM.TITLE'],
                    text: text['WORKGROUP.POPUP.LEAVE_GROUP_CONFIRM.TEXT'],
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT']
                }).then(result => {
                    if (result.value) {
                        payload.join = false;
                        this.advisorService.joinOrLeaveWorkgroup(payload).toPromise().then(res => {
                            this.memberWorkgroups = [];
                            this.getMemberWorkgroupDetails();
                            Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['WORKGROUP.POPUP.SUCCESSFULLY_LEFT_GROUP'], 'success');
                        }).catch(err => {
                            Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                        });
                    }
                });
            });
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
