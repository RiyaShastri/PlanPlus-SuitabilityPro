import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAnalysisComponent } from './view-analysis.component';

describe('ViewAnalysisComponent', () => {
  let component: ViewAnalysisComponent;
  let fixture: ComponentFixture<ViewAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
