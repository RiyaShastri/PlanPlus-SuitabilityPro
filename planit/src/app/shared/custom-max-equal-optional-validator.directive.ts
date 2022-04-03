import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[customMaxEqualOptional][formControlName],[customMaxEqualOptional][formControl],[customMaxEqualOptional][ngModel]',
  providers: [{provide: NG_VALIDATORS, useExisting: CustomMaxEqualOptionalValidatorDirective, multi: true}]
})

export class CustomMaxEqualOptionalValidatorDirective {

    @Input()
    customMaxEqualOptional: number;
    validate(c: FormControl): {[key: string]: any} {
        // tslint:disable-next-line:prefer-const
        let result = null;
        if ((c.value || '').toString().trim().length === 0) {
            result = null;
        } else {
            let v = Number(c.value);
            if (v === NaN) {
                result = { 'customMaxEqualOptional' : 'not a number' };
            } else if (v === null || v === undefined) {
                result = null;
            } else if (v <= this.customMaxEqualOptional) {
                result = null;
            } else {
                result = { 'customMaxEqualOptional' : 'exceed the maximum' };
            }
        }
        return result;
    }
}
