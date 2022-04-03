import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskNotificationComponent } from './task-notification/task-notification.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { ClientComponent } from '../client';
import { UiModule } from '../ui/ui.module';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { TaskNotificationService } from './task-notification.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        UiModule,
        CalendarModule,
        CheckboxModule,
        RouterModule,
        DropdownModule,
        FormsModule,
        AccordionModule,
        TranslateModule,
        SharedModule,
        NgbModule.forRoot(),
    ],
    declarations: [
        TaskNotificationComponent,
        AddTaskComponent
    ],
    exports: [
        TaskNotificationComponent,
        AddTaskComponent
    ],
    providers: [
        TaskNotificationService
    ]
})
export class TaskNotificationModule { }
