import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState, getIsLoggedIn } from '../../shared/app.reducer';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.component.html'
})
export class PrivacyComponent implements OnInit, OnDestroy {

    isLogin = false;
    environment = environment;
    unsubscribe$;

    constructor(
        private store: Store<AppState>
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getIsLoggedIn).subscribe(data => {
            this.isLogin = data;
        });
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }
}
