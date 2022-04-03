import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-product-code-dropdown',
    templateUrl: './product-code-dropdown.component.html',
    styleUrls: ['./product-code-dropdown.component.css']
})
export class ProductCodeDropdownComponent implements OnInit {
    @Input() productCodeList = [];
    selectedProduct;
    @Output() OnSelect = new EventEmitter();
    constructor() { }

    ngOnInit() {
        this.selectedProduct = {
            prodsub: '',
            prodnum: '',
            prod_code: 'Select',
            descr: null
        };
    }
    getSlected(product) {
        this.selectedProduct = product;
        this.OnSelect.emit(product);
    }
}
