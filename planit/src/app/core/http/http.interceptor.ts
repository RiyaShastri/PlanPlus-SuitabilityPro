import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpHeaders,
    HttpErrorResponse,
    HttpSentEvent,
    HttpHeaderResponse,
    HttpProgressEvent,
    HttpResponse,
    HttpUserEvent
} from '@angular/common/http';

import { TokenStorage } from '../../shared/token.storage';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserAuthService } from '../../auth/user-auth.service';
import { RefreshDataService } from '../../shared/refresh-data';
import { switchMap, finalize, filter, take, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
    isRefreshingToken = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    tokenStorage = new TokenStorage();
    constructor(
        private userAuthService: UserAuthService,
        private refreshData: RefreshDataService,
        private translate: TranslateService,
        private router: Router,
    ) { }

    modifyRequest(request) {
        let TOKEN_KEY = 'AuthToken';
        if (request.headers.get('refresh') === 'true') {
            TOKEN_KEY = 'RefreshToken';
        }
        const accessToken = this.tokenStorage.getToken(TOKEN_KEY);
        const apiUrl = environment.apiUrl;
        const reqUrl = request.url.trim();
        const url = reqUrl[0] === '/' ? apiUrl + reqUrl : reqUrl;

        const headerObj = {
            'Authorization': 'Bearer ' + accessToken,
            'Accept': 'application/json'
        };
        if (request.headers.get('isFile') === 'true') {
            headerObj['Content-Type'] = 'multipart/form-data';
        }

        return request.clone({
            url: url,
            headers: new HttpHeaders(headerObj)
        });
    }

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any> | any> {
        if (req.url.includes('logout')) {
            this.refreshData.updateTimeout('resetTimeout');
        } else {
            this.refreshData.updateTimeout('updateTimeout');
        }
        return next.handle(this.modifyRequest(req)).catch(errorResponse => {
            if (errorResponse instanceof HttpErrorResponse) {
                switch (errorResponse.status) {
                    case 401:
                        if (req.url.includes('access-token')) {
                            return <any>this.userAuthService.logout();
                        } else if (!req.url.includes('login')) {
                            return this.handle401Error(req, next);
                        } else {
                            return Observable.throw(errorResponse);
                        }
                    case 403:
                        // window.stop();
                        // return <any>this.userAuthService.logout();
                        if (req.headers.get('getClient') === 'true') {
                            this.translate.get([
                                'ALERT_MESSAGE.OOPS_TEXT',
                                'FORM.INVALID_BIRTHDATE'
                            ]).subscribe(text => {
                                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], 'you don\'t have rights to access client.', 'warning');
                            });
                            this.router.navigate(['./advisor', 'dashboard']);
                        } else {
                            return Observable.throw(errorResponse);
                        }
                }
            } else {
                return Observable.throw(errorResponse);
            }
            return Observable.throw(errorResponse);
        });
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;
            this.tokenSubject.next(null);
            return this.userAuthService.refreshTokenObservable().pipe(
                switchMap((tokenObj) => {
                    if (tokenObj) {
                        this.tokenSubject.next(tokenObj['token']);
                        this.tokenStorage.saveToken(tokenObj['token'], true, 'AuthToken');
                        return next.handle(this.modifyRequest(request));
                    }
                    return <any>this.userAuthService.logout();
                }),
                catchError(err => {
                    return <any>this.userAuthService.logout();
                }),
                finalize(() => {
                    this.isRefreshingToken = false;
                })
            );
        } else {
            this.isRefreshingToken = false;
            return this.tokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(token => {
                    return next.handle(this.modifyRequest(request));
                })
            );
        }
    }
}
