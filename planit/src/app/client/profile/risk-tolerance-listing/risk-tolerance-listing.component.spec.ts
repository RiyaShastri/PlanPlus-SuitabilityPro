import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskToleranceListingComponent } from './risk-tolerance-listing.component';

describe('RiskToleranceListingComponent', () => {
  let component: RiskToleranceListingComponent;
  let fixture: ComponentFixture<RiskToleranceListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskToleranceListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskToleranceListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
