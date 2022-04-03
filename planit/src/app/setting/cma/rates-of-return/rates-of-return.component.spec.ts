import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatesOfReturnComponent } from './rates-of-return.component';

describe('RatesOfReturnComponent', () => {
  let component: RatesOfReturnComponent;
  let fixture: ComponentFixture<RatesOfReturnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatesOfReturnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesOfReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
