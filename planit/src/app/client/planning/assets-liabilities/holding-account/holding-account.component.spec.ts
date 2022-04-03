import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingAccountComponent } from './holding-account.component';

describe('HoldingAccountComponent', () => {
  let component: HoldingAccountComponent;
  let fixture: ComponentFixture<HoldingAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldingAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
