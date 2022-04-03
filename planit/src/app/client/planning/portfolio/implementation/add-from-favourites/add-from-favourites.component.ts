import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../../../shared/animations';
import { PlanningService } from '../../../../service';
import { Store } from '@ngrx/store';
import {
    AppState,
    getClientPayload
} from '../../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-add-from-favourites',
    templateUrl: './add-from-favourites.component.html',
    styleUrls: ['./add-from-favourites.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddFromFavouritesComponent implements OnInit, OnDestroy {
    public productList;
    public productsSearch;
    public favouritesList;
    public favProduct = {
        favourite: null
    };
    clientData = {};
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private _location: Location,
        private store: Store<AppState>,
        private planningService: PlanningService,
        private angulartics2: Angulartics2
    ) {
        this.angulartics2.eventTrack.next({ action: 'addFavouriteSidePanel' });
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.planningService.getFavouriteList().toPromise().then(response => {
            this.favProduct.favourite = response[0];
            this.favouritesList = response;
        }).catch(err => { });
    }

    saveData() {
        this.back();
    }

    getProductSearch() {
        this.planningService.getProductSearch(this.productsSearch).pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            this.productList = result;
        });
    }

    back() {
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
