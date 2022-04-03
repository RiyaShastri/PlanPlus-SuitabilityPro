import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskToleranceResultsComponent } from './risk-tolerance-results.component';

describe('RiskToleranceResultsComponent', () => {
  let component: RiskToleranceResultsComponent;
  let fixture: ComponentFixture<RiskToleranceResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskToleranceResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskToleranceResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
