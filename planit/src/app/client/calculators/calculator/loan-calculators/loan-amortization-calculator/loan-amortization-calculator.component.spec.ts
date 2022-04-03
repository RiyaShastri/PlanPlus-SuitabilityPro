import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAmortizationCalculatorComponent } from './loan-amortization-calculator.component';

describe('LoanAmortizationCalculatorComponent', () => {
  let component: LoanAmortizationCalculatorComponent;
  let fixture: ComponentFixture<LoanAmortizationCalculatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanAmortizationCalculatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAmortizationCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
