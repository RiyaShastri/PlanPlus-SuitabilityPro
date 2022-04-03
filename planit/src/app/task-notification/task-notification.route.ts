import { Routes, RouterModule } from '@angular/router';
import { TaskNotificationComponent } from './task-notification/task-notification.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { HeaderComponent } from '../layout/header/header.component';

export const TASK_NOTIFICATION_ROUTES: Routes = [
    {
        path: 'task-notification',
        component: TaskNotificationComponent
    },
    {
        path: '',
        component: HeaderComponent,
        outlet: 'header'
    },
];
