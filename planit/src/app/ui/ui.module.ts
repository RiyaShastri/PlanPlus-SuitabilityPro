import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { PortfolioListHtmlComponent } from '../client/planning/portfolio/portfolio-list-html/portfolio-list-html.component';
import { RiskToleranceListingComponent } from '../client/profile/risk-tolerance-listing/risk-tolerance-listing.component';
import { TimelineChartComponent } from '../client/planning/goals/timeline-chart/timeline-chart.component';
import {
    FileUploadComponent,
    MemberAvatarComponent,
    ProfileModuleDropDownComponent,
    FamilyMemberDropdownComponent,
    CommonDropDownComponent,
    PaginationComponent,
    PlanningModuleDropDownComponent,
    FamilyPortfolioDropdownComponent,
    FileUploadService,
    ImageUploadComponent,
    ProductCodeDropdownComponent,
    CustomSliderComponent,
    RenameItemComponent
} from '.';
import { HeaderComponent } from '../layout/header/header.component';
import { CheckboxModule } from 'primeng/checkbox';
import { CollaborationCenterTileComponent } from '../advisor/dashboard';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        DropdownModule,
        ImageCropperModule,
        NgbModule.forRoot(),
        IonRangeSliderModule,
        CheckboxModule
    ],
    declarations: [
        FileUploadComponent,
        MemberAvatarComponent,
        ProfileModuleDropDownComponent,
        CommonDropDownComponent,
        FamilyMemberDropdownComponent,
        PaginationComponent,
        PlanningModuleDropDownComponent,
        FamilyPortfolioDropdownComponent,
        ImageUploadComponent,
        ProductCodeDropdownComponent,
        CustomSliderComponent,
        RenameItemComponent,
        PortfolioListHtmlComponent,
        RiskToleranceListingComponent,
        HeaderComponent,
        TimelineChartComponent,
        CollaborationCenterTileComponent
    ],
    exports: [
        FileUploadComponent,
        MemberAvatarComponent,
        ProfileModuleDropDownComponent,
        CommonDropDownComponent,
        FamilyMemberDropdownComponent,
        PaginationComponent,
        PlanningModuleDropDownComponent,
        FamilyPortfolioDropdownComponent,
        ImageUploadComponent,
        ProductCodeDropdownComponent,
        CustomSliderComponent,
        RenameItemComponent,
        PortfolioListHtmlComponent,
        RiskToleranceListingComponent,
        HeaderComponent,
        TimelineChartComponent,
        CollaborationCenterTileComponent
    ],
    providers: [FileUploadService]
})
export class UiModule { }
