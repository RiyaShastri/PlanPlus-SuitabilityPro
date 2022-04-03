import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { slideInOutAnimation } from '../../../../shared/animations';
import { PlanningService, ClientProfileService, PortfolioService } from '../../../service';
import { AppState, getFamilyMemberPayload, getClientPayload } from '../../../../shared/app.reducer';
import { RefreshDataService } from '../../../../shared/refresh-data';
import { getCurrencySymbol } from '@angular/common';
import { Angulartics2 } from 'angulartics2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../../../shared/page-title';
import { AccessRightService } from '../../../../shared/access-rights.service';
import { AdvisorService } from '../../../../advisor/service/advisor.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-add-account',
    templateUrl: './add-account.component.html',
    styleUrls: ['./add-account.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})

export class AddAccountComponent implements OnInit, OnDestroy {
    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency,
        thousands: ',',
        decimal: '.'
    });
    public clientId;
    public portfolioType;
    public today = new Date();
    accountModel = {
        ownerList: [],
        ownership: [],
        managed: true,
        accountName: null,
        accountType: null,
        regulatoryType: null,
        portfolio: null,
        assets: null,
        liability: null,
        portfolioId: '',
        liabilityAmount: null,
        totalAssets: null
    };
    allAccountType;
    familyMembers;
    ownerShipTotal = 100;
    isOwnerShipMultiple = false;
    individualOwnerShip: string;
    ownerListEmpty = true;
    filteredOwnerList = [];
    clientData = {};
    saveButtonDisable = false;
    accessRights = {};
    assetValue: string;
    liabilityValue: string;
    private unsubscribe$ = new Subject<void>();
    isInvestment = false;
    selectionRequiredError = false;
    isFromImplementation = false;
    portfolioId;
    regulatoryTypes;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<AppState>,
        private assetsServices: PlanningService,
        private portfolioService: PortfolioService,
        private refreshDataService: RefreshDataService,
        private profileService: ClientProfileService,
        private angulartics2: Angulartics2,
        private translate: TranslateService,
        private pageTitleService: PageTitleService,
        private accessRightService: AccessRightService,
        private advisorService: AdvisorService,
        private planningService: PlanningService,
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.ADD_AN_ACCOUNT');
        this.angulartics2.eventTrack.next({ action: 'addAccount' });

        this.angulartics2.eventTrack.next({ action: 'addAccount' });
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        if (!this.clientId) {
            this.route.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                this.clientId = params['clientId'];
            });
        }
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.portfolioId = params['portfolioId'];
        });
        this.isFromImplementation = this.router.url.includes('implementation') ? true : false;
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('add_protFolio_screen|')) {
                this.accountModel = JSON.parse(message.replace('add_protFolio_screen|', ''));
                if (this.accountModel && this.accountModel.accountType) {
                    if (this.accountModel['ownership'].length > 0) {
                        this.ownerListEmpty = false;
                        this.individualOwnerShip = this.accountModel['ownership'][0]['personDetails']['id'];
                    }
                    this.allowMultipleOwner(this.accountModel.accountType, this.accountModel.regulatoryType);
                    this.isFromImplementation = this.accountModel['isFromImplementation'];
                }

            } else {
                this.accountModel = {
                    ownerList: [],
                    ownership: [],
                    managed: true,
                    accountName: null,
                    accountType: null,
                    regulatoryType: null,
                    portfolio: null,
                    assets: null,
                    liability: null,
                    portfolioId: '',
                    liabilityAmount: null,
                    totalAssets: null
                };
                this.ownerListEmpty = true;
            }
            this.getFamilyMembers();
        });
    }

    ngOnInit() {
        this.accessRightService.getAccess(['AL_LIABILITY', 'BTN01'])
            .pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
                if (res) {
                    this.accessRights = res;
                    if (this.accessRights['BTN01']['menuId'] === 'BTN01' && this.accessRights['BTN01']['accessLevel'] === 0) {
                        this.back();
                    }
                }
            });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            if (clientData) {
                this.clientData = clientData;
                this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
                this.currencyMask = createNumberMask({
                    prefix: this.currency,
                    thousands: ',',
                    decimal: '.'
                });
                const planningCountry = clientData['planningCountry'];
                this.getAllAccountType(planningCountry);
                this.portfolioService.getListOfPortfolios(this.clientId)
                    .toPromise()
                    .then(res => {
                        this.portfolioType = res['portfolios'].filter(value => {return !value.entityId});
                        if (this.accountModel && this.accountModel.portfolioId !== '') {
                            this.accountModel.portfolio = this.portfolioType.find(x => x['id'] === this.accountModel.portfolioId);
                            this.selectionRequiredError = false;
                        } else {
                            this.accountModel.portfolio = this.portfolioType.find(x => x['defaultPortfolio'] === true);
                        }
                    });
            } else {
                this.profileService.storeClientPayload(this.clientId);
            }
        });
    }

    getAllAccountType(planningCountry) {
        this.assetsServices.getAccountType(planningCountry).toPromise().then(response => {
            this.allAccountType = response;
        }).catch(err => { });
    }

    isInvestmentType(accountType) {
        let result = false;
        if (accountType !== undefined &&
            accountType['investmentType'] !== undefined &&
            accountType['holdAssets'] !== undefined) {
            result = (accountType['investmentType'] === 1 ||   // registered/non-registered
                accountType['investmentType'] === 7 ||   // Universal Life -97
                accountType['investmentType'] === 11 ||  // education
                accountType['investmentType'] === 30 ||  // structured products -30
                accountType['holdAssets'] === 1);
        } else {
            result = false;
        }
        this.selectionRequiredError = result && this.accountModel.portfolio === undefined;
        return result;
    }

    portfolioChange() {
        if (this.selectionRequiredError && this.accountModel.portfolio !== undefined) {
            this.selectionRequiredError = false;
        }
    }

    getFamilyMembers() {
        this.assetsServices.getAccountOwners(this.clientId).toPromise().then(owners => {
            this.familyMembers = owners;
            this.familyMembers.forEach(member => {
                const relationObj = this.profileService.checkStatus(member.role);
                member['btnColor'] = relationObj['btnColor'];
                member['relation'] = relationObj['relation'];
                member['btnInitials'] = member.firstName[0] + (member.lastName ? member.lastName[0] : member.firstName[1]);
            });
            this.assignOwners();
        }).catch(errorResponse => {
            this.familyMembers = [];
        });
    }

    assignOwners() {
        if (this.familyMembers && this.ownerListEmpty) {
            this.accountModel.ownerList = [];
            this.familyMembers.forEach(member => {
                const memberObj = {
                    ownerKey: member.id,
                    owned: null,
                    isOwned: false,
                    type: member.type,
                    role: member.role
                };
                if (member.id === this.clientId) {
                    memberObj['owned'] = 100;
                    memberObj['isOwned'] = true;
                }
                this.accountModel.ownerList.push(memberObj);
            });
        }
    }

    allowMultipleOwner(accountType, regulatoryType) {
      const roleEntity = 5;
      if( regulatoryType && regulatoryType.holdco === 1){
        this.isOwnerShipMultiple = false;
        this.accountModel.portfolio = undefined;
      } else {
        this.filteredOwnerList = this.accountModel.ownerList.filter( value => {return value.role !== roleEntity});
        if ((accountType.jointTic === 0 && accountType.jointWros === 0 && accountType.jointQcNonspouse === 0 && accountType.itfCapable === 0)) {
          if (this.ownerListEmpty) {
            this.individualOwnerShip = this.accountModel.ownerList[0].ownerKey;
          }
          this.isOwnerShipMultiple = false;
        } else {
          this.isOwnerShipMultiple = true;
        }

        // also check if it is an investment type
        this.isInvestment = this.isInvestmentType(this.accountModel.accountType);
        if (!this.isInvestment) {
          this.accountModel.portfolio = undefined;
        }
      }
    }

    changeOwnerShip(event, i) {
        // tslint:disable-next-line:radix
        this.accountModel.ownerList[i].owned = event.target.value !== '' ? parseInt(event.target.value) : '';
        if (event.target.value <= 100 && this.accountModel.ownerList.length === 2) {
            const nextIndex = this.nextOwner(i);
            if (this.accountModel.ownerList[nextIndex].isOwned) {
                this.accountModel.ownerList[nextIndex].owned = 100 - event.target.value;
            }
        }
        this.totalOwnershipPercentage();
    }

    totalOwnershipPercentage() {
        // tslint:disable-next-line:radix
        this.ownerShipTotal = this.accountModel.ownerList.reduce((sum, owner) => sum + (owner.isOwned ? (owner.owned ? parseInt(owner.owned) : 0) : 0), 0);
    }

  getRegularityTypes(isSetData: boolean = true, accountType) {
    this.planningService.getRegularityType(accountType, this.clientData['planningCountry']).toPromise().then(data => {
      this.regulatoryTypes = data;
    });
  }


    checkOwnership(i) {
        if (this.accountModel.ownerList[i].isOwned) {
            this.accountModel.ownerList[i].owned = 0;
        } else {
            this.accountModel.ownerList[i].owned = null;
        }
        this.totalOwnershipPercentage();
    }

    nextOwner(index) {
        index += 1;
        if (index >= this.accountModel.ownerList.length) {
            index = 0;
        }
        return index;
    }

    addAccount(f) {
        if (f.valid) {
            this.trimCurrency();
            const ownerShipList = [];
            if (!this.isOwnerShipMultiple) {
                const slectedOwnerData = this.familyMembers.filter(member => member.id === this.individualOwnerShip)[0];
                ownerShipList.push({
                    owned: 100,
                    ownerKey: this.individualOwnerShip,
                    type: slectedOwnerData['type'],
                    role: slectedOwnerData['role']
                });
            } else {
                this.accountModel.ownerList.forEach(o => {
                    if (o.owned !== null && o.isOwned) {
                        ownerShipList.push(o);
                    }
                });
            }
            const accountDetail = {
                description: this.accountModel.accountName,
                accountType: this.accountModel.accountType.id,
                regulatoryType: this.accountModel.regulatoryType.id,
                portfolio: (this.accountModel.portfolio !== undefined && this.accountModel.portfolio.id) ? (this.accountModel.portfolio.id) : null,
                assetList: [{
                    'fmv': (this.accountModel.assets) ? this.accountModel.assets : 0
                }],

                liabilityList: [{
                    'currentBalance': (this.accountModel.liability) ? this.accountModel.liability : 0
                }],
                ownership: ownerShipList,
                managed: this.accountModel.managed ? 1 : 0,
                liabilityAmount: (this.accountModel.liability) ? this.accountModel.liability : 0,
                totalAssets: (this.accountModel.assets) ? this.accountModel.assets : 0
            };
            this.translate.get([
                'ADD_ACCOUNT.POPUP.SUCCESS'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                this.assetsServices.addAccountOnAssetsAndLiability(this.clientId, accountDetail)
                    .toPromise()
                    .then(res => {
                        Swal('Success', i18Text['ADD_ACCOUNT.POPUP.SUCCESS'], 'success');
                        this.saveButtonDisable = false;
                        const dataObj = {
                            'portfolioKey': res['portfolioKey'],
                            'currencyCode': this.clientData['currencyCode']
                        };
                        this.refreshDataService.changeMessage('Assets_acount_added|' + JSON.stringify(dataObj));
                        this.profileService.getClientNetworthInvestmentPayload(this.clientId);
                        this.profileService.getInvestmentData(this.clientId);
                        this.portfolioService.getClientPortfolioPayload(this.clientId);
                        this.advisorService.getInvestmentPayload();
                        this.advisorService.getAdvisorNetWorthPayload();
                        this.back();
                    }).catch(err => {
                        Swal('Oops...', err.error.errorMessage, 'error');
                        this.saveButtonDisable = false;
                    });
            });
        }
    }

    addProtfolioScreen() {
        const ownerShipList = [];
        if (!this.isOwnerShipMultiple) {
            ownerShipList.push({
                owned: 100,
                personDetails: {
                    'id': this.individualOwnerShip
                }
            });
        } else {
            this.accountModel.ownerList.forEach(o => {
                if (o.owned !== null && o.isOwned) {
                    ownerShipList.push(
                        {
                            owned: o.owned,
                            personDetails: {
                                'id': o.ownerKey
                            }
                        }
                    );
                }
            });
        }
        this.accountModel['ownership'] = ownerShipList;
        this.accountModel['isFromImplementation'] = this.isFromImplementation;
        this.refreshDataService.changeMessage('add_protFolio_screen|' + JSON.stringify(this.accountModel));
        this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', 'add-portfolio']);
    }

    back() {
        this.refreshDataService.changeMessage('default message');
        if (this.isFromImplementation && this.portfolioId) {
            this.router.navigate(['/client', this.clientId, 'planning', 'portfolios', this.portfolioId, 'implementation']);
        } else {
            this.router.navigate(['/client', this.clientId, 'planning', 'assets-liabilities']);
        }
    }

    convertFloat(n) {
        return parseFloat(n);
    }

    public setTwoNumberDecimal(event: any, val: string) {
        //        this.accountModel.assets = parseFloat(event.target.value).toFixed(2);
        let value;
        if (event.target.value === undefined || event.target.value === '') {
            value = null;
        } else {
            value = event.target.value.toString();
            if (value.startsWith('(') || value.startsWith('-')) {
                value = '-' + value.substr(1, value.length).replace(/\(|\)|\$|\-/g, '');
            } else {
                value = value.replace(/\(|\)|\$|\-/g, '');
            }
            let [integer, fraction = ''] = (value || '').toString().split('.');
            fraction = '.' + (fraction + '000000').substring(0, 2);
            integer = integer.replace(/,/g, '');
            integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            // If user types .xx we can display 0.xx
            if (integer === '') {
                integer = '0';
            } else if (integer.startsWith(this.currency)) {
                // If there are multiple transforms, remove the previous dollar sign (blur and change at the same time)
                integer = integer.substr(1, integer.length);
            } else if (integer.startsWith('-')) {
                // If user inputs negative number set to paranthesis format
                integer = integer.substr(1, integer.length);
                value = '(' + this.currency + integer + fraction + ')';
            }
            value = this.currency + integer + fraction;
        }
        if (val === 'assetValue') {
            this.accountModel.assets = value;
        } else if (val === 'liabilityValue') {
            this.accountModel.liability = value;
        }
    }

    public currencyMaskKeypress(event) {
        const key = event.which || event.keyCode || 0;
        if (key === 45) {     // allow negative
            // allow negative numbers
        } else if (key !== 46 && key > 31 && (key < 48 || key > 57)) {
            event.preventDefault();
        }
    }

    public trimCurrency() {
        let value: any;
        if (this.accountModel.assets === null) {
            this.accountModel.assets = '0';
        }
        if (this.accountModel.liability === null) {
            this.accountModel.liability = '0';
        }
        this.accountModel.assets = this.accountModel.assets.replace(this.currency, '');
        this.accountModel.assets = this.accountModel.assets.replace(/,/g, '');
        value = parseFloat(this.accountModel.assets).toFixed(2);
        this.accountModel.assets = value;
        this.accountModel.liability = this.accountModel.liability.replace(this.currency, '');
        this.accountModel.liability = this.accountModel.liability.replace(/,/g, '');
        value = parseFloat(this.accountModel.liability).toFixed(2);
        this.accountModel.liability = value;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
