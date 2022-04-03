import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-rgb-color-table',
    templateUrl: './rgb-color-table.component.html',
    styleUrls: ['./rgb-color-table.component.css']
})
export class RgbColorTableComponent implements OnInit {
    @Input() colours = {};
    @Input() typeSelected: any;
    @Input() forDefault: any;
    @Input() displayTypeVertical: any;
    @Input() isEditable = false;
    keys = [];

    constructor() {
    }

    ngOnInit() {
        if (this.colours) {
            this.keys = Object.keys(this.colours);
        }
    }

}
