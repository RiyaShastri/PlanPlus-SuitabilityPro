import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskToleranceKycComponent } from './risk-tolerance-kyc.component';

describe('RiskToleranceKycComponent', () => {
  let component: RiskToleranceKycComponent;
  let fixture: ComponentFixture<RiskToleranceKycComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskToleranceKycComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskToleranceKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
