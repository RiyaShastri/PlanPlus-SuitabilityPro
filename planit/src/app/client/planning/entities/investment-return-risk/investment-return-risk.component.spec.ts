import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentReturnRiskComponent } from './investment-return-risk.component';

describe('InvestmentReturnRiskComponent', () => {
  let component: InvestmentReturnRiskComponent;
  let fixture: ComponentFixture<InvestmentReturnRiskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentReturnRiskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentReturnRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
