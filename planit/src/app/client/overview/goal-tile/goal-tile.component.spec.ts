import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalTileComponent } from './goal-tile.component';

describe('GoalTileComponent', () => {
    let component: GoalTileComponent;
    let fixture: ComponentFixture<GoalTileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GoalTileComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GoalTileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
