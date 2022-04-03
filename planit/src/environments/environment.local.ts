// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    version: '7.1.14',
    apiUrl: 'https://localhost/api/rest',
    beta: false,
    branding: true,
    favprod: true,
    advanceSearch: true,
  SSOOnly: false,
  SSOLink: 'http://localhost:8080/sso/login',
  SSOLogoutRedirect: 'https://dev-planplusglobal.xecurify.com/moas/idp/oidc/logout?post_logout_redirect_uri=https://dev.planplusglobal.com',
  SSOChangePassword: 'https://dev-planplusglobal.xecurify.com/moas/idp/resetpassword',
  SSOMyAccount: 'https://dev.planplusglobal.com/my-account/',
  disableCMACheckbox: true
};
