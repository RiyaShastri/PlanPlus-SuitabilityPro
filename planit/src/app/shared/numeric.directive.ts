import { Directive, HostListener, ElementRef, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[appNumeric][ngModel]',
    providers: [NgModel]
})
export class NumericDirective implements OnInit, OnDestroy {

    unsubscribe$: any;
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

    @HostListener('input') inputChange() {

        const position = this.elementRef.nativeElement.selectionStart;
        this.ngModelChange.emit(this.extractNumbers(this.elementRef.nativeElement.value));
        setTimeout(() => {
            this.elementRef.nativeElement.setSelectionRange(position, position, 'none');
        });
    }

    constructor(
        private elementRef: ElementRef,
        private ngModel: NgModel,
    ) { }

    ngOnInit(): void {
        this.unsubscribe$ = this.ngModel.valueChanges.subscribe(() => {
            const newValue = this.extractNumbers(this.elementRef.nativeElement.value);
        });
    }

    extractNumbers(value: any) {
        if (!value) { return 0; }
        let number = value;
        if (isNaN(value)) {
            number = value.toString().replace(/[^\d.-]/g, '');
        }

        return Number(number);
    }


    ngOnDestroy() {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }
}

