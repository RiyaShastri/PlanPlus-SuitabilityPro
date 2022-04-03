import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertaintyOutcomeTileComponent } from './certainty-outcome-tile.component';

describe('CertaintyOutcomeTileComponent', () => {
  let component: CertaintyOutcomeTileComponent;
  let fixture: ComponentFixture<CertaintyOutcomeTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CertaintyOutcomeTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertaintyOutcomeTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
