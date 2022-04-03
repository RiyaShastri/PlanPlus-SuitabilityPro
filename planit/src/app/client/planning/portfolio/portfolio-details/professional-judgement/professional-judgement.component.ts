import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-professional-judgement',
    templateUrl: './professional-judgement.component.html',
    styleUrls: ['./professional-judgement.component.css']
})
export class ProfessionalJudgementComponent implements OnInit {
    @Input() public clientId;
    @Input() public portfolioId;
    @Input() public isEditableRoute;
    @Input() public recommendedScore;
    @Input() public pjmLimitingFactors = '';

    constructor() { }

    ngOnInit() {
        // const keys = Object.keys(this.priorEquityExperience);
        // let pjmKeyLabel = '';
        // keys.forEach((element, index) => {
        //     if (index === 0) {
        //         pjmKeyLabel = this.labelObj[element];
        //     } else {
        //         pjmKeyLabel = pjmKeyLabel + ' and ' + this.labelObj[element];
        //     }
        // });
        // this.pjmKeyLabel = pjmKeyLabel;
    }

}
