import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsSpecifiedAccountComponent } from './savings-specified-account.component';

describe('SavingsSpecifiedAccountComponent', () => {
  let component: SavingsSpecifiedAccountComponent;
  let fixture: ComponentFixture<SavingsSpecifiedAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsSpecifiedAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsSpecifiedAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
