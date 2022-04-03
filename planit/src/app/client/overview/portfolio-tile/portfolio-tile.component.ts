import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-portfolio-tile',
    templateUrl: './portfolio-tile.component.html',
    styleUrls: ['./portfolio-tile.component.css']
})
export class PortfolioTileComponent implements OnInit {
    @Input() public clientId;
    public isTile = true;
    constructor() { }

    ngOnInit() { }

}
