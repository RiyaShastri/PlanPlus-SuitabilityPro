import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionGraphComponent } from './solution-graph.component';

describe('SolutionGraphComponent', () => {
  let component: SolutionGraphComponent;
  let fixture: ComponentFixture<SolutionGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
