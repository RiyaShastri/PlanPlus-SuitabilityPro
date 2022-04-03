import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from '../../core/core.module';
import { UiModule } from '../../ui/ui.module';

import { SharedModule } from '../../shared/shared.module';
import { DocumentCentreComponent } from './document-centre/document-centre.component';
import { DocumentService } from '../service';
import { UploadDocumentComponent } from './upload-document/upload-document.component';
import { GenerateDocumentComponent } from './generate-document/generate-document.component';
import { RenameDocumentComponent } from './rename-document/rename-document.component';

import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';

@NgModule({
    imports: [
        FormsModule,
        RouterModule,
        NgbModule.forRoot(),
        SharedModule,
        CommonModule,
        CoreModule,
        UiModule,
        DropdownModule,
        CheckboxModule,
        RadioButtonModule
    ],
    declarations: [
        DocumentCentreComponent,
        UploadDocumentComponent,
        GenerateDocumentComponent,
        RenameDocumentComponent
    ],
    exports: [
        DocumentCentreComponent,
        UploadDocumentComponent,
        RenameDocumentComponent
    ],
    providers: [
        DocumentService
    ]
})
export class DocumentsModule { }
