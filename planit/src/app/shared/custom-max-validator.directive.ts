import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[customMax][formControlName],[customMax][formControl],[customMax][ngModel]',
  providers: [{provide: NG_VALIDATORS, useExisting: CustomMaxValidatorDirective, multi: true}]
})

export class CustomMaxValidatorDirective {

    @Input()
    customMax: number;
    validate(c: FormControl): {[key: string]: any} {
        // tslint:disable-next-line:prefer-const
        let v = c.value;
        return ( v > this.customMax) ? {'customMax': true} : null;
    }
}
