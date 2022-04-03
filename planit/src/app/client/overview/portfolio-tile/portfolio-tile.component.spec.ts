import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioTileComponent } from './portfolio-tile.component';

describe('PortfolioTileComponent', () => {
    let component: PortfolioTileComponent;
    let fixture: ComponentFixture<PortfolioTileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PortfolioTileComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PortfolioTileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
