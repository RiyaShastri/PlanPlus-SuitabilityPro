import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-empty-caculator',
    templateUrl: './empty-caculator.component.html',
    styleUrls: ['./empty-caculator.component.css']
})
export class EmptyCaculatorComponent implements OnInit, OnDestroy {
    clientId;
    previousUrl;
    currentCalculator = '';
    private unsubscribe$ = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private refreshDataService: RefreshDataService,
    ) { }

    ngOnInit() {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.clientId = param['clientId'];
            if (!this.clientId) {
                this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param2 => {
                    this.clientId = param2['clientId'];
                });
            }
        });
        this.currentCalculator = this.route.parent.snapshot.url[0].path;
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            this.previousUrl = [];
            if (message.includes('Go_To_Calculator')) {
                const url = JSON.parse(message.replace('Go_To_Calculator|', ''));
                const splitedUrl = url.split('/');
                splitedUrl.forEach((data, index) => {
                    if (data) {
                        if (index === 1) {
                            this.previousUrl.push('/' + data);
                        } else {
                            this.previousUrl.push(data);
                        }
                    }
                });
            }
        });
    }

    back() {
        if (this.previousUrl.length > 0) {
            this.router.navigate(this.previousUrl);
        } else {
            this.router.navigate(['client/' + this.clientId + '/overview']);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
