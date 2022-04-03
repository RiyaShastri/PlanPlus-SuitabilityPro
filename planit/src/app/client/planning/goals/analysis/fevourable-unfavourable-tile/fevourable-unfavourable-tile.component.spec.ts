import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FevourableUnfavourableTileComponent } from './fevourable-unfavourable-tile.component';

describe('FevourableUnfavourableTileComponent', () => {
  let component: FevourableUnfavourableTileComponent;
  let fixture: ComponentFixture<FevourableUnfavourableTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FevourableUnfavourableTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FevourableUnfavourableTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
