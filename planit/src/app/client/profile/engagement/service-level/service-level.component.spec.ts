import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceLevelComponent } from './service-level.component';

describe('ServiceLevelComponent', () => {
  let component: ServiceLevelComponent;
  let fixture: ComponentFixture<ServiceLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
