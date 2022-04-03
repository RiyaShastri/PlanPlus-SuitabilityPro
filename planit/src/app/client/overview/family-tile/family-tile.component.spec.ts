import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyTileComponent } from './family-tile.component';

describe('FamilyTileComponent', () => {
  let component: FamilyTileComponent;
  let fixture: ComponentFixture<FamilyTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FamilyTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
