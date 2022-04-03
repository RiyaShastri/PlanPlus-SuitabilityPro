import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectValuesComponent } from './select-values.component';

describe('SelectValuesComponent', () => {
  let component: SelectValuesComponent;
  let fixture: ComponentFixture<SelectValuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectValuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
