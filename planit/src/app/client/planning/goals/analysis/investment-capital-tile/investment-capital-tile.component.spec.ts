import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentCapitalTileComponent } from './investment-capital-tile.component';

describe('InvestmentCapitalTileComponent', () => {
  let component: InvestmentCapitalTileComponent;
  let fixture: ComponentFixture<InvestmentCapitalTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentCapitalTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentCapitalTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
