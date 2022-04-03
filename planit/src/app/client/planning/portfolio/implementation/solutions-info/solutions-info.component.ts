import { Component, OnInit } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'app-solutions-info',
  templateUrl: './solutions-info.component.html',
  styleUrls: ['./solutions-info.component.css']
})
export class SolutionsInfoComponent implements OnInit {

  constructor(
    private angulartics2: Angulartics2
) {
    this.angulartics2.eventTrack.next({ action: 'portfolioSolutionInfo' });
}

  ngOnInit() {
  }

}
