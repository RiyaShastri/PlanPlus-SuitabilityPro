import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtConsolidationComponent } from './debt-consolidation.component';

describe('DebtConsolidationComponent', () => {
  let component: DebtConsolidationComponent;
  let fixture: ComponentFixture<DebtConsolidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebtConsolidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtConsolidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
