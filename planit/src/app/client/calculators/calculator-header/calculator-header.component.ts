import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AccessRightService } from '../../../shared/access-rights.service';

@Component({
    selector: 'app-calculator-header',
    templateUrl: './calculator-header.component.html',
    styleUrls: ['./calculator-header.component.css']
})
export class CalculatorHeaderComponent implements OnInit, OnDestroy {
    @Input() clientId;
    @Input() currentCalculator;
    accessRights;
    unsubscribe$;

    constructor(
        private accessRightsService: AccessRightService
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.accessRightsService.getAccess(['CAL07_SP', 'DCONS_SP', 'LEVRG_SP', 'CAL01_SP', 'CAL02_SP', 'CAL08_SP', 'CAL09_SP']).subscribe(res => {
        this.accessRights = res;
        });
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
