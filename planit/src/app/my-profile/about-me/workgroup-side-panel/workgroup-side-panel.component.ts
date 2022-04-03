import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { slideInOutAnimation } from '../../../shared/animations';
import { AdvisorService } from '../../../advisor/service/advisor.service';
import { RefreshDataService } from '../../../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../shared/page-title';
import { Angulartics2 } from 'angulartics2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-workgroup-side-panel',
    templateUrl: './workgroup-side-panel.component.html',
    styleUrls: ['./workgroup-side-panel.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class WorkgroupSidePanelComponent implements OnInit, OnDestroy {
    action = 1;
    workgroupId = '';
    workgroupDetails: any = {};
    newUserID = '';
    usersList = [];
    alreadyMemberError = 0;
    multipleSearchResultsError = 0;
    userNotFoundError = 0;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private _location: Location,
        private route: ActivatedRoute,
        private advisorService: AdvisorService,
        private dataSharing: RefreshDataService,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'workGroupSidePanel' });
        if (this.router.url.indexOf('add-workgroup') > -1) {
            this.action = 1;
            this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_WORKGROUP');
        } else if (this.router.url.indexOf('edit-workgroup') > -1) {
            this.action = 2;
            this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_WORKGROUP');
            this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
                this.workgroupId = param['workgroupId'];
            });
        }
    }

    ngOnInit() {
        this.getUsersListForDropdown();
        if (this.action === 2) {
            this.getWorkgroupDetails();
        }
    }

    getWorkgroupDetails() {
        this.workgroupDetails = {};
        this.usersList = [];
        this.advisorService.getWorkgroupDetailsByID(this.workgroupId).toPromise().then(res => {
            this.workgroupDetails = res;
        }).catch(err => { });
    }

    getUsersListForDropdown() {
        this.advisorService.getUsersListForWorkgroup(this.workgroupId).toPromise().then(res => {
            res.forEach(user => {
                user['name'] = user['firstName'] + ' ' + user['lastName'];
                this.usersList.push(user);
            });
        }).catch(err => { });
    }

    addUser() {
        this.userNotFoundError = 0;
        this.multipleSearchResultsError = 0;
        this.alreadyMemberError = 0;
        this.advisorService.searchUserForWorkgroup(this.newUserID).toPromise().then(res => {
            if (res.length === 0) {
                this.userNotFoundError = 1;
            } else if (res.length === 1) {
                const newUser = res[0];
                const member = {
                    avtar: newUser['avtar'],
                    firstName: newUser['firstName'],
                    lastName: newUser['lastName'],
                    memberId: newUser['memberId'],
                    status: 0
                };
                if (!this.workgroupDetails.hasOwnProperty('members')) {
                    this.workgroupDetails['members'] = [];
                }
                const index = this.workgroupDetails['members'].findIndex(mem => mem.memberId === member.memberId);
                if (index < 0) {
                    this.workgroupDetails['members'].push(member);
                } else {
                    this.alreadyMemberError = 1;
                }
                this.newUserID = '';
            }
        });
    }

    removeUser(member) {
        const payload = {
            planner: member.memberId,
            workgroupid: this.workgroupId,
            status: member.status
        };
        this.translate.get([
            'WORKGROUP.POPUP.DELETE_MEMBER_CONFIRMATION.TITLE',
            'WORKGROUP.POPUP.DELETE_MEMBER_CONFIRMATION.TEXT.PART_1',
            'WORKGROUP.POPUP.DELETE_MEMBER_CONFIRMATION.TEXT.PART_2',
            'WORKGROUP.POPUP.DELETE_MEMBER_CONFIRMATION.TEXT.PART_3',
            'WORKGROUP.POPUP.MEMBER_SUCCESSFULLY_DELETED',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            Swal({
                title: '',
                html: text['WORKGROUP.POPUP.DELETE_MEMBER_CONFIRMATION.TEXT.PART_1'] + '<br/> <span class="fw-600">' + member.firstName + ' ' + member.lastName + '</span> (<span class="fw-600">' +
                    member.memberId + '</span>) ' + text['WORKGROUP.POPUP.DELETE_MEMBER_CONFIRMATION.TEXT.PART_2'] + ' <br/> <small>' + text['WORKGROUP.POPUP.DELETE_MEMBER_CONFIRMATION.TEXT.PART_3'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.userNotFoundError = 0;
                    this.multipleSearchResultsError = 0;
                    this.alreadyMemberError = 0;
                    if (this.action === 1 || member.status === 0) {
                        const index = this.workgroupDetails['members'].findIndex(mem => mem['memberId'] === member['memberId']);
                        if (index > -1) {
                            this.workgroupDetails['members'].splice(index, 1);
                            Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['WORKGROUP.POPUP.MEMBER_SUCCESSFULLY_DELETED'], 'success');
                        }
                    } else if (this.action === 2 && member.status > 1) {
                        this.advisorService.deleteMemberFromWorkgroup(payload).toPromise().then(res => {
                            this.dataSharing.changeMessage('refresh_workgroup_list');
                            this.getWorkgroupDetails();
                            this.getUsersListForDropdown();
                            Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['WORKGROUP.POPUP.MEMBER_SUCCESSFULLY_DELETED'], 'success');
                        }).catch(err => {
                            Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                        });
                    }
                }
            });
        });
    }

    submitForm() {
        this.translate.get([
            'WORKGROUP.POPUP.GROUP_SUCCESSFULLY_ADDED',
            'WORKGROUP.POPUP.GROUP_SUCCESSFULLY_UPDATED',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
            if (this.action === 1) {
                this.advisorService.addNewWorkgroup(this.workgroupDetails).toPromise().then(res => {
                    this.dataSharing.changeMessage('refresh_workgroup_list');
                    Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['WORKGROUP.POPUP.GROUP_SUCCESSFULLY_ADDED'], 'success');
                    this.back();
                }).catch(err => {
                    Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
            } else if (this.action === 2) {
                this.advisorService.updateWorkgroup(this.workgroupDetails).toPromise().then(res => {
                    this.dataSharing.changeMessage('refresh_workgroup_list');
                    Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['WORKGROUP.POPUP.GROUP_SUCCESSFULLY_UPDATED'], 'success');
                    this.back();
                }).catch(err => {
                    Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                });
            }
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
