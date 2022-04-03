import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { slideInOutAnimation } from '../../shared/animations';
import { TaskNotificationService } from '../task-notification.service';
import Swal from 'sweetalert2';
import { AdvisorService } from '../../advisor/service/advisor.service';
import * as moment from 'moment';
import { RefreshDataService } from '../../shared/refresh-data';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../shared/page-title';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-add-task',
    templateUrl: './add-task.component.html',
    styleUrls: ['./add-task.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddTaskComponent implements OnInit, OnDestroy {
    public clientId;
    taskTypes = [];
    taskObj = {
        detail: '',
        taskType: {},
        type: 'TASK',
        dueDate: <any>new Date(),
    };
    saveButtonDisable = false;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: ActivatedRoute,
        private _location: Location,
        private taskNotificationService: TaskNotificationService,
        private advisorService: AdvisorService,
        private dataSharing: RefreshDataService,
        private pageTitleService: PageTitleService,
        private angulartics2: Angulartics2,
        private translate: TranslateService
    ) {
        this.angulartics2.eventTrack.next({ action: 'taskAndNotificationAddTask' });
        this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_TASK_TITLE');
        this.router.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.getTaskTypes();
    }

    getTaskTypes() {
        this.taskNotificationService.getTaskTypes().toPromise().then(res => {
            this.taskTypes = res;
        }).catch(err => { });
    }

    back() {
        this._location.back();
    }

    addNewTask(f) {
        const reqObj = Object.assign({}, this.taskObj);
        reqObj['dueDate'] = moment(reqObj['dueDate']).format('YYYY-MM-DD');
        this.taskNotificationService.addClientTask(this.clientId, reqObj).toPromise().then(res => {
            this.taskNotificationService.getClientTaskNotificationPayload(this.clientId);
            this.advisorService.loadAdvisorTaskNotification();
            this.taskNotificationService.getClientOverviewTaskAndNotificationPayload(this.clientId);
            this.translate.get(['TASK_NOTIFICATION.ADD_TASK.POPUP.SUCCESS']).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
                Swal('Success', i18text['TASK_NOTIFICATION.ADD_TASK.POPUP.SUCCESS'], 'success');
            });
            this.saveButtonDisable = false;
            this.dataSharing.changeMessage('new_task_added');
            this.back();
        }).catch(err => {
            Swal('Error', err.error.errorMessage, 'error');
            this.saveButtonDisable = false;
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
