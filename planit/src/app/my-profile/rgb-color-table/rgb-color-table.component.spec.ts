import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RgbColorTableComponent } from './rgb-color-table.component';

describe('RgbColorTableComponent', () => {
  let component: RgbColorTableComponent;
  let fixture: ComponentFixture<RgbColorTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RgbColorTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RgbColorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
