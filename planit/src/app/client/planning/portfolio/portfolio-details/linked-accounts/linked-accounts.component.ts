import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as $ from 'jquery';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload, getFamilyMemberPayload } from '../../../../../shared/app.reducer';
import { AccessRightService } from '../../../../../shared/access-rights.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PERSON_RELATION } from '../../../../../shared/constants';

@Component({
    selector: 'app-linked-accounts',
    templateUrl: './linked-accounts.component.html',
    styleUrls: ['./linked-accounts.component.css']
})
export class LinkedAccountsComponent implements OnInit, OnChanges {
    @Input() public clientId;
    @Input() public portfolioId;
    @Input() public isEditableRoute;
    @Input() public accountResponse;
    public linkedAccounts;
    clientData = {};
    familyData = {};
    accessRights = {};
    private unsubscribe$ = new Subject<void>();
    PERSON_RELATION = PERSON_RELATION;
    constructor(
        private store: Store<AppState>,
        private accessRightService: AccessRightService
    ) { }

    ngOnInit() {
        this.accessRightService.getAccess(['BTN02', 'SAV01']).pipe(takeUntil(this.unsubscribe$)).subscribe(res => { if (res) { this.accessRights = res; } });
        this.setData();
    }

    ngOnChanges() {
        this.setData();
    }

    setData() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.linkedAccounts = this.accountResponse;
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(familydata => {
            if (this.linkedAccounts.length > 0 && familydata) {
                familydata.familyMembers.forEach(person => {
                    this.familyData[person.id] = person;
                });
            }
        });
    }

    changeAccountAction(index) {
        if ($('#dropdownAccountAction_' + index).is(':visible')) {
            $('.dropdown-account-action').hide();
        } else {
            $('.dropdown-account-action').hide();
            $('#dropdownAccountAction_' + index).toggle();
        }
    }

    changeOwnershipAction(index: number) {
        if ($('#dropdownOwnershipAction' + index).is(':visible')) {
            $('.dropdown-portfolio-owned-action').hide();
        } else {
            $('.dropdown-portfolio-owned-action').hide();
            $('#dropdownOwnershipAction' + index).toggle();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
