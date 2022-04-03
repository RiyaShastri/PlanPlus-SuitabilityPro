import { AppState, getClientOverviewTaskData } from '../../../shared/app.reducer';
import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TaskNotificationService } from '../../../task-notification/task-notification.service';
import * as moment from 'moment';

@Component({
    selector: 'app-task-tile',
    templateUrl: './task-tile.component.html',
    styleUrls: ['./task-tile.component.css']
})
export class TaskTileComponent implements OnInit, OnDestroy {

    @ViewChild('system') public system: NgbTooltip;
    @ViewChild('manual') public manual: NgbTooltip;

    public tasks = [];
    taskLoaded = false;
    messageBadges = {
        'NOTIFICATION': {},
        'TASK': {}
    };
    filterData = {};
    @Input() public clientId;
    unsubscribe$;

    constructor(
        private store: Store<AppState>,
        private taskNotificationService: TaskNotificationService,
    ) { }

    ngOnInit() {
        this.filterData = {};
        this.unsubscribe$ = this.store.select(getClientOverviewTaskData).subscribe(task => {
            if (task) {
                this.processTask(task);
                this.taskLoaded = true;
            } else {
                this.taskNotificationService.getClientOverviewTaskAndNotificationPayload(this.clientId);
            }
        });
    }

    processTask(response) {
        this.tasks = [];
        if (response.hasOwnProperty('messages')) {
            const processedTaskData = this.taskNotificationService.processTaskData(response);
            const taskList = response['messages'].slice(0, 3);
            taskList.forEach(task => {
                if (task.completedDate != null) {
                    if (moment(task.completedDate).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')) {
                        task.editable = true;
                    } else {
                        task.editable = false;
                    }
                } else {
                    task.editable = true;
                }
                if (!task.complete && task.completedDate === null) {
                    this.tasks.push(task);
                }
            });
            this.messageBadges = <any>processedTaskData['messageBadges'];
        }
    }

    toggleClass(task: any) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (task.completedDate > today) {
            task.completedDate = null;
        } else if (task.completedDate == null) {
            task.completedDate = new Date();
        }
    }

    getCompletionStatus(task: any) {
        return task.completedDate !== null;
    }

    async checked(event, data) {
        const messageObj = this.taskNotificationService.checked(event, data, true, this.clientId);
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
