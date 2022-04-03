import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Injectable()
export class PageTitleService {

    private messageSource = new BehaviorSubject('default message');
    currentPageTitle = this.messageSource.asObservable();
    constructor(
        public translate: TranslateService,
        private titleService: Title
    ) { }

    setPageTitle(message: string) {
        this.setDefaultTitle();
        if (message.includes('pageTitle|')) {
            const i18Key = message.replace('pageTitle|', '');
            this.translate.stream(i18Key).subscribe(translatedTitle => {
                if (translatedTitle.trim() !== '') {
                    this.titleService.setTitle(translatedTitle);
                } else {
                    this.setDefaultTitle();
                }
            }, errorResponse => {
                this.setDefaultTitle();
            });
        } else {
            this.setDefaultTitle();
        }
    }

    setDefaultTitle() {
        this.titleService.setTitle('SuitabilityPRO');
    }
}
