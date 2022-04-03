import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState, getIsLoggedIn } from '../../shared/app.reducer';
import { environment } from '../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
    isLogin = false;
    authLogin;
    environment = environment;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private store: Store<AppState>
    ) { }

    ngOnInit() {
        this.store.select(getIsLoggedIn).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            this.isLogin = data;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
