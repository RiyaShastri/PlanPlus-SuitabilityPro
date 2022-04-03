import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighLevelTileComponent } from './high-level-tile.component';

describe('HighLevelTileComponent', () => {
  let component: HighLevelTileComponent;
  let fixture: ComponentFixture<HighLevelTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighLevelTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighLevelTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
