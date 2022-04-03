import { Component } from '@angular/core';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'ngbd-modal-basic',
    templateUrl: './modal-basic.html'
})

// tslint:disable-next-line:component-class-suffix
export class NgbdModalBasic {
    closeResult: string;

    constructor(private modalService: NgbModal) { }

    open(content: any) {
        this.modalService.open(content, {backdrop: 'static', keyboard: false}).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }
}
