import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'app-client-info',
    templateUrl: './client-info.component.html',
    styleUrls: ['./client-info.component.css']
})
export class ClientInfoComponent implements OnInit, OnChanges {
    @Input() clientInfo;
    @Input() dateFormat = 'yy/mm/dd';
    @Input() displayDateFormat = 'YYYY-MM-DD';
    @Input() isEditable = false;

    frequencyList = [
        { id: 1, name: 'Annual' },
        { id: 2, name: 'Every 2 years' },
        { id: 3, name: 'Every 3 years' }
    ];
    clientTypes = [
        { value: 1, label: 'Client' },
        { value: 2, label: 'Prospect' },
        { value: 3, label: 'Inactive' },
        { value: 5, label: 'Test' },
    ];
    dataLoaded = false;
    yearRange;
    maxDate = new Date();
    invalidDate = [false, false, false];
    constructor() {}

    ngOnInit() {
        this.yearRange = (this.maxDate.getFullYear() - 120) + ':' + this.maxDate.getFullYear();
        this.invalidDate = [false, false, false];
        this.processData();
    }

    ngOnChanges(changes) {
        this.invalidDate = [false, false, false];
        if (changes.hasOwnProperty('clientInfo')) {
            this.processData();
        }
    }

    async processData() {
        this.clientInfo['planLastReviewedFrequency'] = await this.frequencyList.find(f => f.id === this.clientInfo['planLastReviewedFrequency']);
        this.clientInfo['portfolioLastReviewedFrequency'] = await this.frequencyList.find(f => f.id === this.clientInfo['portfolioLastReviewedFrequency']);
        this.clientInfo['clientType'] = await this.clientTypes.find(c => c.value === this.clientInfo['clientType']);
        this.clientInfo['becameClientDate'] = this.clientInfo['becameClientDate'] ? new Date(this.clientInfo['becameClientDate']) : null;
        this.clientInfo['planLastReviewedDate'] = this.clientInfo['planLastReviewedDate'] ? new Date(this.clientInfo['planLastReviewedDate']) : null;
        this.clientInfo['portfolioLastReviewedDate'] = this.clientInfo['portfolioLastReviewedDate'] ? new Date(this.clientInfo['portfolioLastReviewedDate']) : null;
        this.dataLoaded = true;
    }

    validateDate(date: Date, index) {
        if (date) {
            if (index === 0) {
                this.invalidDate[index] = this.checkDate(date, this.maxDate);
            } else {
                this.invalidDate[index] = this.checkDate(this.clientInfo['becameClientDate'], date);
            }
        }
    }

    checkDate(minDate: Date, maxDate: Date) {
        if (minDate.getFullYear() < maxDate.getFullYear() ||
            (minDate.getFullYear() === maxDate.getFullYear() && minDate.getMonth() < maxDate.getMonth()) ||
            minDate.getFullYear() === maxDate.getFullYear() && minDate.getMonth() === maxDate.getMonth() && minDate.getDate() <= maxDate.getDate()) {
            return false;
        } else {
            return true;
        }
    }

}
