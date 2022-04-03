import { StackedBarChartService } from './chart/stacked-bar-chart.service';
import { NoOverflowTooltipDirective } from './tooltip.directive';
import { AuthenticationGuard } from './authentication.guard';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TokenStorage } from './token.storage';
import { PagerService } from './pager.service';
import { AccessRightService } from './access-rights.service';
import { RefreshDataService } from './refresh-data';
import { PageTitleService } from './page-title';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';
import { reducers, clearState } from './app.reducer';
import { CustomMinValidatorDirective } from './custom-min-validator.directive';
import { CustomMaxValidatorDirective } from './custom-max-validator.directive';
import { CustomMinEqualOptionalValidatorDirective } from './custom-min-equal-optional-validator.directive';
import { CustomMaxEqualOptionalValidatorDirective } from './custom-max-equal-optional-validator.directive';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NumericDirective } from './numeric.directive';
import { TextMaskModule } from 'angular2-text-mask';
@NgModule({
    imports: [
        CommonModule,
        StoreModule.forRoot(reducers),
        NgxPermissionsModule.forRoot(),
        TextMaskModule
    ],
    declarations: [
        NoOverflowTooltipDirective,
        CustomMinValidatorDirective,
        CustomMaxValidatorDirective,
        CustomMinEqualOptionalValidatorDirective,
        CustomMaxEqualOptionalValidatorDirective,
        NumericDirective
    ],
    exports: [
        TranslateModule,
        NoOverflowTooltipDirective,
        CustomMinValidatorDirective,
        CustomMaxValidatorDirective,
        CustomMinEqualOptionalValidatorDirective,
        CustomMaxEqualOptionalValidatorDirective,
        NgxPermissionsModule,
        NumericDirective,
        TextMaskModule
    ],
    providers: [
        StackedBarChartService,
        AuthenticationGuard,
        TokenStorage,
        PagerService,
        AccessRightService,
        RefreshDataService,
        PageTitleService
    ]
})
export class SharedModule { }
