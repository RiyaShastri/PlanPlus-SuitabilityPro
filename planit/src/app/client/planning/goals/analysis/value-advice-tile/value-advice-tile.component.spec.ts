import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueAdviceTileComponent } from './value-advice-tile.component';

describe('ValueAdviceTileComponent', () => {
  let component: ValueAdviceTileComponent;
  let fixture: ComponentFixture<ValueAdviceTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueAdviceTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueAdviceTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
