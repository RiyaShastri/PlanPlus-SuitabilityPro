import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningSummaryComponent } from './planning-summary.component';

describe('PlanningSummaryComponent', () => {
  let component: PlanningSummaryComponent;
  let fixture: ComponentFixture<PlanningSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
