import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetWorthAccountTableComponent } from './net-worth-account-table.component';

describe('NetWorthAccountTableComponent', () => {
  let component: NetWorthAccountTableComponent;
  let fixture: ComponentFixture<NetWorthAccountTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetWorthAccountTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetWorthAccountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
