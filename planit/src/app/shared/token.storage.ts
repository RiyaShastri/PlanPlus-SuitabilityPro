import { Injectable } from '@angular/core';
const TOKEN_KEY = 'AuthToken';
@Injectable()
export class TokenStorage {

    public signOut() {
        return new Promise((resolve, reject) => {
            window.sessionStorage.removeItem(TOKEN_KEY);
            window.localStorage.removeItem(TOKEN_KEY);
            window.localStorage.removeItem('plannerName');
            window.localStorage.removeItem('isSSO');
            window.sessionStorage.clear();
            window.localStorage.clear();

            localStorage.removeItem('country'); // for CMA
            localStorage.removeItem('region'); // for CMA
            localStorage.removeItem('language');

            const name = 'ssotoken';
            document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            resolve();
        });
    }

    /*
    public saveToken(token: string, is_save: boolean) {
        if (is_save) {
            window.localStorage.removeItem(TOKEN_KEY);
            window.localStorage.setItem(TOKEN_KEY, token);
        } else {
            window.sessionStorage.removeItem(TOKEN_KEY);
            window.sessionStorage.setItem(TOKEN_KEY, token);
        }
    }

    static get token(): string {
        return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    }

    static get exists(): boolean {
        return !!TokenStorage.token;
    }
    */

    public saveToken(token: string, is_save: boolean, token_key: string) {
        if (navigator.cookieEnabled) {
            if (is_save) {
                window.localStorage.removeItem(token_key);
                window.localStorage.setItem(token_key, token);
            } else {
                window.sessionStorage.removeItem(token_key);
                window.sessionStorage.setItem(token_key, token);
            }
        }
    }

    public getToken(token_key) {
        if (navigator.cookieEnabled) {
            const ssotoken = this.getCookie('ssotoken');
            if (token_key === TOKEN_KEY && ssotoken !== '' && !(localStorage.getItem(token_key) || sessionStorage.getItem(token_key))) {
                this.saveToken(ssotoken, true, TOKEN_KEY);
            }
            return localStorage.getItem(token_key) || sessionStorage.getItem(token_key);
        }
    }
    public tokenExists(token_key): boolean {
        return !!this.getToken(token_key);
    }

    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    }

    getCookie(cname) {
        const name = cname + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    checkCookie() {
        let user = this.getCookie('username');
        if (user !== '') {
            alert('Welcome again ' + user);
        } else {
            user = prompt('Please enter your name:', '');
            if (user !== '' && user != null) {
                this.setCookie('username', user, 365);
            }
        }
    }
}
