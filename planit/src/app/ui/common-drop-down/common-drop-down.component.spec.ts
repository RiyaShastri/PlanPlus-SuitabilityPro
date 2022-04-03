import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDropDownComponent } from './common-drop-down.component';

describe('CommonDropDownComponent', () => {
  let component: CommonDropDownComponent;
  let fixture: ComponentFixture<CommonDropDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonDropDownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
