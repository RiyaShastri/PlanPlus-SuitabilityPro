import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UiModule } from '../../ui/ui.module';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { NotesSidePanelComponent } from './notes-side-panel/notes-side-panel.component';
import { SearchNotesComponent } from './search-notes/search-notes.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CalendarModule,
        CheckboxModule,
        DropdownModule,
        RadioButtonModule,
        NgbModule.forRoot(),
        UiModule,
        CoreModule,
        SharedModule
    ],
    declarations: [
        NotesSidePanelComponent,
        SearchNotesComponent
    ]
})
export class NotesModule { }
