import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongTermIncomeDistributionsComponent } from './long-term-income-distributions.component';

describe('LongTermIncomeDistributionsComponent', () => {
  let component: LongTermIncomeDistributionsComponent;
  let fixture: ComponentFixture<LongTermIncomeDistributionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongTermIncomeDistributionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongTermIncomeDistributionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
