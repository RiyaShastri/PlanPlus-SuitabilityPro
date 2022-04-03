import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalsHeaderComponent } from './goals-header.component';

describe('GoalsHeaderComponent', () => {
  let component: GoalsHeaderComponent;
  let fixture: ComponentFixture<GoalsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
