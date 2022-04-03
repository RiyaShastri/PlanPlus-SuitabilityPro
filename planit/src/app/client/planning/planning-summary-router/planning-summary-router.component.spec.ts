import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningSummaryRouterComponent } from './planning-summary-router.component';

describe('PlanningSummaryRouterComponent', () => {
  let component: PlanningSummaryRouterComponent;
  let fixture: ComponentFixture<PlanningSummaryRouterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningSummaryRouterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningSummaryRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
