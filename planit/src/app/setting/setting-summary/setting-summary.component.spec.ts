import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingSummaryComponent } from './setting-summary.component';

describe('SettingSummaryComponent', () => {
  let component: SettingSummaryComponent;
  let fixture: ComponentFixture<SettingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
