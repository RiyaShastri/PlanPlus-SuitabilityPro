import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkgroupSidePanelComponent } from './workgroup-side-panel.component';

describe('WorkgroupSidePanelComponent', () => {
  let component: WorkgroupSidePanelComponent;
  let fixture: ComponentFixture<WorkgroupSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkgroupSidePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkgroupSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
