import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentYearIncomeDistributionsComponent } from './current-year-income-distributions.component';

describe('CurrentYearIncomeDistributionsComponent', () => {
  let component: CurrentYearIncomeDistributionsComponent;
  let fixture: ComponentFixture<CurrentYearIncomeDistributionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentYearIncomeDistributionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentYearIncomeDistributionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
