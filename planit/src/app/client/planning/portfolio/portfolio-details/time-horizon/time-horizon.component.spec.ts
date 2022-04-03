import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeHorizonComponent } from './time-horizon.component';

describe('TimeHorizonComponent', () => {
  let component: TimeHorizonComponent;
  let fixture: ComponentFixture<TimeHorizonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeHorizonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeHorizonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
