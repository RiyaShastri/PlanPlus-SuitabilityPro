import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceCalculatorsComponent } from './insurance-calculators.component';

describe('InsuranceCalculatorsComponent', () => {
  let component: InsuranceCalculatorsComponent;
  let fixture: ComponentFixture<InsuranceCalculatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceCalculatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceCalculatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
