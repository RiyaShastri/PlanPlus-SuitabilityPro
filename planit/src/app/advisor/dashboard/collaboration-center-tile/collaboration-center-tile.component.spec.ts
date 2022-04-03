import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborationCenterTileComponent } from './collaboration-center-tile.component';

describe('CollaborationCenterTileComponent', () => {
  let component: CollaborationCenterTileComponent;
  let fixture: ComponentFixture<CollaborationCenterTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborationCenterTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborationCenterTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
