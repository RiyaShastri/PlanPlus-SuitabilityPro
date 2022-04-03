import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedGoalsComponent } from './linked-goals.component';

describe('LinkedGoalsComponent', () => {
  let component: LinkedGoalsComponent;
  let fixture: ComponentFixture<LinkedGoalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkedGoalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
