import { Component, OnInit, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgxRolesService, NgxPermissionsService } from 'ngx-permissions';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    unsubscribe$: any;
    constructor(
        private router: Router,
        private ngxRolesService: NgxRolesService,
        private permissionsService: NgxPermissionsService,
        public translate: TranslateService
    ) { }

    ngOnInit() {
        if (navigator.cookieEnabled) {
            if (window.location.search.substring(1).includes('errorcode')) {
                const errorCode = window.location.search.substring(1).split('=');
                this.router.navigate(['./error-code', errorCode[1]]);
            }
            const role: string[] = JSON.parse(window.localStorage.getItem('role'));
            if (role) {
                this.permissionsService.loadPermissions(role);
                if (role.length > 1) {
                    this.ngxRolesService.addRole('COMBINED', role);
                } else {
                    this.ngxRolesService.addRole(role[0], role);
                }
            } else {
                // this.router.navigate(['/']);
            }
            this.unsubscribe$ = this.router.events.subscribe((evt) => {
                if (!(evt instanceof NavigationEnd)) {
                    return;
                }
                window.scrollTo(0, 0);
            });
            this.translate.get([
                'TAB.LOGIN_TITLE',
                'TAB.DASHBOARD_TITLE',
                'TAB.ADD_CLIENT_TITLE',
                'TAB.SEARCH_CLIENT_TITLE',
                'TAB.TASK_AND_NOTIFICATION_TITLE',
                'TAB.CLIENT_OVERVIEW_TITLE',
                'TAB.PROFILE_SUMMARY_TITLE',
                'TAB.PLANNING_SUMMARY_TITLE',
                'TAB.DOCUMENT_CENTER_TITLE',
                'TAB.FAMILY_MEMBER_LIST_TITLE',
                'TAB.RISK_TOLERANCE_LIST_TITLE',
                'TAB.PORTFOLIO_LIST_TITLE',
                'TAB.EDIT_CLIENT_TITLE',
                'TAB.RISK_TOLERANCE_RESULT_TITLE',
                'TAB.RISK_TOLERANCE_KYC_TITLE',
                'TAB.ADD_FAMILY_MEMBER_TITLE',
                'TAB.ADD_PORTFOLIO_TITLE',
                'TAB.ADD_INVESTOR_TITLE',
                'TAB.PORTFOLIO_DETAILS_TITLE',
                'TAB.IMPLEMENTATION_TITLE',
                'TAB.GOAL_ANALYSIS_TITLE',
                'TAB.RENAME_PORTFOLIO_TITLE',
                'TAB.APPLY_SOLUTION_TITLE',
                'TAB.EDIT_CURRENT_TITLE',
                'TAB.ANALYTICS_TITLE',
                'TAB.GENERATE_DOCUMENT_TITLE',
                'TAB.UPLOAD_DOCUMENT_TITLE',
                'TAB.RENAME_DOCUMENT_TITLE',
                'TAB.ABOUT_ME_TITLE',
                'TAB.CHANGE_PASSWORD_TITLE',
                'TAB.LICENCE_AGREEMENT_TITLE',
                'TAB.SETTING_SUMMARY_TITLE',
                'TAB.RATES_OF_RETURNS_TITLE',
                'TAB.INCOME_DISTRIBUTION_TITLE',
                'TAB.PJM_TITLE',
                'TAB.PREFERRED_SOLUTION_TITLE',
                'TAB.SOLUTION_FAMILY_TITLE',
                'TAB.PREFERRED_SOLUTION_DETAILS_TITLE',
                'TAB.ADD_GOAL',
                'TAB.ADD_REVENUE',
                'TAB.ALL_SAVINGS',
                'TAB.EDIT_GOAL',
                'TAB.EDIT_REVENUE',
                'TAB.EDUCATION_INSTITUTION',
                'TAB.GOALS',
                'TAB.PLANTRAC',
                'TAB.REVENUES',
                'TAB.SAVINGDETAIL',
                'TAB.ADD_AN_ACCOUNT',
                'TAB.ASSETS_AND_LIABILITIES',
                'TAB.ADD_SAVING',
                'TAB.EDIT_ACCOUNT',
                'TAB.EDIT_SAVINGS',
                'TAB.HOLDINGS',
                'TAB.PRODUCT_SEARCH',
                'TAB.SAVINGS',
                'TAB.SAVING_SPECIFIED',
                'TAB.LINK_TO_GOALS',
                'TAB.ENGAGEMENT_SUMMARY',
                'TAB.SELECT_VALUES_SIDE_PANEL',
                'TAB.ENGAGEMENT_SERVICE_LEVEL',
                'TAB.SEND_INVITE',
                'TAB.SEND_REMINDER',
                'TAB.TRANSLATION_TITLE',
                'TAB.MY_PROFILE_BRANDING',
                'TAB.MY_PROFILE_BRANDING_GRAPH_COLOUR_THEME',
                'TAB.MY_PROFILE_BRANDING_DOCUMENT_COVER_PAGE_SELECTION',
                'TAB.MY_PROFILE_BRANDING_DOCUMENT_DISCLAIMER_SELECTION',
                'TAB.MY_PROFILE_BRANDING_REPORT_DISCLAIMER_SELECTION',
                'TAB.ADD_TASK_TITLE',
                'TAB.INVESTMENT_POLICIES',
                'TAB.ADD_WORKGROUP',
                'TAB.EDIT_WORKGROUP',
                'TAB.ADD_POLICY_SIDE_PANEL',
                'TAB.EDIT_POLICY',
                'TAB.SEARCH_NOTES',
                'TAB.NOTES',
                'TAB.PERSONAL_INFO_ENTITY_DETAILS',
                'TAB.PERSONAL_INFO_ENTITY_OWNERSHIP',
                'TAB.PERSONAL_INFO_ADD_ENTITY',
                'TAB.PERSONAL_INFO_ADD_OTHER_OWNER',
                'TAB.PERSONAL_INFO_ADD_SHARE_CLASS',
                'TAB.PERSONAL_INFO_EDIT_SHARE_CLASS',
                'TAB.PLANNING_ENTITIES_LIST',
                'TAB.PLANNING_ENTITIES_CURRENT_YEAR_INCOME_DISTRIBUTIONS',
                'TAB.PLANNING_ENTITIES_EDIT_LONG_TERM_DISTRIBUTION',
                'TAB.PLANNING_ENTITIES_ADD_DISTRIBUTION',
                'TAB.PLANNING_ENTITIES_EDIT_LONG_TERM_INCOME',
                'TAB.PLANNING_ENTITIES_INVESTMENT_RISK_RETURN',
                'TAB.PLANNING_ENTITIES_LONG_TERM_INCOME_DISTRIBUTIONS',
                'TAB.PLANNING_ENTITIES_VIEW_ANALYSIS'
            ]);
        }
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
