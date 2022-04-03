import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskToleranceDistributionTileComponent } from './risk-tolerance-distribution-tile.component';

describe('RiskToleranceDistributionTileComponent', () => {
  let component: RiskToleranceDistributionTileComponent;
  let fixture: ComponentFixture<RiskToleranceDistributionTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskToleranceDistributionTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskToleranceDistributionTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
