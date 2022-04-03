import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { CloudOptions } from 'angular-tag-cloud-module';
import { AdvisorService } from '../../service/advisor.service';
import { getGraphColours, AppState } from '../../../shared/app.reducer';
@Component({
    selector: 'app-client-value-tile',
    templateUrl: './client-value-tile.component.html',
    styleUrls: ['./client-value-tile.component.css']
})
export class ClientValueTileComponent implements OnInit, OnDestroy {
    valuesLoaded = false;
    options: CloudOptions = {
        width: 1,
        height: 400,
        realignOnResize: true
    };
    valueList = [];
    graphColors = ['#77AAFF', '#55DDAA', '#DDDD44', '#FF44AA', '#FFAA22', '#9999FF', '#AADD55', '#66CCEE', '#FF6644', '#FFCC44', '#CC77FF'];
    unsubscribe$: any;

    constructor(
        private advisorService: AdvisorService,
        private store: Store<AppState>,
    ) { }

    ngOnInit() {
        this.unsubscribe$ = this.store.select(getGraphColours).subscribe(graphColours => {
            if (graphColours && graphColours.hasOwnProperty('allGraphColours') && graphColours['allGraphColours'].length > 0) {
                this.graphColors = graphColours['allGraphColours'];
            }
        });

        this.advisorService.getClientsValues().toPromise().then(clientsValues => {
            this.valuesLoaded = true;
            this.valueList = [];
            clientsValues.forEach(clientsValue => {
                const colorHex = this.graphColors[Math.floor(Math.random() * this.graphColors.length)];
                const obj = {
                    text: clientsValue.text,
                    weight: clientsValue.timesSelected * 10,
                    color: colorHex
                };
                this.valueList.push(obj);
            });
        }).catch(errorResponse => {
            this.valuesLoaded = true;
            this.valueList = [];
        });
    }

    ngOnDestroy(): void {
        if (this.unsubscribe$) { this.unsubscribe$.unsubscribe(); }
    }

}
