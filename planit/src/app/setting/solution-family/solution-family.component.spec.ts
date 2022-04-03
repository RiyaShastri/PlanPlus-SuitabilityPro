import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionFamilyComponent } from './solution-family.component';

describe('SolutionFamilyComponent', () => {
  let component: SolutionFamilyComponent;
  let fixture: ComponentFixture<SolutionFamilyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionFamilyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
