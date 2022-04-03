import { AppState, getIsLoggedIn, getAdvisorPayload } from './app.reducer';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AdvisorService } from '../advisor/service/advisor.service';
import { AccessRightService } from './access-rights.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    accessRights = {};
    advisor;
    constructor(
        private store: Store<AppState>,
        private router: Router,
        private advisorService: AdvisorService,
        private accessRightService: AccessRightService
    ) { }

    async startAsync() {
        await this.delay(500);
        this.reroute(this);
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const observable = this.store.select(getIsLoggedIn);
        observable.subscribe(authenticated => {
            if (!authenticated) {
                this.router.navigate(['./login']);
            } else {
                this.store.select(getAdvisorPayload).subscribe(data => {
                    if (data.hasOwnProperty('planner')) {
                        this.advisor = data;
                        if (authenticated && this.advisor.licenseAgreed === false) {
                            this.accessRightService.getAccess(['LICAGREE']).subscribe(res => { if (res){ this.accessRights = res}});
                            if (this.accessRights.hasOwnProperty('LICAGREE')
                                && this.accessRights['LICAGREE'].hasOwnProperty('accessLevel')
                                && this.accessRights['LICAGREE'].hasOwnProperty('id')
                                && this.accessRights['LICAGREE']['accessLevel'] > 0
                                && this.accessRights['LICAGREE']['id'] != '') {
                                this.router.navigate(['./accept-licence-agreement']);
                            } else {
                                if (this.accessRights === null
                                    || this.accessRights.hasOwnProperty('LICAGREE') === false
                                    || this.accessRights['LICAGREE'].hasOwnProperty('accessLevel') === false
                                    || this.accessRights['LICAGREE'].hasOwnProperty('id') === false
                                    || this.accessRights['LICAGREE']['id'] === '') {    // should not be empty
                                    // async call a function to wait for accessRight ready
                                    this.startAsync();
                                }
                            }
                        }
                    } else {
                        // this.advisorService.getAdvisorPayload();
                    }
                });
            }
        });

        return observable;
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reroute(obj: AuthenticationGuard): boolean {
        if (this.accessRights['LICAGREE']['accessLevel'] > 0
            && this.accessRights['LICAGREE']['id'] != '') {
            obj.router.navigate(['./accept-licence-agreement']);
            return true;
        } else {
            return false;
        }
    }
}
