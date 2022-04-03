import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorHeaderComponent } from './calculator-header.component';

describe('CalculatorHeaderComponent', () => {
  let component: CalculatorHeaderComponent;
  let fixture: ComponentFixture<CalculatorHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculatorHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
