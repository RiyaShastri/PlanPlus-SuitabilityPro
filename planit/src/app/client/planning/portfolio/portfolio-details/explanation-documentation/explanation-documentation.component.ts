import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-explanation-documentation',
    templateUrl: './explanation-documentation.component.html',
    styleUrls: ['./explanation-documentation.component.css']
})
export class ExplanationDocumentationComponent implements OnInit {
    @Input() public clientId;
    @Input() public portfolioId;
    @Input() public isEditableRoute;
    @Input() public constraints;
    constructor() { }

    ngOnInit() {
    }

}
