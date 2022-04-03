import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningModuleDropDownComponent } from './planning-module-drop-down.component';

describe('PlanningModuleDropDownComponent', () => {
  let component: PlanningModuleDropDownComponent;
  let fixture: ComponentFixture<PlanningModuleDropDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningModuleDropDownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningModuleDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
