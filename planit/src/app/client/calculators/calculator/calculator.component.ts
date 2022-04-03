import { Component, OnInit } from '@angular/core';
import { slideInOutAnimation } from '../../../shared/animations';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
  animations: [slideInOutAnimation],
    // attach the slide in/out animation to the host (root) element of this component
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class CalculatorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
