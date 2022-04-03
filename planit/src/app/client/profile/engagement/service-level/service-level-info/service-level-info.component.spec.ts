import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceLevelInfoComponent } from './service-level-info.component';

describe('ServiceLevelInfoComponent', () => {
  let component: ServiceLevelInfoComponent;
  let fixture: ComponentFixture<ServiceLevelInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceLevelInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceLevelInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
