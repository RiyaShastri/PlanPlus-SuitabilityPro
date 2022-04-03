import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskCapacityComponent } from './risk-capacity.component';

describe('RiskCapacityComponent', () => {
  let component: RiskCapacityComponent;
  let fixture: ComponentFixture<RiskCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskCapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
