import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCalculatorsComponent } from './loan-calculators.component';

describe('LoanCalculatorsComponent', () => {
  let component: LoanCalculatorsComponent;
  let fixture: ComponentFixture<LoanCalculatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanCalculatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanCalculatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
