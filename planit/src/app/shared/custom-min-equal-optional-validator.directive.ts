import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[customMinEqualOptional][formControlName],[customMinEqualOptional][formControl],[customMinEqualOptional][ngModel]',
    providers: [{ provide: NG_VALIDATORS, useExisting: CustomMinEqualOptionalValidatorDirective, multi: true }]
})
export class CustomMinEqualOptionalValidatorDirective {

    @Input()
    customMinEqualOptional: number;

    validate(c: FormControl): { [key: string]: any } {
        // tslint:disable-next-line:prefer-const
        let result = null;
        if ((c.value || '').toString().trim().length === 0) {
            result = null;
        } else {
            let v = Number(c.value);
            if (v === NaN) {
                result = { 'customMinEqualOptional' : 'not a number' };
            } else if (v === null || v === undefined) {
                result = null;
            } else if (v >= this.customMinEqualOptional) {
                result = null;
            } else {
                result = { 'customMinEqualOptional' : 'below the minimum' };
            }
        }
        return result;
    }

}
