import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetirementAssumptionComponent } from './retirement-assumption.component';

describe('RetirementAssumptionComponent', () => {
  let component: RetirementAssumptionComponent;
  let fixture: ComponentFixture<RetirementAssumptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetirementAssumptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetirementAssumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
