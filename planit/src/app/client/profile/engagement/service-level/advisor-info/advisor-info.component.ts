import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ClientProfileService } from '../../../../service';

@Component({
    selector: 'app-advisor-info',
    templateUrl: './advisor-info.component.html',
    styleUrls: ['./advisor-info.component.css']
})
export class AdvisorInfoComponent implements OnInit, OnChanges {
    @Input() advisorInfo;
    @Input() clientId;
    @Input() dateFormat = 'yy/mm/dd';
    @Input() displayDateFormat = 'YYYY-MM-DD';
    @Input() workGroupList = [];
    @Input() regionList = [];
    @Input() isEditable = false;

    noSuchAdvisor = [];
    enableAddAdvisorButton = true;
    constructor(
        private profileService: ClientProfileService
    ) {}

    ngOnInit() {
        this.processData();
        this.enableAddAdvisorButton = true;
    }

    ngOnChanges() {
        this.processData();
        this.enableAddAdvisorButton = true;
    }

    processData() {
        this.advisorInfo['secondaryAdvisors'].forEach(element => {
            element.expiryDate = element.expiryDate ? new Date(element.expiryDate) : new Date();
            element['neverExpire'] = element['expiryOption'] === -1 ? true : false;
        });
    }

    addSecondaryAdvisor() {
        const newAdvisor = {
            advisor: '',
            expiryDate: new Date(),
            advisorName: '',
            expiryStatus: '',
            expiryOption: null,
            expiryDays: null,
            showRenewButton: false,
            neverExpire: false
        };
        this.noSuchAdvisor[this.advisorInfo['secondaryAdvisors'].length] = false;
        this.advisorInfo['secondaryAdvisors'].push(newAdvisor);
        this.enableAddAdvisorButton = false;
    }

    searchAdvisor(index) {
        this.noSuchAdvisor[index] = false;
        const advisorId = this.advisorInfo['secondaryAdvisors'][index]['advisor'];
        this.profileService.searchSecondaryAdvisors(this.clientId, advisorId).toPromise().then(res => {
            if (res) {
                this.advisorInfo['secondaryAdvisors'][index] = res;
                this.advisorInfo['secondaryAdvisors'][index]['expiryDate'] = this.advisorInfo['secondaryAdvisors'][index]['expiryDate'] ?
                    new Date(this.advisorInfo['secondaryAdvisors'][index]['expiryDate']) : new Date();
                this.advisorInfo['secondaryAdvisors'][index]['neverExpire'] = res['expiryOption'] === -1 ? true : false;
                this.enableAddAdvisorButton = true;
            }
        }).catch(err => {
            this.noSuchAdvisor[index] = true;
        });
    }

    OnAdvisorIDChange(value, index) {
        this.advisorInfo['secondaryAdvisors'][index]['advisorName'] = '';
    }

    removeAdvisor(index) {
        this.advisorInfo['secondaryAdvisors'].splice(index, 1);
        this.noSuchAdvisor[index] = false;
    }

}
