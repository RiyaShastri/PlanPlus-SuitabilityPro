import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomCashFlowComponent } from './add-custom-cash-flow.component';

describe('AddCustomCashFlowComponent', () => {
  let component: AddCustomCashFlowComponent;
  let fixture: ComponentFixture<AddCustomCashFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCustomCashFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomCashFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
