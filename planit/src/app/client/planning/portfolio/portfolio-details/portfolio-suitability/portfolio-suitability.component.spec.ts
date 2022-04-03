import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioSuitabilityComponent } from './portfolio-suitability.component';

describe('PortfolioSuitabilityComponent', () => {
  let component: PortfolioSuitabilityComponent;
  let fixture: ComponentFixture<PortfolioSuitabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioSuitabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioSuitabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
