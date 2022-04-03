import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingDetailComponent } from './holding-detail.component';

describe('HoldingDetailComponent', () => {
  let component: HoldingDetailComponent;
  let fixture: ComponentFixture<HoldingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
