import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';

import { slideInOutAnimation } from '../../shared/animations';
import { timeHorizonDropdownValues } from '../settings-models';
import { PageTitleService } from '../../shared/page-title';
import { Angulartics2 } from 'angulartics2';

interface TimeHorizon {
  value: number;
  name: string;
}

@Component({
  selector: 'app-time-horizon-side-panel',
  templateUrl: './time-horizon-side-panel.component.html',
  styleUrls: ['./time-horizon-side-panel.component.css'],
  animations: [slideInOutAnimation],
  // attach the slide in/out animation to the host (root) element of this component
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class TimeHorizonSidePanelComponent implements OnInit {

  public timeHorizonDropDownArray: Array<TimeHorizon> = [];
  public scoreArray: Array<object> = [];
  public scoreLowerBoundIndex: number = null;
  public scoreHigherBoundIndex: number = null;

  public timeHorizonObj = {
    // timeHorizon,
    // suitabilityScore
  };

  incorrectScore = false;

  @Input() timeHorizonArray: Array<object>;
  @Output() addEvent = new EventEmitter();
  @Output() closePanelEvent = new EventEmitter();

  constructor(
    private _location: Location,
    private pageTitleService: PageTitleService,
    private angulartics2: Angulartics2
) {
    this.angulartics2.eventTrack.next({ action: 'timeHorizonSidePanel' });
    this.pageTitleService.setPageTitle('pageTitle|TAB.TIME_HORIZON_TITLE');
  }

  ngOnInit() {
    for (let i = 1; i <= 100; i++) {
      this.scoreArray.push({
        text: i + '',
        value: i
      });
    }

    this.timeHorizonDropDownArray = Object.assign([], timeHorizonDropdownValues);

    for (let i = 0; i < this.timeHorizonArray.length; i++) {
      const element = this.timeHorizonArray[i];
      this.timeHorizonDropDownArray.splice(this.timeHorizonDropDownArray.findIndex(x => x['value'] === element['timeHorizonId']), 1);
    }

    this.timeHorizonDropDownArray.splice(this.timeHorizonDropDownArray.findIndex(x => x['name'] === 'Unknown'), 1);
  }

  public closePanel() {
    this.closePanelEvent.emit('true');
  }

  public filterScoreOptions() {

    for (let i = 0; i < this.timeHorizonArray.length; i++) {
      const element = this.timeHorizonArray[i];
      if (element['timeHorizonId'] < this.timeHorizonObj['timeHorizon']['value']) {
        this.scoreLowerBoundIndex = i;
      }

      if (element['timeHorizonId'] > this.timeHorizonObj['timeHorizon']['value']) {
        this.scoreHigherBoundIndex = i;
        return;
      }
    }
  }

  public saveTimeHorizon() {

    if (this.scoreLowerBoundIndex !== null && this.scoreHigherBoundIndex === null) {
      if (this.timeHorizonObj['suitabilityScore']['value'] <= this.timeHorizonArray[this.scoreLowerBoundIndex]['suitabilityScore']) {
        this.incorrectScore = true;
        return;
      }
    } else if (this.scoreLowerBoundIndex === null && this.scoreHigherBoundIndex !== null) {
      if (this.timeHorizonObj['suitabilityScore']['value'] >= this.timeHorizonArray[this.scoreHigherBoundIndex]['suitabilityScore']) {
        this.incorrectScore = true;
        return;
      }
    } else if (this.scoreLowerBoundIndex !== null && this.scoreHigherBoundIndex !== null) {
      if (
        this.timeHorizonObj['suitabilityScore']['value'] <= this.timeHorizonArray[this.scoreLowerBoundIndex]['suitabilityScore'] ||
        this.timeHorizonObj['suitabilityScore']['value'] >= this.timeHorizonArray[this.scoreHigherBoundIndex]['suitabilityScore']
      ) {
        this.incorrectScore = true;
        return;
      }
    }

    this.timeHorizonArray.push({
      timeHorizonId: this.timeHorizonObj['timeHorizon']['value'],
      timeHorizonName: this.timeHorizonObj['timeHorizon']['name'],
      suitabilityScore: this.timeHorizonObj['suitabilityScore']['value']
    });

    this.timeHorizonArray.sort(function (obj1, obj2) { return obj1['timeHorizonId'] - obj2['timeHorizonId']; });
    this.addEvent.emit(this.timeHorizonArray);
  }

}
