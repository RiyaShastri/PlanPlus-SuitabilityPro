import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { PlanningService, ClientProfileService } from '../../../service';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';
import { ASSETS_BREADCRUMB, PERSON_RELATION } from '../../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AccessRightService } from '../../../../shared/access-rights.service';

@Component({
    selector: 'app-savings-list-html',
    templateUrl: './savings-list-html.component.html',
    styleUrls: ['./savings-list-html.component.css']
})
export class SavingsListHtmlComponent implements OnInit, OnChanges, OnDestroy {

    @Input() clientId;
    @Input() i_id;
    @Input() type;
    @Input() allSavings;
    @Input() selectedViewBy;
    @Input() selectedGroupBy;
    @Input() accountId?= '';
    @Input() goalId?= '';
    savingsData = {};
    accessRights = {};
    Ids = [];
    linkedAccountDetails = {};
    noSavings = true;
    clientData: any;
    ASSETS_BREADCRUMB = ASSETS_BREADCRUMB;
    private unsubscribe$ = new Subject<void>();
    unallocated;
    PERSON_RELATION = PERSON_RELATION ;
    constructor(
        private planningServices: PlanningService,
        private dataSharing: RefreshDataService,
        private store: Store<AppState>,
        private angulartics2: Angulartics2,
        public translate: TranslateService,
        private profileService: ClientProfileService,
        private accessRightService: AccessRightService,
        private pageTitleService: PageTitleService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.SAVINGS');
        this.angulartics2.eventTrack.next({ action: 'savingList' });
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.accessRightService.getAccess(['SAV01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.translate.get([
            'PORTFOLIOS.UNALLOCATED'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(res =>{
            this.unallocated = res['PORTFOLIOS.UNALLOCATED'];
        });


        if (this.allSavings.length > 0) {
            this.noSavings = false;
            this.makeSavingsData();
        }
    }

    ngOnChanges(changes) {
        if (changes.hasOwnProperty('selectedGroupBy')) {
            this.makeSavingsData();
        }
    }

    makeSavingsData() {
        this.savingsData = {};
        this.linkedAccountDetails = {};
        this.Ids = [];
        let filter = '';
        this.allSavings.forEach(savings => {
            if ((this.i_id && ((this.type === 'account' && savings.linkedAccountKey === this.i_id) || (this.type === 'goal' && savings.linkedGoal === this.i_id))) || !this.i_id) {
                if (this.selectedGroupBy.id === 1) {
                    filter = savings.linkedGoalDescription;
                } else if (this.selectedGroupBy.id === 2) {
                    filter = savings.linkedAccountKey;
                }
                if (!this.savingsData.hasOwnProperty(filter)) {
                    this.savingsData[filter] = {
                        'linkedAccountKeys': []
                    };
                }
                if (!this.savingsData[filter].hasOwnProperty(savings.linkedAccountKey)) {
                    this.savingsData[filter][savings.linkedAccountKey] = [];
                    this.savingsData[filter]['linkedAccountKeys'].push(savings.linkedAccountKey);

                }

                if (!this.linkedAccountDetails.hasOwnProperty(savings.linkedAccountKey)) {
                    this.linkedAccountDetails[savings.linkedAccountKey] = {};
                }
                savings['linkedAccountDetails'] = {
                    id: savings.linkedAccountKey,
                    description: savings.linkedAccount,
                    regulatoryType: savings.regulatoryType,
                    ownersList: savings['ownersListToDisplay']
                };
                this.linkedAccountDetails[savings.linkedAccountKey] = savings['linkedAccountDetails'];
                // const tierDetail = {};
                // const tierKeys = ['tier1', 'tier2', 'tier3'];
                // savings['tierKeys'] = [];
                // tierKeys.forEach(tierKey => {
                //     const tierData = this.getTierDetail(tierKey, savings);
                //     if (tierData.AmountPerYear > 0) {
                //         savings['tierKeys'].push(tierKey);
                //         tierDetail[tierKey] = tierData;
                //     }
                // });

                // const owners = savings['linkedAccountDetails']['ownersList'];
                // owners.forEach(owner => {
                //     for (const tier in tierDetail) {
                //         if (tierDetail.hasOwnProperty(tier)) {
                //             tierDetail[tier]['startAge'].push(tierDetail[tier]['StartYear'] - owner.birthYear);
                //             tierDetail[tier]['endAge'].push(tierDetail[tier]['EndYear'] - owner.birthYear);
                //         }
                //     }
                // });
                // savings['tierDetail'] = tierDetail;
                this.savingsData[filter][savings.linkedAccountKey].push(savings);
            }
        });
        this.Ids = Object.keys(this.savingsData);
        // if (this.Ids.length > 0) {
        //     this.noSavings = false;
        // }
    }

    getTierDetail(tier, savings) {
        return {
            AmountPerYear: savings[tier + 'AmountPerYear'],
            EmployerContribAmt: savings[tier + 'EmployerContribAmt'],
            EndYear: savings[tier + 'EndYear'],
            EndYearLinkType: savings[tier + 'EndYearLinkType'],
            MatchingAmountPerYear: savings[tier + 'MatchingAmountPerYear'],
            StartYear: savings[tier + 'StartYear'],
            StartYearLinkType: savings[tier + 'StartYearLinkType'],
            startAge: [],
            endAge: []
        };
    }

    toggleActionMenu(id, index) {
        if ($('#' + id + '_' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#' + id + '_' + index).toggle();
        }
    }

    delete(savingId) {
        this.translate.get([
            'DELETE.POPUP.SAVING_TITLE',
            'DELETE.POPUP.TEXT',
            'SWEET_ALERT.POPUP.SAVING_DELETE',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            Swal({
                title: i18MenuTexts['DELETE.POPUP.SAVING_TITLE'],
                text: i18MenuTexts['DELETE.POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18MenuTexts['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                cancelButtonText: i18MenuTexts['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.planningServices.deleteSavings(savingId).toPromise().then(res => {
                        this.dataSharing.changeMessage('refresh_savings_list');
                        this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                        this.profileService.getInvestmentData(this.clientId);
                        Swal(i18MenuTexts['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18MenuTexts['SWEET_ALERT.POPUP.SAVING_DELETE'], 'success');
                    }).catch(err => {
                        Swal(i18MenuTexts['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
