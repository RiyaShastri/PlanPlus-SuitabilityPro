// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    version: '7.1',
    // apiUrl: 'https://dev.ekzeroclient.com/rest',
    // apiUrl: 'http://192.168.100.43:2219/rest', 
    apiUrl: 'http://192.168.100.60:2219/rest', 
    beta: false,
    branding: false,
    favprod: true,
    advanceSearch: true,
    SSOOnly: false,
    SSOLink: 'http://localhost:8080/sso/login',
    SSOLogoutRedirect: 'https://planplusglobal.xecurify.com/moas/idp/oidc/logout?post_logout_redirect_uri=https://planplusglobal.com',
    SSOChangePassword: 'https://planplusglobal.xecurify.com/moas/idp/resetpassword',
    SSOMyAccount: 'https://planplusglobal.com/my-account/',
    disableCMACheckbox: false
};
