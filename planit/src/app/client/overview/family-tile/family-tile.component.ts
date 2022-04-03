import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { MARITAL_STATUS, PERSON_RELATION } from '../../../shared/constants';
import { takeUntil } from 'rxjs/operators';
import {
    AppState,
    getFamilyMemberPayload,
    getClientAddressPayload
} from '../../../shared/app.reducer';

@Component({
    selector: 'app-family-tile',
    templateUrl: './family-tile.component.html',
    styleUrls: ['./family-tile.component.css']
})
export class FamilyTileComponent implements OnInit, OnDestroy {

    @ViewChild('entities') public entities: NgbTooltip;
    @ViewChild('fmembers') public fmembers: NgbTooltip;

    @Input() public clientId;
    public familyMembers = [];
    public clientAddresses: any = [];
    public displayWarning = false;
    private unsubscribe$ = new Subject<void>();
    MARITAL_STATUS = MARITAL_STATUS;
    PERSON_RELATION = PERSON_RELATION;
    
    constructor(
        private store: Store<AppState>
    ) { }

    ngOnInit() {
        this.store
            .select(getFamilyMemberPayload)
            .pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                    this.familyMembers = data['familyMembers'];
                    if (this.familyMembers && this.familyMembers.length > 0) {
                        if (this.familyMembers.length === 1) {
                            if (this.familyMembers[0].maritalStatus === MARITAL_STATUS.MARRIED || this.familyMembers[0].maritalStatus === MARITAL_STATUS.COMMON_LAW || this.familyMembers[0].maritalStatus === MARITAL_STATUS.MARRIED_SINGLE) {
                                this.displayWarning = true;
                            } else {
                                this.displayWarning = false;
                            }
                        } else if (this.familyMembers.length > 1) {
                            for (const member of this.familyMembers) {
                                if (this.familyMembers[0].maritalStatus === MARITAL_STATUS.MARRIED || this.familyMembers[0].maritalStatus === MARITAL_STATUS.COMMON_LAW || this.familyMembers[0].maritalStatus === MARITAL_STATUS.MARRIED_SINGLE) {
                                    if (member.relation === PERSON_RELATION.CLIENT2) {
                                        this.displayWarning = false;
                                        break;
                                    } else {
                                        this.displayWarning = true;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        this.store
            .select(getClientAddressPayload)
            .pipe(takeUntil(this.unsubscribe$)).subscribe(addresses => {
                if (addresses) {
                    this.clientAddresses = addresses.filter(add => add.addressType === '01');
                }
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
