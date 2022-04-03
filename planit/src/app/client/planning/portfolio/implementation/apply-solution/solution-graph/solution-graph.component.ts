import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-solution-graph',
    templateUrl: './solution-graph.component.html',
    styleUrls: ['./solution-graph.component.css']
})
export class SolutionGraphComponent implements OnInit {
    @Input() solutionData = [];
    @Input() implementedSolutionId = '';
    @Input() suitabilityScore = 0;
    @Output() selectedSolution = new EventEmitter();
    constructor() { }

    ngOnInit() { }

    applySolution(portfolioId) {
        this.selectedSolution.emit(portfolioId);
    }

}
