import { Component, OnInit, Input, Output, EventEmitter, OnChanges, HostListener } from '@angular/core';
import { timeout } from 'rxjs/operators';
import { SettingService } from '../../setting/service';
import { PERSON_RELATION } from '../../shared/constants';

@Component({
    selector: 'app-custom-slider',
    templateUrl: './custom-slider.component.html',
    styleUrls: ['./custom-slider.component.css']
})
export class CustomSliderComponent implements OnInit, OnChanges {
    @Input() public fromPoint;
    @Input() public member;
    @Input() public ngcontent;
    @Input() public sliderValue = [];
    @Input() public indicator;
    @Input() public isEditableRoute;
    @Output() public fromPointChange = new EventEmitter();
    @Output() public updateBand = new EventEmitter();

    PERSON_RELATION = PERSON_RELATION;
    // investmentPolicies = [];
    // chartColour = ['#D8F4FA', '#95E3F3', '#35CFEB', '#00ACD3', '#008AAB', '#005C73', '#003642'];
    constructor(
        private settingService: SettingService
    ) { }

    ngOnInit() {
        this.createInvestmentPolicyLable();
    }

    ngOnChanges(changes) {
        if (changes.fromPoint) {
            setTimeout(() => {
                this.createInvestmentPolicyLable();
                // this.changeSliderCSS();
            }, 50);
        }
    }

    // changeSliderCSS() {
    //     this.settingService.getInvestmentPolicies().toPromise().then(response => {
    //         this.investmentPolicies = [];
    //         response.forEach((investment, index) => {
    //             let percent = investment.suitabiliyHigh - investment.suitabilityLow;
    //             if (index !== 0) {
    //                 percent++;
    //             }
    //             this.investmentPolicies.push({
    //                 name: investment.description,
    //                 colour: this.chartColour[index],
    //                 percent: percent
    //             });
    //         });
    //         this.createInvestmentPolicyLable();
    //     }).catch(errorResponse => {
    //         this.investmentPolicies = [
    //             {
    //                 name: 'All income',
    //                 colour: this.chartColour[0],
    //                 percent: 22
    //             },
    //             {
    //                 name: 'Income',
    //                 colour: this.chartColour[1],
    //                 percent: 10
    //             },
    //             {
    //                 name: 'Income and growth',
    //                 colour: this.chartColour[2],
    //                 percent: 10
    //             },
    //             {
    //                 name: 'Balanced',
    //                 colour: this.chartColour[3],
    //                 percent: 13
    //             },
    //             {
    //                 name: 'Growth and Income',
    //                 colour: this.chartColour[4],
    //                 percent: 13
    //             },
    //             {
    //                 name: 'Growth',
    //                 colour: this.chartColour[5],
    //                 percent: 10
    //             },
    //             {
    //                 name: 'All Equity',
    //                 colour: this.chartColour[6],
    //                 percent: 22
    //             }
    //         ];
    //         this.createInvestmentPolicyLable();
    //     });
    // }

    createInvestmentPolicyLable() {
        $('.irs:first').find('.irs').find('.irs-line').remove();
        let addDynamicBlock = '<div ' + this.ngcontent + ' class="slider-main">';
        this.sliderValue.forEach(val => {
            addDynamicBlock = addDynamicBlock + '<div ' + this.ngcontent + ' style="width: ' + val.percent + '%;background: ' + val.colour + ';"></div>';
        });
        addDynamicBlock = addDynamicBlock + '</div>';
        $('.irs:first').find('.irs').prepend(addDynamicBlock);
        $('.irs-slider').empty().prepend(this.fromPoint.toString());


        setTimeout(() => {
            $('.p-slider .irs-slider').css({ 'left': this.fromPoint + '%' });
        }, 100);
    }

    myOnChange(event) {
        $('.irs-slider').empty().prepend(event.from);
        $('.p-slider .irs-slider').css({ 'left': event.from + '%' });
        this.fromPointChange.emit(event);
    }

    myOnFinish(event) {
        this.updateBand.emit(event);
    }

    @HostListener('window:resize') onResize() {
        setTimeout(() => {
            $('.p-slider .irs-slider').css({ 'left': this.fromPoint + '%' });
        }, 300);
    }
}
