import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppState, getClientPayload, getProvincePayload, getShareList } from '../../../shared/app.reducer';
import { Store } from '@ngrx/store';
import { ClientProfileService, EntitiesService, PortfolioService } from '../../service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { FAMILY_MEMBER_DROPDOWN_TYPE, ENTITY_TYPES, BENEFICIARY_RELATION, ENTITY_OWNERSHIP_SHARE_TYPE, ENTITY_VIEW_LIST } from '../../../shared/constants';
import { Relation } from '../../client-models/family-member';
import swal from 'sweetalert2';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { getCurrencySymbol, DecimalPipe } from '@angular/common';
import { SelectItem } from 'primeng/api';
import { PageTitleService } from '../../../shared/page-title';

@Component({
    selector: 'app-entity-ownership',
    templateUrl: './entity-ownership.component.html',
    styleUrls: ['./entity-ownership.component.css']
})
export class EntityOwnershipComponent implements OnInit, OnDestroy {
    clientId;
    entityId;
    private unsubscribe$ = new Subject<void>();
    entityOwnership = {};
    typeDropList = [];
    i18Text = {};
    provinceArr = [];
    selectedProvince;
    selectedType;
    clientData = {};
    relatedCorporateList = [];
    saveDisabled = false;
    TYPES = ENTITY_TYPES;
    ENTITY_TYPE = FAMILY_MEMBER_DROPDOWN_TYPE.ENTITY;
    CLIENT1 = BENEFICIARY_RELATION.CLIENT;
    SHARE_TYPE = ENTITY_OWNERSHIP_SHARE_TYPE;
    ownersList: any[];
    relation = Relation;
    roles = {};
    isTableGenerated = false;
    tableData = [];
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true,
        decimalLimit: 1
    });
    isNotEqualHundred = false;
    viewList = [];
    selectedViewBy = {};
    sharesList = [];
    VIEW_BY = ENTITY_VIEW_LIST;
    isShareOther = false;
    isOwnerOther = false;
    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency,
        allowDecimal: true
    });
    numberMask = createNumberMask({
        prefix: '',
        suffix: '',
        allowDecimal: true,
        decimalLimit: 1
    });
    isAddOwnerSidePanelOpen = false;
    client1_Role;
    selectedOwnerList = [];
    selectedShareList = [];
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService,
        private store: Store<AppState>,
        private clientProfileService: ClientProfileService,
        private entitiesService: EntitiesService,
        private pageTitleService: PageTitleService,
        private portfolioService: PortfolioService,
        private decimalPipe: DecimalPipe
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PERSONAL_INFO_ENTITY_OWNERSHIP');
        this.relation.forEach(element => {
            this.roles[element.id] = element.name;
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
            this.translate.stream([
                'ALERT.TITLE.SUCCESS',
                'ALERT_MESSAGE.ALERT_TITLE',
                'ALERT_MESSAGE.OOPS_TEXT',
                'ENTITY.ACTIVE_BUISNESS',
                'ENTITY.HOLDING_COMPANY',
                'ENTITY.OWNERSHIP_UPDATE_MESSAGE',
                'ENTITY.WARNING_FOR_GENERATE_TABLE',
                'ENTITY.SHARE',
                'ENTITY.OWNERSHIP_SHARE_DELETE',
                'ENTITY.OWNERS_PLACEHOLDER',
                'ENTITY.SHARE_PLACEHOLDER',
                'DELETE.POPUP.DELETE_TITLE',
                'DELETE.POPUP.ENTITY_OWNER_DELETE',
                'DELETE.POPUP.ENTITY_SHARE_CLASS',
                'DELETE.POPUP.NOT_UNDO',
                'ENTITY.POPUP.OWNER_DELETED_SUCCESFULLY',
                'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
                'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
                this.i18Text = i18Text;
                this.typeDropList = [
                    { id: this.TYPES.ACTIVE_BUISNESS, name: this.i18Text['ENTITY.ACTIVE_BUISNESS'] },
                    { id: this.TYPES.HOLDING_COMPANY, name: this.i18Text['ENTITY.HOLDING_COMPANY'] },
                ];
                this.viewList = [
                    { id: this.VIEW_BY['VIEW_BY_%'], name: '%' },
                    { id: this.VIEW_BY['VIEW_BY_$'], name: '$' },
                    { id: this.VIEW_BY['VIEW_BY_SHARE'], name: this.i18Text['ENTITY.SHARE'] }
                ];
                this.selectedViewBy = this.viewList[0];
                this.viewList[1]['name'] = this.currency;
            });
            this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
                if (clientData) {
                    this.clientData = clientData;
                    this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
                    this.viewList[1]['name'] = this.currency;
                    this.currencyMask = createNumberMask({
                        prefix: this.currency,
                        allowDecimal: true
                    });
                    this.store.select(getProvincePayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                        if (data) {
                            if (this.clientData && this.clientData.hasOwnProperty('planningCountry')) {
                                this.provinceArr = data[this.clientData['planningCountry']];
                                this.getEntityDetails();
                                this.getGenerateTableData();
                            }
                        } else {
                            this.clientProfileService.getProvince();
                        }
                    });
                }
            });
        });
        this.entitiesService.getShareClassResponse().pipe(takeUntil(this.unsubscribe$)).subscribe(response => {
            if (response) {
                this.getGenerateTableData();
            }
        });
    }

    getEntityDetails() {
        this.clientProfileService.getEntityByEntityId(this.clientId, this.entityId).toPromise().then(result => {
            this.entityOwnership = result;
            this.selectedProvince = this.provinceArr.find(x => x.provinceId === this.entityOwnership['province']);
        }).catch(entityError => {
            if (entityError.status === 403 || entityError.status === 404) {
                this.router.navigate(['/client/' + this.clientId + '/profile/personal-info']);
            }
        });
    }

    getGenerateTableData() {
        this.selectedOwnerList = [];
        this.clientProfileService.getOwnershipTabel(this.clientId, this.entityId).toPromise().then(distributions => {
            this.tableData = distributions['shareDistributions'];
            this.isTableGenerated = distributions['tableGenerated'];
            this.calculateTotal();
            this.tableData.forEach(share => {
                this.selectedShareList.push({
                    id: share['shareClassId'],
                    name: share['shareClassDesc'],
                });
            });
            if (this.isTableGenerated) {
                this.setSelectedOwnerList();
            } else {
                this.getOwnersAndShareList();

            }
        }).catch(errorResponse => {
            swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
        });
    }

    generateTable() {
        this.selectedOwnerList = [];
        const obj = {
            selectedShareClasses: [],
            selectedOwners: []
        };
        if (this.entityOwnership['owners'] && this.entityOwnership['owners'].length > 0 && this.entityOwnership['shares'] && this.entityOwnership['shares'].length > 0) {
            this.ownersList.forEach(owner => {
                if (owner['id'] !== this.SHARE_TYPE.OTHER) {
                    if (this.entityOwnership['owners'].indexOf(owner['id']) > -1) {
                        if (owner['id'].includes(this.SHARE_TYPE.OTHER)) {
                            owner['id'] = null;
                        }
                        obj['selectedOwners'].push(owner);
                    }
                }
            });
            this.entityOwnership['shares'].forEach(shareItem => {
              let share = this.sharesList.find(item => item.id === shareItem);
                if (share['id'] !== this.SHARE_TYPE.OTHER) {
                    if ((!isNaN(share['id']) && share['id'] < 4) || share['id'].includes(this.SHARE_TYPE.OTHER)  || share['id'].includes(this.SHARE_TYPE.COMMON)) {
                        share['id'] = null;
                    }
                    obj['selectedShareClasses'].push(share);
                }
            });
            this.clientProfileService.generateOwnershipTable(this.clientId, this.entityId, obj).toPromise().then(async result => {
                this.isTableGenerated = result['tableGenerated'];
                this.tableData = result['shareDistributions'];
                this.tableData.forEach(share => {
                    this.selectedShareList.push({
                        shareClassId: share['shareClassId'],
                        shareClassDesc: share['shareClassDesc'],
                    });
                });
                await this.setSelectedOwnerList();
                await this.calculateTotal();
                this.portfolioService.getClientPortfolioPayload(this.clientId);
            }).catch(errorResponse => {
                swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
            });
        } else {
            swal(this.i18Text['ALERT_MESSAGE.ALERT_TITLE'], this.i18Text['ENTITY.WARNING_FOR_GENERATE_TABLE'], 'error');
        }
    }

    setSelectedOwnerList() {
        this.tableData[0]['owners'].forEach(owner => {
            const relation_status = this.clientProfileService.checkStatus(owner['ownerRole']);
            owner['btnColor'] = relation_status['btnColor'];
            const splitedString = owner['ownerName'].split(' ');
            owner['initials'] = splitedString.length > 1 ? splitedString[0][0] + splitedString[1][0] :
                splitedString[0][0] + splitedString[0][1];
            this.selectedOwnerList.push({
                id: owner['ownerId'],
                name: owner['ownerName'],
                role: owner['ownerRole']
            });
        });
    }

    getOwnersAndShareList() {
        this.entityOwnership['owners'] = [];
        this.entityOwnership['shares'] = [];
        this.clientProfileService.getOwnersList(this.clientId, this.entityId).toPromise().then(owners => {
            if (owners) {
                owners.forEach(owner => {
                    if (owner.role === this.CLIENT1) {
                        owner['disabled'] = true;
                        this.entityOwnership['owners'] = [owner.id];
                    }
                    owner['value'] = owner.id;
                    owner['label'] = owner.firstName + ' ' + owner.lastName;
                });
                this.ownersList = owners;
                this.ownersList.push({
                    id: this.SHARE_TYPE.OTHER,
                    firstName: this.SHARE_TYPE.OTHER,
                    lastName: '',
                    value: this.SHARE_TYPE.OTHER,
                    label: this.SHARE_TYPE.OTHER,
                    role: 3
                });
            }
        }).catch(err => {
            this.ownersList = [];
            this.ownersList.push({
                id: this.SHARE_TYPE.OTHER,
                firstName: this.SHARE_TYPE.OTHER,
                lastName: '',
                value: this.SHARE_TYPE.OTHER,
                label: this.SHARE_TYPE.OTHER,
                role: 3
            });
        });
      this.translate.stream([
        'ENTITY.PREFERRED_TEMPLATE','ENTITY.COMMON_SHARES']).pipe(takeUntil(this.unsubscribe$)).subscribe(label => {
        this.entitiesService.getSharesList(this.clientId, this.entityId).toPromise().then(shares => {
            const temp = [];
            shares.forEach(share => {
                temp.push({
                    id: share.shareClassId,
                    firstName: share.description,
                    label: share.description,
                    lastName: '',
                    disabled: share.defaulted,
                  type:share.shareType,
                  value: share.shareClassId
                });
                if(share.defaulted){
                  this.entityOwnership['shares'] = [share.shareClassId];
                }
            });
            if(shares.length === 0){
              temp.push({
                id: this.SHARE_TYPE.COMMON,
                firstName: label['ENTITY.COMMON_SHARES'],
                label: label['ENTITY.COMMON_SHARES'],
                lastName: '',
                disabled: true,
                type:1,
                value: this.SHARE_TYPE.COMMON
              });

                this.entityOwnership['shares'] = [this.SHARE_TYPE.COMMON];

            }
            const prefLabel = ['A', 'B', 'C', 'D'];
            for(let i = 0 ; i < 4; i++){
              temp.push({
                id: i,
                firstName: label['ENTITY.PREFERRED_TEMPLATE'].replace('_', prefLabel[i]),
                label: label['ENTITY.PREFERRED_TEMPLATE'].replace('_', prefLabel[i]),
                lastName: '',
                disabled: false,
                type: 0,
                value: i
              });
            }
            temp.push({
                id: this.SHARE_TYPE.OTHER,
                firstName: this.SHARE_TYPE.OTHER,
                label: this.SHARE_TYPE.OTHER,
                lastName: '',
                disabled: false,
              type: 1,
              value: this.SHARE_TYPE.OTHER
            });
            this.sharesList = Object.assign([], temp);
        }).catch(errorResponse => {
            this.sharesList = [];
            this.sharesList.push({
                id: this.SHARE_TYPE.OTHER,
                firstName: this.SHARE_TYPE.OTHER,
              label: this.SHARE_TYPE.OTHER,
                lastName: '',
              disabled: false,
              type: 1,
              value: this.SHARE_TYPE.OTHER
            });
        });
      })
    }

    addOther(data, type) {
        let temp = [];
        if (type === this.SHARE_TYPE.OWNERS) {
            temp = Object.assign([], this.ownersList);
            this.ownersList = [];
            temp.splice(-1, 0, {
                id: this.SHARE_TYPE.OTHER + temp.length,
                firstName: data,
                lastName: '',
                role: 3,
                label: data,
                value: this.SHARE_TYPE.OTHER + temp.length
            });
            this.ownersList = temp;
            this.entityOwnership['ownersData'] = '';
            const otherIndex = this.entityOwnership['owners'].findIndex(x => x['id'] === this.SHARE_TYPE.OTHER);
            this.entityOwnership['owners'].splice(otherIndex, 1);
            this.checkOther(this.SHARE_TYPE.OWNERS);
        }
        if (type === this.SHARE_TYPE.SHARES) {
            temp = Object.assign([], this.sharesList);
            this.sharesList = [];
            temp.splice(-1, 0, {
                id: this.SHARE_TYPE.OTHER + temp.length,
                firstName: data,
                lastName: ''
            });
            this.sharesList = temp;
            this.entityOwnership['sharesData'] = '';
            const otherIndex = this.entityOwnership['shares'].findIndex(x => x['id'] === this.SHARE_TYPE.OTHER);
            this.entityOwnership['shares'].splice(otherIndex, 1);
            this.checkOther(this.SHARE_TYPE.SHARES);
        }
    }

    checkOther(type) {
        if (type === this.SHARE_TYPE.SHARES) {
            this.isShareOther = this.entityOwnership['shares'].findIndex(x => x.id === this.SHARE_TYPE.OTHER) > -1 ? true : false;
        }
        if (type === this.SHARE_TYPE.OWNERS) {
            this.isOwnerOther = this.entityOwnership['owners'].findIndex(x => x === this.SHARE_TYPE.OTHER) > -1 ? true : false;
        }
    }

    calculateTotal() {
        this.tableData.forEach(share => {
            let totalPercentage = 0;
            let totalDollar = 0;
            let totalShare = 0;
            share.owners.forEach(owner => {
                totalPercentage = totalPercentage + parseFloat(owner['ownerOwnedPercentage']);
                totalDollar = totalDollar + parseFloat(owner['ownerOwnedDollars']);
                totalShare = totalShare + parseFloat(owner['ownerOwnedShares']);
            });
            share['totalPercentage'] = totalPercentage;
            share['totalDollar'] = totalDollar;
            share['totalShare'] = totalShare;
        });
        for (let share = 0; share < this.tableData.length; share++) {
            if (this.selectedViewBy['id'] === this.VIEW_BY['VIEW_BY_%']) {
                if (parseFloat(this.decimalPipe.transform(this.tableData[share]['totalPercentage'], '1.1-1')) !== 100) {
                    this.isNotEqualHundred = true;
                    break;
                } else {
                    this.isNotEqualHundred = false;
                }
            } else if (this.selectedViewBy['id'] === this.VIEW_BY['VIEW_BY_$']) {
                if (this.decimalPipe.transform(this.tableData[share]['totalDollar'], '1.1-2') !== this.decimalPipe.transform(this.tableData[share]['totalDollars'], '1.1-2')) {
                    this.isNotEqualHundred = true;
                    break;
                } else {
                    this.isNotEqualHundred = false;
                }

            } else if (this.selectedViewBy['id'] === this.VIEW_BY['VIEW_BY_SHARE']) {
                if (this.decimalPipe.transform(this.tableData[share]['totalShare'], '1.1-1') !== this.decimalPipe.transform(this.tableData[share]['issuedShares'], '1.1-1')) {
                    this.isNotEqualHundred = true;
                    break;
                } else {
                    this.isNotEqualHundred = false;
                }
            }
        }
    }

    calculatePercent(event, i, j, inputMode) {
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 || event.keyCode === 46) {
            let totalPercentage = 0;
            let totalDollar = 0;
            let totalShare = 0;
            let max = 0;
            const index = this.tableData[0]['owners'].findIndex(x => x.ownerRole === this.CLIENT1);
            if (this.selectedViewBy['id'] === this.VIEW_BY['VIEW_BY_%']) {
                this.tableData[j]['owners'].forEach(owner => {
                    if (owner['ownerRole'] !== this.CLIENT1) {
                        totalPercentage = totalPercentage + parseFloat(this.decimalPipe.transform(owner['ownerOwnedPercentage'], '1.1-1'));
                    }
                });
                max = 100;
                if (this.tableData[j]['owners'][i][inputMode] !== ''
                    && this.tableData[j]['owners'][i][inputMode] >= 0 && this.tableData[j]['owners'][i][inputMode] <= max) {
                    this.tableData[j]['owners'][index][inputMode] = totalPercentage > max ? 0 : max - parseFloat(this.decimalPipe.transform(totalPercentage, '1.1-1'));
                }
            } else if (this.selectedViewBy['id'] === this.VIEW_BY['VIEW_BY_$']) {
                this.tableData.forEach((share, shareIndex) => {
                    if (shareIndex === j) {
                        share.owners.forEach(owner => {
                            if (owner['ownerRole'] !== this.CLIENT1) {
                                totalDollar = totalDollar + parseFloat(owner['ownerOwnedDollars']);
                            }
                        });
                        max = share['totalDollars'];
                    }
                });
                if (this.tableData[j]['owners'][i][inputMode] !== ''
                    && this.tableData[j]['owners'][i][inputMode] >= 0 && parseFloat(this.decimalPipe.transform(this.tableData[j]['owners'][i][inputMode], '1.1-2')) <= max) {
                    this.tableData[j]['owners'][index][inputMode] = totalDollar > max ? 0 : max - totalDollar;
                }
            } else if (this.selectedViewBy['id'] === this.VIEW_BY['VIEW_BY_SHARE']) {
                this.tableData.forEach((share, shareIndex) => {
                    if (shareIndex === j) {
                        share.owners.forEach(owner => {
                            if (owner['ownerRole'] !== this.CLIENT1) {
                                totalShare = totalShare + parseFloat(owner['ownerOwnedShares']);
                            }
                        });
                        max = share['issuedShares'];
                    }
                });
                if (this.tableData[j]['owners'][i][inputMode] !== ''
                    && this.tableData[j]['owners'][i][inputMode] >= 0 && parseFloat(this.decimalPipe.transform(this.tableData[j]['owners'][i][inputMode], '1.1-1')) <= max) {
                    this.tableData[j]['owners'][index][inputMode] = totalShare > max ? 0 : max - parseFloat(this.decimalPipe.transform(totalShare, '1.1-1'));
                }
            }
            this.calculateTotal();
        }
    }

    deleteShare(shareId, shareName) {
        swal({
            title: this.i18Text['DELETE.POPUP.ENTITY_SHARE_CLASS'],
            html: this.i18Text['DELETE.POPUP.DELETE_TITLE'] +
                '&nbsp; <span class="fw-600">' + shareName + '</span> ? <br/> <small>' + this.i18Text['DELETE.POPUP.NOT_UNDO'] + '</small>',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.i18Text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
            cancelButtonText: this.i18Text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
        }).then(result => {
            if (result.value) {
                this.clientProfileService.deleteShare(this.clientId, this.entityId, shareId).toPromise().then(data => {
                    this.getGenerateTableData();
                    swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['ENTITY.OWNERSHIP_SHARE_DELETE'], 'success');
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                });
            }
        });
    }

    deleteOwner(ownerId, ownerName) {
        swal({
            title: this.i18Text['DELETE.POPUP.ENTITY_OWNER_DELETE'],
            html: this.i18Text['DELETE.POPUP.DELETE_TITLE'] +
                '&nbsp; <span class="fw-600">' + ownerName + '</span> ? <br/> <small>' + this.i18Text['DELETE.POPUP.NOT_UNDO'] + '</small>',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.i18Text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
            cancelButtonText: this.i18Text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
        }).then(result => {
            if (result.value) {
                this.entitiesService.deleteOwner(this.clientId, this.entityId, ownerId).toPromise().then(response => {
                    this.getGenerateTableData();
                    swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['ENTITY.POPUP.OWNER_DELETED_SUCCESFULLY'], 'success');
                }).catch(errorResponse => {
                    swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
                });
            }
        });
    }

    changeShareAction(index: number) {
        if ($('#dropdownShareAction' + index).is(':visible')) {
            $('.dropdown-share-action').hide();
        } else {
            $('.dropdown-share-action').hide();
            $('#dropdownShareAction' + index).toggle();
        }
    }

    updateShares() {
        const sharePayload = {
            shareDistributions: this.tableData,
            viewBy: this.selectedViewBy['id']
        };
        this.clientProfileService.updateShares(this.clientId, this.entityId, sharePayload).toPromise().then(result => {
            swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['ENTITY.OWNERSHIP_UPDATE_MESSAGE'], 'success');
            this.portfolioService.getClientPortfolioPayload(this.clientId);
            this.saveDisabled = false;
            this.back();
        }).catch(errorResponse => {
            swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
            this.saveDisabled = false;
        });
    }

    openAddOwnerSidePanel() {
        this.isAddOwnerSidePanelOpen = true;
    }

    closePanel(event) {
        this.isAddOwnerSidePanelOpen = false;
        this.pageTitleService.setPageTitle('pageTitle|TAB.PERSONAL_INFO_ENTITY_OWNERSHIP');
        if (event) {
            this.getGenerateTableData();
        }
    }

    memberSwitch(memberId) {
        this.router.navigate(['/client/' + this.clientId + '/profile/personal-info/' + memberId + '/entity-ownership']);
    }

    viewChange(item) {
        this.selectedViewBy = item;
        this.calculateTotal();
    }

    back() {
        this.router.navigate(['/client/' + this.clientId + '/profile/personal-info/']);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
