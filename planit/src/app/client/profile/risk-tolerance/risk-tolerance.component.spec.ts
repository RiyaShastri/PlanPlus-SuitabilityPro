import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskToleranceComponent } from './risk-tolerance.component';

describe('RiskToleranceComponent', () => {
    let component: RiskToleranceComponent;
    let fixture: ComponentFixture<RiskToleranceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RiskToleranceComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RiskToleranceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
