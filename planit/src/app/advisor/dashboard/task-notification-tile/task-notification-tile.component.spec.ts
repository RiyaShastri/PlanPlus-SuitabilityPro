import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNotificationTileComponent } from './task-notification-tile.component';

describe('TaskNotificationTileComponent', () => {
  let component: TaskNotificationTileComponent;
  let fixture: ComponentFixture<TaskNotificationTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskNotificationTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskNotificationTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
