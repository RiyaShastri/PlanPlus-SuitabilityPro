import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { UiModule } from '../ui/ui.module';

import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { AccordionModule } from 'primeng/accordion';
import { InputMaskModule } from 'primeng/inputmask';
import { RadioButtonModule } from 'primeng/radiobutton';

import { MyProfileComponent } from './my-profile.component';
import { TranslateModule } from '@ngx-translate/core';
import { AboutMeComponent } from './about-me/about-me.component';
import { BrandingComponent } from './branding/branding.component';
import { LangSpecificImageComponent } from './branding/lang-specific-image/lang-specific-image.component';

import { SharedModule } from '../shared/shared.module';
import { WorkgroupTileComponent } from './about-me/workgroup-tile/workgroup-tile.component';
import { RgbColorTableComponent } from './rgb-color-table/rgb-color-table.component';
import { SelectionListComponent } from './selection-list/selection-list.component';
import { GraphColourThemeComponent } from './graph-colour-theme/graph-colour-theme.component';
import { WorkgroupSidePanelComponent } from './about-me/workgroup-side-panel/workgroup-side-panel.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { NgxTreeSelectModule } from 'ngx-tree-select';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule,
        NgbModule.forRoot(),
        FormsModule,
        CoreModule,
        UiModule,
        CheckboxModule,
        CalendarModule,
        DropdownModule,
        AccordionModule,
        RadioButtonModule,
        InputMaskModule,
        SharedModule,
        NgxTreeSelectModule.forRoot({
            allowFilter: false,
            maxVisibleItemCount: 5,
            allowParentSelection: true,
            expandMode: 'All'
          })
    ],
    declarations: [
        MyProfileComponent,
        AboutMeComponent,
        BrandingComponent,
        LangSpecificImageComponent,
        WorkgroupTileComponent,
        RgbColorTableComponent,
        SelectionListComponent,
        GraphColourThemeComponent,
        WorkgroupSidePanelComponent,
        SubscriptionsComponent
    ]
})
export class MyProfileModule { }
