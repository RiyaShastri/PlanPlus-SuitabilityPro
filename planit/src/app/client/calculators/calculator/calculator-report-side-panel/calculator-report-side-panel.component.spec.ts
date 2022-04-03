import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorReportSidePanelComponent } from './calculator-report-side-panel.component';

describe('CalculatorReportSidePanelComponent', () => {
  let component: CalculatorReportSidePanelComponent;
  let fixture: ComponentFixture<CalculatorReportSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculatorReportSidePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorReportSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
