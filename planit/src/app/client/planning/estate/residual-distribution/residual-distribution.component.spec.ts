import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidualDistributionComponent } from './residual-distribution.component';

describe('ResidualDistributionComponent', () => {
  let component: ResidualDistributionComponent;
  let fixture: ComponentFixture<ResidualDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResidualDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResidualDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
