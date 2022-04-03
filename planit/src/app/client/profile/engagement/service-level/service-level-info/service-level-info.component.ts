import { Component, OnInit, Input } from '@angular/core';
import { RefreshDataService } from '../../../../../shared/refresh-data';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-service-level-info',
    templateUrl: './service-level-info.component.html',
    styleUrls: ['./service-level-info.component.css']
})
export class ServiceLevelInfoComponent implements OnInit {
    @Input() isEditable = false;
    title = '';
    serviceList = [
        { id: 1, name: 'Goal based investing' }
    ];
    manageByList = [
        { id: 1, name: 'By portfolio' },
        { id: 2, name: 'By Individual' },
        { id: 3, name: 'Strategic' }
    ];
    private unsubscribe$ = new Subject<void>();
    constructor(
        private refreshData: RefreshDataService,
        private modalService: NgbModal,
        private translate: TranslateService
    ) {
        this.refreshData.editServiceLevel.pipe(takeUntil(this.unsubscribe$)).subscribe(edit => {
            this.isEditable = edit;
        });
    }

    ngOnInit() {
    }

    openModelPopup(content, type) {
        this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
        if (type === 1) {
            this.title = 'ADD A SERVICE';
        } else if (type === 2) {
            this.title = 'EDIT SERVICE';
        }
    }


    deleteService() {
        this.translate.get([
            'ENGAGEMENT.SERVICE_LEVEL_INFO.DELETE_POPUP.TITLE',
            'ENGAGEMENT.SERVICE_LEVEL_INFO.DELETE_POPUP.TEXT',
            'ENGAGEMENT.SERVICE_LEVEL_INFO.DELETE_POPUP.SUCCESS',
            'ALERT_MESSAGE.SUCCESS_DELETED_TITLE',
            'ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18text => {
            swal({
                title: i18text['ENGAGEMENT.SERVICE_LEVEL_INFO.DELETE_POPUP.TITLE'],
                text: i18text['ENGAGEMENT.SERVICE_LEVEL_INFO.DELETE_POPUP.TEXT'],
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18text['ALERT_MESSAGE.CONFIRM_BUTTON_TEXT'],
                cancelButtonText: i18text['ALERT_MESSAGE.CANCEL_BUTTON_TEXT']
            }).then(result => {
                if (result.value) {
                    swal(i18text['ALERT_MESSAGE.SUCCESS_DELETED_TITLE'], i18text['ENGAGEMENT.SERVICE_LEVEL_INFO.DELETE_POPUP.SUCCESS'], 'success');
                }
            });
        });
    }

    toggleActionMenu(id, index) {
        if ($('#' + id + '_' + index).is(':visible')) {
            $('.dropdown-portfolio-action').hide();
        } else {
            $('.dropdown-portfolio-action').hide();
            $('#' + id + '_' + index).toggle();
        }
    }
}
