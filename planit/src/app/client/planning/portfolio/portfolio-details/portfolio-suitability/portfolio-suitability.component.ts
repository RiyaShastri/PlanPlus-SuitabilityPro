import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
    selector: 'app-portfolio-suitability',
    templateUrl: './portfolio-suitability.component.html',
    styleUrls: ['./portfolio-suitability.component.css']
})
export class PortfolioSuitabilityComponent implements OnInit, OnChanges {
    @Input() clientId;
    @Input() portfolioId;
    @Input() isEditableRoute;
    @Input() suitabilityScore;
    @Input() suitabilityBand;
    @Input() graphIndicator;
    @Input() sliderValue = [];
    @Input() suitabilityBands;
    @Input() recommendedScore;
    @Output() suitabilityScoreChanged = new EventEmitter();
    @Output() investmentPolicyChanged = new EventEmitter();
    fromPoint = 0;
    ngcontent = '_ngcontent-c14';
    changedFromPoint = 0;
    indicator = {};
    constructor(private ngxPermissionsService: NgxPermissionsService) { }
    profiler = false;
    advisor = false;

    ngOnInit() {
        if (this.suitabilityBand && this.suitabilityBand.investmentPolicyId) {
            this.suitabilityBand = this.suitabilityBands.find(x => x.investmentPolicyId === this.suitabilityBand.investmentPolicyId);
        }
        const permissions = this.ngxPermissionsService.getPermissions();
        if (permissions.hasOwnProperty('PROFILER')) {
            this.profiler = true;
        } else if (permissions.hasOwnProperty('ADVISOR')) {
            this.advisor = true;
        }
        this.changedFromPoint = this.suitabilityScore;
        this.fromPoint = this.suitabilityScore;
        this.indicator = {
            left: this.graphIndicator,
            bottom: 24,
            background: '#000',
            radius: 5
        };
        this.suitabilityScoreChanged.emit(this.fromPoint);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.changedFromPoint = this.suitabilityScore;
        this.indicator['left'] = (changes.graphIndicator) ? changes.graphIndicator.currentValue : this.indicator['left'];
        if (this.suitabilityBand && this.suitabilityBand.investmentPolicyId) {
            setTimeout(() => {
                this.suitabilityBand = this.suitabilityBands.find(x => x.investmentPolicyId === this.suitabilityBand.investmentPolicyId);
                this.investmentPolicyChanged.emit(this.suitabilityBand);
            }, 0);
        }
    }

    fromPointChange(event) {
        if (this.profiler) {
            this.suitabilityBands.forEach(band => {
                if (event.from >= band.suitabilityLow && event.from <= band.suitabiliyHigh) {
                    this.suitabilityBand = band;
                }
            });
            this.changedFromPoint = event.from;
            this.suitabilityScoreChanged.emit(event.from);
            this.investmentPolicyChanged.emit(this.suitabilityBand);
        } else {
            this.investmentPolicyChanged.emit(event);
        }
    }

    updateBand(event) {
        this.suitabilityScore = event.from;
    }

}
