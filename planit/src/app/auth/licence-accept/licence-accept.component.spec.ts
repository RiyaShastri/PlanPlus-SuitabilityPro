import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenceAcceptComponent } from './licence-accept.component';

describe('LicenceAcceptComponent', () => {
  let component: LicenceAcceptComponent;
  let fixture: ComponentFixture<LicenceAcceptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenceAcceptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenceAcceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
