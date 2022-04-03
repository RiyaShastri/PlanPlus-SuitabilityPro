import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowManagementComponent } from './cash-flow-management.component';

describe('CashFlowManagementComponent', () => {
  let component: CashFlowManagementComponent;
  let fixture: ComponentFixture<CashFlowManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashFlowManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFlowManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
