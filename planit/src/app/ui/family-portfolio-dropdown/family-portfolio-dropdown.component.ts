import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PortfolioService } from '../../client/service';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-family-portfolio-dropdown',
    templateUrl: './family-portfolio-dropdown.component.html',
    styleUrls: ['./family-portfolio-dropdown.component.css']
})
export class FamilyPortfolioDropdownComponent implements OnInit {
    @Input() public clientId: string;
    @Input() public portfolioId: string;
    @Output() public portfoliosSwitch = new EventEmitter();
    constructor(
        private portfolioService: PortfolioService,
        config: NgbDropdownConfig
    ) {
        config.autoClose = true;
    }
    public listOfPortfolio = [];
    public portfolioList = [];
    ngOnInit() {
        this.portfolioService.getListOfPortfolios(this.clientId).toPromise().then(results => {
            this.listOfPortfolio = results;
            for (const portfolio of this.listOfPortfolio['portfolios']) {
                this.portfolioList.push({ 'id': portfolio.id, 'description': portfolio.description });
            }
        }).catch(err => { });
    }
    portfolioClick(portfolioId) {
        this.portfoliosSwitch.emit(portfolioId);
    }
}
