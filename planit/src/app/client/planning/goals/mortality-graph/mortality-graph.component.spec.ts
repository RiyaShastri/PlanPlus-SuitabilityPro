import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MortalityGraphComponent } from './mortality-graph.component';

describe('MortalityGraphComponent', () => {
  let component: MortalityGraphComponent;
  let fixture: ComponentFixture<MortalityGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MortalityGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MortalityGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
