import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeHorizonSidePanelComponent } from './time-horizon-side-panel.component';

describe('TimeHorizonSidePanelComponent', () => {
  let component: TimeHorizonSidePanelComponent;
  let fixture: ComponentFixture<TimeHorizonSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeHorizonSidePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeHorizonSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
