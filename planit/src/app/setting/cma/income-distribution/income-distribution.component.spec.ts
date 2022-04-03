import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeDistributionComponent } from './income-distribution.component';

describe('IncomeDistributionComponent', () => {
  let component: IncomeDistributionComponent;
  let fixture: ComponentFixture<IncomeDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomeDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
