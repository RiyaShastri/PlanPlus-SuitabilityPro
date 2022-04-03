import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplySolutionComponent } from './apply-solution.component';

describe('ApplySolutionComponent', () => {
  let component: ApplySolutionComponent;
  let fixture: ComponentFixture<ApplySolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplySolutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplySolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
