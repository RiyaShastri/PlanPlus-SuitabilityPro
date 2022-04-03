import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UiModule } from '../../../ui/ui.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';

import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { SplitButtonModule } from 'primeng/splitbutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
    AssetsSummaryComponent,
    EditAccountComponent,
    AssetsHeaderComponent,
    AddAccountComponent,
    AddSavingsComponent,
    HoldingAccountComponent,
    HoldingDetailComponent,
    SavingsComponent,
    ProductSearchComponent,
    EditSavingsComponent,
    SavingsSpecifiedAccountComponent,
    SavingsListHtmlComponent,
} from '.';
import { AddCustomProductComponent } from './add-custom-product/add-custom-product.component';



@NgModule({
    imports: [
        UiModule,
        CoreModule,
        FormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        MessageModule,
        MessagesModule,
        CheckboxModule,
        DropdownModule,
        CalendarModule,
        AccordionModule,
        SplitButtonModule,
        RadioButtonModule,
        NgbModule.forRoot()
    ],
    declarations: [
        AssetsSummaryComponent,
        HoldingAccountComponent,
        EditAccountComponent,
        AssetsHeaderComponent,
        AddAccountComponent,
        AddSavingsComponent,
        SavingsComponent,
        HoldingDetailComponent,
        ProductSearchComponent,
        EditSavingsComponent,
        SavingsSpecifiedAccountComponent,
        SavingsListHtmlComponent,
        AddCustomProductComponent
    ],
    exports: [
        AssetsSummaryComponent,
        EditAccountComponent,
        AssetsHeaderComponent,
        AddAccountComponent,
        AddSavingsComponent,
        SavingsComponent,
        EditSavingsComponent,
        SavingsSpecifiedAccountComponent,
        SavingsListHtmlComponent
    ]
})
export class AssetsLiabilitiesModule { }
