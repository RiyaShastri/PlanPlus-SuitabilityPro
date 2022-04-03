import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-estate-header',
    templateUrl: './estate-header.component.html',
    styleUrls: ['./estate-header.component.css']
})
export class EstateHeaderComponent implements OnInit {
    @Input() public clientId;
    @Input() public currentPage;
    constructor() { }

    ngOnInit() {
    }

}
