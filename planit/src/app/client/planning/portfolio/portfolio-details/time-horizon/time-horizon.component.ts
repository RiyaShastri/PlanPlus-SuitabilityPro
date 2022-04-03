import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-time-horizon',
    templateUrl: './time-horizon.component.html',
    styleUrls: ['./time-horizon.component.css']
})
export class TimeHorizonComponent implements OnInit, OnChanges {
    @Input() public clientId;
    @Input() public portfolioId;
    @Input() public isEditableRoute;
    @Input() public timeHorizons;
    @Input() public selectedTimeHorizon;
    @Input() goalAllocations = [];
    @Input() timeHorizoneDetail = '';
    @Output() public timeHorizonChanged = new EventEmitter();
    timeHorizonsArr = [];

    constructor() { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges): void {
        // if (changes.selectedTimeHorizon) {
        //     this.selectedTimeHorizon = changes.selectedTimeHorizon.currentValue;
        // }
    }

    changeTimeHorizon(timeHorizon) {
        this.timeHorizonChanged.emit(timeHorizon);

    }
}
