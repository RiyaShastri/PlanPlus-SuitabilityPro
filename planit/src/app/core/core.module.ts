import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RequestInterceptor } from './http/http.interceptor';
import { CalculateAgeFromDate } from './utility/calculate-date-to-age';
import { NoWhitespaceDirective } from './directive/no-whitespace.directive';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
    declarations: [
        NoWhitespaceDirective
    ],
    exports: [
        NoWhitespaceDirective
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: RequestInterceptor,
            multi: true,
        },
        CalculateAgeFromDate
    ]
})
export class CoreModule { }
