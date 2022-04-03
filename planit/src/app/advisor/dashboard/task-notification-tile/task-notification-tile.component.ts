import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import {
    AppState,
    getAdvisorTaskNotificationPayload,
} from '../../../shared/app.reducer';
import { AdvisorService } from '../../service/advisor.service';
import { TaskNotificationService } from '../../../task-notification/task-notification.service';
import * as moment from 'moment';

@Component({
    selector: 'app-task-notification-tile',
    templateUrl: './task-notification-tile.component.html',
    styleUrls: ['./task-notification-tile.component.css']
})
export class TaskNotificationTileComponent implements OnInit, OnDestroy {

    @ViewChild('system') public system: NgbTooltip;
    @ViewChild('manual') public manual: NgbTooltip;

    public tasks = [];
    taskLoaded = false;
    messageBadges = {
        'NOTIFICATION': {},
        'TASK': {}
    };
    unsubscribe$: any;

    constructor(
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private taskNotificationService: TaskNotificationService
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getAdvisorTaskNotificationPayload).subscribe(data => {
            if (data) {
                this.processTask(data);
                this.taskLoaded = true;
            }
            // else {
            //     this.advisorService.loadAdvisorTaskNotification();
            // }
        });
    }

    processTask(response) {
        this.tasks = [];
        if (response.hasOwnProperty('messages')) {
            const processedTaskData = this.taskNotificationService.processTaskData(response);
            const messages = response.messages;
            const taskList = messages.slice(0, 7);
            if (taskList && taskList.length > 0) {
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
    }

    toggleClass(task: any) {
        task.complete = !task.complete;
    }

    async checked(event, data) {
        const messageObj = this.taskNotificationService.checked(event, data, false);
    }

    SelectTooltip(task) {
        if (task.client1_name && task.client1_lastName && task.client2_lastName !== '' && task.client2_name !== '') {
            if (task.client1_lastName === task.client2_lastName) {
                return task.client1_lastName;
            } else {
                return task.client1_lastName + ' / ' + task.client2_lastName;
            }
        } else {
            return task.client1_lastName;
        }
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
