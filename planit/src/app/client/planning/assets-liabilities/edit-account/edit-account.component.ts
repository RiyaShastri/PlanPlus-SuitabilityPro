import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService } from '../../../service/planning.service';
import { ClientProfileService } from '../../../service/profile.service';
import { AppState, getFamilyMemberPayload, getClientPayload, getPortfolioPayload } from '../../../../shared/app.reducer';
import { PortfolioService } from '../../../service';
import * as moment from 'moment';
import { getCurrencySymbol } from '@angular/common';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { AdvisorService } from '../../../../advisor/service/advisor.service';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { BENEFICIARY_RELATION, ASSETS_LIABILITY_ACCOUNT_TYPE, ENTITY_OWNER_TYPE } from '../../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';


@Component({
    selector: 'app-edit-account',
    templateUrl: './edit-account.component.html',
    styleUrls: ['./edit-account.component.css']
})
export class EditAccountComponent implements OnInit, OnDestroy {
    public clientId;
    public accountId;
    public currentAccount;
    public accountsData: any;
    public totalHoldings;
    public totalLiability;
    public familyMembers;
    public ownerShipTotal = 0;
    public regularityTypes;
    public isOwnerShipMultiple: boolean;
    public individualOwnerShip: string;
    public portfolioType;
    selectedOwnerShip = {};
    selectedOwnerShipId: string;
    selectedOwnerSet = false;
    selectedOwnerType: number;
    isFromAddNamedBeneficiary = false;
    clientData = {};
    account;
    accessRights = {};
    allAccountType = [];
    selectedAccountType;
    beneficiariesData;
    primaryBeneficiary = [];
    contingentBeneficiary = [];
    isBeneficiaryTotalHundred = false;
    primaryTotal = 100;
    contingentTotal = 100;
    BENEFICIARY_RELATION = BENEFICIARY_RELATION;
    private unsubscribe$ = new Subject<void>();
    isInvestment = false;
    selectionRequiredError = false;
    OTHER_OWNER = ASSETS_LIABILITY_ACCOUNT_TYPE;
    ENTITY_OWNER_TYPE = ENTITY_OWNER_TYPE;
    deemedDividend = true;
    filteredPortfolioType;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private planningServices: PlanningService,
        private portfolioService: PortfolioService,
        private profileService: ClientProfileService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private advisorService: AdvisorService,
        private refreshDataService: RefreshDataService
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.EDIT_ACCOUNT');
        this.angulartics2.eventTrack.next({ action: 'editAccount' });
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('NEW_BENEFICIARY_ADDED')) {
                setTimeout(() => {
                    this.getAccountDetail();
                    this.refreshDataService.changeMessage('default message');
                }, 50);
            }
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['AL_LIABILITY', 'AL_BENEF']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.accountId = params['accountId'];
            this.getAllData();
            this.isInvestment = this.isInvestmentType();
        });
        this.isFromAddNamedBeneficiary = this.router.url.includes('add-named-beneficiary') ? true : false;
        this.selectedOwnerSet = this.isFromAddNamedBeneficiary;
        this.route.parent.parent.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(queryParams => {
            this.selectedOwnerShipId = queryParams.selectedOwnerShipId;
            this.selectedOwnerType = queryParams.selectedOwnerType;
            this.isFromAddNamedBeneficiary = this.router.url.includes('add-named-beneficiary') ? true : false;
            this.selectedOwnerSet = this.isFromAddNamedBeneficiary;
        });
    }

    getAllData() {
        this.store.select(getPortfolioPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(portfolio => {
            this.portfolioType = portfolio.portfolios;
            this.filteredPortfolioType = portfolio.portfolios;
        });
        // this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
        //     if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
        //         this.familyMembers = Object.assign([], data['familyMembers']);
        //     }
        // });

        this.planningServices.getAccountOwners(this.clientId, this.accountId).toPromise().then(owners => {
            this.familyMembers = owners;
            this.familyMembers.forEach(member => {
                const relationObj = this.profileService.checkStatus(member.role);
                member['btnColor'] = relationObj['btnColor'];
                member['relation'] = relationObj['relation'];
                member['btnInitials'] = member.firstName[0] + (member.lastName ? member.lastName[0] : member.firstName[1]);
            });
        }).catch(errorResponse => {
            this.familyMembers = [];
        });

        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData && clientData.hasOwnProperty('planningCountry')) {
                this.clientData = clientData;
                this.getAllAccountType(this.clientData['planningCountry']);
                if (this.clientId && this.accountId) {
                    this.getAccountDetail();
                }
            }
        });
    }

    getAccountDetail(isSetAccountData = true) {
        this.planningServices.getAccountWithBeneficiary(this.clientId, this.accountId).toPromise().then(data => {
            if (isSetAccountData) {
                this.currentAccount = data['accountPayload'];
                this.account = Object.assign({}, data['accountPayload']);
                this.selectedAccountType = this.allAccountType.find(x => x.id === this.account['accountType']);
                this.getRegularityTypes(true, this.currentAccount['accountType']);
            }
            if (data.hasOwnProperty('namedBeneficiaries') && data['namedBeneficiaries'].length > 0) {
                this.setBeneficiaryData(data['namedBeneficiaries']);
            }
            this.isInvestment = this.isInvestmentType();
        });
    }

    setBeneficiaryData(benificary) {
        this.primaryBeneficiary = [];
        this.contingentBeneficiary = [];
        this.beneficiariesData = benificary;
        this.beneficiariesData.forEach(data => {
            let details = {};
            if (data && data['defaultNamedBeneficiaryDescription']) {
                const splitedString = data['defaultNamedBeneficiaryDescription'].split(' ');
                data['initials'] = splitedString.length > 1 ? splitedString[0][0] + splitedString[1][0] : splitedString[0][0];
                data['isOther'] = false;
                details = data;
            } else {
                data['initials'] = data['otherBeneficiary']['firstName'][0] +
                    ((data['otherBeneficiary']['lastName']) ? data['otherBeneficiary']['lastName'][0] : '');
                data['isOther'] = true;
                details = data;
            }
            if (data['primaryBeneficiary']) {
                this.primaryBeneficiary.push(details);
            } else {
                this.contingentBeneficiary.push(details);
            }
        });
    }

    totalBeneficiary(event, i, isPrimary) {
        let index = 0;
        let total = 0;
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 || event.keyCode === 46) {
            if (isPrimary) {
                this.primaryTotal = 0;
                this.primaryBeneficiary.forEach((element, ind) => {
                    if (element['canDelete'] === true) {
                        total = total + parseInt(element.owned, 10);
                    } else {
                        index = ind;
                    }
                });
                if (this.primaryBeneficiary[i]['owned'] >= 0 && total <= 100) {
                    this.primaryBeneficiary[index]['owned'] = 100 - total;
                }
                this.primaryBeneficiary.forEach(element => {
                    this.primaryTotal = this.primaryTotal + parseInt(element.owned, 10);
                });
            } else {
                this.contingentTotal = 0;
                this.contingentBeneficiary.forEach((element, ind) => {
                    if (element['canDelete'] === true) {
                        total = total + parseInt(element.owned, 10);
                    } else {
                        index = ind;
                    }
                });
                if (this.contingentBeneficiary[i]['owned'] >= 0 && total <= 100) {
                    this.contingentBeneficiary[index]['owned'] = 100 - total;
                }
                this.contingentBeneficiary.forEach(element => {
                    this.contingentTotal = this.contingentTotal + parseInt(element.owned, 10);
                });
            }
        }
    }

    async getAllAccountType(planningCountry) {
        await this.planningServices.getAccountType(planningCountry).toPromise().then(async response => {
            this.allAccountType = await response;
        }).catch(errorResponse => {
            this.allAccountType = [];
        });
    }

    getRegularityTypes(isSetData: boolean = true, accountType) {
        this.planningServices.getRegularityType(accountType, this.clientData['planningCountry']).toPromise().then(data => {
            this.regularityTypes = data;
            this.account['regulatoryType'] = '';
            let dataArray = data as Array<any>;
            let currentData = dataArray.find(x => x.id === this.account['regulatoryTypeDTO'].id);
            if (currentData === undefined) {
                // switch account type
                currentData = dataArray[0];
            }
            if (currentData !== undefined) {
                this.account['investmentType'] = currentData['investmentType'];
                this.account['holdAssets'] = currentData['holdAssets'];
            }
            this.isInvestment = this.isInvestmentType();
            if (isSetData) {
                this.getCurrentAccountData();
            }
        }).catch(errorResponse => {
            this.regularityTypes = [];
        });
    }

    getCurrentAccountData() {
        this.account['ownerList'] = [];
        this.currentAccount.ownership.forEach(ownerData => {
            this.account['ownerList'].push({
                externalKey: ownerData.personDetails.id,
                owned: (ownerData.owned === 0 || ownerData.owned === null) ? 0 : ownerData.owned,
                isOwned: (ownerData.owned !== null && ownerData.owned !== 0) ? true : false,
                personDetails: ownerData.personDetails,
                type: ownerData.type
            });
            this.ownerShipTotal += ownerData.owned;
        });
        if (this.account['ownerList']) {
            this.account['ownerList'].forEach(owner => {
                if (this.selectedOwnerSet && this.selectedOwnerShipId !== null) {
                    if (this.selectedOwnerShipId === owner.externalKey) {
                        this.selectedOwnerShip = owner;
                        this.selectedOwnerShip['isOwned'] = true;
                        this.selectedOwnerShip['owned'] = 100;
                        this.selectedOwnerType = owner.type;
                        if(owner.type == ENTITY_OWNER_TYPE.OWNER_TYPE_ENTITY){
                          this.filteredPortfolioType = this.portfolioType.filter(value => {return value.entityId === owner.externalKey});
                        }else{
                          this.filteredPortfolioType = this.portfolioType.filter(value => {return !value.entityId});
                        }
                    } else {
                        owner.isOwned = false;
                        owner.owned = 0;
                    }
                } else if (!this.selectedOwnerSet && owner.isOwned) {
                    this.selectedOwnerShip = owner;
                    this.selectedOwnerShipId = owner.externalKey;
                    this.selectedOwnerType = owner.type;
                }
            });
            if (this.selectedOwnerSet) {
                this.selectedOwnerSet = false;
            }
        }
        this.account['created'] = this.currentAccount.renewalDate;
        this.account['regulatoryType'] = this.regularityTypes.find(acc => acc.id === this.currentAccount.regulatoryType);
        this.account['portfolio_id'] = this.portfolioType[this.portfolioType.findIndex(port => port.id === this.currentAccount.portfolio)];
        this.totalLiability = this.currentAccount.liabilityAmount;
        this.totalHoldings = this.currentAccount.totalAssets;
        this.allowMultipleOwner(this.account['regulatoryType']);
        // update the selectionRequiredError
        this.selectionRequiredError = this.selectionRequiredError && this.account['portfolio_id'] === undefined && this.account['regulatoryType']['holdco'] != 1;
    }

    accountChange(id) {
        this.getRegularityTypes(false, id);
    }

    allowMultipleOwner(regulatoryType,isOwnerListSet: boolean = false) {
        if (isOwnerListSet) {
            this.account['ownerList'] = [];
            this.currentAccount.ownership.forEach((ownerData, k) => {
                this.account['ownerList'].push({
                    externalKey: ownerData.personDetails.id,
                    owned: k === 0 ? 100 : 0,
                    isOwned: k === 0 ? true : false,
                    personDetails: ownerData.personDetails,
                    type: ownerData.type
                });
            });
            this.selectedOwnerShip = this.account['ownerList'][0];
            this.selectedOwnerShipId = this.account['ownerList'][0].externalKey;
            this.selectedOwnerType = this.account['ownerList'][0].type;
            this.isInvestment = this.isInvestmentType();
        }
        this.individualOwnerShip = '';
        if ((regulatoryType.jointTic === 0 && regulatoryType.jointWros === 0 && regulatoryType.jointQcNonspouse === 0 && regulatoryType.itfCapable === 0) || regulatoryType.holdco == 1) {
            this.isOwnerShipMultiple = false;
        } else {
            this.isOwnerShipMultiple = true;
        }
        if(regulatoryType.holdco ===1){
          this.filteredPortfolioType = this.portfolioType.filter(value => this.selectedOwnerShipId === value.entityId);
        }else{
          this.filteredPortfolioType = this.portfolioType.filter(value => !value.entityId);
        }
        this.totalOwnershipPercentage();
    }

    changeAccount(accountId) {
        this.accountId = accountId;
        this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities/' + accountId + '/edit-account']);
    }

    changeOwnerShip(event, i) {
        // tslint:disable-next-line:radix
        this.account['ownerList'][i].owned = event.target.value !== '' ? parseInt(event.target.value) : 0;
        if (event.target.value <= 100 && this.account['ownerList'].length === 2) {
            const nextIndex = this.nextOwner(i);
            if (this.account['ownerList'][nextIndex].isOwned) {
                this.account['ownerList'][nextIndex].owned = 100 - event.target.value;
            }
        }
        this.totalOwnershipPercentage();
    }

    totalOwnershipPercentage() {
        // tslint:disable-next-line:radix
        this.ownerShipTotal = this.account['ownerList'].reduce((sum, owner) => sum + (owner.isOwned ? (owner.owned ? parseInt(owner.owned) : 0) : 0), 0);
    }

    checkOwnership(i) {
        if (this.account['ownerList'][i].isOwned) {
            this.account['ownerList'][i].owned = 0;
        } else {
            this.account['ownerList'][i].owned = 0;
        }
        this.totalOwnershipPercentage();
    }

    updateSelctedOwner(ownerKey) {
        this.account['ownerList'].forEach(owner => {
            if (owner.externalKey === ownerKey) {
                this.selectedOwnerShip = owner;
                this.selectedOwnerShip['isOwned'] = true;
                this.selectedOwnerShip['owned'] = 100;
                this.selectedOwnerShipId = owner.externalKey;
                this.selectedOwnerType = owner.type;
                if(owner.type === ENTITY_OWNER_TYPE.OWNER_TYPE_ENTITY){
                  this.filteredPortfolioType = this.portfolioType.filter(value => {return value.entityId === owner.externalKey});
                  this.account.portfolio_id = this.filteredPortfolioType[0];
                  this.portfolioChange();
                }
            } else {
                owner.owned = 0;
                owner.isOwned = false;
            }
        });
        this.totalOwnershipPercentage();
    }

    ChangeDateFormate(date) {
        this.account['created'] = moment(date).format('YYYY-MM-DD');
    }

    nextOwner(index) {
        index += 1;
        if (index >= this.account['ownerList'].length) {
            index = 0;
        }
        return index;
    }

    updateAccount() {
        const accountValue = {
            key: this.accountId,
            description: this.account['description'],
            accountNumber: this.account['accountNumber'],
            accountType: this.selectedAccountType['id'],
            regulatoryType: this.account['regulatoryType']['id'],
            renewalDate: this.account['created'],
            portfolioKey: (this.account['portfolio_id']) ? this.account['portfolio_id'].id : 0,
            ownerList: this.account['ownerList'],
            managed: this.account['managed'] ? 1 : 0,
            planning: this.account['included'] ? 1 : 0,
        };
        const tempPrimaryBeneficiary = JSON.parse(JSON.stringify(this.primaryBeneficiary));
        const tempContingentBeneficiary = JSON.parse(JSON.stringify(this.contingentBeneficiary));
        const namedBeneficiaries = [];
        tempPrimaryBeneficiary.forEach(element => {
            delete element['initials'];
            delete element['isOther'];
            namedBeneficiaries.push(element);
        });
        tempContingentBeneficiary.forEach(element => {
            delete element['initials'];
            delete element['isOther'];
            namedBeneficiaries.push(element);
        });
        const savePayload = {
            'accountPayloadDTO': accountValue,
            'namedBeneficiaries': namedBeneficiaries
        };
        this.translate.get([
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ASSETS_SUMMARY.POPUP.ACCOUNT_UPDATE'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.planningServices.updateAccountWithBeneficiary(this.clientId, this.accountId, savePayload)
                .toPromise().then(response => {
                    Swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['ASSETS_SUMMARY.POPUP.ACCOUNT_UPDATE'], 'success');
                    this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                    this.profileService.getInvestmentData(this.clientId);
                    this.portfolioService.getClientPortfolioPayload(this.clientId);
                    this.advisorService.getInvestmentPayload();
                    this.advisorService.getAdvisorNetWorthPayload();
                    this.back();
                }).catch(errorResponse => {
                    Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                });
        });
    }

    back() {
        this.router.navigate(['/client/' + this.clientId + '/planning/assets-liabilities']);
    }

    deleteBeneficiary(data, isPrimary) {
        if (data && data.hasOwnProperty('otherBeneficiary')) {
            this.translate.get([
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ALERT_MESSAGE.OOPS_TEXT',
                'ESTATE_PLANING.POPUP.BENEFICIARY_DELETED_SUCCESSFULLY'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                this.planningServices.deleteNamedBeneficiaries(this.clientId, this.accountId, data['otherBeneficiary']['benificaryId'], data['primaryBeneficiary'])
                    .toPromise().then(result => {
                        if (isPrimary) {
                            const index = this.primaryBeneficiary.findIndex(x => x['canDelete'] === false);
                            this.primaryBeneficiary[index]['owned'] = parseInt(this.primaryBeneficiary[index]['owned'], 10) + parseInt(data['owned'], 10);
                        } else {
                            const index = this.contingentBeneficiary.findIndex(x => x['canDelete'] === false);
                            this.contingentBeneficiary[index]['owned'] = parseInt(this.contingentBeneficiary[index]['owned'], 10) + parseInt(data['owned'], 10);
                        }
                        Swal(i18Text['ALERT_MESSAGE.SUCCESS_TITLE'], i18Text['ESTATE_PLANING.POPUP.BENEFICIARY_DELETED_SUCCESSFULLY'], 'success');
                        this.getAccountDetail(false);
                    }).catch(errorResponse => {
                        Swal(i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                    });
            });
        }
    }

    isInvestmentType() {
        var result: boolean = false;
        if (this.account !== undefined &&
            this.account['investmentType'] !== undefined &&
            this.account['holdAssets'] !== undefined && this.account['regulatoryType']['holdco'] != 1) {
            result = (this.account['investmentType'] === 1 ||   // registered/non-registered
                this.account['investmentType'] === 7 ||   // Universal Life -97
                this.account['investmentType'] === 11 ||  // education
                this.account['investmentType'] === 30 ||  // structured products -30
                this.account['holdAssets'] === 1);
        } else {
            result = false;
        }
        this.selectionRequiredError = result && this.account['portfolio_id'] === undefined;
        return result;
    }

    portfolioChange() {
        if ((this.selectionRequiredError && this.account['portfolio_id'] !== undefined) || this.account['regulatoryType']['holdco'] == 1) {
            this.selectionRequiredError = false;
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
