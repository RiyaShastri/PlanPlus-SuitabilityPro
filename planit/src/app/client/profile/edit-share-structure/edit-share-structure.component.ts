import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../../shared/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { Location, getCurrencySymbol } from '@angular/common';
import { ENTITY_TYPES, CORPORATION_OPTIONS, SHARE_TYPES } from '../../../shared/constants';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState, getClientPayload } from '../../../shared/app.reducer';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { EntitiesService } from '../../service';
import swal from 'sweetalert2';
import { PageTitleService } from '../../../shared/page-title';

@Component({
    selector: 'app-edit-share-structure',
    templateUrl: './edit-share-structure.component.html',
    styleUrls: ['./edit-share-structure.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class EditShareStructureComponent implements OnInit, OnDestroy {
    clientId;
    entityId;
    shareId;
    shareTypes = [];
    selectedShareType = {};
    clientData = {};
    relatedCorporateList = [];
    unsubscribe$ = new Subject<void>();
    TYPES = ENTITY_TYPES;
    i18Text = {};
    cancelDisable = false;
    saveDisabled = false;
    CORPORATION_OPTIONS = CORPORATION_OPTIONS;
    SHARE_TYPES = SHARE_TYPES;
    currencyMask = createNumberMask({
        prefix: '$',
        allowDecimal: true,
    });
    numberMask = createNumberMask({
        prefix: '',
        suffix: '',
        allowDecimal: true,
        decimalLimit: 1
    });
    entityShare = {};
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private translate: TranslateService,
        private store: Store<AppState>,
        private entitiesService: EntitiesService,
        private pageTitleService: PageTitleService
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.entityId = params['entityId'];
        });
        this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.shareId = params['shareId'];
        });
    }

    ngOnInit() {
        this.entityShare = {
            'description': '',
            'issuedShares': 100,
            'puc': 100,
            'votingShares': CORPORATION_OPTIONS.YES,
        };
        this.translate.stream([
            'ENTITY.FIXED_VALUE',
            'ENTITY.GROWTH',
            'ENTITY.SHARE_UPDATE_SUCESS',
            'ALERT.TITLE.SUCCESS',
            'ALERT_MESSAGE.OOPS_TEXT',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18Text => {
            this.i18Text = i18Text;
            this.shareTypes = [
                { id: SHARE_TYPES.FIXED_VALUE, name: this.i18Text['ENTITY.FIXED_VALUE'] },
                { id: SHARE_TYPES.GROWTH, name: this.i18Text['ENTITY.GROWTH'] }
            ];
            this.selectedShareType = this.shareTypes[1];
            if (this.entityShare['shareType']) {
                this.selectedShareType = this.shareTypes.find(x => x.id === this.entityShare['shareType']);
            }
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currencyMask = createNumberMask({
                prefix: getCurrencySymbol(this.clientData['currencyCode'], 'narrow'),
                allowDecimal: true,
            });
        });
        this.pageTitleService.setPageTitle('pageTitle|TAB.PERSONAL_INFO_ADD_SHARE_CLASS');
        if (this.shareId) {
            this.pageTitleService.setPageTitle('pageTitle|TAB.PERSONAL_INFO_EDIT_SHARE_CLASS');
            this.entitiesService.getShareByShareId(this.clientId, this.entityId, this.shareId).toPromise().then(share => {
                this.entityShare = share;
                this.selectedShareType = this.shareTypes.find(x => x.id === this.entityShare['shareType']);
                this.entityShare['votingShares'] = this.entityShare['shareType'] ? CORPORATION_OPTIONS.YES : CORPORATION_OPTIONS.NO;
            }).catch(err => { });
        }
    }

    updateShare() {
        const obj = {
            ...this.entityShare,
            votingShares: this.entityShare['votingShares'] === CORPORATION_OPTIONS.YES ? true : false,
            shareType: this.selectedShareType['id']
        };
        this.entitiesService.updateShare(this.clientId, this.entityId, obj).toPromise().then(result => {
            this.entitiesService.redirectToOwnershipTab(true);
            this.back();
            swal(this.i18Text['ALERT.TITLE.SUCCESS'], this.i18Text['ENTITY.SHARE_UPDATE_SUCESS'], 'success');
        }).catch(errorResponse => {
            swal(this.i18Text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse['error']['errorMessage'], 'error');
        });
    }

    changeShareType() {
        this.entityShare['votingShares'] = this.selectedShareType['id'] ? CORPORATION_OPTIONS.YES : CORPORATION_OPTIONS.NO;
    }

    back() {
        this.location.back();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
