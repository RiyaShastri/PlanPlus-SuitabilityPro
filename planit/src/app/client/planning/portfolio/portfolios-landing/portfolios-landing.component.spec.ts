import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfoliosLandingComponent } from './portfolios-landing.component';

describe('PortfoliosLandingComponent', () => {
  let component: PortfoliosLandingComponent;
  let fixture: ComponentFixture<PortfoliosLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfoliosLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfoliosLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
