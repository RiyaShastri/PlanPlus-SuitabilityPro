import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-common-drop-down',
    templateUrl: './common-drop-down.component.html',
    styleUrls: ['./common-drop-down.component.css']
})
export class CommonDropDownComponent implements OnInit {
    @Input() itemList = [];
    @Input() defaultSelected;
    @Input() dropDownLabel?;
    @Output() OnSelect = new EventEmitter();
    constructor() {
        this.OnSelect.emit(this.defaultSelected);
    }

    ngOnInit() {
    }
    getSlected(item) {
        this.defaultSelected = item;
        this.OnSelect.emit(item);
    }
}
