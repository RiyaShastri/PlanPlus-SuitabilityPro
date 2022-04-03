import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalDetailsHeaderComponent } from './goal-details-header.component';

describe('GoalDetailsHeaderComponent', () => {
  let component: GoalDetailsHeaderComponent;
  let fixture: ComponentFixture<GoalDetailsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalDetailsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
