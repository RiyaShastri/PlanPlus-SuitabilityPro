import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-auth-header',
    templateUrl: './auth-header.component.html',
    styleUrls: ['./auth-header.component.css', '../header/header.component.css']
})
export class AuthHeaderComponent implements OnInit {
    applicableLangList = [];
    isBeta = false;
    constructor(
        public translate: TranslateService
    ) {
        translate.langs = [];
        this.applicableLangList = ['en'/*, 'fr'*/];
        translate.addLangs(this.applicableLangList);
        translate.setDefaultLang(this.applicableLangList[0]);
        // const browserLang = translate.getBrowserLang();

        // used getTranslation to check if language is available or not
        translate.getTranslation(this.applicableLangList[0]).toPromise().then(res => {
            translate.use(this.applicableLangList[0]);
        }).catch(errorResponse => {
            translate.use('en');
        });
    }
    ngOnInit() {
        if (typeof environment.beta !== 'undefined' && environment.beta) {
            this.isBeta = environment.beta;
        } else {
            this.isBeta = false;
        }
    }
}
