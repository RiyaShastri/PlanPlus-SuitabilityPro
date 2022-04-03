import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskTileComponent } from './risk-tile.component';

describe('RiskTileComponent', () => {
    let component: RiskTileComponent;
    let fixture: ComponentFixture<RiskTileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RiskTileComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RiskTileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
