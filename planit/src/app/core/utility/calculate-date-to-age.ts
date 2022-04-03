import { Injectable } from '@angular/core';
import * as moment from 'moment';
@Injectable()
export class CalculateAgeFromDate {
    public calculate(date) {
        const age = moment().diff(moment(date).format('YYYY-MM-DD'), 'years', false);
        return age;
    }
}
