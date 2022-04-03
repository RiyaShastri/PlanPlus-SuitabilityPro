import { getAccessRightsPayload, AppState } from './app.reducer';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';

@Injectable()
export class AccessRightService {
    constructor(
        private store: Store<AppState>,
    ) { }

    // Convert the access right payload to an observable so we force the ui to1 wait for this
    // to actually get data. This allows for components to 
    // use access rights after we have actually gotten the data, such as on advisor dashboard.
    getAccess(requiredAccessKeys) {

        return this.store.select(getAccessRightsPayload).map(accessRights => {
            const returnAccess = {};
            if (accessRights) {
                requiredAccessKeys.forEach(accessKey => {
                    returnAccess[accessKey] = (accessRights[accessKey]) ? accessRights[accessKey][0] : { accessLevel: 0, menuDescr: '', menuId: '' };
                });
                return returnAccess;
            }
        });
    }
}
