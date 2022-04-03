// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Angulartics2 } from 'angulartics2';
import { Login, Logout } from '../shared/app.actions';
import { AppState } from '../shared/app.reducer';
import { HttpClient } from '@angular/common/http';
import { TokenStorage } from '../shared/token.storage';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { RefreshDataService } from '../shared/refresh-data';
import { environment } from '../../environments/environment';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UserAuthService {

    localStorageFetcher = new EventEmitter<any>();
    isSSO: string;
    private refreshTokenSource = new BehaviorSubject('RefreshToken');
    currentRefreshToken = this.refreshTokenSource.asObservable();

    constructor(
        private http: HttpClient,
        private token: TokenStorage,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        private refreshDataService: RefreshDataService,
        private router: Router,
    ) {
        this.localStorageFetcher.subscribe(localStorage => this.isSSO = localStorage.getItem('isSSO'));
    }

    login(username: string, password: string) {
        const url = '/v30/login';
        return this.http.post(url, { username: username, password: password });
    }

    public logout(isUnauthorized = false) {
        this.http.post('/v30/logout', null).toPromise().then(res => {
            this.logoutAction(isUnauthorized);
        });
    }

    async logoutAction(isUnauthorized = false) {
        this.store.dispatch(new Logout());
        if (!navigator.cookieEnabled) {
            this.refreshDataService.changeMessage('cookie-disabled');
        }
        await this.token.signOut();
        if (isUnauthorized) {
            setTimeout(() => {
                location.reload();
            }, 750);
        }
        if (this.isSSO === 'true') {
            this.localStorageFetcher.unsubscribe();
            window.location.href = environment.SSOLogoutRedirect;
        } else {
            await this.router.navigate(['/login']);
        }

    }

    public doLogin(username: string, password: string): Observable<any> {
        const url = '/v30/login';
        return this.http.post(url, { username: username, password: password }).do((response) => {
            const TOKEN_KEY = 'AuthToken';
            const REFRESH_KEY = 'RefreshToken';
            this.token.saveToken(response['token'], true, TOKEN_KEY);
            this.token.saveToken(response['refreshToken'], true, REFRESH_KEY);
            this.store.dispatch(new Login());
            this.angulartics2.eventTrack.next({ action: 'login' });
        }).catch(this.handleError);
    }

    public sendResetLink(username: string): any {
        const url = '/v30/users/password/sendResetLink';
        return this.http.post(url, { user: username, baseUrl: location.origin + '/app/reset-password/' });
    }

    public resetPassword(reqObj) {
        const url = '/v30/users/password/reset';
        return this.http.put(url, reqObj);
    }

    public changePassword(reqObj) {
        const url = '/v30/users/password/change';
        return this.http.put(url, reqObj);
    }

    private handleError(error: Response) {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        return Observable.throw(error || 'Server error');
    }

    refreshToken() {
        const httpOptions = {
            headers: new HttpHeaders({
                'refresh': 'true',
            }),
        };

        this.http.get('/v30/access-token', httpOptions).toPromise().then(response => {
            const TOKEN_KEY = 'AuthToken';
            this.token.saveToken(response['token'], true, TOKEN_KEY);
            this.refreshTokenSource.next(response['token']);
        }).catch(error => {
            if (error.status === 401) {
                this.refreshDataService.changeMessage('timeout');
                this.logout();
            }
        });
    }

    public handOffToPlanIt(advisor: string, clientId: string) {
        const payload = {
            advisor: advisor,
            clientId: clientId
        }
        return this.http.post('/v30/handshake', payload);
    }
    refreshTokenObservable(): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'refresh': 'true',
            }),
        };

        return this.http.get('/v30/access-token', httpOptions).pipe(
            map(toeknObj => {
                if (toeknObj && toeknObj['token']) {
                    this.token.saveToken(toeknObj['token'], true, 'AuthToken');
                }
                return toeknObj;
            }));
    }

    public getRefreshToken(token_key) {
        return Observable.of(localStorage.getItem(token_key));
    }
}
