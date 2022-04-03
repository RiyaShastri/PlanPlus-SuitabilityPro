import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNotificationComponent } from './task-notification.component';

describe('TaskNotificationComponent', () => {
  let component: TaskNotificationComponent;
  let fixture: ComponentFixture<TaskNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
