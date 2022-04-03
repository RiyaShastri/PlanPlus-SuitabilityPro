import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { EstateService } from '../../../service';
import { getFamilyMemberPayload, AppState, getClientPayload } from '../../../../shared/app.reducer';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { PERSON_RELATION } from '../../../../shared/constants';

@Component({
    selector: 'app-estate-analysis',
    templateUrl: './estate-analysis.component.html',
    styleUrls: ['./estate-analysis.component.css']
})
export class EstateAnalysisComponent implements OnInit, OnDestroy {

    clientId = '';
    clientData;
    familyMembers = [];
    client1: any;
    client2: any;
    analysisData: any;
    currencyMask = createNumberMask({
        prefix: '$'
    });
    saveButtonDisabled = false;
    PERSON_RELATION = PERSON_RELATION;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private store: Store<AppState>,
        private estateService: EstateService,
        private translate: TranslateService
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
        });
        this.store.select(getFamilyMemberPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
            if (data.hasOwnProperty('familyMembers') && data['familyMembers'].length > 0) {
                this.familyMembers = data['familyMembers'];
                this.client1 = this.familyMembers.find(x => x.relation === PERSON_RELATION.CLIENT1);
                this.client2 = this.familyMembers.find(x => x.relation === PERSON_RELATION.CLIENT2);
            } else {
                this.familyMembers = [];
            }
        });
        this.getAnalysisDetails();
    }

    getAnalysisDetails() {
        this.analysisData = null;
        this.estateService.getAnalysisData(this.clientId).toPromise().then(res => {
            this.analysisData = res;
        }).catch(() => { });
    }

    async saveChanges() {
        this.saveButtonDisabled = true;
        await this.estateService.saveAnalysisData(this.clientId, this.analysisData).toPromise().then(res => {
            this.getAnalysisDetails();
            this.translate.get([
                'ALERT_MESSAGE.SUCCESS_TITLE',
                'ESTATE_PLANING.POPUP.ANALYSIS_UPDATED_SUCCESSFULLY'
            ]).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.SUCCESS_TITLE'], text['ESTATE_PLANING.POPUP.DISTRIBUTION_SUCCESSFULLY_ADDED'], 'success');
            });
        }).catch((err) => {
            this.translate.get(['ALERT_MESSAGE.OOPS_TEXT']).pipe(takeUntil(this.unsubscribe$)).subscribe(text => {
                Swal(text['ALERT_MESSAGE.OOPS_TEXT'], err.error.errorMessage, 'error');
            });
        });
        this.saveButtonDisabled = false;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
