import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuesTileComponent } from './values-tile.component';

describe('ValuesTileComponent', () => {
  let component: ValuesTileComponent;
  let fixture: ComponentFixture<ValuesTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValuesTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValuesTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
