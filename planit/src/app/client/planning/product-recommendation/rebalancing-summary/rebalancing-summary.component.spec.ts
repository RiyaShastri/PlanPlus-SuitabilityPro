import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RebalancingSummaryComponent } from './rebalancing-summary.component';

describe('RebalancingSummaryComponent', () => {
  let component: RebalancingSummaryComponent;
  let fixture: ComponentFixture<RebalancingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RebalancingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RebalancingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
