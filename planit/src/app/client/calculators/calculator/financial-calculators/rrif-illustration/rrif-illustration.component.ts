
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrencySymbol } from '@angular/common';
import swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/debounceTime';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { CalculatorService } from '../../../../service';
import { getProvincePayload, AppState, getClientPayload } from '../../../../../shared/app.reducer';


@Component({
    selector: 'app-rrif-illustration',
    templateUrl: './rrif-illustration.component.html',
    styleUrls: ['./rrif-illustration.component.css']
})
export class RrifIllustrationComponent implements OnInit, OnDestroy {
    currency = '$';
    currencyMask = createNumberMask({
        prefix: this.currency
    });
    percentMask = createNumberMask({
        prefix: '',
        suffix: '%',
        allowDecimal: true
    });

    clientId;
    private unsubscribe$ = new Subject<void>();
    isError = false;
    planType =[];
    selectedPlanType:any;
    clientData: any = {};
    registeredData = {};

    constructor(
        private route: ActivatedRoute,
        private calculatorService: CalculatorService,
        private location: Location,
        private store: Store<AppState>
    ) {
        this.route.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
            this.clientId = param['clientId'];
        });
    }
    
    async ngOnInit() {
        this.store.select(getClientPayload).pipe(takeUntil(this.unsubscribe$)).subscribe(clientData => {
            this.clientData = clientData;
            this.currency = getCurrencySymbol(this.clientData['currencyCode'], 'narrow');
            this.currencyMask = createNumberMask({
                prefix: this.currency
            });
        });

        await this.calculatorService.getPlanTypeDroplist().toPromise().then(result => {
            this.planType = result;
            console.log("drop down ..........",this.planType);
        }).catch(errorResponse => { });

        await this.calculatorService.getDefaultRegistered(this.clientId).toPromise().then(result => {
            this.registeredData = result;
            this.isError = (this.registeredData.hasOwnProperty('errors') && Object.keys(this.registeredData['errors']).length > 0) ? true : false;
            console.log("default data..........",this.registeredData);
        }).catch(errorResponse => { });
    }

    saveData(f: NgForm) {
    }

    generateReport() {
    }

    back() {
        this.location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    changeScenario(){

    }

}
