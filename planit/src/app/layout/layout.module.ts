import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UiModule } from '../ui/ui.module';
import { FooterComponent, AuthHeaderComponent } from './';
@NgModule({
    imports: [
        NgbModule.forRoot(),
        TranslateModule,
        CommonModule,
        RouterModule,
        CoreModule,
        UiModule
    ],
    declarations: [
        FooterComponent,
        AuthHeaderComponent
    ],
    exports: [
        FooterComponent,
        AuthHeaderComponent
    ]
})
export class LayoutModule { }
