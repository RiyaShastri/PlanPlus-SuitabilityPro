import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { AppState, getClientPayload } from '../../../../shared/app.reducer';
import { ClientProfileService, PlanningService } from '../../../service';
import { RefreshDataService } from '../../../../shared/refresh-data';

@Component({
    selector: 'app-entities-table',
    templateUrl: './entities-table.component.html',
    styleUrls: ['./entities-table.component.css']
})
export class EntitiesTableComponent implements OnInit, OnChanges {

    @Input() clientId;
    @Input() entitiesList = [];
    @Input() isAllEntities = true;

    clientData;
    private unsubscribe$ = new Subject<void>();
    i18text = {};
    totalAllAssets = 0;
    constructor(
        private store: Store<AppState>,
        private translate: TranslateService,
        private profileService: ClientProfileService,
        private dataSharing: RefreshDataService,
        private planningService: PlanningService
    ) { }

    ngOnInit() {
        this.translate.stream([
            'ENTITY.POPUP.ENTITY_DELETED_SUCCESFULLY',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.OOPS_TEXT',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT',
            'ALERT_MESSAGE.CANCEL_BUTTON_TEXT',
            'DELETE.POPUP.ENTITY_TITLE',
            'DELETE.POPUP.DELETE_TITLE',
            'DELETE.POPUP.NOT_UNDO'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            this.i18text = i18text;
        });
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.calculateTotal();
    }

    calculateTotal() {
        this.totalAllAssets = this.entitiesList.reduce((sum, item) => sum + item.totalAssets, 0);
    }

    ngOnChanges(changes) {
        if (changes.hasOwnProperty('entitiesList')) {
            this.calculateTotal();
        }
    }

    changePersonalInfoAction(index: number) {
        if ($('#dropdownPersonalInfoAction' + index).is(':visible')) {
            $('.dropdown-entities-action').hide();
        } else {
            $('.dropdown-entities-action').hide();
            $('#dropdownPersonalInfoAction' + index).toggle();
        }
    }

    deleteEntity(entityId, entityName) {
        Swal({
            title: this.i18text['DELETE.POPUP.ENTITY_TITLE'],
            html: this.i18text['DELETE.POPUP.DELETE_TITLE'] +
                '&nbsp; <span class="fw-600">' + entityName + '</span> ? <br/> <small>' + this.i18text['DELETE.POPUP.NOT_UNDO'] + '</small>',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.i18text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
            cancelButtonText: this.i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
        }).then(result => {
            if (result.value) {
                this.profileService.deleteEntity(this.clientId, entityId).toPromise().then(response => {
                    this.profileService.getEntities(this.clientId);
                    this.profileService.getCorporation(this.clientId);
                    this.planningService.getClientPlanningSummary(this.clientId);
                    this.dataSharing.changeMessage('entityDeleted');
                    Swal(this.i18text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], this.i18text['ENTITY.POPUP.ENTITY_DELETED_SUCCESFULLY'], 'success');
                }).catch(errorResponse => {
                    Swal(this.i18text['ALERT_MESSAGE.OOPS_TEXT'], errorResponse.error.errorMessage, 'error');
                });
            }
        });

    }

}
