import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioListHtmlComponent } from './portfolio-list-html.component';

describe('PortfolioListHtmlComponent', () => {
  let component: PortfolioListHtmlComponent;
  let fixture: ComponentFixture<PortfolioListHtmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioListHtmlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioListHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
