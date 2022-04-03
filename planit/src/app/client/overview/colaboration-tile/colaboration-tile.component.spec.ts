import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColaborationTileComponent } from './colaboration-tile.component';

describe('ColaborationTileComponent', () => {
  let component: ColaborationTileComponent;
  let fixture: ComponentFixture<ColaborationTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColaborationTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColaborationTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
