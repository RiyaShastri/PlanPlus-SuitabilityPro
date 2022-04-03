import { Component, OnInit } from '@angular/core';
import { AdvisorService } from '../../service/advisor.service';

@Component({
    selector: 'app-demographics-tile',
    templateUrl: './demographics-tile.component.html',
    styleUrls: ['./demographics-tile.component.css']
})
export class DemographicsTileComponent implements OnInit {
    demograpghicsData = [];
    TotalClients = 0;
    max = 0;
    constructor(
        private advisorService: AdvisorService
    ) { }
    ngOnInit() {
        this.advisorService.getDemographicsDetails().toPromise().then(res => {
            this.setDemographicData(res);
        }).catch(err => { });

    }
    setDemographicData(data) {
        let total = 0;
        this.max = 0;
        this.demograpghicsData = data.ageBands;
        if (data) {
            this.demograpghicsData.forEach(value => {
                total = total + value.numberOfClients;
                if (value.numberOfClients > this.max) {
                    this.max = value.numberOfClients;
                }
            });
            this.TotalClients = total;
            const personIconFactor = this.max / total / 17;
            this.demograpghicsData.forEach(value => {
                value['clientsPercentage'] = (value.numberOfClients / this.TotalClients) * 100;
                value['shadingFactor'] = Math.ceil(value['clientsPercentage'] / 100 / personIconFactor);
            });
        }
    }

    calcShadingFactor(value, n) {
        const personIconFactor = this.max / n;
        const shadingFactor = Math.ceil(value / personIconFactor);
        return shadingFactor;
    }
}
