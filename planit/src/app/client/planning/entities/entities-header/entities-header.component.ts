import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { SCENARIOS } from '../../../../shared/constants';
import { EntitiesService } from '../../../service';

@Component({
    selector: 'app-entities-header',
    templateUrl: './entities-header.component.html',
    styleUrls: ['./entities-header.component.css']
})
export class EntitiesHeaderComponent implements OnInit {

    @Input() clientId;
    @Input() entityId;
    @Input() currentPage;
    @Output() switchEntity = new EventEmitter();
    @Output() switchScenario = new EventEmitter();
    entitiesList = null;
    entityDescription;
    scenarios = [];
    selectedScenario = {};
    i18Text = {};
    private unsubscribe$ = new Subject<void>();

    constructor(
        private translate: TranslateService,
        private entityService: EntitiesService
    ) { }

    ngOnInit() {
        this.translate.stream([
            'ENTITY.CURRENT_SCENARIO',
            'ENTITY.STRATEGY_SCENARIO',
        ]).pipe(takeUntil(this.unsubscribe$)).subscribe(i18MenuTexts => {
            this.i18Text = i18MenuTexts;
            this.scenarios = [
                {
                    id: SCENARIOS.CURRENT_SCENARIO,
                    name: this.i18Text['ENTITY.CURRENT_SCENARIO']
                },
                {
                    id: SCENARIOS.STRATEGY_SCENARIO,
                    name: this.i18Text['ENTITY.STRATEGY_SCENARIO']
                }
            ];
            this.selectedScenario = this.scenarios[0];
        });
        this.entityService.getEntitiesList(this.clientId).toPromise().then(entities => {
            this.entitiesList = entities;
            const entity = this.entitiesList.find(e => e.entityId === this.entityId);
            this.entityDescription = entity['entityDescription'];
            this.selectedScenario = this.scenarios[0];
        }).catch(err => {
            this.entitiesList = [];
        });
    }

    changeEntity(entityId, description) {
        this.entityId = entityId;
        this.entityDescription = description;
        this.switchEntity.emit(entityId);
    }

    changeScenario(value) {
        this.selectedScenario = value;
        this.switchScenario.emit(value);
    }


}
