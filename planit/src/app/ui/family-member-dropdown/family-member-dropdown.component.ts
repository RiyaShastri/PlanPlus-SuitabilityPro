import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ClientProfileService } from '../../client/service';
import { AppState, getFamilyMemberRiskPayload, getFamilyMemberPayload, getEntities } from '../../shared/app.reducer';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { FAMILY_MEMBER_DROPDOWN_TYPE } from '../../shared/constants';
@Component({
    selector: 'app-family-member-dropdown',
    templateUrl: './family-member-dropdown.component.html',
    styleUrls: ['./family-member-dropdown.component.css'],
    providers: [NgbDropdownConfig]
})
export class FamilyMemberDropdownComponent implements OnChanges, OnDestroy {
    @Input() public clientId: string;
    @Input() public personalId: string;
    @Input() public typeId: string;
    public familyMembersRisk;
    public personDetails = {};
    public familyMembers = [];
    @Output() public memberSwitch = new EventEmitter();
    private unsubscribe$ = new Subject<void>();
    TYPE = FAMILY_MEMBER_DROPDOWN_TYPE;
    constructor(
        private route: ActivatedRoute,
        private profileService: ClientProfileService,
        private store: Store<AppState>,
        config: NgbDropdownConfig
    ) {
        config.autoClose = true;
    }

    ngOnChanges(changes) {
        if (changes && changes.hasOwnProperty('personalId')) {
            this.personalId = changes.personalId['currentValue'];
            this.setData();
        }
    }

    setData() {
        if (this.typeId === this.TYPE.RISK) {
            this.store.select(getFamilyMemberRiskPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data) {
                    this.familyMembersRisk = data;
                    this.filterMembers();
                }
            });
        } else if (this.typeId === this.TYPE.FAMILY) {
            this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                    this.familyMembers = Object.assign([], data['familyMembers']);
                    this.personDetails = Object.assign({}, this.familyMembers[data['idMapping'][this.personalId]]);
                }
            });
        } else if (this.typeId === this.TYPE.ENTITY) {
            this.store.select(getEntities).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                if (data && data.length > 0) {
                    this.familyMembers = Object.assign([], data);
                    this.personDetails = this.familyMembers.find(x => x.entityId === this.personalId);
                }
            });
        }
    }

    filterMembers() {
        this.familyMembers = [];
        for (const member of this.familyMembersRisk) {
            if (member.calculatedScore) {
                if (member['personalDetails']['id'] === this.personalId) {
                    this.personDetails = member['personalDetails'];
                }
                this.familyMembers.push(member['personalDetails']);
            }
        }
    }

    memberClick(member) {
        // this.personDetails = member;
        if (this.typeId === this.TYPE.ENTITY) {
            this.memberSwitch.emit(member.entityId);
        } else {
            this.memberSwitch.emit(member.id);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
