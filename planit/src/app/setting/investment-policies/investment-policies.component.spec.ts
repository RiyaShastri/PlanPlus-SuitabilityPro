import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentPoliciesComponent } from './investment-policies.component';

describe('InvestmentPoliciesComponent', () => {
  let component: InvestmentPoliciesComponent;
  let fixture: ComponentFixture<InvestmentPoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentPoliciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
