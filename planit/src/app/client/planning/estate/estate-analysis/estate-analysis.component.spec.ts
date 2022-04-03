import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstateAnalysisComponent } from './estate-analysis.component';

describe('EstateAnalysisComponent', () => {
  let component: EstateAnalysisComponent;
  let fixture: ComponentFixture<EstateAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstateAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstateAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
