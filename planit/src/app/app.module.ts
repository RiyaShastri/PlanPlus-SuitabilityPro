import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, TRANSLATIONS } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AmChartsModule, AmChartsService } from '@amcharts/amcharts3-angular';
import { Angulartics2Module } from 'angulartics2';
import { CoreModule } from './core/core.module';

// Import the service
import { I18n } from '@ngx-translate/i18n-polyfill';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { NgbdModalBasic } from './modal-basic';
import { registerLocaleData } from '@angular/common';

import { appRoutes } from './app.route';

declare const require; // Use the require method provided by webpack
export const translations = require(`raw-loader!../locale/source.xlf`);
import localeFr from '@angular/common/locales/hi';
import localeFrExtra from '@angular/common/locales/extra/hi';
registerLocaleData(localeFr, 'hi', localeFrExtra);

// All modules
import { AuthModule } from './auth/auth.module';
import { LayoutModule } from './layout/layout.module';
import { ClientModule } from './client/client.module';
import { SharedModule } from './shared/shared.module';
import { AdvisorModule } from './advisor/advisor.module';
import { MyProfileModule } from './my-profile';
import { SettingModule } from './setting/setting.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from 'primeng/calendar';
import { UiModule } from './ui/ui.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TaskNotificationModule } from './task-notification/task-notification.module';
import { environment } from '../environments/environment';
import { TagCloudModule } from 'angular-tag-cloud-module';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json?v=' + environment.version);
}

@NgModule({
    declarations: [
        AppComponent,
        NgbdModalBasic
    ],
    imports: [
        UiModule,
        CoreModule,
        AuthModule,
        FormsModule,
        LayoutModule,
        ClientModule,
        SharedModule,
        BrowserModule,
        AmChartsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),
        Angulartics2Module.forRoot([]),
        BrowserAnimationsModule,
        CalendarModule, ReactiveFormsModule, AdvisorModule, TaskNotificationModule, MyProfileModule,
        SettingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        TagCloudModule
    ],
    providers: [
        AmChartsService,
        { provide: TRANSLATIONS, useValue: translations },
        I18n,
        Title
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
