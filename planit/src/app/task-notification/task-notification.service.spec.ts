import { TestBed, inject } from '@angular/core/testing';

import { TaskNotificationService } from './task-notification.service';

describe('TaskNotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskNotificationService]
    });
  });

  it('should be created', inject([TaskNotificationService], (service: TaskNotificationService) => {
    expect(service).toBeTruthy();
  }));
});
