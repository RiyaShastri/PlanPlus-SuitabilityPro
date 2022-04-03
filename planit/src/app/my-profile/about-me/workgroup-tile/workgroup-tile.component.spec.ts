import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkgroupTileComponent } from './workgroup-tile.component';

describe('WorkgroupTileComponent', () => {
  let component: WorkgroupTileComponent;
  let fixture: ComponentFixture<WorkgroupTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkgroupTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkgroupTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
