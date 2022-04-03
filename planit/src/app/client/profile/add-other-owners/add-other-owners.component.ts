import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { slideInOutAnimation } from '../../../shared/animations';
import { ClientProfileService, EntitiesService } from '../../service';
import { ENTITY_OWNERSHIP_SHARE_TYPE, BENEFICIARY_RELATION } from '../../../shared/constants';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Relation } from '../../client-models';
import { PageTitleService } from '../../../shared/page-title';

@Component({
    selector: 'app-add-other-owners',
    templateUrl: './add-other-owners.component.html',
    styleUrls: ['./add-other-owners.component.css'],
    animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class AddOtherOwnersComponent implements OnInit {
    @Input() clientId;
    @Input() entityId;
    @Input() ownersList = [];
    @Output() closePanelEvent = new EventEmitter();
    saveButtonDisabled = false;
    owners = [];
    otherOwner = '';
    isOtherChecked = false;
    SHARE_TYPE = ENTITY_OWNERSHIP_SHARE_TYPE;
    CLIENT1 = BENEFICIARY_RELATION.CLIENT;
    i18Text = {};
    relation = Relation;
    unsubscribe$ = new Subject<void>();
    allOwners = [];
    constructor(
        private clientProfileService: ClientProfileService,
        private entitiesService: EntitiesService,
        private translate: TranslateService,
        private pageTitleService: PageTitleService
    ) { }

    ngOnInit() {
        this.pageTitleService.setPageTitle('pageTitle|TAB.PERSONAL_INFO_ADD_OTHER_OWNER');
        this.translate.stream([
            'ALERT.TITLE.SUCCESS',
            'ENTITY.OWNERS_UPDATE_MESSAGE',
            'ENTITY.WARNING_FOR_GENERATE_TABLE',
            'ALERT_MESSAGE.ALERT_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
        });
        this.clientProfileService.getOwnersList(this.clientId, this.entityId).toPromise().then(owners => {
            this.allOwners = owners;
            this.allOwners.push({
                id: this.SHARE_TYPE.OTHER,
                firstName: this.SHARE_TYPE.OTHER,
                lastName: '',
                role: 3
            });
            this.allOwners.forEach(owner => {
                const isExist = this.ownersList.findIndex(x => x['id'] === owner['id']);
                owner['disabled'] = false;
                if (isExist > -1) {
                    owner['disabled'] = true;
                    if (owner['id'] === this.ownersList[isExist]['id']) {
                        this.owners.push(owner['id']);
                    }
                }
            });
        });
    }

    addOther(otherOwner) {
        const temp = Object.assign([], this.allOwners);
        this.allOwners = [];
        temp.splice(-1, 0, {
            id: this.SHARE_TYPE.OTHER + (temp.length + 1),
            firstName: otherOwner,
            lastName: '',
            role: 3
        });
        this.allOwners = temp;
        this.otherOwner = '';
        const ownerTemp = Object.assign([], this.owners);
        const otherIndex = ownerTemp.findIndex(x => x['id'] === this.SHARE_TYPE.OTHER);
        ownerTemp.splice(otherIndex, 1);
        this.owners = ownerTemp;
        this.checkOther();
    }

    checkOther() {
        this.isOtherChecked = this.owners.findIndex(x => x === this.SHARE_TYPE.OTHER) > -1 ? true : false;
    }

    closePanel() {
        this.closePanelEvent.emit(false);
    }

    submitForm() {
        const obj = {
            selectedOwners: []
        };
        if (this.owners && this.owners.length > 0) {
            this.owners.forEach(ownerId => {
                if (ownerId !== this.SHARE_TYPE.OTHER) {
                    const index = this.allOwners.findIndex(x => x['id'] === ownerId);
                    const ownerDetail = this.allOwners[index];
                    obj['selectedOwners'].push({
                        id: ownerId.includes(this.SHARE_TYPE.OTHER) ? null : ownerId,
                        firstName: ownerDetail['firstName'],
                        lastName: ownerDetail['lastName'],
                        role: ownerId.includes(this.SHARE_TYPE.OTHER) ? 3 : ownerDetail['role']
                    });
                }
            });
            this.entitiesService.addOtherOwner(this.clientId, this.entityId, obj).toPromise().then(result => {
                this.closePanelEvent.emit(true);
                swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['ENTITY.OWNERS_UPDATE_MESSAGE'], 'success');
            }).catch(errorResponse => {
                swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
            });
        } else {
            swal(this.i18Text['ALERT_MESSAGE.ALERT_TITLE'], this.i18Text['ENTITY.WARNING_FOR_GENERATE_TABLE'], 'error');
        }
    }

}
