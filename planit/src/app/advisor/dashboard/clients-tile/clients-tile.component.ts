import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { TranslateService } from '@ngx-translate/core';
import { RefreshDataService } from '../../../shared/refresh-data';
import { PlanningService } from '../../../client/service';
import { AdvisorService } from '../../service/advisor.service';
import { environment } from '../../../../environments/environment';
import { AccessRightService } from '../../../shared/access-rights.service';

@Component({
    selector: 'app-clients-tile',
    templateUrl: './clients-tile.component.html',
    styleUrls: ['./clients-tile.component.css']
})
export class ClientsTileComponent implements OnInit, OnDestroy {
    changePage: Subject<number> = new Subject();
    @Input() isSidePanel = false;
    isCollapsed = true;
    selectedViewBy: any;
    itemList = [
        { id: 0, name: 'Most recent' },
        { id: 1, name: 'Family name' },
    ];
    clientList = [];
    searchText;
    TotalClients;
    clientTypes = [
        { value: 1, label: 'Client' },
        { value: 2, label: 'Prospect' },
        { value: 3, label: 'Inactive' },
        { value: 5, label: 'Test' },
    ];
    privacyStatus = [
        { value: 0, label: 'Not Private' },
        { value: 1, label: 'Private' },
    ];
    advisorRoles = [
        { value: 1, label: 'Primary Advisor' },
        { value: 2, label: 'Secondary Advisor' },
    ];
    workgroups = [
        { value: 'ALL', label: 'All' },
    ];
    clientId;
    clientLoaded = false;
    searchSpouse = false;
    accessToSearch = environment.advanceSearch;
    accessToWorkgroups;
    accessRights = {};
    selectedFilter = {
        searchString: '',
        clientType: this.clientTypes[0]['value'],
        privacyStatus: this.privacyStatus[0]['value'],
        advisorRole: this.advisorRoles[0]['value'],
        workgroup: this.workgroups[0]['value'],
        pageNum: 1,
        pageSize: 10
    };
    relationShipId;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private advisorService: AdvisorService,
        private _location: Location,
        private accessRightService: AccessRightService,
        private router: Router,
        private translate: TranslateService,
        private refreshDataService: RefreshDataService,
        private planningService: PlanningService,
        private route: ActivatedRoute
    ) {
        this.isSidePanel = false;
        if (this.router.url.indexOf('advanced') > 0) {
            this.isCollapsed = false;
        }
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(paramsObj => {
            this.clientId = paramsObj.personalId;
            if (paramsObj.personalId) {
                this.searchSpouse = true;
            }
        });

        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('search-spouse-client1-marital-status-')) {
                this.relationShipId = message.replace('search-spouse-client1-marital-status-', '');
            }
        });
        if (this.clientId && !this.relationShipId) {
            this.router.navigate(['/client', this.clientId, 'profile', 'personal-info']);
        }
    }

    ngOnInit() {
        this.advisorService.getWorkgroupsOfPlanner().toPromise().then(res => {
            res.forEach(element => {
                this.workgroups.push({ value: element.workgroupid, label: element.description });
            });
        });
        this.accessRightService.getAccess(['CLI18', 'FIL02', 'WRKGR', 'FIL03']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
            if (res) {
                this.accessRights = res;
                this.accessToWorkgroups = this.accessRights['WRKGR']['accessLevel'] > 0;
            }
        });

        this.selectedViewBy = this.itemList[0];
        const viewById = window.sessionStorage.getItem('viewBySelected');
        if (viewById) {
            // tslint:disable-next-line:radix
            this.selectedViewBy = this.itemList.filter(s => s.id === parseInt(viewById))[0];
        }
        this.selectedFilter['viewBy'] = this.selectedViewBy.id;
        this.getAdvisorClient(this.selectedFilter);

        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message === 'getClientList') {
                this.selectedFilter['viewBy'] = this.selectedViewBy.id;
                this.getAdvisorClient(this.selectedFilter);
                this.refreshDataService.changeMessage('default message');
            }
        });

        this.advisorService.clientAdded.pipe(takeUntil(this.unsubscribe$)).subscribe(x => this.getAdvisorClient());
    }

    getAdvisorClient(searchParameters?) {
        if (!searchParameters) {
            searchParameters = {
                'pageNum': 1,
                'pageSize': 10,
                'viewBy': 0
            };
        }
        this.clientLoaded = false;
        this.advisorService.getClientList(searchParameters, this.searchSpouse, this.clientId)
            .debounceTime(1000)
            .distinctUntilChanged()
            .toPromise()
            .then(result => {
                this.TotalClients = result.totalRecords;
                this.clientList = result.results;
                this.getClientWithAddress();
            });

    }

    getClientWithAddress() {
        this.clientList.forEach(client => {
            if (client.client2FirstName && client.client2LastName && client.client2FirstName !== '' && client.client2LastName !== '') {
                if (client.client1LastName === client.client2LastName) {
                    client['clientFileName'] = client.client1FirstName + ' & ' + client.client2FirstName + ' ' + client.client2LastName;
                } else {
                    client['clientFileName'] = client.client1FirstName + ' ' + client.client1LastName + ' , ' + client.client2FirstName + ' ' + client.client2LastName;
                }
            } else {
                client['clientFileName'] = client.client1FirstName + ' ' + client.client1LastName;
            }
            client.displayAddress = client.addressList.filter(add => add.addressType === '01');
        });
        this.clientLoaded = true;
    }

    getFilterClient(item) {
        this.selectedViewBy = item;
        this.changePage.next(1);
        window.sessionStorage.setItem('viewBySelected', this.selectedViewBy.id);
        this.selectedFilter['viewBy'] = this.selectedViewBy.id;
        this.selectedFilter['pageNum'] = 1;
        this.getAdvisorClient(this.selectedFilter);
    }
    getPageFilterClient(event) {
        this.selectedFilter['pageNum'] = event.currentPage;
        this.getAdvisorClient(this.selectedFilter);
    }

    getAdvanceFilteredClients() {
        this.selectedFilter['pageNum'] = 1;
        this.getAdvisorClient(this.selectedFilter);
    }
    searchByString() {
        this.selectedFilter['pageNum'] = 1;
        this.changePage.next(1);
        this.selectedFilter['searchString'] = this.selectedFilter.searchString;
        this.getAdvisorClient(this.selectedFilter);
    }
    advancedSearchNav() {
        // route to side panel
        if (!this.isSidePanel) {
            this.isCollapsed = true;
            this.router.navigate(['/advisor/dashboard/client-search/advanced']);
        }
    }
    addClient() {
        this.router.navigate(['/advisor/dashboard/add-client']);
    }
    async clientOverview(clientId) {
        await this.planningService.loadStoreData(clientId);
        this.router.navigate(['/client/' + clientId + '/overview']);
    }

    deleteClient(client) {
        this.translate.get([
            'ADVISOR.DASHBOARD.CLIENTS_TILE.POPUP.TITLE',
            'ADVISOR.DASHBOARD.CLIENTS_TILE.POPUP.DECSCRIPTION',
            'ADVISOR.DASHBOARD.CLIENTS_TILE.POPUP.NOT_UNDO',
            'ADVISOR.DASHBOARD.CLIENTS_TILE.POPUP.SUCCESS',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.SUCCESS_TITLE',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            Swal({
                title: i18text['ADVISOR.DASHBOARD.CLIENTS_TILE.POPUP.TITLE'],
                html: i18text['ADVISOR.DASHBOARD.CLIENTS_TILE.POPUP.DECSCRIPTION'] +
                    '<br/> <span class="fw-600">' + client['clientFileName'] + '</span> ? <br/> <small>' + i18text['ADVISOR.DASHBOARD.CLIENTS_TILE.POPUP.NOT_UNDO'] + '</small>',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    this.advisorService.deleteClient(client.id).toPromise().then(res => {
                        Swal(i18text['ALERT_MESSAGE.SUCCESS_TITLE'], i18text['ADVISOR.DASHBOARD.CLIENTS_TILE.POPUP.SUCCESS'], 'success');
                        this.getAdvisorClient();
                    }).catch(errorResponse => {
                        Swal(i18text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                    });
                }
            });
        });
    }

    addSpouse(spouseId) {
        const reqObj = {
            'clientId': this.clientId,
            'clientMaritalStatus': parseInt(this.relationShipId, 10),
            'spouseId': spouseId
        };
        this.advisorService.addSpouse(reqObj).toPromise().then((res: any) => {
            this.planningService.loadStoreData(this.clientId, true);
            this.router.navigate(['/client', this.clientId, 'profile', 'personal-info']);
        });
    }

    back() {
        this._location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
