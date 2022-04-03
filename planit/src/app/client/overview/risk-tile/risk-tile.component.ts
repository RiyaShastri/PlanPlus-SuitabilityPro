import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-risk-tile',
    templateUrl: './risk-tile.component.html',
    styleUrls: ['./risk-tile.component.css']
})
export class RiskTileComponent implements OnInit {

    @Input() public clientId;

    constructor() { }

    ngOnInit() {
    }

}
