import { fadeInAnimation } from '../../shared/animations';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import * as $ from 'jquery';

import { TaskNotificationService } from '../task-notification.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { AppState, getTaskAndNotificationPayload, getAdvisorTaskNotificationPayload } from '../../shared/app.reducer';
import { AdvisorService } from '../../advisor/service/advisor.service';
import * as moment from 'moment';
import { PageTitleService } from '../../shared/page-title';
import { RefreshDataService } from '../../shared/refresh-data';
import { AccessRightService } from '../../shared/access-rights.service';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-task-notification',
    templateUrl: './task-notification.component.html',
    styleUrls: ['./task-notification.component.css'],
    animations: [fadeInAnimation],
    // attach the fade in animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@fadeInAnimation]': '' }
})
export class TaskNotificationComponent implements OnInit, OnDestroy {
    changePage: Subject<number> = new Subject();
    @ViewChild('system') public system: NgbTooltip;
    @ViewChild('manual') public manual: NgbTooltip;
    clientId = '';
    currentClient = '';
    groupValues = [];
    groupTasks = {};
    messageBadges = {
        'NOTIFICATION': {},
        'TASK': {}
    };
    viewList = [
        { id: 1, name: 'All' },
        { id: 2, name: 'Completed' },
        { id: 3, name: 'Current client' },
        { id: 4, name: 'New' },
        { id: 5, name: 'Uncompleted' }
    ];
    filterViewList = Object.assign([], this.viewList);
    defaultView = this.filterViewList[3];
    sortList = [
        { id: 1, name: 'Assigned' },
        { id: 2, name: 'Client name' },
        { id: 4, name: 'Due date' },
        { id: 5, name: 'Type' },
        { id: 3, name: 'Completed date' },
    ];
    filterSortList = Object.assign([], this.sortList);
    defaultSort = this.sortList[3];
    groupList = [
        { id: 1, name: 'Assigned', groupBy: 'planner', field: 'planner' },
        { id: 2, name: 'None', groupBy: 'none', field: '' },
        { id: 3, name: 'Status', groupBy: 'type', field: '' },
        { id: 4, name: 'Type', groupBy: 'taskType', field: 'label' },
        { id: 5, name: 'Uncompleted / Completed', groupBy: 'complete', field: '' }
    ];
    defaultGroup = this.groupList[1];
    taskTypes = [];
    taskData: any;
    assignList = [
        { id: 1, value: 'Joe Advisor' }
    ];
    dataModel: any = {};
    fromDateList = [
        { id: 1, date: 'Past 30 days', daysToAdd: '-30' },
        { id: 2, date: 'Past 7 days', daysToAdd: '-7' },
        { id: 3, date: 'Yesterday', daysToAdd: '-1' },
        { id: 4, date: 'Next 7 days', daysToAdd: '+7' }
    ];
    toDateList = [
        { id: 1, date: 'Tomorrow', daysToAdd: '+1' },
        { id: 2, date: 'Next 7 days', daysToAdd: '+7' },
        { id: 3, date: 'Next 30 days', daysToAdd: '+30' },
        { id: 4, date: 'Next 90 days', daysToAdd: '+90' },
        { id: 5, date: 'Past 7 days', daysToAdd: '-7' }
    ];
    filterData: any = {};
    today = new Date().toISOString().substring(0, 10);
    taskLoaded = false;
    accessRights = {};
    isSpecificClient = false;
    totalPages;
    closeButtonDisable = false;
    isNewTask = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private taskNotificationService: TaskNotificationService,
        private advisorService: AdvisorService,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService,
        private store: Store<AppState>,
        private dataSharing: RefreshDataService,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'taskAndNotification' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.TASK_AND_NOTIFICATION_TITLE');
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
            if (this.clientId !== undefined) {
                localStorage.setItem('currentClientId', this.clientId);
            } else {
                this.clientId = 'all';
            }
            if (this.clientId === 'all' && localStorage.getItem('currentClientId') !== 'all') {
                this.currentClient = localStorage.getItem('currentClientId');
                localStorage.removeItem('currentClientId');
            }
            if (this.currentClient == null || this.currentClient === '') {
                this.filterViewList = Object.assign([], this.viewList);
                this.filterViewList.splice(2, 1);
                this.defaultView = this.filterViewList.find(x => x.id === 5);
            }
        });
        this.isSpecificClient = this.router.url.includes('/client/' + this.clientId + '/task-notification') ? true : false;
        if (this.isSpecificClient && this.clientId !== 'all') {
            this.filterSortList = Object.assign([], this.sortList);
            this.filterSortList.splice(1, 1);
            this.defaultSort = this.filterSortList.find(x => x.id === 4);
        } else {
            this.filterSortList = Object.assign([], this.sortList);
            this.defaultSort = this.filterSortList.find(x => x.id === 4);
        }
    }

    async ngOnInit() {
        this.defaultView = this.filterViewList.find(x => x.id === 5);
        await this.getIsNewTask(true);
        this.accessRightService.getAccess(['ADTSK']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.dataModel['complete'] = new Date();
        this.selectDatePeriod({ value: { daysToAdd: '-30' } }, 'fromDate');
        this.selectDatePeriod({ value: { daysToAdd: '+30' } }, 'toDate');
        this.filterData = {
            from: moment(this.dataModel['fromDate']).format('YYYY-MM-DD'),
            to: moment(this.dataModel['toDate']).format('YYYY-MM-DD'),
            groupBy: this.defaultGroup.name,
            sortBy: this.defaultSort.name,
            view: this.defaultView.name,
            limit: 20,
            messageType: [
                'task',
                'notification',
            ],
            pageNo: 1,
        };
        this.getTaskList();
        this.taskNotificationService.getTaskTypes().toPromise().then(res => {
            this.taskTypes = res;
        }).catch(err => { });
        this.dataSharing.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message === 'new_task_added' && this.clientId !== 'all') {
                this.defaultView = this.filterViewList[3];
                this.filterData.view = this.defaultView.name;
                this.getTaskList();
                this.dataSharing.changeMessage('default');
            }
        });
    }

    async getIsNewTask(initial = false) {
        await this.advisorService.getNewTaskBellDigits().toPromise().then(taskDigits => {
            this.isNewTask = taskDigits['response'] > 0 ? true : false;
            if (initial) {
                if (this.isNewTask) {
                    this.defaultView = this.filterViewList.find(x => x.id === 4);
                }
            }
        }).catch(errorResponse => { });
    }

    async getTaskList() {
        await this.getIsNewTask();
        this.taskLoaded = false;
        if (this.clientId === 'all') {
            this.advisorService.getAdvisorTaskNotification(this.filterData).toPromise().then(res => {
                if (this.filterData.view === 'New') {
                    if (res['messages'].length === 0 && this.defaultView.name === 'New') {
                        this.defaultView = this.filterViewList.find(x => x.id === 4);
                        if (!this.defaultView) {
                            this.defaultView = this.filterViewList[3];
                            this.filterSortList.splice(-1);
                            this.defaultSort = this.filterSortList.find(x => x.id === 4);
                            this.filterData.view = this.defaultView.name;
                            this.getTaskList();
                        }
                    } else {
                        this.dataSharing.changeMessage('new_task_added');
                    }
                }
                if (this.isNewTask) {
                    this.dataSharing.changeMessage('Badge_update_for_specified_client');
                }
                this.processTaskData(res);
            }).catch(err => { });
        } else {
            this.taskNotificationService.getAllTaskByFilterByClient(this.clientId, this.filterData).toPromise().then(res => {
                if (this.filterData.view === 'New') {
                    if (res['messages'].length === 0 && this.defaultView.name === 'New') {
                        if (!this.defaultView) {
                            this.defaultView = this.filterViewList.find(x => x.id === 4);
                            this.filterData.view = this.defaultView.name;
                            this.filterSortList.splice(-1);
                            this.defaultSort = this.filterSortList.find(x => x.id === 4);
                            this.getTaskList();
                        }
                    }
                }
                if (this.isNewTask) {
                    this.dataSharing.changeMessage('Badge_update_for_specified_client');
                }
                this.processTaskData(res);
            }).catch(err => { });
        }
    }

    ngOnDestroy() {
        if (this.clientId !== 'all') {
            this.dataSharing.changeMessage('Badge_update_for_specified_client');
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    processTaskData(response) {
        if (response.hasOwnProperty('messages')) {
            this.taskLoaded = true;
            this.taskData = response;
            this.totalPages = response['totalRecords'];
            const processedTaskData = this.taskNotificationService.processTaskData(response);
            this.messageBadges = <any>processedTaskData['messageBadges'];
            this.manageGroupping(Object.assign([], response['messages']));
        }
    }

    manageGroupping(taskList) {
        const groupTasks = {};
        const groupValues = [];
        const selectedGroupping = this.defaultGroup;
        taskList.forEach(function (task) {
            let groupByString;
            if (selectedGroupping.groupBy === 'none') {
                groupByString = selectedGroupping.groupBy;
            } else if (selectedGroupping.groupBy === 'complete') {
                groupByString = (task[selectedGroupping.groupBy]) ? 'Completed' : 'Uncompleted';
            } else if (selectedGroupping.groupBy === 'type') {
                groupByString = task[selectedGroupping.groupBy].toLowerCase();
                groupByString = groupByString.charAt(0).toUpperCase() + groupByString.slice(1);
            } else if (selectedGroupping.groupBy === 'planner') {
                groupByString = task[selectedGroupping.groupBy]['firstname'] + ' ' + task[selectedGroupping.groupBy]['lastname'];
            } else {
                groupByString = task[selectedGroupping.groupBy];
                if (selectedGroupping.field !== '') {
                    groupByString = task[selectedGroupping.groupBy][selectedGroupping.field];
                }
            }

            if (!groupTasks.hasOwnProperty(groupByString)) {
                groupTasks[groupByString] = {
                    tasks: []
                };
                groupValues.push(groupByString);
            }
            if (task.completedDate != null) {
                if (task.completedDate >= moment().format('YYYY-MM-DD')) {
                    task.editable = true;
                } else {
                    task.editable = false;
                }
            } else {
                task.editable = true;
            }
            groupTasks[groupByString].tasks.push(task);
        }, this);
        this.groupTasks = groupTasks;
        this.groupValues = groupValues;
    }

    selectDatePeriod(selectedOption, modelName) {
        const today = new Date();
        const daysToAdd = selectedOption.value.daysToAdd;
        this.dataModel[modelName] = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    taskTypeFilter(data) {
        this.dataModel.key = data.key;
        this.dataModel.taskModel = this.taskTypes.filter(result => result.descr === data.taskType.descr)[0];
        this.dataModel.dueDateModel = moment(data.dueDate).format('YYYY-MM-DD');
    }

    dateCampare(data_from, data_to) {
        if (data_from !== '' && data_to !== '') {
            const from = data_from;
            const to = data_to;
            if (Date.parse(from) < Date.parse(to)) {
                this.filterData['from'] = moment(this.dataModel['fromDate']).format('YYYY-MM-DD');
                this.filterData['to'] = moment(this.dataModel['toDate']).format('YYYY-MM-DD');
                this.filterData['pageNo'] = 1;
                this.changePage.next(1);
                this.getTaskList();
            } else {
                setTimeout(() => {
                    this.dataModel['fromDate'] = moment(this.dataModel['toDate']).format('YYYY-MM-DD');
                    this.filterData['from'] = moment(this.dataModel['fromDate']).format('YYYY-MM-DD');
                    this.filterData['to'] = moment(this.dataModel['toDate']).format('YYYY-MM-DD');
                    this.filterData['pageNo'] = 1;
                    this.changePage.next(1);
                    this.getTaskList();
                }, 10);
            }
        }
    }

    SelectTooltip(task) {
        if (task.client1_name && task.client1_lastName && task.client2_lastName !== '' && task.client2_name !== '') {
            if (task.client1_lastName === task.client2_lastName) {
                return task.client1_name + ' & ' + task.client2_name + ' ' + task.client1_lastName;
            } else {
                return task.client1_name + ' ' + task.client1_lastName + ' / ' + task.client2_name + ' ' + task.client2_lastName;
            }
        } else {
            return task.client1_name + ' ' + task.client1_lastName;
        }
    }

    checkCompletedDate(task, completedDate) {
        if (moment(completedDate).format('YYYY-MM-DD') < this.today) {
            task['isCompletedDue'] = true;
        } else {
            task['isCompletedDue'] = false;
        }
    }

    async saveTaskNotification() {
        let messageObj = [];
        this.groupValues.forEach(function (groupValue) {
            messageObj = messageObj.concat(this.groupTasks[groupValue].tasks.filter(t => t.type === 'TASK'));
        }, this);
        messageObj.forEach(message => {
            message['dueDate'] = moment(message['dueDate']).format('YYYY-MM-DD');
        });
        this.taskNotificationService.updateAllTask(messageObj).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            this.translate.get(['TASK_AND_NOTIFICATION.POPUP.CHANGES_SAVED_SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Success', i18text['TASK_AND_NOTIFICATION.POPUP.CHANGES_SAVED_SUCCESS'], 'success');
            });
            this.advisorService.loadAdvisorTaskNotification();
            this.dataSharing.changeMessage('new_task_added');
            this.getTaskList();
        }, err => {
            Swal('Error', err.error.errorMessage, 'error');
        });
    }

    deleteTask(data, key) {
        this.translate.get([
            'TASK_AND_NOTIFICATION.POPUP.DELETE_TASK_TITLE',
            'TASK_AND_NOTIFICATION.POPUP.DELETE_TASK_TEXT',
            'TASK_AND_NOTIFICATION.POPUP.DELETE_TASK_SUCCESS',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['TASK_AND_NOTIFICATION.POPUP.DELETE_TASK_TITLE'],
                text: i18text['TASK_AND_NOTIFICATION.POPUP.DELETE_TASK_TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.taskNotificationService.deleteTask(key).pipe(takeUntil(this.unsubscribe$)).pipe(takeUntil(this.unsubscribe$)).subscribe(respon => {
                        Swal(i18text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18text['TASK_AND_NOTIFICATION.POPUP.DELETE_TASK_SUCCESS'], 'success');
                        this.advisorService.loadAdvisorTaskNotification();
                        if (this.clientId && this.clientId !== 'all') {
                            this.taskNotificationService.getClientOverviewTaskAndNotificationPayload(this.clientId);
                        }
                        if (this.clientId !== 'all') {
                            this.dataSharing.changeMessage('new_task_added');
                        } else {
                            this.getTaskList();
                        }
                    }, err => {
                        Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    formateDate(task, date) {
        date = moment(date).format('YYYY-MM-DD');
        task.dueDate = date;
    }

    checked(event, data) {
        if (this.clientId !== 'all') {
            this.taskNotificationService.checked(event, data, true, this.clientId).then(response => {
                this.getTaskList();
            });
        } else {
            this.taskNotificationService.checked(event, data, true).then(response => {
                this.getTaskList();
            });
        }
    }

    viewSorting(event) {
        if (event.id !== 3) {
            this.defaultView = event;
            this.filterData.view = this.defaultView.name;
            this.filterData['pageNo'] = 1;
            if (event.id === 5 && this.defaultGroup !== undefined && this.defaultGroup.id !== 4) {
                if (this.clientId === 'all') {
                    this.filterSortList = Object.assign([], this.sortList);
                    const index = this.filterSortList.findIndex(x => x.id === 3);
                    this.filterSortList.splice(index, 1);
                } else {
                    this.filterSortList = Object.assign([], this.sortList);
                    const index = this.filterSortList.findIndex(x => x.id === 3);
                    this.filterSortList.splice(index, 1);
                    const clientSort = this.filterSortList.findIndex(x => x.id === 2);
                    this.filterSortList.splice(clientSort, 1);
                }
                if (event.id === 5 && this.defaultSort !== undefined && this.defaultSort.id === 3) {
                    this.defaultSort = this.filterSortList.find(x => x.id === 4);
                }
            } else if (event.id === 5 && this.defaultGroup !== undefined && this.defaultGroup.id === 4) {
                if (this.clientId === 'all') {
                    this.filterSortList = Object.assign([], this.sortList);
                    const index = this.filterSortList.findIndex(x => x.id === 3);
                    this.filterSortList.splice(index, 1);
                    const typeIndex = this.filterSortList.findIndex(x => x.id === 5);
                    this.filterSortList.splice(typeIndex, 1);
                } else {
                    this.filterSortList = Object.assign([], this.sortList);
                    const index = this.filterSortList.findIndex(x => x.id === 3);
                    this.filterSortList.splice(index, 1);
                    const typeIndex = this.filterSortList.findIndex(x => x.id === 5);
                    this.filterSortList.splice(typeIndex, 1);
                    const clientSort = this.filterSortList.findIndex(x => x.id === 2);
                    this.filterSortList.splice(clientSort, 1);
                }
                if (event.id === 5 && this.defaultSort !== undefined && this.defaultSort.id === 3) {
                    this.defaultSort = this.filterSortList.find(x => x.id === 4);
                }
            } else if (event.id !== 5 && this.defaultGroup !== undefined && this.defaultGroup.id === 4) {
                if (this.clientId === 'all') {
                    this.filterSortList = Object.assign([], this.sortList);
                    const index = this.filterSortList.findIndex(x => x.id === 5);
                    this.filterSortList.splice(index, 1);
                } else {
                    this.filterSortList = Object.assign([], this.sortList);
                    const index = this.filterSortList.findIndex(x => x.id === 5);
                    this.filterSortList.splice(index, 1);
                    const clientSort = this.filterSortList.findIndex(x => x.id === 2);
                    this.filterSortList.splice(clientSort, 1);
                }
            } else if (event.id !== 5 && this.defaultGroup !== undefined && this.defaultGroup.id !== 4) {
                if (this.clientId === 'all') {
                    this.filterSortList = Object.assign([], this.sortList);
                } else {
                    this.filterSortList = Object.assign([], this.sortList);
                    const clientSort = this.filterSortList.findIndex(x => x.id === 2);
                    this.filterSortList.splice(clientSort, 1);
                }
            }
            this.getTaskList();
        } else {
            this.router.navigate(['/client', this.currentClient, 'task-notification']);
        }
    }

    sorting(event) {
        this.defaultSort = event;
        this.filterData.sortBy = this.defaultSort.name;
        this.changePage.next(1);
        this.getTaskList();
    }

    groupSorting(event) {
        this.defaultGroup = event;
        this.filterData.groupBy = this.defaultGroup.name;
        this.filterData['pageNo'] = 1;
        this.changePage.next(1);
        if (event.id === 4 && this.defaultView.id === 5) {
            if (this.clientId === 'all') {
                this.filterSortList = Object.assign([], this.sortList);
                const index = this.filterSortList.findIndex(x => x.id === 5);
                this.filterSortList.splice(index, 1);
                const compSort = this.filterSortList.findIndex(x => x.id === 3);
                this.filterSortList.splice(compSort, 1);
                if (event.id === 4 && this.defaultSort !== undefined && this.defaultSort.id === 5) {
                    this.defaultSort = this.filterSortList.find(x => x.id === 4);
                }
            } else {
                this.filterSortList = Object.assign([], this.sortList);
                const index = this.filterSortList.findIndex(x => x.id === 5);
                this.filterSortList.splice(index, 1);
                const compSort = this.filterSortList.findIndex(x => x.id === 3);
                this.filterSortList.splice(compSort, 1);
                const clientSort = this.filterSortList.findIndex(x => x.id === 2);
                this.filterSortList.splice(clientSort, 1);
                if (event.id === 4 && this.defaultSort !== undefined && this.defaultSort.id === 5) {
                    this.defaultSort = this.filterSortList.find(x => x.id === 4);
                }
            }
        } else if (event.id === 4 && this.defaultView.id !== 5) {
            if (this.clientId === 'all') {
                this.filterSortList = Object.assign([], this.sortList);
                const index = this.filterSortList.findIndex(x => x.id === 5);
                this.filterSortList.splice(index, 1);
                if (event.id === 4 && this.defaultSort !== undefined && this.defaultSort.id === 5) {
                    this.defaultSort = this.filterSortList.find(x => x.id === 4);
                }
            } else {
                this.filterSortList = Object.assign([], this.sortList);
                const index = this.filterSortList.findIndex(x => x.id === 5);
                this.filterSortList.splice(index, 1);
                const clientSort = this.filterSortList.findIndex(x => x.id === 2);
                this.filterSortList.splice(clientSort, 1);
                if (event.id === 4 && this.defaultSort !== undefined && this.defaultSort.id === 3) {
                    this.defaultSort = this.filterSortList.find(x => x.id === 4);
                }
            }
        } else if (event.id !== 4 && this.defaultView.id === 5) {
            if (this.clientId === 'all') {
                this.filterSortList = Object.assign([], this.sortList);
                this.filterSortList.splice(-1);
            } else {
                this.filterSortList = Object.assign([], this.sortList);
                this.filterSortList.splice(-1);
                const clientSort = this.filterSortList.findIndex(x => x.id === 2);
                this.filterSortList.splice(clientSort, 1);
            }
        } else if (event.id !== 4 && this.defaultView.id !== 5) {
            if (this.clientId === 'all') {
                this.filterSortList = Object.assign([], this.sortList);
            } else {
                this.filterSortList = Object.assign([], this.sortList);
                const clientSort = this.filterSortList.findIndex(x => x.id === 2);
                this.filterSortList.splice(clientSort, 1);
            }
        }
        this.getTaskList();
    }

    expandTab() {
        $('#tasktList_').toggle('slow');
    }

    back() {
        this._location.back();
    }

    getPageFilterTaskAndNotification(event) {
        if (this.isNewTask && this.filterData.view === 'New') {
            this.filterData['pageNo'] = event.currentPage - 1;
        } else {
            this.filterData['pageNo'] = event.currentPage;
        }
        this.getTaskList();
    }
}
