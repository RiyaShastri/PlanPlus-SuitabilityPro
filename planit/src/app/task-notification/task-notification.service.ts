import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { SetTaskAndNotification, SetClientOverviewTaskAndNotification } from '../shared/app.actions';
import { AppState } from '../shared/app.reducer';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { AdvisorService } from '../advisor/service/advisor.service';
import { RefreshDataService } from '../shared/refresh-data';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TaskNotificationService {

    constructor(
        private http: HttpClient,
        private store: Store<AppState>,
        private advisorService: AdvisorService,
        private dataSharing: RefreshDataService,
        private translate: TranslateService
    ) { }

    getAllTaskByFilter(filterObj): Observable<any> {
        return this.http.post('/v30/message/', filterObj);
    }

    getAllTaskByFilterByClient(clientId, filterObj: any = {}) {
        return this.http.post('/v30/message/' + clientId + '/', filterObj);
    }

    getClientTaskNotificationPayload(clientId, filterObj = {}) {
        this.getAllTaskByFilterByClient(clientId, filterObj).toPromise().then(response => {
            this.store.dispatch(new SetTaskAndNotification(response));
        }).catch(errorResponse => {
            this.store.dispatch(new SetTaskAndNotification({}));
        });
    }

    getClientOverviewTaskAndNotificationPayload(clientId, filterObj = {}) {
        filterObj = {
            'from': '',
            'to': '',
            'groupBy': 'None',
            'sortBy': 'Due date',
            'view': 'Uncompleted',
            'limit': 20,
            'messageType': [
                'task',
                'notification',
            ],
            'pageNo': 0,
            'sortByTile': true
        };
        // tslint:disable-next-line:max-line-length
        this.http.post('/v30/message/' + clientId + '/',  filterObj)
            .toPromise().then(response => {
                if (response) {
                    this.store.dispatch(new SetClientOverviewTaskAndNotification(response));
                }
            }).catch(errorResponse => {
                this.store.dispatch(new SetClientOverviewTaskAndNotification({}));
            });
    }

    updateAllTask(messageObj): Observable<any> {
        return this.http.put('/v30/message/', messageObj).catch(error => Observable.throw(error));
    }

    addClientTask(clientId, messageObj): any {
        return this.http.post('/v30/message/' + clientId + '/create', messageObj);
    }

    getMessageDetail(messageId): Observable<any> {
        return this.http.get('/v30/message/' + messageId).map(response => <any>(<any>response))
            .catch(error => Observable.throw(error));
    }

    deleteTask(messageId): Observable<any> {
        return this.http.delete('/v30/message/' + messageId)
            .catch(error => Observable.throw(error));
    }

    getTaskTypes(): any {
        return this.http.get('/v30/message/taskType');
    }

    processTaskData(response) {
        const resObj = {
            'response': response,
            'messageBadges': {}
        };
        response.badges.forEach(badge => {
            if (!resObj['messageBadges'].hasOwnProperty(badge.id)) {
                resObj['messageBadges'][badge.id] = {};
            }
            resObj['messageBadges'][badge.id]['total'] = badge.value;
        });
        response.messageBadgeList.forEach(messageBadge => {
            if (!resObj['messageBadges'].hasOwnProperty(messageBadge.id)) {
                resObj['messageBadges'][messageBadge.id] = {};
            }
            resObj['messageBadges'][messageBadge.id]['todayDue'] = messageBadge.todayDue;
            resObj['messageBadges'][messageBadge.id]['pastDue'] = messageBadge.pastDue;
        });
        return resObj;
    }

    checked(event, data, isClientTasks, clientId?: any) {
        const clientID = (clientId && clientId !== '') ? clientId : '';
        if (event === true) {
            if (data.completedDate === null) {
                data.completedDate = moment().format('YYYY-MM-DD');
                data.editable = true;
            } else {
                if (data.completedDate >= moment().format('YYYY-MM-DD')) {
                    data.editable = true;
                } else {
                    data.editable = false;
                }
                data.completedDate = moment(data.completedDate).format('YYYY-MM-DD');
            }
            data.complete = true;
        } else {
            data.editable = true;
            data.complete = false;
            data.completedDate = null;
        }
        const messageObj = [
            data
        ];
        return this.updateAllTask(messageObj).toPromise().then(respon => {
            if (isClientTasks && clientID !== '') {
                this.getClientTaskNotificationPayload(clientID);
                this.advisorService.loadAdvisorTaskNotification();
                this.getClientOverviewTaskAndNotificationPayload(clientId);
            } else {
                this.advisorService.loadAdvisorTaskNotification();
            }
            this.dataSharing.changeMessage('new_task_added');
            this.translate.get(['TASK_AND_NOTIFICATION.POPUP.UPDATE_SUCCESS']).subscribe(i18text => {
                Swal('Updated!', i18text['TASK_AND_NOTIFICATION.POPUP.UPDATE_SUCCESS'], 'success');
            });
        }).catch(err => {
            Swal('Error', err.error.errorMessage, 'error');
        });
    }
}
