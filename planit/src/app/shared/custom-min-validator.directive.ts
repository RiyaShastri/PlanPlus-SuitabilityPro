import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[customMin][formControlName],[customMin][formControl],[customMin][ngModel]',
    providers: [{ provide: NG_VALIDATORS, useExisting: CustomMinValidatorDirective, multi: true }]
})
export class CustomMinValidatorDirective {

    @Input()
    customMin: number;

    validate(c: FormControl): { [key: string]: any } {
        // tslint:disable-next-line:prefer-const
        let v = c.value;
        return (v < this.customMin) ? { 'customMin': true } : null;
    }

}
